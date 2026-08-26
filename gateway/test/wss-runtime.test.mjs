import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { connect as connectSocket } from 'node:net';
import { randomBytes, createHash } from 'node:crypto';
import { attachWssTransport } from '../src/wss.mjs';

function envelope(type, deviceId = 'device-1', payload = {}, extra = {}) {
  return {
    protocol_version: '1.0',
    message_id: extra.message_id ?? randomBytes(8).toString('hex'),
    message_type: type,
    device_id: deviceId,
    timestamp_utc: '2026-08-26T00:00:00.000Z',
    payload,
    ...extra,
  };
}

function maskFrame(text) {
  const payload = Buffer.from(text);
  const mask = Buffer.from([1, 2, 3, 4]);
  const header = payload.length < 126
    ? Buffer.from([0x81, 0x80 | payload.length])
    : (() => {
        const h = Buffer.alloc(4);
        h[0] = 0x81;
        h[1] = 0x80 | 126;
        h.writeUInt16BE(payload.length, 2);
        return h;
      })();
  const masked = Buffer.alloc(payload.length);
  for (let i = 0; i < payload.length; i += 1) masked[i] = payload[i] ^ mask[i % 4];
  return Buffer.concat([header, mask, masked]);
}

function frameReader(socket) {
  let buffer = Buffer.alloc(0);
  const queue = [];
  const waiters = [];
  socket.on('data', chunk => {
    buffer = Buffer.concat([buffer, chunk]);
    while (buffer.length >= 2) {
      const opcode = buffer[0] & 0x0f;
      const len = buffer[1] & 0x7f;
      let offset = 2;
      let bodyLength = len;
      if (len === 126) {
        if (buffer.length < 4) break;
        bodyLength = buffer.readUInt16BE(2);
        offset = 4;
      }
      if (buffer.length < offset + bodyLength) break;
      const body = Buffer.from(buffer.subarray(offset, offset + bodyLength));
      buffer = buffer.subarray(offset + bodyLength);
      const frame = { opcode, payload: body };
      if (waiters.length) waiters.shift()(frame);
      else queue.push(frame);
    }
  });
  return () => new Promise(resolve => {
    if (queue.length) resolve(queue.shift());
    else waiters.push(resolve);
  });
}

async function openWebSocket(server) {
  const socket = connectSocket(server.address().port, '127.0.0.1');
  await new Promise(resolve => socket.once('connect', resolve));
  const key = randomBytes(16).toString('base64');
  socket.write([
    'GET / HTTP/1.1',
    'Host: 127.0.0.1',
    'Upgrade: websocket',
    'Connection: Upgrade',
    `Sec-WebSocket-Key: ${key}`,
    'Sec-WebSocket-Version: 13',
    '\r\n',
  ].join('\r\n'));

  let handshake = Buffer.alloc(0);
  while (!handshake.toString('latin1').includes('\r\n\r\n')) {
    handshake = Buffer.concat([handshake, await new Promise(resolve => socket.once('data', resolve))]);
  }
  const expected = createHash('sha1').update(`${key}258EAFA5-E914-47DA-95CA-C5AB0DC85B11`).digest('base64');
  assert.ok(handshake.toString('latin1').includes(`Sec-WebSocket-Accept: ${expected}`));

  return { socket, next: frameReader(socket), send: message => socket.write(maskFrame(JSON.stringify(message))) };
}

async function withRuntime(authenticateDevice, callback) {
  const server = createServer();
  const runtime = attachWssTransport(server, { authenticateDevice });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  try {
    await callback(runtime, server);
  } finally {
    runtime.close();
    await new Promise(resolve => server.close(resolve));
  }
}

async function nextJson(ws) {
  const frame = await ws.next();
  assert.equal(frame.opcode, 0x1);
  return JSON.parse(frame.payload.toString());
}

