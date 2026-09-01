import fs from 'node:fs/promises';
import path from 'node:path';
import makeWASocket, {
  Browsers,
  DisconnectReason,
  fetchLatestBaileysVersion,
  fetchLatestWaWebVersion,
  makeCacheableSignalKeyStore,
  useMultiFileAuthState,
} from '@whiskeysockets/baileys';
import pino from 'pino';
import qrcode from 'qrcode-terminal';
import { persistWhatsAppMessage } from './persistence-client.mjs';

/** @typedef {'DISCONNECTED' | 'CONNECTING' | 'PAIRING' | 'CONNECTED' | 'ERROR'} ConnectionState */
/** @typedef {'INBOUND' | 'OUTBOUND'} MessageDirection */
/** @typedef {'UNKNOWN' | 'RECEIVED'} MessageStatus */
/** @typedef {{ id: string, jid: string | null, direction: MessageDirection, fromMe: boolean, text: string | null, timestamp: number, status: MessageStatus, push_name?: string | null }} MessageSnapshot */
/** @typedef {{ connection: ConnectionState, qr: string | null, me: { id: string, name: string | null } | null, lastError: string | null, messageCount: number }} GatewayStatus */
/** @typedef {{ type: 'connection', status: GatewayStatus } | { type: 'message', message: MessageSnapshot }} GatewayEvent */
/** @typedef {(event: GatewayEvent) => void} EventListener */

const logger = pino({ level: process.env.KASSIST_WA_LOG_LEVEL ?? 'warn' });
const authDir = path.resolve(process.env.KASSIST_WA_AUTH_DIR ?? './.data/whatsapp/auth');
const RECONNECT_BASE_MS = 1000;
const RECONNECT_MAX_MS = 30000;
const RECONNECT_JITTER_MS = 500;

/** @type {{ connection: ConnectionState, qr: string | null, me: { id: string, name: string | null } | null, lastError: string | null, messages: MessageSnapshot[], messageIds: Set<string> }} */
const state = {
  connection: 'DISCONNECTED',
  qr: null,
  me: null,
  lastError: null,
  messages: [],
  messageIds: new Set(),
};

/** @type {import('@whiskeysockets/baileys').WASocket | null} */
let socket = null;
/** @type {Promise<void> | null} */
let connecting = null;
/** @type {Promise<void>} */
let pendingCredsSave = Promise.resolve();
/** @type {NodeJS.Timeout | null} */
let reconnectTimer = null;
let reconnectAttempt = 0;
let autoReconnect = true;
let shuttingDown = false;
/** @type {Set<EventListener>} */
let eventListeners = new Set();

/** @param {GatewayEvent} event */
function emit(event) {
  for (const listener of eventListeners) {
    try {
      listener(event);
    } catch {
      // Event subscribers are isolated from the transport process.
    }
  }
}

/** @param {EventListener} listener */
export function subscribe(listener) {
  eventListeners.add(listener);
  return () => eventListeners.delete(listener);
}

/** @returns {GatewayStatus} */
export function getStatus() {
  return {
    connection: state.connection,
    qr: state.qr,
    me: state.me,
    lastError: state.lastError,
    messageCount: state.messages.length,
  };
}

/** @param {number | string | null} [limit=100] @returns {MessageSnapshot[]} */
export function getMessages(limit = 100) {
  const safeLimit = Math.max(1, Math.min(Number(limit) || 100, 500));
  return state.messages.slice(-safeLimit);
}

/** @param {unknown} value @returns {string} */
function normalizeRecipient(value) {
  const raw = String(value ?? '').trim();
  if (!raw) throw new Error('Recipient is required');
  if (
    raw.endsWith('@lid') ||
    raw.endsWith('@g.us') ||
    raw.endsWith('@s.whatsapp.net')
  ) return raw;
  const digits = raw.replace(/\D/g, '');
  if (!digits) throw new Error('Recipient must contain a WhatsApp JID, LID or phone digits');
  return `${digits}@s.whatsapp.net`;
}

