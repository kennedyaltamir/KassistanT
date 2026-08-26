import { P0_001BRecovery } from "./p0-001b-recovery";
import type { OutboundPersistencePort } from "./p0-001b-runtime";

describe("P0-001B recovery", () => {
  it("moves retryable failures to RETRY_WAIT", async () => {
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
    await expect(
      recovery.recover({ idempotencyKey: "idem-1", attempt: 1 }, true),
    ).resolves.toBe("RETRY_WAIT");
    expect(calls).toEqual(["retry:1"]);
  });

  it("makes exhausted or non-retryable failures terminal", async () => {
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
    await expect(
      recovery.recover({ idempotencyKey: "idem-1", attempt: 3 }, true),
    ).resolves.toBe("FAILED_TERMINAL");
    await expect(
      recovery.recover({ idempotencyKey: "idem-2", attempt: 1 }, false),
    ).resolves.toBe("FAILED_TERMINAL");
    expect(calls).toEqual(["terminal", "terminal"]);
  });
});
