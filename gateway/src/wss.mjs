import { createHash } from 'node:crypto';
import { validateWssEnvelope } from './wss-envelope.mjs';

const MAX_FRAME_PAYLOAD = 1024 * 1024;
const CLOSE_NORMAL = 1000;
const CLOSE_PROTOCOL_ERROR = 1002;
const CLOSE_MESSAGE_TOO_BIG = 1009;

const STATES = Object.freeze({
  DISCONNECTED: 'DISCONNECTED',
  CONNECTING: 'CONNECTING',
  AUTHENTICATING: 'AUTHENTICATING',
  READY: 'READY',
  CLOSING: 'CLOSING',
});

/** @typedef {import('node:http').Server} HttpServer */
/** @typedef {import('node:http').IncomingMessage} IncomingMessage */
/** @typedef {import('node:net').Socket} Socket */
/**
 * @typedef {Object} ProtocolMessage
 * @property {string} protocol_version
 * @property {string} message_id
 * @property {string} message_type
 * @property {string} device_id
 * @property {string} timestamp_utc
 * @property {unknown} payload
 * @property {string} [event_id]
 * @property {string} [correlation_id]
 * @property {string} [causation_id]
 * @property {number} [sequence]
 */
/**
 * @typedef {Object} EnvelopeOptions
 * @property {string} messageType
 * @property {string} deviceId
 * @property {unknown} payload
 * @property {string} [correlationId]
 * @property {string} [causationId]
 * @property {string} [eventId]
 * @property {number} [sequence]
 */
/**
 * @typedef {Object} Session
 * @property {Socket} socket
 * @property {'DISCONNECTED'|'CONNECTING'|'AUTHENTICATING'|'READY'|'CLOSING'} state
 * @property {string|null} deviceId
 * @property {boolean} authenticated
 * @property {number|null} lastSequence
 * @property {Set<string>} messageIds
 */
/** @typedef {{ lastSequence: number|null }} ResumeRecord */
/**
 * @typedef {Object} WssOptions
 * @property {(message: ProtocolMessage) => boolean | { ok: boolean, reason?: string } | Promise<boolean | { ok: boolean, reason?: string }>} [authenticateDevice]
 * @property {(message: ProtocolMessage, session: { state: Session['state'], deviceId: string, send: (outbound: ProtocolMessage) => void }) => unknown | Promise<unknown>} [onMessage]
 * @property {(error: Error) => void} [onError]
 */

/** @param {string} key */
function websocketAccept(key) {
  return createHash('sha1')
    .update(`${key}258EAFA5-E914-47DA-95CA-C5AB0DC85B11`)
    .digest('base64');
}

/** @param {number} opcode @param {Buffer|string} [payload] */
function encodeFrame(opcode, payload = Buffer.alloc(0)) {
  const body = Buffer.isBuffer(payload) ? payload : Buffer.from(payload);
  if (body.length > MAX_FRAME_PAYLOAD) throw new RangeError('WSS frame exceeds maximum payload size');
  if (body.length < 126) return Buffer.concat([Buffer.from([0x80 | opcode, body.length]), body]);
  if (body.length <= 0xffff) {
    const header = Buffer.alloc(4);
    header[0] = 0x80 | opcode;
    header[1] = 126;
    header.writeUInt16BE(body.length, 2);
    return Buffer.concat([header, body]);
  }
  const header = Buffer.alloc(10);
  header[0] = 0x80 | opcode;
  header[1] = 127;
  header.writeUInt32BE(0, 2);
  header.writeUInt32BE(body.length, 6);
  return Buffer.concat([header, body]);
}

/** @param {Buffer} buffer @returns {{ frame: { fin: boolean, opcode: number, payload: Buffer }, remaining: Buffer }|null} */
function tryDecodeFrame(buffer) {
  if (buffer.length < 2) return null;
  const first = buffer[0] ?? 0;
  const second = buffer[1] ?? 0;
  const fin = (first & 0x80) !== 0;
  const rsv = first & 0x70;
  const opcode = first & 0x0f;
  const masked = (second & 0x80) !== 0;
  let length = second & 0x7f;
  let offset = 2;

  if (rsv !== 0) throw new Error('unsupported_websocket_extension');
  if (!fin) throw new Error('fragmentation_not_supported');
  if (!masked) throw new Error('client_frame_not_masked');
  if (length === 126) {
    if (buffer.length < offset + 2) return null;
    length = buffer.readUInt16BE(offset);
    offset += 2;
  } else if (length === 127) {
    if (buffer.length < offset + 8) return null;
    const high = buffer.readUInt32BE(offset);
    const low = buffer.readUInt32BE(offset + 4);
    offset += 8;
    if (high !== 0 || low > MAX_FRAME_PAYLOAD) throw new RangeError('frame_too_large');
    length = low;
  }
  if (length > MAX_FRAME_PAYLOAD) throw new RangeError('frame_too_large');
  if (buffer.length < offset + 4 + length) return null;

  const mask = buffer.subarray(offset, offset + 4);
  offset += 4;
  const payload = Buffer.from(buffer.subarray(offset, offset + length));
  for (let index = 0; index < payload.length; index += 1) {
    payload[index] = (payload[index] ?? 0) ^ (mask[index % 4] ?? 0);
  }
  return { frame: { fin, opcode, payload }, remaining: buffer.subarray(offset + length) };
}

