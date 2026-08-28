import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { BACKOFF_MS } from '../src/batch-dispatch.mjs';
import { CampaignDispatchRuntime } from '../src/campaign-dispatch.mjs';

async function tempPaths() {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'kassist-campaign-rotation-'));
  return { statePath: path.join(dir, 'campaigns.json'), batchRoot: path.join(dir, 'batches') };
}

function recipients(count) {
  return Array.from({ length: count }, (_, index) => ({
    normalizedNumber: `551199999${String(index + 1).padStart(4, '0')}`,
    contact: `R${index + 1}`,
    context: `Contexto ${index + 1}`,
  }));
}

function fakeTransport(log) {
  return {
    sendText: async (to, text) => {
      log.push({ type: 'TEXT', to, text });
      return { id: `wa-${log.length}` };
    },
    sendImage: async (to, imageReference, caption) => {
      log.push({ type: 'IMAGE', to, imageReference, caption });
      return { id: `wa-${log.length}` };
    },
  };
}

test('three message variants rotate deterministically across five recipients', async () => {
  const paths = await tempPaths();
  const runtime = new CampaignDispatchRuntime({ ...paths, ...fakeTransport([]) });
  await runtime.ready;

  const preview = await runtime.preview({
    source: { type: 'manual' },
    recipients: recipients(5),
    objective: 'Rotação controlada — áéíóú ãõç €',
    message_variants: [
      { id: 'm1', text: 'ROTACAO TESTE A — áéíóú ãõç €', order: 0 },
      { id: 'm2', text: 'ROTACAO TESTE B — conteúdo UTF-8', order: 1 },
      { id: 'm3', text: 'ROTACAO TESTE C — campanha controlada', order: 2 },
    ],
    image_variants: [],
    caption_policy: 'NO_IMAGE',
    pacing_policy: { minimumMs: 0, maximumMs: 0 },
  });

  const draft = await runtime.createDraft(preview, {
    batchId: 'rotation-5',
    correlationId: 'rotation-correlation',
  });

  const selected = draft.campaign.recipients.map((recipient) => draft.selections[recipient.normalizedNumber].messageVariantId);

  assert.deepEqual(selected, ['m1', 'm2', 'm3', 'm1', 'm2']);
  assert.deepEqual(
    draft.campaign.recipients.map((recipient) => draft.selections[recipient.normalizedNumber].effect.text),
    [
      'ROTACAO TESTE A — áéíóú ãõç €',
      'ROTACAO TESTE B — conteúdo UTF-8',
      'ROTACAO TESTE C — campanha controlada',
      'ROTACAO TESTE A — áéíóú ãõç €',
      'ROTACAO TESTE B — conteúdo UTF-8',
    ],
  );

  const persisted = JSON.parse(await fs.readFile(paths.statePath, 'utf8'));
  assert.deepEqual(
    draft.campaign.recipients.map((recipient) => persisted.campaigns['rotation-5'].selections[recipient.normalizedNumber].messageVariantId),
    ['m1', 'm2', 'm3', 'm1', 'm2'],
  );
});

test('image variants rotate independently and caption follows the selected message variant', async () => {
  const paths = await tempPaths();
  const runtime = new CampaignDispatchRuntime({ ...paths, ...fakeTransport([]) });
  await runtime.ready;

  const preview = await runtime.preview({
    source: { type: 'manual' },
    recipients: recipients(5),
    objective: 'Imagem + legenda',
    message_variants: [
      { id: 'm1', text: 'Legenda 1 — á' },
      { id: 'm2', text: 'Legenda 2 — ç' },
    ],
    image_variants: [
      { id: 'i1', reference: 'C:\\controlled\\one.png', filename: 'one.png', mimeType: 'image/png' },
      { id: 'i2', reference: 'C:\\controlled\\two.png', filename: 'two.png', mimeType: 'image/png' },
    ],
    caption_policy: 'IMAGE_WITH_MESSAGE_CAPTION',
    pacing_policy: { minimumMs: 0, maximumMs: 0 },
  });

  const draft = await runtime.createDraft(preview, {
    batchId: 'image-rotation-5',
    correlationId: 'image-rotation-correlation',
  });

  const selections = draft.campaign.recipients.map((recipient) => draft.selections[recipient.normalizedNumber]);

  assert.deepEqual(selections.map((selection) => selection.messageVariantId), ['m1', 'm2', 'm1', 'm2', 'm1']);
  assert.deepEqual(selections.map((selection) => selection.imageVariantId), ['i1', 'i2', 'i1', 'i2', 'i1']);
  assert.deepEqual(selections.map((selection) => selection.effect.type), ['IMAGE', 'IMAGE', 'IMAGE', 'IMAGE', 'IMAGE']);
  assert.deepEqual(selections.map((selection) => selection.effect.caption), ['Legenda 1 — á', 'Legenda 2 — ç', 'Legenda 1 — á', 'Legenda 2 — ç', 'Legenda 1 — á']);
  assert.equal(selections.some((selection) => selection.effect.type === 'TEXT'), false);
});

