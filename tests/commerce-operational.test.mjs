import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const preload = readFileSync(new URL("../apps/desktop/electron/preload.cjs", import.meta.url), "utf8");
const renderer = readFileSync(new URL("../apps/desktop/src/commerce-ui.js", import.meta.url), "utf8");

for (const channel of [
  "commerce.products.list",
  "commerce.products.create",
  "commerce.orders.list",
  "commerce.orders.createDraft",
  "commerce.orders.confirm"
]) {
  test(`preload allowlist exposes ${channel}`, () => {
    assert.match(preload, new RegExp(channel.replaceAll(".", "\\.")));
  });
}

test("Commerce renderer consumes canonical IPC instead of fixtures", () => {
  assert.match(renderer, /window\.kassist\?\.commerce/);
  assert.match(renderer, /api\.products\.list/);
  assert.match(renderer, /api\.products\.create/);
  assert.match(renderer, /api\.orders\.createDraft/);
  assert.match(renderer, /api\.orders\.confirm/);
  assert.doesNotMatch(renderer, /p-demo-|o-demo-/);
  assert.doesNotMatch(renderer, /PROVISIONAL_DATA/);
});

test("Commerce renderer keeps money in integer cents at IPC boundary", () => {
  assert.match(renderer, /price_amount_cents/);
  assert.match(renderer, /parseMoneyCents/);
  assert.match(renderer, /Number\.isSafeInteger/);
});

test("Commerce renderer represents loading, empty and error states", () => {
  assert.match(renderer, /Carregando catálogo/);
  assert.match(renderer, /Nenhum produto cadastrado/);
  assert.match(renderer, /Nenhum pedido persistido/);
  assert.match(renderer, /role=\"alert\"/);
});
