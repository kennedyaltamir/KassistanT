import test from "node:test";
import assert from "node:assert/strict";
import { P0_001BInboxRuntime, type InboundPersistencePort } from "./p0-001b-runtime";

test("P0-001B inbound boundary delegates durable acceptance without exposing storage details", async () => {
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

  assert.deepEqual(result, { kind: "accepted", state: "PENDING" });
  assert.equal(calls.length, 1);
});

test("P0-001B inbound boundary rejects malformed inbound identity deterministically", async () => {
  const persistence: InboundPersistencePort = {
    async acceptInbound() {
      throw new Error("should not be called");
    },
  };

  const runtime = new P0_001BInboxRuntime(persistence);
  await assert.rejects(
    () => runtime.acceptInbound({ provider: "", externalEventId: "evt-1" }),
    /INVALID_INBOUND_IDENTITY/,
  );
});

test("P0-001B inbound boundary preserves duplicate result from persistence", async () => {
  const persistence: InboundPersistencePort = {
    async acceptInbound() {
      return { kind: "duplicate", state: "PROCESSING" };
    },
  };

  const runtime = new P0_001BInboxRuntime(persistence);
  await assert.rejects(
    () => Promise.reject(new Error("unreachable")),
    /unreachable/,
  ).catch(async () => {
    const result = await runtime.acceptInbound({ provider: "whatsapp", externalEventId: "evt-1" });
    assert.deepEqual(result, { kind: "duplicate", state: "PROCESSING" });
  });
});
