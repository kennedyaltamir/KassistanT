import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const source = fs.readFileSync(new URL('../src/whatsapp.mjs', import.meta.url), 'utf8');

test('WhatsApp lifecycle uses a monotonic generation guard for socket events', () => {
  assert.match(source, /let lifecycleGeneration = 0;/);
  assert.match(source, /async function startSocket\(\{ generation \} = \{ generation: lifecycleGeneration \}\)/);
  assert.match(source, /if \(generation !== lifecycleGeneration \|\| shuttingDown\) return;/);
  assert.match(source, /if \(generation !== lifecycleGeneration\) \{[\s\S]*?await safelyEndSocket\(socketInstance\);[\s\S]*?\}/);
  assert.match(source, /export async function connect\(\) \{[\s\S]*?lifecycleGeneration \+= 1;[\s\S]*?const generation = lifecycleGeneration;[\s\S]*?startSocket\(\{ generation \}\)/);
  assert.match(source, /export async function logout\(\) \{[\s\S]*?lifecycleGeneration \+= 1;/);
  assert.match(source, /export async function shutdown\(\) \{[\s\S]*?shuttingDown = true;[\s\S]*?lifecycleGeneration \+= 1;/);
});

test('logout is the transport disconnect contract and invalidates the active lifecycle before closing the socket', () => {
  assert.doesNotMatch(source, /export async function disconnect\(\)/);

  assert.match(
    source,
    /export async function logout\(\) \{[\s\S]*?lifecycleGeneration \+= 1;[\s\S]*?if \(reconnectTimer\) \{/
  );

  assert.match(
    source,
    /export async function logout\(\) \{[\s\S]*?const current = socket;[\s\S]*?socket = null;[\s\S]*?current\.logout\(/
  );

  assert.match(
    source,
    /export async function shutdown\(\) \{[\s\S]*?shuttingDown = true;[\s\S]*?lifecycleGeneration \+= 1;[\s\S]*?const activeSocket = socket;[\s\S]*?socket = null;[\s\S]*?activeSocket\.end/
  );
});

test('reset clears authentication only after lifecycle invalidation and pending credential saves settle', () => {
  const start = source.indexOf('export async function resetSession()');
  assert.notEqual(start, -1);
  const end = source.indexOf('export async function sendText', start);
  assert.notEqual(end, -1);
  const resetSource = source.slice(start, end);

  const logoutIndex = resetSource.indexOf('await logout();');
  const pendingSaveIndex = resetSource.indexOf('await pendingCredsSave;');
  const clearAuthIndex = resetSource.indexOf('await clearAuthState();');
  const disconnectedIndex = resetSource.indexOf("state.connection = 'DISCONNECTED';");

  assert.ok(logoutIndex >= 0);
  assert.ok(pendingSaveIndex > logoutIndex);
  assert.ok(clearAuthIndex > pendingSaveIndex);
  assert.ok(disconnectedIndex > clearAuthIndex);
  assert.doesNotMatch(resetSource, /setTimeout\([\s\S]*?connect\(/);
});

test('stale creds.update cannot persist credentials after lifecycle invalidation', () => {
  assert.match(
    source,
    /socketInstance\.ev\.on\('creds\.update', \(\) => \{[\s\S]*?const saveGeneration = generation;[\s\S]*?saveGeneration !== lifecycleGeneration[\s\S]*?socketInstance !== socket[\s\S]*?shuttingDown[\s\S]*?await saveCreds\(\)/
  );

  assert.match(
    source,
    /const saveGeneration = generation;[\s\S]*?pendingCredsSave = pendingCredsSave[\s\S]*?\.then\(async \(\) => \{/
  );
});

test('stale messages.upsert cannot publish after lifecycle invalidation', () => {
  assert.match(
    source,
    /const isCurrentLifecycle = \(\) =>[\s\S]*?generation === lifecycleGeneration[\s\S]*?socketInstance === socket[\s\S]*?!shuttingDown/
  );

  assert.match(
    source,
    /if \(!isCurrentLifecycle\(\)\) return;[\s\S]*?await persistSnapshot\(snapshot\);[\s\S]*?if \(!isCurrentLifecycle\(\)\) return;[\s\S]*?recordMessage\(snapshot\)/
  );
});

test('explicit connect starts a new lifecycle generation', () => {
  assert.match(source, /export async function connect\(\) \{[\s\S]*?lifecycleGeneration \+= 1;[\s\S]*?startSocket\(\{ generation \}\)/);
});

test('unexpected current-socket close still schedules automatic reconnect', () => {
  const closeStart = source.indexOf("if (connection === 'close') {");
  assert.notEqual(closeStart, -1);
  const closeEnd = source.indexOf("socketInstance.ev.on('messages.upsert'", closeStart);
  assert.notEqual(closeEnd, -1);
  const closeSource = source.slice(closeStart, closeEnd);

  assert.match(closeSource, /const loggedOut = statusCode === DisconnectReason\.loggedOut;/);
  assert.match(closeSource, /if \(reconnectTimer\) \{[\s\S]*?clearTimeout\(reconnectTimer\);[\s\S]*?reconnectTimer = null;[\s\S]*?\}/);
  assert.match(closeSource, /state\.connection = loggedOut \? 'DISCONNECTED' : 'CONNECTING';/);
  assert.match(closeSource, /if \(!loggedOut\)\s*reconnectTimer = setTimeout\(\(\) => \{[\s\S]*?reconnectTimer = null;[\s\S]*?connect\(\)/);
  assert.match(closeSource, /if \(shuttingDown\) \{[\s\S]*?state\.connection = 'DISCONNECTED';[\s\S]*?return;[\s\S]*?\}\s*state\.connection = loggedOut/);
});

test('stale socket events are bound to their originating socket instance', () => {
  assert.match(source, /const socketInstance = makeWASocket\(/);
  assert.match(source, /if \(socketInstance === socket\) socket = null;/);
  assert.match(source, /async function safelyEndSocket\(targetSocket = socket\)/);
  assert.match(source, /if \(current === socket\) socket = null;/);
});

test('lifecycle keeps exactly the five official connection states', () => {
  assert.match(
    source,
    /@typedef \{'DISCONNECTED' \| 'CONNECTING' \| 'PAIRING' \| 'CONNECTED' \| 'ERROR'\}/
  );
  assert.doesNotMatch(source, /'RECONNECTING'|'LOGGED_OUT'|'UNAVAILABLE'/);
});
