import fs from 'node:fs/promises';
import path from 'node:path';
import makeWASocket, {
  DisconnectReason,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
  useMultiFileAuthState,
} from '@whiskeysockets/baileys';
import pino from 'pino';
import qrcode from 'qrcode-terminal';

/** @typedef {'DISCONNECTED' | 'CONNECTING' | 'PAIRING' | 'CONNECTED' | 'RECONNECTING' | 'ERROR'} ConnectionState */
/** @typedef {'INBOUND' | 'OUTBOUND'} MessageDirection */
/** @typedef {'UNKNOWN' | 'RECEIVED'} MessageStatus */
/** @typedef {{ id: string, jid: string | null, direction: MessageDirection, fromMe: boolean, text: string | null, timestamp: number, status: MessageStatus }} MessageSnapshot */
/** @typedef {{ connection: ConnectionState, qr: string | null, me: { id: string, name: string | null } | null, lastError: string | null, messageCount: number }} GatewayStatus */
/** @typedef {{ type: 'connection', status: GatewayStatus } | { type: 'message', message: MessageSnapshot }} GatewayEvent */
/** @typedef {(event: GatewayEvent) => void} EventListener */

const logger = pino({ level: process.env.KASSIST_WA_LOG_LEVEL ?? 'warn' });
const authDir = path.resolve(process.env.KASSIST_WA_AUTH_DIR ?? './.data/whatsapp/auth');

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

/** @param {number} [limit=100] @returns {MessageSnapshot[]} */
export function getMessages(limit = 100) {
  const safeLimit = Math.max(1, Math.min(Number(limit) || 100, 500));
  return state.messages.slice(-safeLimit);
}

/** @param {unknown} value @returns {string} */
function normalizeRecipient(value) {
  const raw = String(value ?? '').trim();
  if (!raw) throw new Error('Recipient is required');
  if (raw.endsWith('@g.us') || raw.endsWith('@s.whatsapp.net')) return raw;
  const digits = raw.replace(/\D/g, '');
  if (!digits) throw new Error('Recipient must contain a WhatsApp JID or phone digits');
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
    id: key.id ?? `wa-${Date.now()}`,
    jid,
    direction,
    fromMe: Boolean(key.fromMe),
    text,
    timestamp: Number(message.messageTimestamp ?? Math.floor(Date.now() / 1000)),
    status: direction === 'INBOUND' ? 'RECEIVED' : 'UNKNOWN',
  };
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

async function clearAuthState() {
  await fs.rm(authDir, { recursive: true, force: true });
}

async function startSocket() {
  await fs.mkdir(authDir, { recursive: true });
  const { state: authState, saveCreds } = await useMultiFileAuthState(authDir);
  const { version } = await fetchLatestBaileysVersion();

  socket = makeWASocket({
    version,
    auth: {
      creds: authState.creds,
      keys: makeCacheableSignalKeyStore(authState.keys, logger),
    },
    logger,
    markOnlineOnConnect: false,
    syncFullHistory: false,
  });

  socket.ev.on('creds.update', saveCreds);

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
      state.connection = 'CONNECTED';
      state.qr = null;
      state.lastError = null;
      state.me = socket?.user ? { id: socket.user.id, name: socket.user.name ?? null } : null;
      console.log(`[KassisT WhatsApp] Connected as ${state.me?.id ?? 'unknown'}`);
      emit({ type: 'connection', status: getStatus() });
      return;
    }

    if (connection === 'close') {
      const statusCode = lastDisconnect?.error?.output?.statusCode;
      const loggedOut = statusCode === DisconnectReason.loggedOut;
      const error = lastDisconnect?.error?.message ?? String(lastDisconnect?.error ?? 'Connection closed');

      state.connection = loggedOut ? 'DISCONNECTED' : 'RECONNECTING';
      state.lastError = error;
      state.qr = null;
      emit({ type: 'connection', status: getStatus() });

      socket = null;
      if (loggedOut) {
        console.log('[KassisT WhatsApp] Session logged out. Authentication state retained until explicit reset.');
        return;
      }

      setTimeout(() => {
        connect().catch((reconnectError) => {
          state.connection = 'ERROR';
          state.lastError = reconnectError instanceof Error ? reconnectError.message : String(reconnectError);
          emit({ type: 'connection', status: getStatus() });
        });
      }, 1500);
    }
  });

  socket.ev.on('messages.upsert', ({ messages }) => {
    for (const message of messages) {
      const snapshot = snapshotMessage(message, message.key?.fromMe ? 'OUTBOUND' : 'INBOUND');
      recordMessage(snapshot);
    }
  });
}

export async function connect() {
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

export async function logout() {
  if (socket) {
    try {
      await socket.logout('KassisT user requested logout');
    } finally {
      socket = null;
    }
  }
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

export async function sendText(to, text) {
  if (!socket || state.connection !== 'CONNECTED') {
    throw new Error('WhatsApp transport is not connected');
  }
  const jid = normalizeRecipient(to);
  const body = String(text ?? '').trim();
  if (!body) throw new Error('Message text is required');

  const result = await socket.sendMessage(jid, { text: body });
  const snapshot = snapshotMessage(result, 'OUTBOUND');
  recordMessage(snapshot);
  return snapshot;
}

export { normalizeRecipient };

process.on('SIGINT', async () => {
  try {
    if (socket) socket.end(undefined);
  } finally {
    process.exit(0);
  }
});
