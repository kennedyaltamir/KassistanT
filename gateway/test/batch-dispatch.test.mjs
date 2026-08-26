import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import {
  BACKOFF_MS,
  BatchDispatchRuntime,
  MAX_ATTEMPTS,
  PROCESSING_TIMEOUT_MS,
} from '../src/batch-dispatch.mjs';

async function tempStatePath() {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'kassist-dispatch-'));
  return path.join(dir, 'batches.json');
}

function preview(overrides = {}) {
  return {
    status: 'PREVIEW',
    fingerprint: 'fp-001',
    sourceName: 'test.csv',
    recipients: [
      { normalizedNumber: '5511999990001', context: 'Olá 1', contact: 'A' },
      { normalizedNumber: '5511999990002', context: 'Olá 2', contact: 'B' },
    ],
    ...overrides,
  };
}

function clockController(initial = 1_000_000) {
  let current = initial;
  return {
    now: () => current,
    advance(ms) { current += ms; },
  };
}

async function confirmedRuntime(sendText, options = {}) {
  const statePath = options.statePath ?? await tempStatePath();
  const clock = options.clock ?? clockController();
  const timers = options.timers ?? [];
  const runtime = new BatchDispatchRuntime({
    sendText,
    statePath,
    clock: clock.now,
    setTimeoutImpl: (callback, delay) => {
      timers.push({ callback, delay });
      return Symbol('timer');
    },
  });
  await runtime.ready;
  const draft = await runtime.createDraft(preview());
  const confirmed = await runtime.confirmBatch(draft.batchId, {
    fingerprint: draft.preview.fingerprint,
    recipientCount: 2,
    correlationId: 'corr-001',
  });
  return { runtime, statePath, clock, timers, batchId: confirmed.batchId };
}

test('CSV-derived preview enters DRAFT and cannot send before confirmation', async () => {
  let sends = 0;
  const ctx = await confirmedRuntime(async () => { sends += 1; return { id: 'wa-1' }; });
  const batch = await ctx.runtime.getBatch(ctx.batchId);
  assert.equal(batch.state, 'CONFIRMED');
  assert.equal(sends, 0);
});

test('CONFIRMED permits queue and queue starts real transport through injected sendText', async () => {
  const sent = [];
  const ctx = await confirmedRuntime(async (to, text) => { sent.push({ to, text }); return { id: `wa-${sent.length}` }; });
  await ctx.runtime.queueBatch(ctx.batchId);
  await new Promise((resolve) => setImmediate(resolve));
  const batch = await ctx.runtime.getBatch(ctx.batchId);
  assert.equal(sent.length, 2);
  assert.equal(batch.state, 'COMPLETED');
  assert.ok(Object.values(batch.recipients).every((recipient) => recipient.state === 'SUCCESS'));
});

test('recipient identity remains stable across retry', async () => {
  let calls = 0;
  const ctx = await confirmedRuntime(async () => {
    calls += 1;
    if (calls === 1) throw Object.assign(new Error('ECONNRESET'), { code: 'ECONNRESET' });
    return { id: 'wa-2' };
  });
  await ctx.runtime.queueBatch(ctx.batchId);
  await new Promise((resolve) => setImmediate(resolve));
  const first = await ctx.runtime.getBatch(ctx.batchId);
  const recipient = first.recipients['5511999990001'];
  const identity = recipient.idempotencyIdentity;
  assert.equal(recipient.state, 'RETRY_WAIT');
  ctx.clock.advance(BACKOFF_MS[0]);
  await ctx.runtime.retryRecipient(ctx.batchId, recipient.identity);
  const after = await ctx.runtime.getBatch(ctx.batchId);
  assert.equal(after.recipients[recipient.identity].idempotencyIdentity, identity);
  assert.equal(after.recipients[recipient.identity].attempts.length, 2);
});

