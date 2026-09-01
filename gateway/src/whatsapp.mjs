import fs from 'node:fs/promises';
import path from 'node:path';
import makeWASocket, {
  Browsers,
  DisconnectReason,
  downloadMediaMessage,
  fetchLatestBaileysVersion,
  fetchLatestWaWebVersion,
  makeCacheableSignalKeyStore,
  useMultiFileAuthState,
} from '@whiskeysockets/baileys';
import pino from 'pino';
import qrcode from 'qrcode-terminal';
import { persistWhatsAppMessage } from './persistence-client.mjs';

const logger = pino({ level: process.env.KASSIST_WA_LOG_LEVEL ?? 'warn' });
const authDir = path.resolve(process.env.KASSIST_WA_AUTH_DIR ?? './.data/whatsapp/auth');
const mediaDir = path.resolve(process.env.KASSIST_WA_MEDIA_DIR ?? './.data/whatsapp/media');
const RECONNECT_BASE_MS = 1000;
const RECONNECT_MAX_MS = 30000;
const RECONNECT_JITTER_MS = 500;

/** @typedef {'DISCONNECTED'|'CONNECTING'|'PAIRING'|'CONNECTED'|'ERROR'} ConnectionState */
/** @typedef {'INBOUND'|'OUTBOUND'} MessageDirection */
/** @typedef {{ id:string, jid:string|null, direction:MessageDirection, fromMe:boolean, text:string|null, timestamp:number, status:'UNKNOWN'|'RECEIVED', push_name?:string|null, message_type?:string, media_path?:string|null, customer_email?:string|null }} MessageSnapshot */

const state = { connection: 'DISCONNECTED', qr: null, me: null, lastError: null, messages: [], messageIds: new Set() };
let socket = null;
let connecting = null;
let pendingCredsSave = Promise.resolve();
let reconnectTimer = null;
let reconnectAttempt = 0;
let autoReconnect = true;
let shuttingDown = false;
let eventListeners = new Set();

function emit(event) { for (const listener of eventListeners) { try { listener(event); } catch {} } }
export function subscribe(listener) { eventListeners.add(listener); return () => eventListeners.delete(listener); }
export function getStatus() { return { connection: state.connection, qr: state.qr, me: state.me, lastError: state.lastError, messageCount: state.messages.length }; }
export function getMessages(limit = 100) { const safe = Math.max(1, Math.min(Number(limit) || 100, 500)); return state.messages.slice(-safe); }

function normalizeRecipient(value) {
  const raw = String(value ?? '').trim();
  if (!raw) throw new Error('Recipient is required');
  if (raw.endsWith('@lid') || raw.endsWith('@g.us') || raw.endsWith('@s.whatsapp.net')) return raw;
  const digits = raw.replace(/\D/g, '');
  if (!digits) throw new Error('Recipient must contain a WhatsApp JID, LID or phone digits');
  return `${digits}@s.whatsapp.net`;
}

