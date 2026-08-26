import test from "node:test";
import assert from "node:assert/strict";
import {
  INBOX_MAX_ATTEMPTS,
  PROCESSING_ABANDONMENT_MS,
  RETRY_BACKOFF_MS,
  InboxOutboxRuntime,
  type FailureCode,
  type InboxOutboxPersistence,
  type InboxRecord,
  type OutboxRecord,
} from "./runtime.js";

class MemoryPersistence implements InboxOutboxPersistence {
  readonly inbound = new Map<string, InboxRecord>();
  readonly outbound = new Map<string, OutboxRecord>();

  async acceptInbound<TPayload>(record: Omit<InboxRecord<TPayload>, "state" | "attempts" | "createdAt" | "updatedAt"> & Partial<Pick<InboxRecord, "state" | "attempts" | "createdAt" | "updatedAt">>) {
    const key = `${record.identity.provider}:${record.identity.externalEventId}`;
    const existing = this.inbound.get(key);
    if (existing) return { accepted: false as const, duplicate: true as const, record: existing as InboxRecord<TPayload> };
    const stored = record as InboxRecord<TPayload>;
    this.inbound.set(key, stored);
    return { accepted: true as const, duplicate: false as const, record: stored };
  }

  async retrievePendingInbound<TPayload>() {
    return [...this.inbound.values()].filter((record) => record.state === "PENDING" || record.state === "RETRY_WAIT") as InboxRecord<TPayload>[];
  }
  async getInbound(identity: { provider: string; externalEventId: string }) { return this.inbound.get(this.inboundKey(identity)) ?? null; }
  async markInboundProcessing(identity: { provider: string; externalEventId: string }, updatedAt: string) {
    const record = this.requireInbound(identity);
    if (record.state !== "PENDING" && record.state !== "RETRY_WAIT") throw new Error(`Invalid inbound transition from ${record.state}`);
    const updated = { ...record, state: "PROCESSING" as const, attempts: record.attempts + 1, updatedAt };
    this.inbound.set(this.inboundKey(identity), updated); return updated;
  }
  async recordInboundRetry(identity: { provider: string; externalEventId: string }, nextAttemptAt: string, failureCode: FailureCode, failureMessage: string, updatedAt: string) {
    const record = this.requireInbound(identity);
    if (record.state !== "PROCESSING") throw new Error(`Invalid inbound retry state ${record.state}`);
    const updated = { ...record, state: "RETRY_WAIT" as const, updatedAt, nextAttemptAt, failureCode, failureMessage, failedAt: updatedAt } as InboxRecord & { nextAttemptAt: string };
    this.inbound.set(this.inboundKey(identity), updated); return updated;
  }
  async recordInboundFailure(identity: { provider: string; externalEventId: string }, failureCode: FailureCode, failureMessage: string, failedAt: string, updatedAt: string) {
    const record = this.requireInbound(identity);
    if (record.state !== "PROCESSING") throw new Error(`Invalid inbound failure state ${record.state}`);
    const updated = { ...record, state: "FAILED_TERMINAL" as const, failureCode, failureMessage, failedAt, updatedAt };
    this.inbound.set(this.inboundKey(identity), updated); return updated;
  }
  async markInboundProcessed(identity: { provider: string; externalEventId: string }, processedAt: string, updatedAt: string) {
    const record = this.requireInbound(identity);
    if (record.state !== "PROCESSING") throw new Error(`Invalid inbound processed state ${record.state}`);
    const updated = { ...record, state: "PROCESSED" as const, processedAt, updatedAt };
    this.inbound.set(this.inboundKey(identity), updated); return updated;
  }
  async recoverAbandonedInbound(cutoffUpdatedAt: string, now: string, nextAttemptAt: (attempts: number, now: Date) => string | undefined) {
    const cutoff = new Date(cutoffUpdatedAt).getTime(); const recoveryNow = new Date(now); const recovered: InboxRecord[] = [];
    for (const [key, record] of this.inbound) {
      if (record.state !== "PROCESSING" || new Date(record.updatedAt).getTime() >= cutoff) continue;
      const retryAt = nextAttemptAt(record.attempts, recoveryNow);
      const updated = retryAt === undefined
        ? { ...record, state: "FAILED_TERMINAL" as const, failureCode: "PROCESSING_TIMEOUT" as const, failureMessage: "processing abandoned after timeout", failedAt: now, updatedAt: now }
        : { ...record, state: "RETRY_WAIT" as const, failureCode: "PROCESSING_TIMEOUT" as const, failureMessage: "processing abandoned after timeout", failedAt: now, updatedAt: now, nextAttemptAt: retryAt } as InboxRecord & { nextAttemptAt: string };
      this.inbound.set(key, updated); recovered.push(updated);
    }
    return recovered;
  }
  async stageOutbound<TPayload>(record: Omit<OutboxRecord<TPayload>, "state" | "attempts" | "createdAt" | "updatedAt"> & Partial<Pick<OutboxRecord, "state" | "attempts" | "createdAt" | "updatedAt">>) {
    const existing = this.outbound.get(record.idempotencyKey); if (existing) return existing as OutboxRecord<TPayload>;
    const stored = record as OutboxRecord<TPayload>; this.outbound.set(record.idempotencyKey, stored); return stored;
  }
  async getOutbound(idempotencyKey: string) { return this.outbound.get(idempotencyKey) ?? null; }
  async listPendingOutbound() { return [...this.outbound.values()].filter((record) => record.state === "PENDING" || record.state === "RETRY_WAIT"); }
  async markOutboundProcessing(idempotencyKey: string, updatedAt: string) {
    const record = this.requireOutbound(idempotencyKey);
    if (record.state !== "PENDING" && record.state !== "RETRY_WAIT") throw new Error(`Invalid outbound transition from ${record.state}`);
    const updated = { ...record, state: "PROCESSING" as const, attempts: record.attempts + 1, updatedAt }; this.outbound.set(idempotencyKey, updated); return updated;
  }
  async markOutboundDelivered(idempotencyKey: string, processedAt: string, updatedAt: string) {
    const record = this.requireOutbound(idempotencyKey); if (record.state !== "PROCESSING") throw new Error(`Invalid outbound delivery state ${record.state}`);
    const updated = { ...record, state: "DELIVERED" as const, processedAt, updatedAt }; this.outbound.set(idempotencyKey, updated); return updated;
  }
  async recordOutboundRetry(idempotencyKey: string, nextAttemptAt: string, failureCode: FailureCode, failureMessage: string, updatedAt: string) {
    const record = this.requireOutbound(idempotencyKey); if (record.state !== "PROCESSING") throw new Error(`Invalid outbound retry state ${record.state}`);
    const updated = { ...record, state: "RETRY_WAIT" as const, failureCode, failureMessage, failedAt: updatedAt, updatedAt, nextAttemptAt } as OutboxRecord & { nextAttemptAt: string };
    this.outbound.set(idempotencyKey, updated); return updated;
  }
  async recordOutboundFailure(idempotencyKey: string, failureCode: FailureCode, failureMessage: string, failedAt: string, updatedAt: string) {
    const record = this.requireOutbound(idempotencyKey); if (record.state !== "PROCESSING") throw new Error(`Invalid outbound failure state ${record.state}`);
    const updated = { ...record, state: "FAILED_TERMINAL" as const, failureCode, failureMessage, failedAt, updatedAt }; this.outbound.set(idempotencyKey, updated); return updated;
  }
  private inboundKey(identity: { provider: string; externalEventId: string }) { return `${identity.provider}:${identity.externalEventId}`; }
  private requireInbound(identity: { provider: string; externalEventId: string }) { const record = this.inbound.get(this.inboundKey(identity)); if (!record) throw new Error("missing inbound"); return record; }
  private requireOutbound(idempotencyKey: string) { const record = this.outbound.get(idempotencyKey); if (!record) throw new Error("missing outbound"); return record; }
}

