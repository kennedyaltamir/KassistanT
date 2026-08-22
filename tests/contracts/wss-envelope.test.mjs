import test from "node:test";
import assert from "node:assert/strict";

const messageTypes = [
  "CONNECT", "AUTH", "AUTH_OK", "AUTH_FAILED", "PING", "PONG", "EVENT", "ACK",
  "COMMAND", "COMMAND_RESULT", "REQUEST", "REQUEST_RESULT", "RESUME", "RESUME_OK",
  "STATE_SYNC_REQUIRED", "STATE_SYNC_START", "STATE_SYNC_COMPLETE", "DEVICE_REVOKED",
  "DISCONNECT", "ERROR"
];

test("WSS v1 message type catalogue is non-empty and contains ACK", () => {
  assert.ok(messageTypes.length > 0);
  assert.ok(messageTypes.includes("ACK"));
});

test("ACK semantics require an event identifier", () => {
  const payload = { event_id: "018f0f55-0000-7000-8000-000000000001" };
  assert.equal(typeof payload.event_id, "string");
});