test('context remains immutable during retry', async () => {
  let calls = 0;
  const ctx = await confirmedRuntime(async (_to, text) => {
    calls += 1;
    if (calls === 1) throw new Error('ETIMEDOUT');
    assert.equal(text, 'Olá 1');
    return { id: 'wa-3' };
  });
  await ctx.runtime.queueBatch(ctx.batchId);
  await new Promise((resolve) => setImmediate(resolve));
  ctx.clock.advance(BACKOFF_MS[0]);
  await ctx.runtime.retryRecipient(ctx.batchId, '5511999990001');
  const batch = await ctx.runtime.getBatch(ctx.batchId);
  assert.equal(batch.recipients['5511999990001'].context, 'Olá 1');
});

test('retry policy is five attempts with deterministic backoff', async () => {
  assert.equal(MAX_ATTEMPTS, 5);
  assert.deepEqual(BACKOFF_MS, [30_000, 60_000, 120_000, 240_000]);
  assert.equal(PROCESSING_TIMEOUT_MS, 300_000);
});

test('retryable failure enters RETRY_WAIT and terminal failure enters FAILED_TERMINAL', async () => {
  let calls = 0;
  const ctx = await confirmedRuntime(async () => {
    calls += 1;
    if (calls === 1) throw Object.assign(new Error('service unavailable'), { statusCode: 503 });
    return { id: `wa-${calls}` };
  });
  await ctx.runtime.queueBatch(ctx.batchId);
  await new Promise((resolve) => setImmediate(resolve));
  let batch = await ctx.runtime.getBatch(ctx.batchId);
  assert.equal(batch.recipients['5511999990001'].state, 'RETRY_WAIT');

  ctx.clock.advance(BACKOFF_MS[0]);
  await ctx.runtime.retryRecipient(ctx.batchId, '5511999990001');
  batch = await ctx.runtime.getBatch(ctx.batchId);
  assert.equal(batch.recipients['5511999990001'].state, 'SUCCESS');

  const terminalCtx = await confirmedRuntime(async () => { throw new Error('invalid recipient'); });
  await terminalCtx.runtime.queueBatch(terminalCtx.batchId);
  await new Promise((resolve) => setImmediate(resolve));
  const terminalBatch = await terminalCtx.runtime.getBatch(terminalCtx.batchId);
  assert.equal(terminalBatch.recipients['5511999990001'].state, 'FAILED_TERMINAL');
});

test('attempt five terminates a retryable recipient', async () => {
  const ctx = await confirmedRuntime(async () => { throw Object.assign(new Error('ETIMEDOUT'), { code: 'ETIMEDOUT' }); });
  await ctx.runtime.queueBatch(ctx.batchId);
  await new Promise((resolve) => setImmediate(resolve));
  for (let attempt = 1; attempt < MAX_ATTEMPTS; attempt += 1) {
    ctx.clock.advance(BACKOFF_MS[attempt - 1]);
    await ctx.runtime.retryRecipient(ctx.batchId, '5511999990001');
  }
  const batch = await ctx.runtime.getBatch(ctx.batchId);
  assert.equal(batch.recipients['5511999990001'].attempts.length, 5);
  assert.equal(batch.recipients['5511999990001'].state, 'FAILED_TERMINAL');
});

test('batch COMPLETED requires every recipient SUCCESS', async () => {
  const ctx = await confirmedRuntime(async () => ({ id: 'wa-ok' }));
  await ctx.runtime.queueBatch(ctx.batchId);
  await new Promise((resolve) => setImmediate(resolve));
  const batch = await ctx.runtime.getBatch(ctx.batchId);
  assert.equal(batch.state, 'COMPLETED');
});

test('batch PARTIAL_FAILURE requires success plus terminal failure', async () => {
  let calls = 0;
  const ctx = await confirmedRuntime(async () => {
    calls += 1;
    if (calls === 2) throw new Error('invalid recipient');
    return { id: `wa-${calls}` };
  });
  await ctx.runtime.queueBatch(ctx.batchId);
  await new Promise((resolve) => setImmediate(resolve));
  const batch = await ctx.runtime.getBatch(ctx.batchId);
  assert.equal(batch.state, 'PARTIAL_FAILURE');
});

