import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const html = readFileSync(path.join(root, "apps", "desktop", "src", "index.html"), "utf8");
const app = readFileSync(path.join(root, "apps", "desktop", "src", "first-sale", "app.js"), "utf8");


test("first-sale UX stays outside Electron backend boundaries", () => {
  assert.match(html, /first-sale\/app\.js/);
  assert.match(html, /first-sale\/styles\.css/);
  assert.doesNotMatch(app, /main\.cjs|preload\.cjs|ipcMain|ipcRenderer/);
});

test("commercial authority is not reimplemented in the renderer", () => {
  assert.match(app, /frontend does not calculate|não calcula subtotal, desconto ou total/i);
  assert.doesNotMatch(app, /subtotal\s*=|total\s*=|discount_cents\s*=|price\s*[+\-*\/]/i);
});

test("confirmation has duplicate-submit protection", () => {
  assert.match(app, /state\.submitting/);
  assert.match(app, /if \(!state\.coreReady \|\| state\.submitting\) return/);
  assert.match(app, /Confirmar pedido/);
});

test("UX exposes the complete first-sale flow", () => {
  for (const step of ["conversation", "product", "review", "address", "payment", "confirmation", "result"]) {
    assert.match(app, new RegExp(`id: "${step}"`));
  }
});