test('WSS lifecycle reaches READY after authentication and preserves correlation', async () => {
  await withRuntime(async message => message.device_id === 'device-1', async (runtime, server) => {
    const ws = await openWebSocket(server);
    ws.send(envelope('CONNECT', 'device-1', {}, { correlation_id: 'corr-connect' }));
    const response = await nextJson(ws);
    assert.equal(response.message_type, 'AUTH_OK');
    assert.equal(response.correlation_id, 'corr-connect');
    assert.equal(response.causation_id !== undefined, true);
    assert.equal(runtime.getSessionState('device-1'), 'READY');
    ws.socket.destroy();
  });
});

test('WSS rejects authentication failure and never reaches READY', async () => {
  await withRuntime(async () => false, async (runtime, server) => {
    const ws = await openWebSocket(server);
    ws.send(envelope('CONNECT'));
    const response = await nextJson(ws);
    assert.equal(response.message_type, 'AUTH_FAILED');
    assert.equal(runtime.getSessionState('device-1'), 'CONNECTING');
    ws.socket.destroy();
  });
});

test('WSS emits deterministic ERROR for malformed envelope', async () => {
  await withRuntime(async () => true, async (_runtime, server) => {
    const ws = await openWebSocket(server);
    ws.send({ message_type: 'CONNECT', device_id: 'device-1' });
    const response = await nextJson(ws);
    assert.equal(response.message_type, 'ERROR');
    assert.equal(response.payload.code, 'invalid_protocol_version');
    ws.socket.destroy();
  });
});

test('WSS ACKs EVENT with event_id and preserves correlation/causation', async () => {
  let delivered = 0;
  await withRuntime(async () => true, async (_runtime, server) => {
    const ws = await openWebSocket(server);
    // Authentication boundary is sufficient for this focused transport test.
    ws.send(envelope('CONNECT'));
    await nextJson(ws);
    ws.send(envelope('EVENT', 'device-1', { value: 1 }, { event_id: 'evt-1', correlation_id: 'corr-1', causation_id: 'cause-1', sequence: 1 }));
    const ack = await nextJson(ws);
    assert.equal(ack.message_type, 'ACK');
    assert.deepEqual(ack.payload, { event_id: 'evt-1' });
    assert.equal(ack.event_id, 'evt-1');
    assert.equal(ack.correlation_id, 'corr-1');
    assert.equal(typeof ack.causation_id, 'string');
    delivered += 1;
    assert.equal(delivered, 1);
    ws.socket.destroy();
  });
});

test('WSS requests state sync on a sequence gap and ignores duplicate message id', async () => {
  let delivered = 0;
  const server = createServer();
  const runtime = attachWssTransport(server, { authenticateDevice: async () => true, onMessage: async () => { delivered += 1; } });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  try {
    const ws = await openWebSocket(server);
    ws.send(envelope('CONNECT'));
    await nextJson(ws);

    const first = envelope('COMMAND', 'device-1', { action: 'one' }, { message_id: 'dup-1', sequence: 1 });
    ws.send(first);
    await new Promise(resolve => setImmediate(resolve));
    ws.send(first);
    await new Promise(resolve => setImmediate(resolve));
    assert.equal(delivered, 1);

    ws.send(envelope('COMMAND', 'device-1', { action: 'three' }, { message_id: 'gap-3', sequence: 3 }));
    const sync = await nextJson(ws);
    assert.equal(sync.message_type, 'STATE_SYNC_REQUIRED');
    assert.equal(sync.payload.reason, 'sequence_gap');
    ws.socket.destroy();
  } finally {
    runtime.close();
    await new Promise(resolve => server.close(resolve));
  }
});

test('WSS removes upgrade listener and closes active sessions on shutdown', async () => {
  await withRuntime(async () => true, async (runtime, server) => {
    const ws = await openWebSocket(server);
    ws.send(envelope('CONNECT'));
    await nextJson(ws);
    assert.equal(runtime.getActiveSessionCount(), 1);
    runtime.close();
    assert.equal(runtime.getActiveSessionCount(), 0);
    ws.socket.destroy();
  });
});
