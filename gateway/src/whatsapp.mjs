import fs from 'node:fs/promises';
import path from 'node:path';
import makeWASocket, {
  DisconnectReason,
  downloadMediaMessage,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
  useMultiFileAuthState,
} from '@whiskeysockets/baileys';
import pino from 'pino';
import qrcode from 'qrcode-terminal';
import { persistWhatsAppMessage } from './persistence-client.mjs';
import { analyzeImageBuffer, transcribeAudioBuffer } from './multimodal.mjs';

/** @typedef {'DISCONNECTED' | 'CONNECTING' | 'PAIRING' | 'CONNECTED' | 'ERROR'} ConnectionState */
/** @typedef {'INBOUND' | 'OUTBOUND'} MessageDirection */
/** @typedef {'UNKNOWN' | 'RECEIVED'} MessageStatus */
/** @typedef {'TEXT' | 'AUDIO' | 'IMAGE' | 'VIDEO' | 'DOCUMENT' | 'OTHER'} MessageType */
/** @typedef {{ id: string, jid: string | null, direction: MessageDirection, fromMe: boolean, text: string | null, timestamp: number, status: MessageStatus, push_name?: string | null, message_type?: MessageType, media_status?: string, media_error?: string | null }} MessageSnapshot */
/** @typedef {{ connection: ConnectionState, qr: string | null, me: { id: string, name: string | null } | null, lastError: string | null, messageCount: number }} GatewayStatus */
/** @typedef {{ type: 'connection', status: GatewayStatus } | { type: 'message', message: MessageSnapshot }} GatewayEvent */
/** @typedef {(event: GatewayEvent) => void} EventListener */

const logger = pino({ level: process.env.KASSIST_WA_LOG_LEVEL ?? 'warn' });
const authDir = path.resolve(process.env.KASSIST_WA_AUTH_DIR ?? './.data/whatsapp/auth');

const state = {
  connection: 'DISCONNECTED', qr: null, me: null, lastError: null, messages: [], messageIds: new Set()
};
let socket = null;
let connecting = null;
let pendingCredsSave = Promise.resolve();
let reconnectTimer = null;
let lifecycleGeneration = 0;
let shuttingDown = false;
let eventListeners = new Set();

function emit(event) {
  for (const listener of eventListeners) {
    try { listener(event); } catch { /* event subscribers are isolated */ }
  }
}

export function subscribe(listener) { eventListeners.add(listener); return () => eventListeners.delete(listener); }

export function getStatus() {
  return { connection: state.connection, qr: state.qr, me: state.me, lastError: state.lastError, messageCount: state.messages.length };
}

export function getMessages(limit = 100) {
  const safeLimit = Math.max(1, Math.min(Number(limit) || 100, 500));
  return state.messages.slice(-safeLimit);
}

function normalizeRecipient(value) {
  const raw = String(value ?? '').trim();
  if (!raw) throw new Error('Recipient is required');
  if (raw.endsWith('@lid') || raw.endsWith('@g.us') || raw.endsWith('@s.whatsapp.net')) return raw;
  const digits = raw.replace(/\D/g, '');
  if (!digits) throw new Error('Recipient must contain a WhatsApp JID, LID or phone digits');
  return `${digits}@s.whatsapp.net`;
}

function messageType(message) {
  if (message?.audioMessage) return 'AUDIO';
  if (message?.imageMessage) return 'IMAGE';
  if (message?.videoMessage) return 'VIDEO';
  if (message?.documentMessage) return 'DOCUMENT';
  return 'TEXT';
}

function snapshotMessage(message, direction) {
  const key = message.key ?? {};
  const jid = key.remoteJid ?? null;
  const text = message.message?.conversation ?? message.message?.extendedTextMessage?.text ?? message.message?.imageMessage?.caption ?? message.message?.videoMessage?.caption ?? null;
  return {
    id: key.id ?? `wa-${Date.now()}`,
    jid,
    direction,
    fromMe: Boolean(key.fromMe),
    text,
    timestamp: Number(message.messageTimestamp ?? Math.floor(Date.now() / 1000)),
    status: direction === 'INBOUND' ? 'RECEIVED' : 'UNKNOWN',
    push_name: typeof message.pushName === 'string' ? message.pushName : null,
    message_type: messageType(message),
    media_status: messageType(message) === 'TEXT' ? 'NOT_APPLICABLE' : 'PENDING',
    media_error: null,
  };
}