const baseInbound = { identity: { provider: "whatsapp", externalEventId: "evt-1" }, payload: { text: "hello" }, correlation: { correlationId: "corr-1", causationId: "cause-1" } };
const baseOutbound = { idempotencyKey: "idem-1", eventId: "event-1", eventType: "message.send", aggregateId: "message-1", payload: { text: "hello" }, occurredAtUtc: "2026-08-26T03:00:00.000Z", correlation: { correlationId: "corr-2", causationId: "cause-2" } };

test("inbound acceptance is PENDING, durable, idempotent, and attempt-zero", async () => {
  const persistence = new MemoryPersistence(); const runtime = new InboxOutboxRuntime(persistence);
  const first = await runtime.acceptInbound(baseInbound, new Date("2026-08-26T03:00:00.000Z")); const second = await runtime.acceptInbound(baseInbound, new Date("2026-08-26T03:00:01.000Z"));
  assert.equal(first.accepted, true); assert.equal(first.record.state, "PENDING"); assert.equal(first.record.attempts, 0); assert.equal(second.duplicate, true); assert.equal(persistence.inbound.size, 1);
});

test("inbound attempts increment only on real processing attempts", async () => {
  const persistence = new MemoryPersistence(); const runtime = new InboxOutboxRuntime(persistence); await runtime.acceptInbound(baseInbound);
  const processing = await runtime.markInboundProcessing(baseInbound.identity); assert.equal(processing.attempts, 1);
  const retry = await runtime.recordInboundRetry(baseInbound.identity, "PROVIDER_ERROR", "provider unavailable"); assert.equal(retry.attempts, 1); assert.equal(retry.state, "RETRY_WAIT");
  const next = await runtime.markInboundProcessing(baseInbound.identity); assert.equal(next.attempts, 2);
});

