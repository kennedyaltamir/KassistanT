import test from "node:test";
import assert from "node:assert/strict";
import { validateWssEnvelope } from "../src/wss-envelope.mjs";

const baseEnvelope = {
  protocol_version: "1.0",
  message_id: "message-1",
  message_type: "EVENT",
  device_id: "device-1",
  timestamp_utc: "2026-08-24T04:00:00Z",
  correlation_id: "corr-1",
  payload: { event: "sample" }
};

test("accepts a valid WSS v1 envelope and preserves correlation metadata", () => {
  const result = validateWssEnvelope(baseEnvelope);
  assert.deepEqual(result, { valid: true });
  assert.equal(baseEnvelope.correlation_id, "corr-1");
});

test("rejects an unsupported protocol version", () => {
  const result = validateWssEnvelope({ ...baseEnvelope, protocol_version: "2.0" });
  assert.deepEqual(result, { valid: false, code: "invalid_protocol_version" });
});

test("rejects an unknown message type", () => {
  const result = validateWssEnvelope({ ...baseEnvelope, message_type: "UNKNOWN" });
  assert.deepEqual(result, { valid: false, code: "invalid_message_type" });
});

test("requires event_id in ACK payload", () => {
  const result = validateWssEnvelope({ ...baseEnvelope, message_type: "ACK", payload: {} });
  assert.deepEqual(result, { valid: false, code: "invalid_ack_payload" });
});

test("rejects envelopes without a payload", () => {
  const { payload: _payload, ...withoutPayload } = baseEnvelope;
  const result = validateWssEnvelope(withoutPayload);
  assert.deepEqual(result, { valid: false, code: "missing_payload" });
});