function getDisconnectStatusCode(error) {
  if (typeof error !== 'object' || error === null || !('output' in error)) return undefined;
  const output = error.output;
  if (typeof output !== 'object' || output === null || !('statusCode' in output)) return undefined;
  return typeof output.statusCode === 'number' ? output.statusCode : undefined;
}

export function recordMessage(snapshot) {
  if (state.messageIds.has(snapshot.id)) return false;
  state.messageIds.add(snapshot.id);
  state.messages.push(snapshot);
  if (state.messages.length > 500) {
    const removed = state.messages.shift();
    if (removed) state.messageIds.delete(removed.id);
  }
  emit({ type: 'message', message: snapshot });
  return true;
}

async function persistSnapshot(snapshot) {
  const result = await persistWhatsAppMessage({ message: { ...snapshot, external_message_id: snapshot.id } });
  if (!result.persisted) console.warn(`[KassisT Persistence] duplicate or already persisted message ${snapshot.id}`);
}

async function enrichMediaMessage(message, snapshot) {
  if (!['AUDIO', 'IMAGE'].includes(snapshot.message_type)) return snapshot;
  try {
    const buffer = await downloadMediaMessage(message, 'buffer', {});
    if (!Buffer.isBuffer(buffer) || buffer.length === 0) throw new Error('WhatsApp media payload is empty');
    if (snapshot.message_type === 'AUDIO') {
      const result = await transcribeAudioBuffer(buffer, { extension: 'ogg' });
      return { ...snapshot, text: result.text ?? snapshot.text, media_status: result.status, media_error: result.error ?? null };
    }
    const result = await analyzeImageBuffer(buffer);
    return { ...snapshot, text: result.text ?? snapshot.text, media_status: result.status, media_error: result.error ?? null };
  } catch (error) {
    return { ...snapshot, media_status: 'FAILED', media_error: error instanceof Error ? error.message : String(error) };
  }
}

async function clearAuthState() { await fs.rm(authDir, { recursive: true, force: true }); }

async function safelyEndSocket(targetSocket = socket) {
  const current = targetSocket;
  if (current === socket) socket = null;
  if (!current) return;
  try { current.end(undefined); } catch { /* terminal lifecycle */ }
}

async function startSocket({ generation } = { generation: lifecycleGeneration }) {
  await fs.mkdir(authDir, { recursive: true });
  const { state: authState, saveCreds } = await useMultiFileAuthState(authDir);
  const { version } = await fetchLatestBaileysVersion();
  if (generation !== lifecycleGeneration || shuttingDown) return;

  const socketInstance = makeWASocket({
    version,
    auth: { creds: authState.creds, keys: makeCacheableSignalKeyStore(authState.keys, logger) },
    logger, markOnlineOnConnect: false, syncFullHistory: false,
  });
  socket = socketInstance;

  socketInstance.ev.on('creds.update', () => {
    const saveGeneration = generation;
    pendingCredsSave = pendingCredsSave.then(async () => {
      if (saveGeneration !== lifecycleGeneration || socketInstance !== socket || shuttingDown) return;
      await saveCreds();
    }).catch((error) => console.error('[KassisT WhatsApp] failed to persist auth credentials:', error instanceof Error ? error.message : error));
  });

  socketInstance.ev.on('connection.update', async ({ connection, qr, lastDisconnect }) => {
    if (generation !== lifecycleGeneration) { await safelyEndSocket(socketInstance); return; }
    if (qr) {
      state.qr = qr; state.connection = 'PAIRING'; state.lastError = null;
      qrcode.generate(qr, { small: true });
      console.log('\n[KassisT WhatsApp] QR code generated. Scan it from WhatsApp → Linked devices.\n');
      emit({ type: 'connection', status: getStatus() });
    }
    if (connection === 'open') {
      state.connection = 'CONNECTED'; state.qr = null; state.lastError = null;
      state.me = socketInstance.user ? { id: socketInstance.user.id, name: socketInstance.user.name ?? null } : null;
      console.log(`[KassisT WhatsApp] Connected as ${state.me?.id ?? 'unknown'}`);
      emit({ type: 'connection', status: getStatus() });
      return;
    }
    if (connection === 'close') {
      const statusCode = getDisconnectStatusCode(lastDisconnect?.error);
      const loggedOut = statusCode === DisconnectReason.loggedOut;
      const error = lastDisconnect?.error?.message ?? String(lastDisconnect?.error ?? 'Connection closed');
      if (socketInstance === socket) socket = null;
      if (reconnectTimer) { clearTimeout(reconnectTimer); reconnectTimer = null; }
      if (shuttingDown) {
        state.connection = 'DISCONNECTED'; state.qr = null; state.me = null; state.lastError = null;
        emit({ type: 'connection', status: getStatus() }); return;
      }
      state.connection = loggedOut ? 'DISCONNECTED' : 'CONNECTING'; state.lastError = loggedOut ? null : error; state.qr = null; state.me = null;
      emit({ type: 'connection', status: getStatus() });
      if (loggedOut) {
        return;
      }
      reconnectTimer = setTimeout(() => {
        reconnectTimer = null;
        connect().catch((reconnectError) => { state.connection = 'ERROR'; state.lastError = reconnectError instanceof Error ? reconnectError.message : String(reconnectError); emit({ type: 'connection', status: getStatus() }); });
      }, 1500);
    }
  });

  socketInstance.ev.on('messages.upsert', ({ messages }) => {
    const isCurrentLifecycle = () => generation === lifecycleGeneration && socketInstance === socket && !shuttingDown;
    for (const message of messages) {
      if (!isCurrentLifecycle()) return;
      const initial = snapshotMessage(message, message.key?.fromMe ? 'OUTBOUND' : 'INBOUND');
      void (async () => {
        if (!isCurrentLifecycle()) return;
        const snapshot = initial.direction === 'INBOUND' ? await enrichMediaMessage(message, initial) : initial;
        if (!isCurrentLifecycle()) return;
        try { await persistSnapshot(snapshot); }
        catch (error) { console.error(`[KassisT Persistence] failed to persist WhatsApp message ${snapshot.id}:`, error instanceof Error ? error.message : error); return; }
        if (!isCurrentLifecycle()) return;
        recordMessage(snapshot);
      })();
    }
  });
}

