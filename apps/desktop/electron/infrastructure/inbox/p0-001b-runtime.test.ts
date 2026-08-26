import { P0_001BInboxRuntime, type InboundPersistencePort } from "./p0-001b-runtime";

describe("P0-001B inbound boundary", () => {
  it("delegates durable acceptance without exposing storage details", async () => {
    const calls: unknown[] = [];
    const persistence: InboundPersistencePort = {
      async acceptInbound(event) {
        calls.push(event);
        return { kind: "accepted", state: "PENDING" };
      },
    };

    const runtime = new P0_001BInboxRuntime(persistence);
    const result = await runtime.acceptInbound({
      provider: "whatsapp",
      externalEventId: "evt-1",
      correlationId: "corr-1",
      causationId: "cause-1",
      payloadRef: "payload-1",
    });

    expect(result).toEqual({ kind: "accepted", state: "PENDING" });
    expect(calls).toHaveLength(1);
  });

  it("rejects malformed inbound identity deterministically", async () => {
    const persistence: InboundPersistencePort = {
      async acceptInbound() {
        throw new Error("should not be called");
      },
    };

    const runtime = new P0_001BInboxRuntime(persistence);
    await expect(
      runtime.acceptInbound({ provider: "", externalEventId: "evt-1" }),
    ).rejects.toThrow("INVALID_INBOUND_IDENTITY");
  });

  it("preserves duplicate result from persistence boundary", async () => {
    const persistence: InboundPersistencePort = {
      async acceptInbound() {
        return { kind: "duplicate", state: "PROCESSING" };
      },
    };

    const runtime = new P0_001BInboxRuntime(persistence);
    await expect(
      runtime.acceptInbound({ provider: "whatsapp", externalEventId: "evt-1" }),
    ).resolves.toEqual({ kind: "duplicate", state: "PROCESSING" });
  });
});
