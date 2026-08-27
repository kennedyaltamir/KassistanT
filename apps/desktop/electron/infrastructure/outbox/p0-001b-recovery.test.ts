import test from "node:test";
import assert from "node:assert/strict";
import { P0_001BRecovery } from "./p0-001b-recovery";
import type { OutboundPersistencePort } from "./p0-001b-runtime";

test("P0-001B recovery moves retryable failures to RETRY_WAIT", async () => {
  const calls: string[] = [];
  const persistence: OutboundPersistencePort = {
    async stageOutbound() {
      return { state: "PENDING" };
    },
    async markProcessing() {},
    async markDelivered() {},
    async recordRetry(_key, attempt) {
      calls.push(`retry:${attempt}`);
    },
    async recordFailure() {
      calls.push("terminal");
    },
  };

  const recovery = new P0_001BRecovery(persistence, { maxAttempts: 3 });
  const result = await recovery.recover({ idempotencyKey: "idem-1", attempt: 1 }, true);
  assert.equal(result, "RETRY_WAIT");
  assert.deepEqual(calls, ["retry:1"]);
});

test("P0-001B recovery makes exhausted or non-retryable failures terminal", async () => {
  const calls: string[] = [];
  const persistence: OutboundPersistencePort = {
    async stageOutbound() {
      return { state: "PENDING" };
    },
    async markProcessing() {},
    async markDelivered() {},
    async recordRetry() {},
    async recordFailure(_key, terminal) {
      calls.push(terminal ? "terminal" : "non-terminal");
    },
  };

  const recovery = new P0_001BRecovery(persistence, { maxAttempts: 3 });
  assert.equal(await recovery.recover({ idempotencyKey: "idem-1", attempt: 3 }, true), "FAILED_TERMINAL");
  assert.equal(await recovery.recover({ idempotencyKey: "idem-2", attempt: 1 }, false), "FAILED_TERMINAL");
  assert.deepEqual(calls, ["terminal", "terminal"]);
});