/** @param {import('@whiskeysockets/baileys').WAMessage} message @param {MessageDirection} direction @returns {MessageSnapshot} */
function snapshotMessage(message, direction) {
  const key = message.key ?? {};
  const jid = key.remoteJid ?? null;
  const text =
    message.message?.conversation ??
    message.message?.extendedTextMessage?.text ??
    message.message?.imageMessage?.caption ??
    message.message?.videoMessage?.caption ??
    null;

  return {
    id: key.id ?? `wa-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    jid,
    direction,
    fromMe: Boolean(key.fromMe),
    text,
    timestamp: Number(message.messageTimestamp ?? Math.floor(Date.now() / 1000)),
    status: direction === 'INBOUND' ? 'RECEIVED' : 'UNKNOWN',
    push_name: typeof message.pushName === 'string' ? message.pushName : null,
  };
}

/** @param {unknown} error @returns {number | undefined} */
function getDisconnectStatusCode(error) {
  if (typeof error !== 'object' || error === null || !('output' in error)) return undefined;
  const output = error.output;
  if (typeof output !== 'object' || output === null || !('statusCode' in output)) return undefined;
  const statusCode = output.statusCode;
  return typeof statusCode === 'number' ? statusCode : undefined;
}

/** @param {string | null} jid */
function shouldIgnoreJid(jid) {
  return typeof jid === 'string' && (
    jid === 'status@broadcast' ||
    jid.endsWith('@broadcast')
  );
}

/** @param {MessageSnapshot} snapshot @returns {boolean} */
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

/** @param {MessageSnapshot} snapshot @returns {Promise<boolean>} */
async function persistSnapshot(snapshot) {
  try {
    const result = await persistWhatsAppMessage({
      message: {
        ...snapshot,
        external_message_id: snapshot.id,
      },
    });
    if (!result.persisted) {
      console.warn(`[KassisT Persistence] duplicate or already persisted message ${snapshot.id}`);
    }
    return true;
  } catch (error) {
    console.error(
      `[KassisT Persistence] failed to persist WhatsApp message ${snapshot.id}:`,
      error instanceof Error ? error.message : error
    );
    return false;
  }
}

async function clearAuthState() {
  await fs.rm(authDir, { recursive: true, force: true });
}

function cancelReconnect() {
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }
}

function scheduleReconnect() {
  if (reconnectTimer || !autoReconnect || shuttingDown) return;
  const exponent = Math.min(reconnectAttempt, 5);
  const baseDelay = Math.min(RECONNECT_MAX_MS, RECONNECT_BASE_MS * (2 ** exponent));
  const delay = baseDelay + Math.floor(Math.random() * RECONNECT_JITTER_MS);
  reconnectAttempt += 1;
  console.log(`[KassisT WhatsApp] reconnect scheduled in ${delay}ms (attempt=${reconnectAttempt})`);
  reconnectTimer = setTimeout(() => {
    reconnectTimer = null;
    connect().catch((reconnectError) => {
      state.connection = 'ERROR';
      state.lastError = reconnectError instanceof Error ? reconnectError.message : String(reconnectError);
      emit({ type: 'connection', status: getStatus() });
      scheduleReconnect();
    });
  }, delay);
}

async function resolveWaWebVersion() {
  try {
    const latest = await fetchLatestWaWebVersion();
    if (Array.isArray(latest?.version) && latest.version.length === 3) {
      return latest.version;
    }
  } catch (error) {
    console.warn(
      '[KassisT WhatsApp] failed to fetch latest WhatsApp Web version; using Baileys fallback:',
      error instanceof Error ? error.message : error
    );
  }

  const fallback = await fetchLatestBaileysVersion();
  return fallback.version;
}

async function startSocket() {
  await fs.mkdir(authDir, { recursive: true });
  const { state: authState, saveCreds } = await useMultiFileAuthState(authDir);
  const version = await resolveWaWebVersion();

  socket = makeWASocket({
    version,
    browser: Browsers.windows('Chrome'),
    auth: {
      creds: authState.creds,
      keys: makeCacheableSignalKeyStore(authState.keys, logger),
    },
    logger,
    printQRInTerminal: false,
    markOnlineOnConnect: false,
    defaultQueryTimeoutMs: undefined,
    keepAliveIntervalMs: 30000,
    syncFullHistory: false,
    shouldSyncHistoryMessage: () => false,
    shouldIgnoreJid,
  });

  socket.ev.on('creds.update', () => {
    pendingCredsSave = pendingCredsSave
      .then(() => saveCreds())
      .catch((error) => {
        console.error(
          '[KassisT WhatsApp] failed to persist auth credentials:',
          error instanceof Error ? error.message : error
        );
      });
  });

  socket.ev.on('connection.update', async ({ connection, qr, lastDisconnect }) => {
    if (qr) {
      state.qr = qr;
      state.connection = 'PAIRING';
      state.lastError = null;
      qrcode.generate(qr, { small: true });
      console.log('\n[KassisT WhatsApp] QR code generated. Scan it from WhatsApp → Linked devices.\n');
      emit({ type: 'connection', status: getStatus() });
    }

    if (connection === 'open') {
      reconnectAttempt = 0;
      cancelReconnect();
      state.connection = 'CONNECTED';
      state.qr = null;
      state.lastError = null;
      state.me = socket?.user ? { id: socket.user.id, name: socket.user.name ?? null } : null;
      console.log(`[KassisT WhatsApp] Connected as ${state.me?.id ?? 'unknown'}`);
      emit({ type: 'connection', status: getStatus() });
      return;
    }

    if (connection === 'close') {
      const statusCode = getDisconnectStatusCode(lastDisconnect?.error);
      const loggedOut = statusCode === DisconnectReason.loggedOut;
      const error = lastDisconnect?.error?.message ?? String(lastDisconnect?.error ?? 'Connection closed');

      socket = null;
      cancelReconnect();

      if (shuttingDown || !autoReconnect) {
        state.connection = 'DISCONNECTED';
        state.qr = null;
        state.lastError = null;
        emit({ type: 'connection', status: getStatus() });
        return;
      }

      state.connection = loggedOut ? 'DISCONNECTED' : 'CONNECTING';
      state.lastError = loggedOut ? null : error;
      state.qr = null;
      emit({ type: 'connection', status: getStatus() });

      if (loggedOut) {
        autoReconnect = false;
        console.log('[KassisT WhatsApp] Session logged out. Authentication state retained until explicit reset.');
        return;
      }

      scheduleReconnect();
    }
  });

  socket.ev.on('messages.upsert', ({ messages }) => {
    for (const message of messages) {
      if (shouldIgnoreJid(message.key?.remoteJid ?? null)) continue;
      const snapshot = snapshotMessage(message, message.key?.fromMe ? 'OUTBOUND' : 'INBOUND');
      void (async () => {
        const persisted = await persistSnapshot(snapshot);
        if (persisted) recordMessage(snapshot);
      })();
    }
  });
}

export async function connect() {
  if (shuttingDown) return;
  autoReconnect = true;
  if (connecting) return connecting;
  if (socket && state.connection === 'CONNECTED') return;

  connecting = (async () => {
    state.connection = 'CONNECTING';
    state.qr = null;
    state.lastError = null;
    emit({ type: 'connection', status: getStatus() });
    try {
      await startSocket();
    } catch (error) {
      state.connection = 'ERROR';
      state.lastError = error instanceof Error ? error.message : String(error);
      emit({ type: 'connection', status: getStatus() });
      throw error;
    } finally {
      connecting = null;
    }
  })();

  return connecting;
}

export async function shutdown() {
  shuttingDown = true;
  autoReconnect = false;
  cancelReconnect();

  const activeSocket = socket;
  socket = null;
  if (activeSocket) {
    try {
      activeSocket.end(undefined);
    } catch (error) {
      console.error(
        '[KassisT WhatsApp] failed to close socket cleanly:',
        error instanceof Error ? error.message : error
      );
    }
  }

  await pendingCredsSave;
  state.connection = 'DISCONNECTED';
  state.qr = null;
  emit({ type: 'connection', status: getStatus() });
}

export async function logout() {
  autoReconnect = false;
  cancelReconnect();
  const activeSocket = socket;
  socket = null;
  if (activeSocket) {
    try {
      await activeSocket.logout('KassisT user requested logout');
    } catch (error) {
      console.warn(
        '[KassisT WhatsApp] logout request failed:',
        error instanceof Error ? error.message : error
      );
    }
  }
  await pendingCredsSave;
  state.connection = 'DISCONNECTED';
  state.qr = null;
  state.me = null;
  state.lastError = null;
  emit({ type: 'connection', status: getStatus() });
}

export async function resetSession() {
  await logout();
  await clearAuthState();
  state.connection = 'DISCONNECTED';
  emit({ type: 'connection', status: getStatus() });
}

/** @param {string} to @param {string} text @returns {Promise<MessageSnapshot>} */
export async function sendText(to, text) {
  if (!socket || state.connection !== 'CONNECTED') {
    throw new Error('WhatsApp transport is not connected');
  }
  const jid = normalizeRecipient(to);
  const body = String(text ?? '').trim();
  if (!body) throw new Error('Message text is required');
  if (shouldIgnoreJid(jid)) throw new Error('Broadcast/status recipients are not supported');

  const result = await socket.sendMessage(jid, { text: body });
  if (!result) throw new Error('WhatsApp transport did not return a message');
  const snapshot = snapshotMessage(result, 'OUTBOUND');
  const persisted = await persistSnapshot(snapshot);
  if (!persisted) throw new Error('WhatsApp message was sent but could not be durably persisted');
  recordMessage(snapshot);
  return snapshot;
}

export { normalizeRecipient };