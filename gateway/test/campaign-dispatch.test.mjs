import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { CampaignDispatchRuntime, fingerprintCampaign } from '../src/campaign-dispatch.mjs';

async function tempPaths() {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'kassist-campaign-'));
  return { statePath: path.join(dir, 'campaigns.json'), batchRoot: path.join(dir, 'batches') };
}

function campaign(overrides = {}) {
  return {
    source: { type: 'manual' },
    recipients: [
      { normalizedNumber: '5511999990001', contact: 'A', context: 'Contexto A' },
      { normalizedNumber: '5511999990002', contact: 'B', context: 'Contexto B' },
    ],
    objective: 'Validar Campaign Dispatch',
    message_variants: [
      { id: 'm1', text: 'Olá! Temos uma novidade para você.', order: 0 },
      { id: 'm2', text: 'Oi! Passando para apresentar uma novidade.', order: 1 },
      { id: 'm3', text: 'Olá! Queria te mostrar uma novidade.', order: 2 },
    ],
    image_variants: [],
    caption_policy: 'NO_IMAGE',
    pacing_policy: { minimumMs: 2000, maximumMs: 4000 },
    ...overrides,
  };
}

function fakeTransport(log) {
  return {
    sendText: async (to, text) => { log.push({ type: 'TEXT', to, text }); return { id: `wa-${log.length}` }; },
    sendImage: async (to, imageReference, caption) => { log.push({ type: 'IMAGE', to, imageReference, caption }); return { id: `wa-${log.length}` }; },
  };
}

test('campaign runtime with absent journal keeps initialization read-only', async () => {
  const paths = await tempPaths();
  const runtime = new CampaignDispatchRuntime(paths);

  assert.equal(await fs.stat(paths.statePath).catch((error) => error.code), 'ENOENT');
  await runtime.ready;
  assert.equal(await fs.stat(paths.statePath).catch((error) => error.code), 'ENOENT');
  assert.deepEqual(await runtime.listCampaigns(), []);
});

test('campaign runtime loads an existing journal without rewriting it', async () => {
  const paths = await tempPaths();
  const persisted = JSON.stringify({ version: 1, campaigns: {} }, null, 2) + '\n';
  await fs.mkdir(path.dirname(paths.statePath), { recursive: true });
  await fs.writeFile(paths.statePath, persisted, 'utf8');

  const runtime = new CampaignDispatchRuntime(paths);
  await runtime.ready;

  assert.equal(await fs.readFile(paths.statePath, 'utf8'), persisted);
});

test('campaign preview includes immutable fingerprint inputs', async () => {
  const paths = await tempPaths();
  const runtime = new CampaignDispatchRuntime(paths);
  await runtime.ready;
  const preview = await runtime.preview(campaign());
  assert.equal(preview.status, 'PREVIEW');
  assert.equal(preview.recipientCount, 2);
  assert.equal(preview.campaign.objective, 'Validar Campaign Dispatch');
  assert.equal(preview.fingerprint, fingerprintCampaign(preview.campaign));

  const changed = await runtime.preview(campaign({ objective: 'Outro objetivo' }));
  assert.notEqual(changed.fingerprint, preview.fingerprint);
});

test('campaign draft persists selection and pacing before confirmation', async () => {
  const paths = await tempPaths();
  const log = [];
  const runtime = new CampaignDispatchRuntime({ ...paths, ...fakeTransport(log) });
  await runtime.ready;
  const preview = await runtime.preview(campaign());
  const draft = await runtime.createDraft(preview, { batchId: 'campaign-1', correlationId: 'corr-1' });
  assert.equal(draft.batch.state, 'DRAFT');
  assert.equal(draft.batch.preview.recipients.length, 2);
  assert.equal(Object.keys(draft.selections).length, 2);
  assert.ok(draft.selections['5511999990001'].messageVariantId);
  assert.ok(draft.selections['5511999990002'].scheduledDelayMs >= 2000);
  assert.ok(draft.selections['5511999990002'].scheduledDelayMs <= 4000);
  assert.equal(log.length, 0);
  const journal = JSON.parse(await fs.readFile(paths.statePath, 'utf8'));
  assert.equal(journal.campaigns['campaign-1'].lifecycle, 'DRAFT');
  assert.equal(journal.campaigns['campaign-1'].selections['5511999990002'].scheduledDelayMs, draft.selections['5511999990002'].scheduledDelayMs);
});