function shouldIgnoreJid(jid) { return typeof jid === 'string' && (jid === 'status@broadcast' || jid.endsWith('@broadcast')); }
function inferMessageType(message) {
  if (message?.message?.imageMessage) return 'IMAGE';
  if (message?.message?.videoMessage) return 'VIDEO';
  if (message?.message?.documentMessage) return 'DOCUMENT';
  if (message?.message?.audioMessage) return 'AUDIO';
  return 'TEXT';
}
function extractText(message) {
  return message?.message?.conversation ?? message?.message?.extendedTextMessage?.text ?? message?.message?.imageMessage?.caption ?? message?.message?.videoMessage?.caption ?? null;
}
function snapshotMessage(message, direction, mediaPath = null) {
  const key = message.key ?? {};
  const text = extractText(message);
  const emailMatch = typeof text === 'string' ? text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i) : null;
  return {
    id: key.id ?? `wa-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    jid: key.remoteJid ?? null,
    direction,
    fromMe: Boolean(key.fromMe),
    text,
    timestamp: Number(message.messageTimestamp ?? Math.floor(Date.now() / 1000)),
    status: direction === 'INBOUND' ? 'RECEIVED' : 'UNKNOWN',
    push_name: typeof message.pushName === 'string' ? message.pushName : null,
    message_type: inferMessageType(message),
    media_path: mediaPath,
    customer_email: emailMatch?.[0] ?? null,
  };
}
function getDisconnectStatusCode(error) { const code = error?.output?.statusCode; return typeof code === 'number' ? code : undefined; }
export function recordMessage(snapshot) {
  if (state.messageIds.has(snapshot.id)) return false;
  state.messageIds.add(snapshot.id); state.messages.push(snapshot);
  if (state.messages.length > 500) { const removed = state.messages.shift(); if (removed) state.messageIds.delete(removed.id); }
  emit({ type: 'message', message: snapshot }); return true;
}
async function persistSnapshot(snapshot) {
  try { await persistWhatsAppMessage({ message: { ...snapshot, external_message_id: snapshot.id } }); return true; }
  catch (error) { console.error(`[KassisT Persistence] failed to persist WhatsApp message ${snapshot.id}:`, error instanceof Error ? error.message : error); return false; }
}
async function clearAuthState() { await fs.rm(authDir, { recursive: true, force: true }); }
function cancelReconnect() { if (reconnectTimer) { clearTimeout(reconnectTimer); reconnectTimer = null; } }
function scheduleReconnect() {
  if (reconnectTimer || !autoReconnect || shuttingDown) return;
  const exponent = Math.min(reconnectAttempt, 5); const delay = Math.min(RECONNECT_MAX_MS, RECONNECT_BASE_MS * (2 ** exponent)) + Math.floor(Math.random() * RECONNECT_JITTER_MS); reconnectAttempt += 1;
  reconnectTimer = setTimeout(() => { reconnectTimer = null; connect().catch(() => scheduleReconnect()); }, delay);
}
async function resolveWaWebVersion() {
  try { const latest = await fetchLatestWaWebVersion(); if (Array.isArray(latest?.version) && latest.version.length === 3) return latest.version; }
  catch (error) { console.warn('[KassisT WhatsApp] latest Web version unavailable:', error instanceof Error ? error.message : error); }
  const fallback = await fetchLatestBaileysVersion(); return fallback.version;
}
async function downloadIncomingMedia(message) {
  const type = inferMessageType(message);
  if (!['IMAGE', 'VIDEO', 'DOCUMENT', 'AUDIO'].includes(type) || !socket) return null;
  try {
    await fs.mkdir(mediaDir, { recursive: true });
    const buffer = await downloadMediaMessage(message, 'buffer', {}, { logger, reuploadRequest: socket.updateMediaMessage });
    const ext = type === 'IMAGE' ? 'jpg' : type === 'VIDEO' ? 'mp4' : type === 'AUDIO' ? 'ogg' : 'bin';
    const filePath = path.join(mediaDir, `${message.key?.id ?? Date.now()}.${ext}`);
    await fs.writeFile(filePath, buffer);
    return filePath;
  } catch (error) {
    console.error('[KassisT WhatsApp] media download failed:', error instanceof Error ? error.message : error);
    return null;
  }
}
async function startSocket() {
  await fs.mkdir(authDir, { recursive: true }); await fs.mkdir(mediaDir, { recursive: true });
  const { state: authState, saveCreds } = await useMultiFileAuthState(authDir);
  const version = await resolveWaWebVersion();
  socket = makeWASocket({ version, browser: Browsers.windows('Chrome'), auth: { creds: authState.creds, keys: makeCacheableSignalKeyStore(authState.keys, logger) }, logger, printQRInTerminal: false, markOnlineOnConnect: false, defaultQueryTimeoutMs: undefined, keepAliveIntervalMs: 30000, syncFullHistory: false, shouldIgnoreJid });
  socket.ev.on('creds.update', () => { pendingCredsSave = pendingCredsSave.then(() => saveCreds()).catch((error) => console.error('[KassisT WhatsApp] credential save failed:', error instanceof Error ? error.message : error)); });
  socket.ev.on('connection.update', async ({ connection, qr, lastDisconnect }) => {
    if (qr) { state.qr = qr; state.connection = 'PAIRING'; state.lastError = null; qrcode.generate(qr, { small: true }); emit({ type: 'connection', status: getStatus() }); }
    if (connection === 'open') { reconnectAttempt = 0; cancelReconnect(); state.connection = 'CONNECTED'; state.qr = null; state.lastError = null; state.me = socket?.user ? { id: socket.user.id, name: socket.user.name ?? null } : null; emit({ type: 'connection', status: getStatus() }); return; }
    if (connection === 'close') {
      const loggedOut = getDisconnectStatusCode(lastDisconnect?.error) === DisconnectReason.loggedOut;
      const error = lastDisconnect?.error?.message ?? String(lastDisconnect?.error ?? 'Connection closed'); socket = null; cancelReconnect();
      if (shuttingDown || !autoReconnect) { state.connection = 'DISCONNECTED'; state.qr = null; state.lastError = null; emit({ type: 'connection', status: getStatus() }); return; }
      state.connection = loggedOut ? 'DISCONNECTED' : 'CONNECTING'; state.lastError = loggedOut ? null : error; state.qr = null; emit({ type: 'connection', status: getStatus() });
      if (loggedOut) { autoReconnect = false; return; }
      scheduleReconnect();
    }
  });
  socket.ev.on('messages.upsert', ({ messages }) => {
    for (const message of messages) {
      if (shouldIgnoreJid(message.key?.remoteJid ?? null)) continue;
      void (async () => {
        const mediaPath = message.key?.fromMe ? null : await downloadIncomingMedia(message);
        const snapshot = snapshotMessage(message, message.key?.fromMe ? 'OUTBOUND' : 'INBOUND', mediaPath);
        if (await persistSnapshot(snapshot)) recordMessage(snapshot);
      })();
    }
  });
}
export async function connect() {
  if (shuttingDown) return; autoReconnect = true; if (connecting) return connecting; if (socket && state.connection === 'CONNECTED') return;
  connecting = (async () => { state.connection = 'CONNECTING'; state.qr = null; state.lastError = null; emit({ type: 'connection', status: getStatus() }); try { await startSocket(); } catch (error) { state.connection = 'ERROR'; state.lastError = error instanceof Error ? error.message : String(error); emit({ type: 'connection', status: getStatus() }); throw error; } finally { connecting = null; } })();
  return connecting;
}
export async function shutdown() { shuttingDown = true; autoReconnect = false; cancelReconnect(); const active = socket; socket = null; try { active?.end(undefined); } catch {} await pendingCredsSave; state.connection = 'DISCONNECTED'; state.qr = null; emit({ type: 'connection', status: getStatus() }); }
export async function logout() { autoReconnect = false; cancelReconnect(); const active = socket; socket = null; try { await active?.logout('KassisT user requested logout'); } catch (error) { console.warn('[KassisT WhatsApp] logout failed:', error instanceof Error ? error.message : error); } await pendingCredsSave; state.connection = 'DISCONNECTED'; state.qr = null; state.me = null; state.lastError = null; emit({ type: 'connection', status: getStatus() }); }
export async function resetSession() { await logout(); await clearAuthState(); state.connection = 'DISCONNECTED'; emit({ type: 'connection', status: getStatus() }); }
export async function sendText(to, text) {
  if (!socket || state.connection !== 'CONNECTED') throw new Error('WhatsApp transport is not connected');
  const jid = normalizeRecipient(to); const body = String(text ?? '').trim(); if (!body) throw new Error('Message text is required'); if (shouldIgnoreJid(jid)) throw new Error('Broadcast/status recipients are not supported');
  const result = await socket.sendMessage(jid, { text: body }); if (!result) throw new Error('WhatsApp transport did not return a message');
  const snapshot = snapshotMessage(result, 'OUTBOUND'); if (!await persistSnapshot(snapshot)) throw new Error('WhatsApp message was sent but could not be durably persisted'); recordMessage(snapshot); return snapshot;
}
export async function sendImage(to, filePath, caption = '') {
  if (!socket || state.connection !== 'CONNECTED') throw new Error('WhatsApp transport is not connected');
  const jid = normalizeRecipient(to); if (shouldIgnoreJid(jid)) throw new Error('Broadcast/status recipients are not supported');
  const resolved = path.resolve(String(filePath)); await fs.access(resolved);
  const result = await socket.sendMessage(jid, { image: { url: resolved }, caption: String(caption ?? '').trim() }); if (!result) throw new Error('WhatsApp transport did not return an image message');
  const snapshot = snapshotMessage(result, 'OUTBOUND', resolved); if (!await persistSnapshot(snapshot)) throw new Error('WhatsApp image was sent but could not be durably persisted'); recordMessage(snapshot); return snapshot;
}
export { normalizeRecipient };