function randomId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`;
}

/** @param {EnvelopeOptions} options */
function envelope({ messageType, deviceId, payload, correlationId, causationId, eventId, sequence }) {
  /** @type {ProtocolMessage} */
  const message = {
    protocol_version: '1.0',
    message_id: randomId(),
    message_type: messageType,
    device_id: deviceId,
    timestamp_utc: new Date().toISOString(),
    payload,
  };
  if (eventId !== undefined) message.event_id = eventId;
  if (correlationId !== undefined) message.correlation_id = correlationId;
  if (causationId !== undefined) message.causation_id = causationId;
  if (typeof sequence === 'number') message.sequence = sequence;
  return message;
}

/** @param {HttpServer} server @param {WssOptions} [options] */
export function attachWssTransport(server, options = {}) {
  if (!server || typeof server.on !== 'function') throw new TypeError('server is required');

  const authenticateDevice = options.authenticateDevice ?? (() => false);
  const onMessage = options.onMessage ?? (() => undefined);
  const onError = options.onError ?? (() => undefined);
  /** @type {Set<Session>} */
  const sessions = new Set();
  /** @type {Map<string, ResumeRecord>} */
  const resumeState = new Map();

  /** @param {Session} session @param {ProtocolMessage} message */
  function send(session, message) {
    if (!session.socket.destroyed) session.socket.write(encodeFrame(0x1, JSON.stringify(message)));
  }
  /** @param {Session} session @param {number} [code] @param {string} [reason] */
  function close(session, code = CLOSE_NORMAL, reason = '') {
    if (session.socket.destroyed) return;
    session.state = STATES.CLOSING;
    const reasonBuffer = Buffer.from(reason).subarray(0, 123);
    const payload = Buffer.alloc(2 + reasonBuffer.length);
    payload.writeUInt16BE(code, 0);
    reasonBuffer.copy(payload, 2);
    session.socket.write(encodeFrame(0x8, payload), () => session.socket.end());
  }
  /** @param {Session} session @param {string} code @param {string} message */
  function fail(session, code, message) {
    send(session, envelope({ messageType: 'ERROR', deviceId: session.deviceId ?? 'unknown', payload: { code, message } }));
    close(session, CLOSE_PROTOCOL_ERROR, code);
  }

  /** @param {Session} session @param {ProtocolMessage} message */
  async function processMessage(session, message) {
    const validation = validateWssEnvelope(message);
    if (!validation.valid) {
      fail(session, validation.code, validation.code);
      return;
    }
    if (session.state === STATES.CONNECTING) {
      if (message.message_type !== 'CONNECT') {
        fail(session, 'unauthenticated_client', 'CONNECT is required before other protocol messages');
        return;
      }
      session.state = STATES.AUTHENTICATING;
      session.deviceId = message.device_id;
      const result = await authenticateDevice(message);
      const auth = typeof result === 'boolean' ? { ok: result } : result;
      if (!auth?.ok) {
        send(session, envelope({ messageType: 'AUTH_FAILED', deviceId: session.deviceId, payload: { code: auth?.reason ?? 'authentication_failed' }, ...(message.correlation_id !== undefined ? { correlationId: message.correlation_id } : {}), ...(message.message_id !== undefined ? { causationId: message.message_id } : {}) }));
        close(session, CLOSE_PROTOCOL_ERROR, 'authentication_failed');
        return;
      }
      session.authenticated = true;
      session.state = STATES.READY;
      session.lastSequence = resumeState.get(session.deviceId)?.lastSequence ?? null;
      send(session, envelope({ messageType: 'AUTH_OK', deviceId: session.deviceId, payload: { state: STATES.READY }, ...(message.correlation_id !== undefined ? { correlationId: message.correlation_id } : {}), ...(message.message_id !== undefined ? { causationId: message.message_id } : {}) }));
      return;
    }
    if (session.state !== STATES.READY) {
      fail(session, 'unauthenticated_client', 'connection is not ready');
      return;
    }
    if (message.device_id !== session.deviceId) {
      fail(session, 'invalid_device_id', 'device identity changed during session');
      return;
    }
    if (session.messageIds.has(message.message_id)) return;
    session.messageIds.add(message.message_id);

    if (message.message_type === 'PING') {
      send(session, envelope({ messageType: 'PONG', deviceId: session.deviceId, payload: message.payload, ...(message.correlation_id !== undefined ? { correlationId: message.correlation_id } : {}), ...(message.message_id !== undefined ? { causationId: message.message_id } : {}) }));
      return;
    }
    if (message.message_type === 'RESUME') {
      const last = resumeState.get(session.deviceId);
      let requested = null;
      if (typeof message.payload === 'object' && message.payload !== null && 'last_sequence' in message.payload) {
        const payload = /** @type {{ last_sequence?: unknown }} */ (message.payload);
        requested = typeof payload.last_sequence === 'number' ? payload.last_sequence : null;
      }
      if (last && (requested === last.lastSequence || requested === null)) {
        session.lastSequence = last.lastSequence;
        send(session, envelope({ messageType: 'RESUME_OK', deviceId: session.deviceId, payload: { last_sequence: session.lastSequence ?? 0 }, ...(message.message_id !== undefined ? { causationId: message.message_id } : {}) }));
      } else {
        send(session, envelope({ messageType: 'STATE_SYNC_REQUIRED', deviceId: session.deviceId, payload: { reason: 'resume_unavailable' }, ...(message.message_id !== undefined ? { causationId: message.message_id } : {}) }));
      }
      return;
    }
    if (message.message_type === 'ACK') return;
    if (typeof message.sequence === 'number') {
      if (session.lastSequence !== null && message.sequence <= session.lastSequence) return;
      if (session.lastSequence !== null && message.sequence > session.lastSequence + 1) {
        send(session, envelope({ messageType: 'STATE_SYNC_REQUIRED', deviceId: session.deviceId, payload: { reason: 'sequence_gap', expected: session.lastSequence + 1, received: message.sequence }, ...(message.message_id !== undefined ? { causationId: message.message_id } : {}) }));
        return;
      }
      session.lastSequence = message.sequence;
      resumeState.set(session.deviceId, { lastSequence: session.lastSequence });
    }
    if (message.message_type === 'EVENT') {
      if (!message.event_id) {
        fail(session, 'missing_required_field', 'event_id is required for EVENT');
        return;
      }
      send(session, envelope({ messageType: 'ACK', deviceId: session.deviceId, payload: { event_id: message.event_id }, eventId: message.event_id, ...(message.correlation_id !== undefined ? { correlationId: message.correlation_id } : {}), ...(message.message_id !== undefined ? { causationId: message.message_id } : {}) }));
    }
    try {
      await onMessage(message, { state: session.state, deviceId: session.deviceId, send: (outbound) => send(session, outbound) });
    } catch (error) {
      const normalized = error instanceof Error ? error : new Error(String(error));
      onError(normalized);
      fail(session, 'internal_transport_failure', 'message handling failed');
    }
  }

  /** @param {IncomingMessage} request @param {Socket} socket @param {Buffer} head */
  function acceptUpgrade(request, socket, head) {
    const upgrade = String(request.headers.upgrade ?? '').toLowerCase();
    const connection = String(request.headers.connection ?? '').toLowerCase();
    const key = request.headers['sec-websocket-key'];
    if (upgrade !== 'websocket' || !connection.includes('upgrade') || typeof key !== 'string') {
      socket.destroy();
      return;
    }
    /** @type {Session} */
    const session = { socket, state: STATES.CONNECTING, deviceId: null, authenticated: false, lastSequence: null, messageIds: new Set() };
    sessions.add(session);
    socket.write(['HTTP/1.1 101 Switching Protocols', 'Upgrade: websocket', 'Connection: Upgrade', `Sec-WebSocket-Accept: ${websocketAccept(key)}`, '\r\n'].join('\r\n'));
    let buffer = head.length ? Buffer.from(head) : Buffer.alloc(0);
    socket.on('data', async (chunk) => {
      const chunkBuffer = typeof chunk === 'string' ? Buffer.from(chunk) : chunk;
      buffer = Buffer.concat([buffer, chunkBuffer]);
      try {
        while (buffer.length) {
          const decoded = tryDecodeFrame(buffer);
          if (!decoded) return;
          buffer = decoded.remaining;
          const { opcode, payload } = decoded.frame;
          if (opcode === 0x8) { close(session); return; }
          if (opcode === 0x9) { socket.write(encodeFrame(0xA, payload)); continue; }
          if (opcode !== 0x1) { fail(session, 'unsupported_frame', 'only text frames are supported'); return; }
          let message;
          try {
            message = /** @type {ProtocolMessage} */ (JSON.parse(payload.toString('utf8')));
          } catch {
            fail(session, 'malformed_envelope', 'invalid JSON payload');
            return;
          }
          await processMessage(session, message);
          if (socket.destroyed) return;
        }
      } catch (error) {
        const normalized = error instanceof Error ? error : new Error(String(error));
        onError(normalized);
        fail(session, normalized instanceof RangeError ? 'message_too_large' : 'malformed_envelope', 'invalid websocket frame');
      }
    });
    socket.on('close', () => {
      session.state = STATES.DISCONNECTED;
      sessions.delete(session);
      if (session.deviceId) resumeState.set(session.deviceId, { lastSequence: session.lastSequence });
    });
    socket.on('error', (error) => onError(error));
  }

  server.on('upgrade', acceptUpgrade);
  return {
    states: STATES,
    getActiveSessionCount: () => sessions.size,
    getSessionState: (/** @type {string} */ deviceId) => [...sessions].find(session => session.deviceId === deviceId)?.state ?? STATES.DISCONNECTED,
    close() {
      server.off('upgrade', acceptUpgrade);
      for (const session of sessions) close(session, CLOSE_NORMAL, 'shutdown');
      sessions.clear();
    },
  };
}
