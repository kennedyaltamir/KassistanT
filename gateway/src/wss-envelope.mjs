const MESSAGE_TYPES = new Set([
  "CONNECT",
  "AUTH",
  "AUTH_OK",
  "AUTH_FAILED",
  "PING",
  "PONG",
  "EVENT",
  "ACK",
  "COMMAND",
  "COMMAND_RESULT",
  "REQUEST",
  "REQUEST_RESULT",
  "RESUME",
  "RESUME_OK",
  "STATE_SYNC_REQUIRED",
  "STATE_SYNC_START",
  "STATE_SYNC_COMPLETE",
  "DEVICE_REVOKED",
  "DISCONNECT",
  "ERROR"
]);

const PROTOCOL_VERSION = "1.0";

function isNonEmptyString(value) {
  return typeof value === "string" && value.length > 0;
}

export function validateWssEnvelope(message) {
  if (message === null || typeof message !== "object" || Array.isArray(message)) {
    return { valid: false, code: "invalid_envelope" };
  }

  if (message.protocol_version !== PROTOCOL_VERSION) {
    return { valid: false, code: "invalid_protocol_version" };
  }

  if (!isNonEmptyString(message.message_id)) {
    return { valid: false, code: "invalid_message_id" };
  }

  if (!MESSAGE_TYPES.has(message.message_type)) {
    return { valid: false, code: "invalid_message_type" };
  }

  if (!isNonEmptyString(message.device_id)) {
    return { valid: false, code: "invalid_device_id" };
  }

  if (!isNonEmptyString(message.timestamp_utc)) {
    return { valid: false, code: "invalid_timestamp" };
  }

  if (!("payload" in message)) {
    return { valid: false, code: "missing_payload" };
  }

  for (const field of ["event_id", "correlation_id", "causation_id"]) {
    if (field in message && !isNonEmptyString(message[field])) {
      return { valid: false, code: `invalid_${field}` };
    }
  }

  if ("sequence" in message && typeof message.sequence !== "number") {
    return { valid: false, code: "invalid_sequence" };
  }

  if (message.message_type === "ACK") {
    if (
      message.payload === null ||
      typeof message.payload !== "object" ||
      !isNonEmptyString(message.payload.event_id)
    ) {
      return { valid: false, code: "invalid_ack_payload" };
    }
  }

  return { valid: true };
}
