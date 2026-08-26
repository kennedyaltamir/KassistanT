import test from "node:test";
import assert from "node:assert/strict";

import {
  InboxOutboxRuntime,
  type InboxEvent,
  type InboxOutboxPersistence,
  type InboundAcceptance,
  type OutboxRecord,
  type RetryDecision,
} from "./runtime.js";

class MemoryPersistence implements InboxOutboxPersistence {
  readonly inbound = new Map<string, InboxEvent>();
  readonly outbound = new Map<string, OutboxRecord>();

  async acceptInbound<TPayload>(event: InboxEvent<TPayload>): Promise<InboundAcceptance<TPayload>> {
    const key = `${event.identity.provider}:${event.identity.externalEventId}`;
    const existing = this.inbound.get(key);
    if (existing) {
      return { accepted: false, duplicate: true, event: existing as InboxEvent<TPayload> };
    }
    this.inbound.set(key, event);
    return { accepted: true, duplicate: false, event };
  }

  async retrievePendingInbound<TPayload>(): Promise<InboxEvent<TPayload>[]> {
    return [...this.inbound.values()] as InboxEvent<TPayload>[];
  }

  async stageOutbound<TPayload>(record: OutboxRecord<TPayload>): Promise<OutboxRecord<TPayload>> {
    const existing = this.outbound.get(record.idempotencyKey);
    if (existing) return existing;
    this.outbound.set(record.idempotencyKey, record);
    return record;
  }

  async getOutbound(idempotencyKey: string): Promise<OutboxRecord | null> {
    return this.outbound.get(idempotencyKey) ?? null;
  }

  async listPendingOutbound(): Promise<OutboxRecord[]> {
    return [...this.outbound.values()].filter((record) => record.state === "PENDING" || record.state === "RETRY_WAIT");
  }

  async markOutboundProcessing(idempotencyKey: string): Promise<OutboxRecord> {
    const record = this.requireOutbound(idempotencyKey);
    assert.equal(record.state === "PENDING" || record.state === "RETRY_WAIT", true);
    const updated = { ...record, state: "PROCESSING" as const };
    this.outbound.set(idempotencyKey, updated);
    return updated;
  }

  async markOutboundDelivered(idempotencyKey: string): Promise<OutboxRecord> {
    const record = this.requireOutbound(idempotencyKey);
    assert.equal(record.state, "PROCESSING");
    const updated = { ...record, state: "DELIVERED" as const };
    this.outbound.set(idempotencyKey, updated);
    return updated;
  }

  async recordOutboundRetry(idempotencyKey: string, decision: RetryDecision): Promise<OutboxRecord> {
    const record = this.requireOutbound(idempotencyKey);
    assert.equal(decision.retry, true);
    const updated = {
      ...record,
      state: "RETRY_WAIT" as const,
      attemptCount: record.attemptCount + 1,
      nextAttemptAt: decision.nextAttemptAt,
      lastFailure: decision.failureReason,
    };
    this.outbound.set(idempotencyKey, updated);
    return updated;
  }

  async recordOutboundFailure(idempotencyKey: string, reason: string): Promise<OutboxRecord> {
    const record = this.requireOutbound(idempotencyKey);
    const updated = {
      ...record,
      state: "FAILED_TERMINAL" as const,
      attemptCount: record.attemptCount + 1,
      lastFailure: reason,
    };
    this.outbound.set(idempotencyKey, updated);
    return updated;
  }

  private requireOutbound(idempotencyKey: string): OutboxRecord {
    const record = this.outbound.get(idempotencyKey);
    if (!record) throw new Error(`Unknown outbound idempotency key: ${idempotencyKey}`);
    return record;
  }
}

const runtime = (persistence = new MemoryPersistence()) => ({
  persistence,
  runtime: new InboxOutboxRuntime(persistence, {
    maxAttempts: 3,
    nextAttemptAt: (attemptCount, now) => new Date(now.getTime() + attemptCount * 1000).toISOString(),
  }),
});

test("inbound duplicate delivery is idempotent", async () => {
  const { persistence, runtime } = runtime();
  const event: InboxEvent = {
    identity: { provider: "test", externalEventId: "evt-1" },
    payload: { value: 1 },
    correlation: { correlationId: "corr-1", causationId: "cause-1" },
  };

  const first = await runtime.acceptInbound(event);
  const second = await runtime.acceptInbound(event);

  assert.equal(first.accepted, true);
  assert.equal(second.duplicate, true);
  assert.equal(persistence.inbound.size, 1);
});

test("outbox keeps correlation/causation while staging a single logical effect", async () => {
  const { persistence, runtime } = runtime();
  const record = await runtime.stageOutbound({
    idempotencyKey: "out-1",
    payload: { type: "notification" },
    correlation: { correlationId: "corr-2", causationId: "cause-2" },
  });
  const duplicate = await runtime.stageOutbound({
    idempotencyKey: "out-1",
    payload: { type: "different" },
    correlation: { correlationId: "other", causationId: "other" },
  });

  assert.equal(record.state, "PENDING");
  assert.deepEqual(duplicate, record);
  assert.equal(persistence.outbound.size, 1);
});

test("outbox lifecycle is deterministic", async () => {
  const { runtime } = runtime();
  await runtime.stageOutbound({ idempotencyKey: "out-2", payload: {} });

  assert.equal((await runtime.markProcessing("out-2")).state, "PROCESSING");
  assert.equal((await runtime.markDelivered("out-2")).state, "DELIVERED");
});

test("retry is bounded and becomes terminal", async () => {
  const { runtime } = runtime();
  await runtime.stageOutbound({ idempotencyKey: "out-3", payload: {} });

  await runtime.markProcessing("out-3");
  const retry = await runtime.recordRetry("out-3", "temporary", new Date("2026-08-25T23:00:00Z"));
  assert.equal(retry.state, "RETRY_WAIT");
  assert.equal(retry.attemptCount, 1);

  await runtime.markProcessing("out-3");
  const retryAgain = await runtime.recordRetry("out-3", "temporary", new Date("2026-08-25T23:00:00Z"));
  assert.equal(retryAgain.state, "RETRY_WAIT");
  assert.equal(retryAgain.attemptCount, 2);

  await runtime.markProcessing("out-3");
  const terminal = await runtime.recordRetry("out-3", "permanent", new Date("2026-08-25T23:00:00Z"));
  assert.equal(terminal.state, "FAILED_TERMINAL");
});

test("terminal failure cannot be transformed into a retry by the runtime", async () => {
  const { runtime } = runtime();
  await runtime.stageOutbound({ idempotencyKey: "out-4", payload: {} });
  await runtime.recordTerminalFailure("out-4", "permanent");

  const recovered = await runtime.recoverPendingOutbound();
  assert.equal(recovered.length, 0);
});

test("restart recovery delegates pending durable state to persistence", async () => {
  const { persistence, runtime } = runtime();
  const inbound: InboxEvent = { identity: { provider: "test", externalEventId: "evt-2" }, payload: {} };
  await runtime.acceptInbound(inbound);
  await runtime.stageOutbound({ idempotencyKey: "out-5", payload: {} });

  const recoveredInbound = await runtime.recoverPendingInbound();
  const recoveredOutbound = await runtime.recoverPendingOutbound();

  assert.equal(recoveredInbound.length, 1);
  assert.equal(recoveredOutbound.length, 1);
  assert.equal(persistence.outbound.get("out-5")?.state, "PENDING");
});

test("missing persistence records fail explicitly", async () => {
  const { runtime } = runtime();
  await assert.rejects(() => runtime.markProcessing("missing"), /Unknown outbound idempotency key/);
});
