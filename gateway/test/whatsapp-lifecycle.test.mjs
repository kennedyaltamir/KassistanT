import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const source = fs.readFileSync(new URL('../src/whatsapp.mjs', import.meta.url), 'utf8');

function count(text) {
  return (source.match(new RegExp(text, 'g')) ?? []).length;
}

test('WhatsApp lifecycle uses a monotonic generation guard for socket events', () => {
  assert.equal(count('lifecycleGeneration'), 7);
  assert.match(source, /let lifecycleGeneration = 0;/);
  assert.match(source, /async function startSocket\(\{ generation \} = \{ generation: lifecycleGeneration \}\)/);
  assert.match(source, /if \(generation !== lifecycleGeneration\) \{/);
  assert.match(source, /await safelyEndSocket\(socketInstance\)/);
});

test('intentional logout and disconnect invalidate the active socket lifecycle before closing it', () => {
  assert.match(
    source,
    /export async function disconnect\(\) \{\s*lifecycleGeneration \+= 1;\s*if \(reconnectTimer\)/s
  );
  assert.match(
    source,
    /export async function logout\(\) \{\s*lifecycleGeneration \+= 1;\s*if \(reconnectTimer\)/s
  );
  assert.match(
    source,
    /export async function shutdown\(\) \{\s*shuttingDown = true;\s*lifecycleGeneration \+= 1;/s
  );
});

test('reset clears authentication and ends in DISCONNECTED without automatic reconnect', () => {
  const start = source.indexOf('export async function resetSession()');
  assert.notEqual(start, -1);
  const end = source.indexOf('/** @param {string} to', start);
  assert.notEqual(end, -1);
  const resetSource = source.slice(start, end);

  assert.match(resetSource, /await logout\(\);/);
  assert.match(resetSource, /await clearAuthState\(\);/);
  assert.match(resetSource, /state\.connection = 'DISCONNECTED';/);
  assert.doesNotMatch(resetSource, /setTimeout\(.*connect\(/s);
});

test('explicit connect starts a new lifecycle generation', () => {
  assert.match(source, /export async function connect\(\) \{[\s\S]*?lifecycleGeneration \+= 1;[\s\S]*?startSocket\(\{ generation \}\)/);
});

test('unexpected current-socket close still schedules automatic reconnect', () => {
  assert.match(
    source,
    /if \(loggedOut\) \{[\s\S]*?return;\s*\}\s*\n\s*reconnectTimer = setTimeout\(\(\) => \{\s*reconnectTimer = null;\s*connect\(\)/
  );
});

test('stale socket events are bound to their originating socket instance', () => {
  assert.match(source, /const socketInstance = makeWASocket\(/);
  assert.match(source, /if \(socketInstance === socket\) socket = null;/);
  assert.match(source, /async function safelyEndSocket\(targetSocket = socket\)/);
  assert.match(source, /if \(current === socket\) socket = null;/);
});

// Contract guard: the renderer-facing connection model remains the five official states.
test('lifecycle patch does not introduce a new connection state', () => {
  assert.match(
    source,
    /@typedef \{'DISCONNECTED' \| 'CONNECTING' \| 'PAIRING' \| 'CONNECTED' \| 'ERROR'\}/
  );
  assert.doesNotMatch(source, /'RECONNECTING'|'LOGGED_OUT'|'UNAVAILABLE'/);
});