export async function connect() {
  if (shuttingDown) return;
  if (connecting) return connecting;
  if (socket && state.connection === 'CONNECTED') return;
  if (reconnectTimer) { clearTimeout(reconnectTimer); reconnectTimer = null; }
  lifecycleGeneration += 1;
  const generation = lifecycleGeneration;
  connecting = (async () => {
    state.connection = 'CONNECTING'; state.qr = null; state.me = null; state.lastError = null;
    emit({ type: 'connection', status: getStatus() });
    try { await startSocket({ generation }); }
    catch (error) { if (generation === lifecycleGeneration) { state.connection = 'ERROR'; state.lastError = error instanceof Error ? error.message : String(error); emit({ type: 'connection', status: getStatus() }); } throw error; }
    finally { connecting = null; }
  })();
  return connecting;
}

export async function shutdown() {
  shuttingDown = true; lifecycleGeneration += 1;
  if (reconnectTimer) { clearTimeout(reconnectTimer); reconnectTimer = null; }
  const activeSocket = socket; socket = null;
  if (activeSocket) { try { activeSocket.end(undefined); } catch (error) { console.error('[KassisT WhatsApp] failed to close socket cleanly:', error instanceof Error ? error.message : error); } }
  await pendingCredsSave;
  state.connection = 'DISCONNECTED'; state.qr = null; state.me = null; emit({ type: 'connection', status: getStatus() });
}

export async function logout() {
  lifecycleGeneration += 1;
  if (reconnectTimer) { clearTimeout(reconnectTimer); reconnectTimer = null; }
  const current = socket; socket = null;
  if (current) { try { await current.logout('KassisT user requested logout'); } catch (error) { console.error('[KassisT WhatsApp] failed to logout cleanly:', error instanceof Error ? error.message : error); } }
  state.connection = 'DISCONNECTED'; state.qr = null; state.me = null; state.lastError = null; emit({ type: 'connection', status: getStatus() });
}

export async function resetSession() {
  await logout(); await pendingCredsSave; await clearAuthState();
  state.connection = 'DISCONNECTED'; state.qr = null; state.me = null; state.lastError = null; emit({ type: 'connection', status: getStatus() });
}

/** @param {string} to @param {string} text */
export async function sendText(to, text) {
  if (!socket || state.connection !== 'CONNECTED') throw new Error('WhatsApp transport is not connected');
  const jid = normalizeRecipient(to); const body = String(text ?? '').trim(); if (!body) throw new Error('Message text is required');
  const result = await socket.sendMessage(jid, { text: body });
  if (!result) throw new Error('WhatsApp transport did not return a message');
  const snapshot = snapshotMessage(result, 'OUTBOUND');
  await persistSnapshot(snapshot); recordMessage(snapshot); return snapshot;
}

export { normalizeRecipient };
