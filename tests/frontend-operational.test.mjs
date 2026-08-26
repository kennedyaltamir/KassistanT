import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const html = readFileSync(new URL("../apps/desktop/src/index.html", import.meta.url), "utf8");

test("AppShell exposes all operational navigation surfaces", () => {
  for (const page of ["Dashboard", "Conversas", "Assistente", "Disparos", "Grupos", "Pedidos", "Produtos", "Clientes", "Configurações"]) assert.match(html, new RegExp(page));
  for (const pageId of ["dashboard", "whatsapp", "assistant", "broadcasts", "groups", "orders", "products", "clients", "settings"]) assert.match(html, new RegExp(`data-page=\\"${pageId}\\"`));
  assert.match(html, /aria-label="Navegação principal"/);
});

test("Conversation navigation follows canonical terminology", () => {
  assert.match(html, /<button data-page="whatsapp" class="active">Conversas<\/button>/);
  assert.match(html, /const pages=\{[^}]*whatsapp:'Conversas'/);
  assert.doesNotMatch(html, /<button data-page="whatsapp"[^>]*>WhatsApp<\/button>/);
});

test("WhatsApp renderer exposes real Gateway integration", () => {
  assert.match(html, /127\.0\.0\.1:3210/);
  assert.match(html, /\/health/);
  assert.match(html, /\/api\/whatsapp\/status/);
  assert.match(html, /\/api\/whatsapp\/messages\?limit=500/);
  assert.match(html, /\/api\/whatsapp\/events/);
});

test("WhatsApp renderer exposes explicit operational states", () => {
  for (const status of ["HEALTHY", "UNAVAILABLE", "UNKNOWN", "CONNECTED", "DISCONNECTED", "CONNECTING", "ERROR"]) assert.match(html, new RegExp(status));
});

test("WhatsApp renderer preserves delivery boundary", () => {
  assert.match(html, /connection==='CONNECTED'/);
  assert.match(html, /canSend/);
  assert.match(html, /aguardando evento SSE/);
  assert.match(html, /Delivery UNKNOWN/);
});

test("WhatsApp renderer preserves real conversation identity", () => {
  assert.match(html, /Conversas reais/);
  assert.match(html, /JID REAL/);
  assert.match(html, /@lid/);
  assert.match(html, /message\.id/);
});

test("New operational surfaces remain honest when backend contracts are absent", () => {
  assert.match(html, /renderAssistant/);
  assert.match(html, /renderBroadcasts/);
  assert.match(html, /renderGroups/);
  assert.match(html, /NOT_IMPLEMENTED/);
  assert.match(html, /UNAVAILABLE/);
  assert.match(html, /EMPTY/);
  assert.match(html, /LOADING/);
  assert.match(html, /disabled/);
  assert.match(html, /Não há ação local que represente envio/);
});

test("Settings exposes the required operational categories", () => {
  for (const section of ["Geral", "WhatsApp", "Assistente IA", "Operação", "Segurança", "Dados e Privacidade", "Diagnóstico", "Sobre"]) assert.match(html, new RegExp(section));
  assert.match(html, /role="tablist"/);
  assert.match(html, /aria-label="Categorias de configurações"/);
});

test("Provider-neutral navigation and contextual provider semantics are preserved", () => {
  assert.doesNotMatch(html, /data-page="[^"]+">WhatsApp<\/button>/);
  assert.match(html, /WhatsApp \/ Conexão/);
  assert.match(html, /Canal\/provider contextual/);
});

test("No parallel assistant config or DLQ is introduced", () => {
  assert.doesNotMatch(html, /AssistantConfig/);
  assert.doesNotMatch(html, /\bDLQ\b/);
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
  assert.match(html, /Persistence/);
  assert.match(html, /Delivery/);
});

test("Accessibility-critical primitives exist", () => {
  assert.match(html, /role="dialog"/);
  assert.match(html, /aria-modal="true"/);
  assert.match(html, /tabindex="-1"/);
  assert.match(html, /:focus/);
  assert.match(html, /aria-selected/);
});

test("Responsive layout primitives exist", () => {
  assert.match(html, /@media\(max-width:920px\)/);
  assert.match(html, /@media\(max-width:620px\)/);
  assert.match(html, /grid-template-columns:1fr/);
});
