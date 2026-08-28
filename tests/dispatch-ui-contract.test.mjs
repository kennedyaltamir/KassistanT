import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';

const ui = readFileSync(new URL('../apps/desktop/src/assistant-products-ui.js', import.meta.url), 'utf8');

function requireAll(patterns, message) {
  for (const pattern of patterns) assert.match(ui, pattern, message);
}

test('dispatch UI consumes the canonical batch state contract', () => {
  requireAll([
    /batchId/,
    /preview/,
    /fingerprint/,
    /recipientCount/,
    /recipients/
  ], 'dispatch UI must reference the canonical batch fields');

  assert.doesNotMatch(ui, /dispatchBatch\.fingerprint/, 'UI must not read fingerprint from the batch root');
  assert.doesNotMatch(ui, /dispatchBatch\.recipientCount/, 'UI must not read recipientCount from the batch root');
});

test('dispatch UI keeps confirmation as a hard gate before queueing', () => {
  requireAll([
    /action\s*:\s*["']confirm["']/,
    /action\s*:\s*["']queue["']/,
    /CONFIRMED/,
    /window\.confirm/
  ], 'dispatch UI must preserve explicit confirmation before queueing');

  const confirmIndex = ui.search(/action\s*:\s*["']confirm["']/);
  const queueIndex = ui.search(/action\s*:\s*["']queue["']/);
  assert.ok(confirmIndex >= 0 && queueIndex >= 0 && confirmIndex < queueIndex, 'confirmation action must appear before queue action');
});

test('dispatch UI exposes persisted recipient outcomes', () => {
  requireAll([
    /batch\.recipients/,
    /recipient\.state/,
    /recipient\.attempts/,
    /recipient\.lastError/
  ], 'dispatch UI must render persisted recipient outcome data');
});
