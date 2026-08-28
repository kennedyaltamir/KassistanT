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
  assert.match(source, /async function startSocket\(\{ generation \} = \{\}\)/);
  assert.match(source, /if \(generation !== lifecycleGeneration\) \{/);
  assert.match(source, /await safelyEndSocket\(socketInstance\)/);
});

test('intentional logout and disconnect invalidate the active socket lifecycle before closing it', () => {
  assert.match(
    source,
    /export async function disconnect\(\) \{\s*lifecycleGeneration \+= 1;\s*cancelScheduledReconnect\(\);/s
  );
  assert.match(
    source,
    /export async function logout\(\) \{\s*lifecycleGeneration \+= 1;\s*cancelScheduledReconnect\(\);/s
  );
  assert.match(
    source,
    /export async function shutdown\(\) \{\s*shuttingDown = true;\s*lifecycleGeneration \+= 1;/s
  );
});

test('reset delegates to logout and clears persisted authentication without reconnect logic', () => {
  assert.match(
    source,
    /export async function resetSession\(\) \{\s*await logout\(\);\s*await clearAuthState\(\);/s
  );
  assert.doesNotMatch(source, /POST \/api\/whatsapp\/reconnect/);
});

test('unexpected current-socket close still schedules automatic reconnect', () => {
  assert.match(
    source,
    /if \(loggedOut\) \{[\s\S]*?return;\s*\}\s*\n\s*reconnectTimer = setTimeout\(\(\) => \{\s*reconnectTimer = null;\s*connect\(\)/
  );
});

test('connect creates a new lifecycle generation and passes it into startSocket', () => {
  assert.match(source, /lifecycleGeneration \+= 1;\s*const generation = lifecycleGeneration;/s);
  assert.match(source, /await startSocket\(\{ generation \}\);/);
});

// Contract guard: the renderer-facing connection model remains the five official states.
test('lifecycle patch does not introduce a new connection state', () => {
  assert.match(
    source,
    /@typedef \{'DISCONNECTED' \| 'CONNECTING' \| 'PAIRING' \| 'CONNECTED' \| 'ERROR'\}/
  );
  assert.doesNotMatch(source, /'RECONNECTING'|'LOGGED_OUT'|'UNAVAILABLE'/);
});
