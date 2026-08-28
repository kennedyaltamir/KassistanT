import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';

const ui = readFileSync(new URL('../apps/desktop/src/assistant-products-ui.js', import.meta.url), 'utf8');
const preload = readFileSync(new URL('../apps/desktop/electron/preload.cjs', import.meta.url), 'utf8');
const main = readFileSync(new URL('../apps/desktop/electron/main.cjs', import.meta.url), 'utf8');

test('assistant UI uses canonical structured configuration values', () => {
  assert.match(ui, /responseFormat/);
  for (const value of ['natural_text', 'concise_text', 'bullet_points', 'markdown']) assert.match(ui, new RegExp(value));
  assert.match(ui, /deliveryFeePolicy/);
  assert.match(ui, /amountCents/);
  assert.match(ui, /parseHours/);
  assert.match(ui, /businessHours:parseHours/);
  assert.match(ui, /autoReplyEnabled/);
});

test('conversation UI consumes persisted external thread and customer fields', () => {
  assert.match(ui, /externalThreadId/);
  assert.match(ui, /lastMessage\?\.text/);
  assert.match(ui, /phoneNormalized/);
  assert.match(ui, /conversation-context/);
  assert.match(ui, /conversation-analysis/);
});

test('product UI persists integer-cent pricing and local image reference', () => {
  assert.match(ui, /priceCents/);
  assert.match(ui, /Math\.round\(amount\*100\)/);
  assert.match(ui, /selectProductImage/);
  assert.match(ui, /imageReference/);
  assert.match(main, /kassist:select-product-image/);
  assert.match(preload, /ipcRenderer\.invoke\("kassist:select-product-image"\)/);
});

test('renderer remains isolated from Node filesystem APIs', () => {
  assert.doesNotMatch(ui, /require\(/);
  assert.doesNotMatch(ui, /from ['"]node:/);
  assert.doesNotMatch(ui, /process\.env/);
});

test('dispatch remains preview-first and confirmation-gated', () => {
  assert.match(ui, /dispatch\/preview\/csv/);
  assert.match(ui, /dispatch\/preview\/manual/);
  assert.match(ui, /dispatch\/batches/);
  assert.match(ui, /action:'confirm'/);
  assert.match(ui, /action:'queue'/);
  assert.match(ui, /fingerprint:state\.dispatchBatch\.fingerprint/);
});
