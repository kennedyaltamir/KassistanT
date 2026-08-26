import test from "node:test";
import assert from "node:assert/strict";
import { P0_001BOutboxRuntime, type OutboundPersistencePort } from "./p0-001b-runtime";

test("P0-001B outbound boundary stages an outbound event with idempotency identity", async () => {
  const calls: unknown[] = [];
  const persistence: OutboundPersistencePort = {
    async stageOutbound(event) {
      calls.push(event);
      return { state: "PENDING" };
    },
    async markProcessing() {},
    async markDelivered() {},
    async recordRetry() {},
    async recordFailure() {},
  };

  const runtime = new P0_001BOutboxRuntime(persistence);
  const result = await runtime.stage({
    idempotencyKey: "idem-1",
    eventType: "message.send",
    correlationId: "corr-1",
    causationId: "cause-1",
    payloadRef: "payload-1",
  });

  assert.deepEqual(result, { state: "PENDING" });
  assert.equal(calls.length, 1);
});

test("P0-001B outbound boundary supports approved state operations", async () => {
  const operations: string[] = [];
  const persistence: OutboundPersistencePort = {
    async stageOutbound() {
      operations.push("PENDING");
      return { state: "PENDING" };
    },
    async markProcessing() {
      operations.push("PROCESSING");
    },
    async markDelivered() {
      operations.push("DELIVERED");
    },
    async recordRetry(_key, attempt) {
      operations.push(`RETRY_WAIT:${attempt}`);
    },
    async recordFailure(_key, terminal) {
      operations.push(terminal ? "FAILED_TERMINAL" : "FAILED_RETRYABLE");
    },
  };

  const runtime = new P0_001BOutboxRuntime(persistence);
  await runtime.stage({ idempotencyKey: "idem-1", eventType: "message.send" });
  await runtime.process("idem-1");
  await runtime.deliver("idem-1");
  await runtime.retry("idem-1", 2);
  await runtime.fail("idem-1", true);

  assert.deepEqual(operations, [
    "PENDING",
    "PROCESSING",
    "DELIVERED",
    "RETRY_WAIT:2",
    "FAILED_TERMINAL",
  ]);
});

test("P0-001B outbound boundary rejects invalid inputs deterministically", async () => {
  const persistence: OutboundPersistencePort = {
    async stageOutbound() {
      throw new Error("should not be called");
    },
    async markProcessing() {},
    async markDelivered() {},
    async recordRetry() {},
    async recordFailure() {},
  };

  const runtime = new P0_001BOutboxRuntime(persistence);
  await assert.rejects(
    () => runtime.stage({ idempotencyKey: "", eventType: "message.send" }),
    /INVALID_OUTBOUND_IDENTITY/,
  );
  await assert.rejects(
    () => runtime.process(""),
    /INVALID_OUTBOUND_IDENTITY/,
  );
  await assert.rejects(
    () => runtime.retry("idem-1", 0),
    /INVALID_ATTEMPT/,
  );
});
