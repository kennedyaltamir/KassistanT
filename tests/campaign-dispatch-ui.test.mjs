import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';

const ui = readFileSync(new URL('../apps/desktop/src/campaign-dispatch-ui.js', import.meta.url), 'utf8');
const main = readFileSync(new URL('../apps/desktop/electron/main.cjs', import.meta.url), 'utf8');
const preload = readFileSync(new URL('../apps/desktop/electron/preload.cjs', import.meta.url), 'utf8');

test('campaign UI exposes the required campaign sections and contracts', () => {
  for (const pattern of [
    /Destinatários|campaign-manual|campaign-csv/,
    /Objetivo da campanha|campaign-objective/,
    /Mensagens|campaign-add-message|message_variants/,
    /Imagens|campaign-add-image|image_variants/,
    /Legenda|campaign-caption|caption_policy/,
    /Intervalo entre disparos|minimumMs|maximumMs/,
    /Gerar PREVIEW|dispatch\/campaign\/preview/,
    /Confirmar campanha|action.*confirm/,
    /Queue \/ Executar|action.*queue/,
  ]) assert.match(ui, pattern);
});

test('campaign UI does not access the filesystem or WhatsApp internals', () => {
  assert.doesNotMatch(ui, /require\(|fs\.|node:fs|path\.join|makeWASocket|useMultiFileAuthState|authState/);
});

test('campaign confirmation is explicit and precedes queue action', () => {
  const confirmIndex = ui.indexOf("action: 'confirm'");
  const queueIndex = ui.indexOf("action: 'queue'");
  assert.ok(confirmIndex >= 0);
  assert.ok(queueIndex >= 0);
  assert.ok(confirmIndex < queueIndex);
  assert.match(ui, /window\.confirm\('Confirmar esta campanha\?/);
  assert.match(ui, /window\.confirm\('Enviar a campanha agora\?/);
});

test('Desktop exposes only controlled campaign media picker', () => {
  assert.match(preload, /selectCampaignImage/);
  assert.match(main, /kassist:select-campaign-image/);
  assert.match(main, /campaigns.*images/);
  assert.match(main, /KASSIST_MEDIA_ROOT/);
  assert.doesNotMatch(ui, /input.*type=["']file["'][^>]*image/);
});
