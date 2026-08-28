import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';

const ui = readFileSync(new URL('../apps/desktop/src/assistant-products-ui.js', import.meta.url), 'utf8');

test('dispatch UI consumes canonical batch shape', () => {
  assert.match(ui, /state\.dispatchBatch\.batchId/);
  assert.match(ui, /state\.dispatchBatch\.preview\.fingerprint/);
  assert.match(ui, /state\.dispatchBatch\.preview\.recipientCount/);
  assert.doesNotMatch(ui, /state\.dispatchBatch\.fingerprint/);
  assert.doesNotMatch(ui, /state\.dispatchBatch\.recipientCount/);
});

test('dispatch UI requires explicit confirmation before queue', () => {
  assert.match(ui, /state\.dispatchBatch\.state === 'CONFIRMED'/);
  assert.match(ui, /window\.confirm\([^)]*efeito externo/i);
  assert.match(ui, /action:'confirm'/);
  assert.match(ui, /action:'queue'/);
});

test('dispatch UI renders persisted recipient outcomes', () => {
  assert.match(ui, /Object\.values\(batch\.recipients/);
  assert.match(ui, /recipient\.state/);
  assert.match(ui, /recipient\.attempts/);
  assert.match(ui, /recipient\.lastError/);
});
