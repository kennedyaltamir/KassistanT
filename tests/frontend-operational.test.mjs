import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const html = readFileSync(
  new URL("../apps/desktop/src/index.html", import.meta.url),
  "utf8"
);

test("AppShell exposes current C1 navigation surfaces", () => {
  for (const page of [
    "Dashboard",
    "WhatsApp",
    "Pedidos",
    "Produtos",
    "Clientes",
    "Configurações"
  ]) {
    assert.match(html, new RegExp(page));
  }

  assert.match(html, /data-page="dashboard"/);
  assert.match(html, /data-page="whatsapp"/);
  assert.match(html, /aria-label="Navegação principal"/);
});

test("WhatsApp renderer exposes real Gateway integration", () => {
  assert.match(html, /127\.0\.0\.1:3210/);
  assert.match(html, /\/health/);
  assert.match(html, /\/api\/whatsapp\/status/);
  assert.match(html, /\/api\/whatsapp\/messages\?limit=500/);
  assert.match(html, /\/api\/whatsapp\/events/);
});

test("WhatsApp renderer exposes explicit operational states", () => {
  for (const status of [
    "HEALTHY",
    "UNAVAILABLE",
    "UNKNOWN",
    "CONNECTED",
    "DISCONNECTED",
    "CONNECTING",
    "ERROR"
  ]) {
    assert.match(html, new RegExp(status));
  }
});

test("WhatsApp renderer preserves delivery boundary", () => {
  assert.match(html, /connection==='CONNECTED'/);
  assert.match(html, /canSend/);
  assert.match(html, /aguardando evento SSE/);
});

test("WhatsApp renderer preserves real conversation identity", () => {
  assert.match(html, /Conversas reais/);
  assert.match(html, /JID REAL/);
  assert.match(html, /@lid/);
  assert.match(html, /message\.id/);
});

test("Provisional UI boundaries remain explicit", () => {
  assert.match(html, /PROVISIONAL_DATA/);
  assert.match(html, /presentation-only|presentation only/i);
});

test("Diagnostics surface exists", () => {
  assert.match(html, /Diagnostics/);
  assert.match(html, /Gateway/);
  assert.match(html, /WhatsApp/);
  assert.match(html, /SSE/);
});

test("Accessibility-critical primitives exist", () => {
  assert.match(html, /role="dialog"/);
  assert.match(html, /aria-modal="true"/);
  assert.match(html, /tabindex="-1"/);
  assert.match(html, /:focus/);
});