test('retry preserves the frozen message variant selection', async () => {
  const paths = await tempPaths();
  const clockState = { now: 2_000_000 };
  const clock = () => clockState.now;
  const timers = [];
  let calls = 0;
  const runtime = new CampaignDispatchRuntime({
    ...paths,
    clock,
    setTimeoutImpl: (callback, delay) => {
      timers.push({ callback, delay });
      return Symbol('timer');
    },
    sendText: async (_to, text) => {
      calls += 1;
      if (calls === 1) throw Object.assign(new Error('ECONNRESET'), { code: 'ECONNRESET' });
      return { id: 'wa-retry', text };
    },
  });
  await runtime.ready;

  const preview = await runtime.preview({
    source: { type: 'manual' },
    recipients: recipients(1),
    objective: 'Retry com seleção congelada',
    message_variants: [
      { id: 'm1', text: 'Primeira variante' },
      { id: 'm2', text: 'Segunda variante' },
    ],
    caption_policy: 'NO_IMAGE',
    pacing_policy: { minimumMs: 0, maximumMs: 0 },
  });

  const draft = await runtime.createDraft(preview, { batchId: 'rotation-retry', correlationId: 'rotation-retry-correlation' });
  const recipientId = draft.campaign.recipients[0].normalizedNumber;
  const selectedBeforeRetry = draft.selections[recipientId].messageVariantId;

  await runtime.confirmCampaign(draft.batch.batchId, {
    fingerprint: draft.fingerprint,
    recipientCount: 1,
    correlationId: 'rotation-retry-confirm',
  });

  await runtime.queueCampaign(draft.batch.batchId, { causationId: 'rotation-retry-queue' });
  let campaignAfterFailure = await runtime.getCampaign(draft.batch.batchId);
  const recipientAfterFailure = campaignAfterFailure.batch.recipients[recipientId];

  assert.equal(recipientAfterFailure.state, 'RETRY_WAIT');
  assert.equal(campaignAfterFailure.selections[recipientId].messageVariantId, selectedBeforeRetry);
  assert.equal(timers.some((timer) => timer.delay === BACKOFF_MS[0]), true);

  clockState.now += BACKOFF_MS[0];
  const retryTimer = timers.find((timer) => timer.delay === BACKOFF_MS[0]);
  assert.ok(retryTimer);
  await retryTimer.callback();
  await new Promise((resolve) => setImmediate(resolve));

  campaignAfterFailure = await runtime.getCampaign(draft.batch.batchId);
  const recipientAfterRetry = campaignAfterFailure.batch.recipients[recipientId];
  assert.equal(recipientAfterRetry.state, 'SUCCESS');
  assert.equal(campaignAfterFailure.selections[recipientId].messageVariantId, selectedBeforeRetry);
  assert.equal(campaignAfterFailure.selections[recipientId].effect.text, 'Primeira variante');
});

test('confirmed snapshot remains unchanged when the original preview is mutated', async () => {
  const paths = await tempPaths();
  const runtime = new CampaignDispatchRuntime({ ...paths, ...fakeTransport([]) });
  await runtime.ready;

  const preview = await runtime.preview({
    recipients: recipients(2),
    objective: 'Objetivo original — ç',
    message_variants: [
      { id: 'm1', text: 'Texto original — ã' },
      { id: 'm2', text: 'Texto alternativo — é' },
    ],
    caption_policy: 'NO_IMAGE',
    pacing_policy: { minimumMs: 0, maximumMs: 0 },
  });

  const draft = await runtime.createDraft(preview, { batchId: 'snapshot-immutable', correlationId: 'snapshot-correlation' });
  await runtime.confirmCampaign(draft.batch.batchId, {
    fingerprint: draft.fingerprint,
    recipientCount: 2,
    correlationId: 'snapshot-confirm',
  });

  preview.campaign.objective = 'Objetivo adulterado';
  preview.campaign.messageVariants[0].text = 'Texto adulterado';

  const reloaded = await runtime.getCampaign('snapshot-immutable');
  assert.equal(reloaded.campaign.objective, 'Objetivo original — ç');
  assert.equal(reloaded.campaign.messageVariants[0].text, 'Texto original — ã');
  assert.equal(reloaded.selections[reloaded.campaign.recipients[0].normalizedNumber].messageVariantId, 'm1');
});
