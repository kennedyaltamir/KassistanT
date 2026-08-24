import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const html = readFileSync(new URL("../apps/desktop/src/index.html", import.meta.url), "utf8");

test("AppShell exposes every C1 navigation surface", () => {
  for (const page of ["Dashboard", "Conversas", "Pedidos", "Produtos", "Clientes", "Configurações"]) assert.match(html, new RegExp(page));
});

test("products and orders expose validation and confirmation behavior", () => {
  assert.match(html, /product-form/);
  assert.match(html, /Informe um preço maior que zero/);
  assert.match(html, /Confirmar pedido\?/);
  assert.match(html, /DRAFT/);
  assert.match(html, /CONFIRMED/);
});

test("conversations never claim delivery without transport", () => {
  assert.match(html, /Enviar • UNAVAILABLE/);
  assert.match(html, /Transport real não conectado/);
  assert.doesNotMatch(html, /MESSAGE_SENT/);
});

test("renderer preserves provisional and unavailable integration boundaries", () => {
  assert.match(html, /PROVISIONAL_DATA/);
  assert.match(html, /NOT_CONNECTED/);
  assert.match(html, /UNAVAILABLE/);
});
