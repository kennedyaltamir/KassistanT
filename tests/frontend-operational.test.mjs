import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const html = readFileSync(new URL("../apps/desktop/src/index.html", import.meta.url), "utf8");

test("AppShell exposes every C1 navigation surface and active navigation", () => {
  for (const page of ["Dashboard", "Conversas", "Pedidos", "Produtos", "Clientes", "Configurações"]) assert.match(html, new RegExp(page));
  assert.match(html, /data-page="dashboard" class="active"/);
  assert.match(html, /aria-label="Navegação principal"/);
});

test("products provide create, detail, edit and presentation validation", () => {
  assert.match(html, /Novo produto/);
  assert.match(html, /Editar produto/);
  assert.match(html, /product-form/);
  assert.match(html, /Informe ao menos 2 caracteres/);
  assert.match(html, /Informe um preço maior que zero/);
  assert.match(html, /Salvar na sessão/);
});

test("orders expose DRAFT review, item creation and explicit confirmation", () => {
  assert.match(html, /Adicionar item/);
  assert.match(html, /Confirmar pedido/);
  assert.match(html, /Confirmar pedido\?/);
  assert.match(html, /DRAFT/);
  assert.match(html, /CONFIRMED/);
  assert.match(html, /modifiers/);
  assert.doesNotMatch(html, /product_id/);
});

test("conversations never claim delivery without real transport", () => {
  assert.match(html, /Enviar • UNAVAILABLE/);
  assert.match(html, /Transport real não conectado/);
  assert.doesNotMatch(html, /MESSAGE_SENT/);
});

test("clients, settings and diagnostics have explicit operational states", () => {
  assert.match(html, /Clientes/);
  assert.match(html, /Diagnostics/);
  for (const status of ["HEALTHY", "UNAVAILABLE", "NOT_CONNECTED", "UNKNOWN"]) assert.match(html, new RegExp(status));
});

test("renderer preserves provisional and unavailable integration boundaries", () => {
  assert.match(html, /PROVISIONAL_DATA/);
  assert.match(html, /NOT_CONNECTED/);
  assert.match(html, /UNAVAILABLE/);
  assert.match(html, /não representam persistência real/i);
});

test("accessibility-critical primitives exist", () => {
  assert.match(html, /role="dialog"/);
  assert.match(html, /aria-modal="true"/);
  assert.match(html, /tabindex="-1"/);
  assert.match(html, /:focus/);
  assert.match(html, /<label/);
});