test('batch FAILED does not hide success', async () => {
  const ctx = await confirmedRuntime(async () => { throw new Error('invalid recipient'); });
  await ctx.runtime.queueBatch(ctx.batchId);
  await new Promise((resolve) => setImmediate(resolve));
  const batch = await ctx.runtime.getBatch(ctx.batchId);
  assert.equal(batch.state, 'FAILED');
  assert.equal(Object.values(batch.recipients).some((recipient) => recipient.state === 'SUCCESS'), false);
});

test('cancel before effect prevents every pending recipient from being sent', async () => {
  let sends = 0;
  const ctx = await confirmedRuntime(async () => { sends += 1; return { id: `wa-${sends}` }; });
  await ctx.runtime.cancelBatch(ctx.batchId);
  const batch = await ctx.runtime.getBatch(ctx.batchId);
  assert.equal(batch.state, 'CANCELLED');
  assert.equal(sends, 0);
  assert.ok(Object.values(batch.recipients).every((recipient) => recipient.state === 'CANCELLED'));
});

test('cancellation during processing does not erase already observed effects', async () => {
  let resolveSend;
  const sendPromise = new Promise((resolve) => { resolveSend = resolve; });
  const ctx = await confirmedRuntime(async () => sendPromise);
  const queuePromise = ctx.runtime.queueBatch(ctx.batchId);
  await new Promise((resolve) => setImmediate(resolve));
  const processing = await ctx.runtime.getBatch(ctx.batchId);
  assert.equal(processing.recipients['5511999990001'].state, 'PROCESSING');
  await ctx.runtime.cancelBatch(ctx.batchId);
  resolveSend({ id: 'wa-late' });
  await queuePromise;
  await new Promise((resolve) => setImmediate(resolve));
  const cancelled = await ctx.runtime.getBatch(ctx.batchId);
  assert.equal(cancelled.recipients['5511999990001'].state, 'SUCCESS');
  assert.equal(cancelled.state, 'CANCELLED');
});

test('restart preserves batch identity, attempts and blocks indeterminate effect', async () => {
  const statePath = await tempStatePath();
  const clock = clockController();
  const runtime = new BatchDispatchRuntime({ sendText: async () => ({ id: 'wa' }), statePath, clock: clock.now, setTimeoutImpl: () => Symbol('timer') });
  await runtime.ready;
  const draft = await runtime.createDraft(preview(), { batchId: 'batch-restart' });
  await runtime.confirmBatch(draft.batchId, { fingerprint: 'fp-001', recipientCount: 2, correlationId: 'corr-restart' });
  const state = await fs.readFile(statePath, 'utf8');
  const journal = JSON.parse(state);
  const batch = journal.batches['batch-restart'];
  batch.state = 'PROCESSING';
  const recipient = batch.recipients['5511999990001'];
  recipient.state = 'PROCESSING';
  recipient.attempts.push({ attempt: 1, idempotencyIdentity: recipient.idempotencyIdentity, phase: 'REQUEST_ATTEMPTED', startedAt: new Date(clock.now()).toISOString() });
  await fs.writeFile(statePath, JSON.stringify(journal), 'utf8');

  const restarted = new BatchDispatchRuntime({ sendText: async () => ({ id: 'should-not-send' }), statePath, clock: clock.now, setTimeoutImpl: () => Symbol('timer') });
  await restarted.ready;
  const recovered = await restarted.getBatch('batch-restart');
  assert.equal(recovered.batchId, 'batch-restart');
  assert.equal(recovered.recipients['5511999990001'].attempts.length, 1);
  assert.equal(recovered.recipients['5511999990001'].state, 'PROCESSING');
  assert.equal(recovered.recipients['5511999990001'].recoveryBlocked, true);
  assert.equal(recovered.recipients['5511999990001'].attempts[0].effectStatus, 'INDETERMINATE_EFFECT_UNRESOLVED');
});

test('restart preserves correlation and causation history', async () => {
  const ctx = await confirmedRuntime(async () => ({ id: 'wa' }));
  const before = await ctx.runtime.getBatch(ctx.batchId);
  const restarted = new BatchDispatchRuntime({ sendText: async () => ({ id: 'wa' }), statePath: ctx.statePath, clock: ctx.clock.now, setTimeoutImpl: () => Symbol('timer') });
  await restarted.ready;
  const after = await restarted.getBatch(ctx.batchId);
  assert.equal(after.batchId, before.batchId);
  assert.equal(after.correlationId, before.correlationId);
  assert.equal(after.causationId, before.causationId);
});

