import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const html = readFileSync(
  new URL("../apps/desktop/src/index.html", import.meta.url),
  "utf8"
);
const campaignUi = readFileSync(
  new URL("../apps/desktop/src/campaign-dispatch-ui.js", import.meta.url),
  "utf8"
);
const desktopMain = readFileSync(
  new URL("../apps/desktop/electron/main.cjs", import.meta.url),
  "utf8"
);

test("AppShell exposes current C1 navigation surfaces", () => {
  for (const page of [
    "Dashboard",
    "Conversas",
    "Pedidos",
    "Produtos",
    "Clientes",
    "Configurações"
  ]) {
    assert.match(html, new RegExp(page));
  }

  assert.match(html, /data-page="dashboard"/);
  assert.match(html, /data-page="conversations"/);
  assert.match(html, /aria-label="Navegação principal"/);
});

test("WhatsApp renderer exposes real Gateway integration", () => {
  assert.match(html, /127\.0\.0\.1:3210/);
  assert.match(html, /\/health/);
  assert.match(html, /\/api\/whatsapp\/status/);
  assert.match(html, /\/api\/whatsapp\/messages\?limit=500/);
  assert.match(html, /\/api\/whatsapp\/events/);
  assert.match(html, /\/api\/whatsapp\/connect/);
  assert.match(html, /\/api\/whatsapp\/logout/);
  assert.match(html, /\/api\/whatsapp\/reset-session/);
});

test("WhatsApp renderer exposes explicit operational states", () => {
  for (const status of [
    "HEALTHY",
    "UNAVAILABLE",
    "UNKNOWN",
    "CONNECTED",
    "DISCONNECTED",
    "CONNECTING",
    "PAIRING",
    "ERROR"
  ]) {
    assert.match(html, new RegExp(status));
  }
});

test("WhatsApp settings contains the complete connection UX contract", () => {
  assert.match(html, /WhatsApp \/ Conexão/);
  assert.match(html, /WhatsApp desconectado/);
  assert.match(html, /Conectando ao WhatsApp\.\.\./);
  assert.match(html, /Vincule seu WhatsApp/);
  assert.match(html, /WhatsApp conectado/);
  assert.match(html, /Falha na conexão/);
  assert.match(html, /id="wa-qr"/);
  assert.match(html, /Conectar WhatsApp/);
  assert.match(html, /Desconectar/);
  assert.match(html, /Reconectar/);
  assert.match(html, /Resetar sessão/);
  assert.match(html, /state\.wa\.me\?\.name/);
  assert.match(html, /state\.wa\.me\?\.id/);
  assert.match(html, /state\.wa\.error/);
});