test("inbound retry uses canonical fixed backoff", async () => {
  const persistence = new MemoryPersistence(); const runtime = new InboxOutboxRuntime(persistence); await runtime.acceptInbound(baseInbound); await runtime.markInboundProcessing(baseInbound.identity, new Date("2026-08-26T03:00:00.000Z"));
  const retry = await runtime.recordInboundRetry(baseInbound.identity, "DEPENDENCY_UNAVAILABLE", "dependency down", new Date("2026-08-26T03:00:00.000Z"));
  assert.equal((retry as InboxRecord & { nextAttemptAt: string }).nextAttemptAt, "2026-08-26T03:00:30.000Z"); assert.deepEqual(RETRY_BACKOFF_MS, [30_000, 60_000, 120_000, 240_000]);
});

test("inbound fifth real attempt becomes terminal with failure metadata", async () => {
  const persistence = new MemoryPersistence(); const runtime = new InboxOutboxRuntime(persistence); await runtime.acceptInbound(baseInbound);
  for (let attempt = 0; attempt < INBOX_MAX_ATTEMPTS - 1; attempt += 1) { await runtime.markInboundProcessing(baseInbound.identity); await runtime.recordInboundRetry(baseInbound.identity, "PROVIDER_ERROR", `failure ${attempt + 1}`); }
  const processing = await runtime.markInboundProcessing(baseInbound.identity); assert.equal(processing.attempts, INBOX_MAX_ATTEMPTS);
  const terminal = await runtime.recordInboundFailure(baseInbound.identity, "PROCESSING_TIMEOUT", "terminal timeout"); assert.equal(terminal.state, "FAILED_TERMINAL"); assert.equal(terminal.failureCode, "PROCESSING_TIMEOUT"); assert.equal(terminal.failureMessage, "terminal timeout"); assert.ok(terminal.failedAt);
});

test("abandoned PROCESSING recovers to RETRY_WAIT after five minutes without new identity", async () => {
  const persistence = new MemoryPersistence(); const runtime = new InboxOutboxRuntime(persistence); await runtime.acceptInbound(baseInbound, new Date("2026-08-26T03:00:00.000Z")); await runtime.markInboundProcessing(baseInbound.identity, new Date("2026-08-26T03:00:01.000Z"));
  const now = new Date("2026-08-26T03:05:02.000Z"); const recovered = await runtime.recoverAbandonedInbound(now);
  assert.equal(recovered[0]?.state, "RETRY_WAIT"); assert.equal(recovered[0]?.attempts, 1); assert.deepEqual(recovered[0]?.identity, baseInbound.identity); assert.equal(recovered[0]?.failureCode, "PROCESSING_TIMEOUT");
  assert.equal(now.getTime() - new Date("2026-08-26T03:00:01.000Z").getTime() > PROCESSING_ABANDONMENT_MS, true);
});

test("outbox stage preserves event identity, event semantics, occurred time, and correlation metadata", async () => {
  const persistence = new MemoryPersistence(); const runtime = new InboxOutboxRuntime(persistence); const record = await runtime.stageOutbound(baseOutbound, new Date("2026-08-26T03:01:00.000Z"));
  assert.equal(record.state, "PENDING"); assert.equal(record.attempts, 0); assert.equal(record.eventId, "event-1"); assert.equal(record.eventType, "message.send"); assert.equal(record.aggregateId, "message-1"); assert.equal(record.occurredAtUtc, "2026-08-26T03:00:00.000Z"); assert.deepEqual(record.correlation, baseOutbound.correlation);
});