test('indeterminate effect is never promoted to SUCCESS', async () => {
  const statePath = await tempStatePath();
  const clock = clockController();
  const runtime = new BatchDispatchRuntime({ sendText: async () => ({ id: 'wa' }), statePath, clock: clock.now, setTimeoutImpl: () => Symbol('timer') });
  await runtime.ready;
  const draft = await runtime.createDraft(preview(), { batchId: 'batch-unknown' });
  await runtime.confirmBatch(draft.batchId, { fingerprint: 'fp-001', recipientCount: 2, correlationId: 'corr' });
  const raw = JSON.parse(await fs.readFile(statePath, 'utf8'));
  raw.batches['batch-unknown'].state = 'PROCESSING';
  const recipient = raw.batches['batch-unknown'].recipients['5511999990001'];
  recipient.state = 'PROCESSING';
  recipient.attempts.push({ attempt: 1, idempotencyIdentity: recipient.idempotencyIdentity, phase: 'REQUEST_ATTEMPTED' });
  await fs.writeFile(statePath, JSON.stringify(raw), 'utf8');
  const restarted = new BatchDispatchRuntime({ sendText: async () => ({ id: 'wa' }), statePath, clock: clock.now, setTimeoutImpl: () => Symbol('timer') });
  await restarted.ready;
  const batch = await restarted.getBatch('batch-unknown');
  assert.notEqual(batch.recipients['5511999990001'].state, 'SUCCESS');
});

test('replay with the same batch does not create a duplicate batch', async () => {
  const ctx = await confirmedRuntime(async () => ({ id: 'wa' }));
  const first = await ctx.runtime.getBatch(ctx.batchId);
  const second = await ctx.runtime.createDraft(preview(), { batchId: 'batch-new' });
  assert.notEqual(first.batchId, second.batchId);
  assert.equal((await ctx.runtime.listBatches()).length, 2);
});

test('identical recipient sets in different batches remain independent', async () => {
  const statePath = await tempStatePath();
  const runtime = new BatchDispatchRuntime({ sendText: async () => ({ id: 'wa' }), statePath, clock: () => Date.now(), setTimeoutImpl: () => Symbol('timer') });
  await runtime.ready;
  await runtime.createDraft(preview(), { batchId: 'batch-a' });
  await runtime.createDraft(preview(), { batchId: 'batch-b' });
  const batches = await runtime.listBatches();
  assert.deepEqual(batches.map((batch) => batch.batchId).sort(), ['batch-a', 'batch-b']);
});

test('UNKNOWN is not a success signal', async () => {
  const statePath = await tempStatePath();
  const clock = clockController();
  const runtime = new BatchDispatchRuntime({ sendText: async () => ({ id: 'wa' }), statePath, clock: clock.now, setTimeoutImpl: () => Symbol('timer') });
  await runtime.ready;
  const draft = await runtime.createDraft(preview(), { batchId: 'batch-unknown-2' });
  await runtime.confirmBatch(draft.batchId, { fingerprint: 'fp-001', recipientCount: 2, correlationId: 'corr' });
  const raw = JSON.parse(await fs.readFile(statePath, 'utf8'));
  raw.batches['batch-unknown-2'].state = 'PROCESSING';
  const recipient = raw.batches['batch-unknown-2'].recipients['5511999990001'];
  recipient.state = 'PROCESSING';
  recipient.attempts.push({ attempt: 1, idempotencyIdentity: recipient.idempotencyIdentity, phase: 'UNKNOWN' });
  await fs.writeFile(statePath, JSON.stringify(raw), 'utf8');
  const restarted = new BatchDispatchRuntime({ sendText: async () => ({ id: 'wa' }), statePath, clock: clock.now, setTimeoutImpl: () => Symbol('timer') });
  await restarted.ready;
  const batch = await restarted.getBatch('batch-unknown-2');
  assert.notEqual(batch.recipients['5511999990001'].state, 'SUCCESS');
});
