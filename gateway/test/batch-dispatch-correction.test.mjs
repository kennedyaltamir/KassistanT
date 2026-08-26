import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { BatchDispatchRuntime, PROCESSING_TIMEOUT_MS } from '../src/batch-dispatch.mjs';

const ROOT = path.resolve(import.meta.dirname, '../..');
const CANONICAL_CSV = path.join(ROOT, 'apps/desktop/electron/dispatch/csv-recipient-ingestion.mjs');
const DUPLICATE_GATEWAY_CSV = path.join(ROOT, 'gateway/src/csv-recipient-ingestion.mjs');

function preview() {
  return {
    status: 'PREVIEW',
    fingerprint: 'fp-correction',
    sourceName: 'test.csv',
    recipients: [{ normalizedNumber: '5511999990001', context: 'Olá', contact: 'A' }],
  };
}

function clockController(initial = 1_000_000) {
  let current = initial;
  return { now: () => current, advance(ms) { current += ms; } };
}

async function tempStatePath() {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'kassist-p0-012d-'));
  return path.join(dir, 'batches.json');
}

test('canonical P0-012 CSV parser exists and no gateway parser duplicate exists', async () => {
  await fs.access(CANONICAL_CSV);
  await assert.rejects(fs.access(DUPLICATE_GATEWAY_CSV), { code: 'ENOENT' });
});

test('processing timeout preserves identity and blocks blind retry', async () => {
  const statePath = await tempStatePath();
  const clock = clockController();
  const timers = [];
  let sends = 0;
  const runtime = new BatchDispatchRuntime({
    statePath,
    clock: clock.now,
    sendText: async () => {
      sends += 1;
      return new Promise(() => {});
    },
    setTimeoutImpl: (callback, delay) => {
      timers.push({ callback, delay });
      return Symbol('timer');
    },
    clearTimeoutImpl: () => {},
  });

  await runtime.ready;
  const draft = await runtime.createDraft(preview(), { batchId: 'batch-timeout', correlationId: 'corr-timeout' });
  await runtime.confirmBatch(draft.batchId, { fingerprint: draft.preview.fingerprint, recipientCount: 1, correlationId: 'corr-timeout' });
  await runtime.queueBatch(draft.batchId);
  await new Promise((resolve) => setImmediate(resolve));

  const timeout = timers.find((entry) => entry.delay === PROCESSING_TIMEOUT_MS);
  assert.ok(timeout);
  timeout.callback();
  await new Promise((resolve) => setImmediate(resolve));

  const batch = await runtime.getBatch('batch-timeout');
  const recipient = batch.recipients['5511999990001'];
  assert.equal(recipient.state, 'PROCESSING');
  assert.equal(recipient.recoveryBlocked, true);
  assert.equal(recipient.attempts[0].effectStatus, 'INDETERMINATE_EFFECT_UNRESOLVED');
  assert.equal(recipient.attempts[0].recovery, 'PROCESSING_TIMEOUT');
  assert.equal(batch.recoveryRequired, true);
  assert.equal(batch.batchId, 'batch-timeout');
  assert.match(recipient.idempotencyIdentity, /^[0-9a-f]{64}$/);
  const beforeAttempts = recipient.attempts.length;
  await runtime.retryRecipient('batch-timeout', '5511999990001');
  const after = await runtime.getBatch('batch-timeout');
  assert.equal(after.recipients['5511999990001'].attempts.length, beforeAttempts);
  assert.equal(sends, 1);
});

test('custom database path selects sibling dispatch journal directory', async () => {
  const previous = process.env.KASSIST_BATCH_STATE_PATH;
  const previousDb = process.env.KASSIST_DB_PATH;
  delete process.env.KASSIST_BATCH_STATE_PATH;
  const dbDir = await fs.mkdtemp(path.join(os.tmpdir(), 'kassist-db-'));
  process.env.KASSIST_DB_PATH = path.join(dbDir, 'kassist.sqlite');
  try {
    const runtime = new BatchDispatchRuntime({ sendText: async () => ({ id: 'wa' }) });
    assert.equal(runtime.statePath, path.join(dbDir, 'dispatch', 'batches.json'));
    await runtime.ready;
  } finally {
    if (previous === undefined) delete process.env.KASSIST_BATCH_STATE_PATH;
    else process.env.KASSIST_BATCH_STATE_PATH = previous;
    if (previousDb === undefined) delete process.env.KASSIST_DB_PATH;
    else process.env.KASSIST_DB_PATH = previousDb;
  }
});