test('campaign lifecycle mutations continue to persist after initialization fix', async () => {
  const paths = await tempPaths();
  const runtime = new CampaignDispatchRuntime({ ...paths, ...fakeTransport([]), sleepImpl: async () => {} });
  await runtime.ready;
  const preview = await runtime.preview(campaign({ pacing_policy: { minimumMs: 0, maximumMs: 0 } }));
  const draft = await runtime.createDraft(preview, { batchId: 'campaign-persist', correlationId: 'corr-persist' });

  let journal = JSON.parse(await fs.readFile(paths.statePath, 'utf8'));
  assert.equal(journal.campaigns['campaign-persist'].lifecycle, 'DRAFT');

  const confirmed = await runtime.confirmCampaign(draft.batch.batchId, {
    fingerprint: draft.fingerprint,
    recipientCount: 2,
    correlationId: 'corr-confirm',
  });
  journal = JSON.parse(await fs.readFile(paths.statePath, 'utf8'));
  assert.equal(confirmed.batch.state, 'CONFIRMED');
  assert.equal(journal.campaigns['campaign-persist'].lifecycle, 'CONFIRMED');

  const queued = await runtime.queueCampaign(draft.batch.batchId);
  journal = JSON.parse(await fs.readFile(paths.statePath, 'utf8'));
  assert.equal(queued.batch.state, 'COMPLETED');
  assert.equal(journal.campaigns['campaign-persist'].lifecycle, 'COMPLETED');

  const cancelledPreview = await runtime.preview(campaign({ pacing_policy: { minimumMs: 0, maximumMs: 0 } }));
  const cancelledDraft = await runtime.createDraft(cancelledPreview, { batchId: 'campaign-cancel', correlationId: 'corr-cancel' });
  const cancelled = await runtime.cancelCampaign(cancelledDraft.batch.batchId);
  journal = JSON.parse(await fs.readFile(paths.statePath, 'utf8'));
  assert.equal(cancelled.batch.state, 'CANCELLED');
  assert.equal(journal.campaigns['campaign-cancel'].lifecycle, 'CANCELLED');
});

test('campaign confirmation gates transport and queue reuses persisted message selection', async () => {
  const paths = await tempPaths();
  const log = [];
  const runtime = new CampaignDispatchRuntime({ ...paths, ...fakeTransport(log), sleepImpl: async () => {} });
  await runtime.ready;
  const preview = await runtime.preview(campaign({ pacing_policy: { minimumMs: 0, maximumMs: 0 } }));
  const draft = await runtime.createDraft(preview, { batchId: 'campaign-2', correlationId: 'corr-2' });
  const selected = draft.selections['5511999990001'].effect.text;
  assert.equal(log.length, 0);
  await runtime.confirmCampaign(draft.batch.batchId, {
    fingerprint: draft.fingerprint,
    recipientCount: 2,
    correlationId: 'corr-2-confirm',
  });
  const result = await runtime.queueCampaign(draft.batch.batchId, { causationId: 'cause-queue' });
  assert.equal(result.batch.state, 'COMPLETED');
  assert.equal(log.length, 2);
  assert.equal(log[0].text, selected);
});

test('image with message caption persists a single multimodal effect', async () => {
  const paths = await tempPaths();
  const log = [];
  const imagePath = path.join(path.dirname(paths.statePath), 'one.png');
  await fs.writeFile(imagePath, 'not-used-by-transport');
  const runtime = new CampaignDispatchRuntime({ ...paths, ...fakeTransport(log), sleepImpl: async () => {} });
  await runtime.ready;
  const preview = await runtime.preview(campaign({
    image_variants: [{ id: 'img1', reference: imagePath, filename: 'one.png', mimeType: 'image/png' }],
    caption_policy: 'IMAGE_WITH_MESSAGE_CAPTION',
    pacing_policy: { minimumMs: 0, maximumMs: 0 },
  }));
  const draft = await runtime.createDraft(preview, { batchId: 'campaign-3', correlationId: 'corr-3' });
  assert.equal(draft.selections['5511999990001'].effect.type, 'IMAGE');
  assert.ok(draft.selections['5511999990001'].effect.caption);
  await runtime.confirmCampaign(draft.batch.batchId, { fingerprint: draft.fingerprint, recipientCount: 2, correlationId: 'corr-3-confirm' });
  await runtime.queueCampaign(draft.batch.batchId);
  assert.equal(log.every((item) => item.type === 'IMAGE'), true);
  assert.equal(log[0].caption, draft.selections['5511999990001'].effect.caption);
});

test('campaign journal survives restart with the same selections and batch identity', async () => {
  const paths = await tempPaths();
  const log = [];
  const runtime = new CampaignDispatchRuntime({ ...paths, ...fakeTransport(log) });
  await runtime.ready;
  const preview = await runtime.preview(campaign());
  const draft = await runtime.createDraft(preview, { batchId: 'campaign-4', correlationId: 'corr-4' });
  const before = draft.selections['5511999990001'];

  const restarted = new CampaignDispatchRuntime({ ...paths, ...fakeTransport(log) });
  await restarted.ready;
  const after = await restarted.getCampaign('campaign-4');
  assert.equal(after.batch.batchId, 'campaign-4');
  assert.deepEqual(after.selections['5511999990001'], before);
});