test("WhatsApp settings binds existing Gateway lifecycle endpoints", () => {
  assert.match(html, /#wa-settings-connect/);
  assert.match(html, /#wa-settings-reconnect/);
  assert.match(html, /#wa-settings-disconnect/);
  assert.match(html, /#wa-settings-reset/);
  assert.match(html, /#wa-settings-refresh/);
  assert.match(html, /gatewayJson\('\/api\/whatsapp\/connect'/);
  assert.match(html, /gatewayJson\('\/api\/whatsapp\/logout'/);
  assert.match(html, /gatewayJson\('\/api\/whatsapp\/reset-session'/);
});

test("WhatsApp QR renderer is local SVG output", () => {
  assert.match(html, /qrcode-generator\/dist\/qrcode\.js/);
  assert.match(html, /qrcode\(0,'M'\)/);
  assert.match(html, /addData\(String\(state\.wa\.qr\)\)/);
  assert.match(html, /createSvgTag\(\{cellSize:6,margin:18,scalable:true\}\)/);
  assert.match(html, /setAttribute\('role','img'\)/);
});

test("Conversation surface no longer owns WhatsApp onboarding", () => {
  const start = html.indexOf("function conversations(){");
  const end = html.indexOf("function assistant(){", start);
  assert.notEqual(start, -1);
  assert.notEqual(end, -1);
  const conversations = html.slice(start, end);
  assert.doesNotMatch(conversations, /wa-connect/);
  assert.doesNotMatch(conversations, /wa-logout/);
  assert.doesNotMatch(conversations, /wa-reset/);
  assert.doesNotMatch(conversations, /<textarea/i);
  assert.doesNotMatch(conversations, /wa\.qr/);
  assert.match(conversations, /wa-open-connection-settings/);
});

test("Connection status consumption preserves Gateway lastError", () => {
  assert.match(html, /x\.lastError/);
  assert.match(html, /state\.wa\.error=x\.lastError/);
});

test("Renderer contains no prohibited local WhatsApp implementation", () => {
  for (const forbidden of [
    "MutationObserver",
    "paintWhatsAppSettings",
    "sanitizeConversationsOnboarding",
    "makeWASocket",
    "useMultiFileAuthState",
    "KASSIST_WA_AUTH_DIR"
  ]) {
    assert.doesNotMatch(html, new RegExp(forbidden));
  }
});

test("Renderer keeps the existing function architecture unique", () => {
  for (const name of [
    "applyStatus",
    "settings",
    "conversations",
    "bindConversations",
    "bind"
  ]) {
    const matches = html.match(new RegExp(`function ${name}\\(`, "g")) ?? [];
    assert.equal(matches.length, 1, `${name} must exist exactly once`);
  }
});

test("WhatsApp renderer preserves delivery boundary", () => {
  assert.match(html, /connection==='CONNECTED'/);
  assert.match(html, /canSend/);
  assert.match(html, /aguardando evento SSE/);
});

test("WhatsApp renderer preserves real conversation identity", () => {
  assert.match(html, /Mensagens reais recebidas do Gateway/);
  assert.match(html, /jidLabel/);
  assert.match(html, /@lid/);
  assert.match(html, /message\.id/);
});

test("Provisional UI boundaries remain explicit", () => {
  assert.match(html, /UNAVAILABLE/);
  assert.match(html, /UNKNOWN/);
  assert.match(html, /Nenhum grupo será fabricado na interface/);
});

test("Diagnostics surface exists", () => {
  assert.match(html, /Diagnósticos/);
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

test("WhatsApp health contract consumes status=ok, not legacy ok=true", () => {
  assert.match(html, /health&&health\.status==='ok'\?'HEALTHY':'UNKNOWN'/);
  assert.doesNotMatch(html, /health&&health\.ok\?/);
});

test("WhatsApp reset requires explicit confirmation before destructive request", () => {
  const resetMarker = "document.querySelector('#wa-settings-reset')?.addEventListener('click',async()=>{";
  const resetStart = html.indexOf(resetMarker);
  assert.notEqual(resetStart, -1);
  const pairingBoundary = html.indexOf("if(state.wa.connection==='PAIRING'", resetStart);
  assert.ok(pairingBoundary > resetStart);
  const resetHandler = html.slice(resetStart, pairingBoundary);
  const confirmationIndex = resetHandler.indexOf('window.confirm(');
  const cancelIndex = resetHandler.indexOf('if(!confirmed)return;');
  const endpointIndex = resetHandler.indexOf('/api/whatsapp/reset-session');
  assert.ok(confirmationIndex >= 0);
  assert.ok(cancelIndex > confirmationIndex);
  assert.ok(endpointIndex > confirmationIndex);
});

test("WhatsApp reset confirmation describes destructive session removal", () => {
  assert.match(html, /Resetar sessão\?/);
  assert.match(html, /A sessão WhatsApp armazenada pelo KassisT será removida/);
  assert.match(html, /Um novo QR Code poderá ser necessário/);
});

test("Dashboard validates error retention by runtime state rather than presentation text", () => {
  assert.match(html, /async function refreshDashboard\(/);
  assert.match(html, /state\.dashboard\.data=payload/);
  assert.match(html, /state\.dashboard\.error=error instanceof Error\?error\.message:String\(error\)/);
  assert.match(html, /state\.dashboard\.error&&!d\?/);
  assert.match(html, /state\.dashboard\.error\?statusNotice\('Dashboard','DEGRADED'/);
});

test("Campaign UI module owns interactive state and is loaded by the Desktop main process", () => {
  assert.match(campaignUi, /interactiveEnabled: false/);
  assert.match(campaignUi, /buttonVariants: \[\]/);
  assert.match(campaignUi, /function setInteractiveEnabled\(/);
  assert.match(campaignUi, /function addButton\(/);
  assert.match(campaignUi, /function removeButton\(/);
  assert.match(campaignUi, /function addButtonVariant\(/);
  assert.match(campaignUi, /function removeButtonVariant\(/);
  assert.match(campaignUi, /id="campaign-interactive-enabled"/);
  assert.match(campaignUi, /data-button-text/);
  assert.match(campaignUi, /data-button-id/);
  assert.match(campaignUi, /data-add-button/);
  assert.match(campaignUi, /data-remove-button/);
  assert.match(campaignUi, /data-remove-button-variant/);
  assert.match(campaignUi, /id="campaign-add-button-variant"/);
  assert.match(campaignUi, /button_variants: state\.interactiveEnabled \? state\.buttonVariants : \[\]/);
  assert.match(campaignUi, /state\.preview = null/);
  assert.match(campaignUi, /state\.draft = null/);
  assert.match(campaignUi, /window\.kassist\?\.selectCampaignImage/);
  assert.match(campaignUi, /imageReference/);
  assert.match(campaignUi, /dispatch\/campaign\/preview/);
  assert.match(campaignUi, /dispatch\/campaigns/);
  assert.match(campaignUi, /action:\s*['"]confirm['"]/);
  assert.match(campaignUi, /action:\s*['"]queue['"]/);
  assert.match(campaignUi, /\/api\/whatsapp\/dispatch\/batches/);
  assert.match(campaignUi, /\/api\/whatsapp\/dispatch\/preview\/csv/);
  assert.match(campaignUi, /\/api\/whatsapp\/dispatch\/preview\/manual/);
  assert.match(desktopMain, /campaign-dispatch-ui\.js/);
  assert.match(desktopMain, /executeJavaScript\(`\$\{campaignUi\}\\n\$\{featureUi\}`, true\)/);
});