test("outbox idempotency key is stable across duplicate staging", async () => {
  const persistence = new MemoryPersistence(); const runtime = new InboxOutboxRuntime(persistence); const first = await runtime.stageOutbound(baseOutbound); const duplicate = await runtime.stageOutbound({ ...baseOutbound, payload: { text: "different" }, eventId: "different-event" });
  assert.deepEqual(duplicate, first); assert.equal(persistence.outbound.size, 1);
});

test("outbox processing increments attempts and successful delivery sets processedAt and DELIVERED", async () => {
  const persistence = new MemoryPersistence(); const runtime = new InboxOutboxRuntime(persistence); await runtime.stageOutbound(baseOutbound);
  const processing = await runtime.markOutboundProcessing(baseOutbound.idempotencyKey, new Date("2026-08-26T03:02:00.000Z")); assert.equal(processing.state, "PROCESSING"); assert.equal(processing.attempts, 1);
  const delivered = await runtime.markOutboundDelivered(baseOutbound.idempotencyKey, new Date("2026-08-26T03:02:01.000Z")); assert.equal(delivered.state, "DELIVERED"); assert.equal(delivered.processedAt, "2026-08-26T03:02:01.000Z");
});

test("outbox processedAt absence does not imply PENDING", async () => {
  const persistence = new MemoryPersistence(); const runtime = new InboxOutboxRuntime(persistence); await runtime.stageOutbound(baseOutbound); await runtime.markOutboundProcessing(baseOutbound.idempotencyKey); await runtime.recordOutboundRetry(baseOutbound.idempotencyKey, "PROVIDER_ERROR", "temporary");
  const pending = await runtime.retrievePendingOutbound(); assert.equal(pending[0]?.state, "RETRY_WAIT"); assert.equal(pending[0]?.processedAt, undefined);
});

test("outbox retry uses 30/60/120/240 second backoff and terminal state on fifth attempt", async () => {
  const persistence = new MemoryPersistence(); const runtime = new InboxOutboxRuntime(persistence); await runtime.stageOutbound(baseOutbound); const now = new Date("2026-08-26T03:00:00.000Z");
  for (let index = 0; index < RETRY_BACKOFF_MS.length; index += 1) {
    await runtime.markOutboundProcessing(baseOutbound.idempotencyKey, now); const retry = await runtime.recordOutboundRetry(baseOutbound.idempotencyKey, "DEPENDENCY_UNAVAILABLE", `failure ${index + 1}`, now);
    const delay = RETRY_BACKOFF_MS[index]; if (delay === undefined) throw new Error(`missing retry delay for index ${index}`); const expected = now.getTime() + delay;
    assert.equal(new Date((retry as OutboxRecord & { nextAttemptAt: string }).nextAttemptAt).getTime(), expected);
  }
  await runtime.markOutboundProcessing(baseOutbound.idempotencyKey); const terminal = await runtime.recordOutboundFailure(baseOutbound.idempotencyKey, "PROCESSING_TIMEOUT", "final delivery timeout");
  assert.equal(terminal.state, "FAILED_TERMINAL"); assert.equal(terminal.attempts, 5); assert.equal(terminal.failureCode, "PROCESSING_TIMEOUT");
});

test("invalid identities and failure codes are rejected fail-closed", async () => {
  const runtime = new InboxOutboxRuntime(new MemoryPersistence()); await assert.rejects(() => runtime.acceptInbound({ ...baseInbound, identity: { provider: "", externalEventId: "evt" } })); await assert.rejects(() => runtime.acceptInbound({ ...baseInbound, identity: { provider: "whatsapp", externalEventId: "" } })); await assert.rejects(() => runtime.stageOutbound({ ...baseOutbound, idempotencyKey: "" })); await runtime.acceptInbound(baseInbound); await runtime.markInboundProcessing(baseInbound.identity); await assert.rejects(() => runtime.recordInboundRetry(baseInbound.identity, "NOT_A_REAL_CODE" as FailureCode, "bad"));
});
