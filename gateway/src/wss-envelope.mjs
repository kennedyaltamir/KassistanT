/** @typedef {Record<string, unknown> & { protocol_version?: unknown, message_id?: unknown, message_type?: unknown, device_id?: unknown, timestamp_utc?: unknown, payload?: unknown, event_id?: unknown, correlation_id?: unknown, causation_id?: unknown, sequence?: unknown }} WssEnvelope */
/** @typedef {{ valid: true, code?: undefined } | { valid: false, code: string }} WssValidationResult */

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

/** @param {unknown} value @returns {value is string} */
function isNonEmptyString(value) {
  return typeof value === "string" && value.length > 0;
}

/** @param {unknown} message @returns {WssValidationResult} */
export function validateWssEnvelope(message) {
  if (message === null || typeof message !== "object" || Array.isArray(message)) {
    return { valid: false, code: "invalid_envelope" };
  }

  const envelope = /** @type {WssEnvelope} */ (message);

  if (envelope.protocol_version !== PROTOCOL_VERSION) {
    return { valid: false, code: "invalid_protocol_version" };
  }

  if (!isNonEmptyString(envelope.message_id)) {
    return { valid: false, code: "invalid_message_id" };
  }

  if (!MESSAGE_TYPES.has(envelope.message_type)) {
    return { valid: false, code: "invalid_message_type" };
  }

  if (!isNonEmptyString(envelope.device_id)) {
    return { valid: false, code: "invalid_device_id" };
  }

  if (!isNonEmptyString(envelope.timestamp_utc)) {
    return { valid: false, code: "invalid_timestamp" };
  }

  if (!("payload" in envelope)) {
    return { valid: false, code: "missing_payload" };
  }

  for (const field of ["event_id", "correlation_id", "causation_id"]) {
    if (field in envelope && !isNonEmptyString(envelope[field])) {
      return { valid: false, code: `invalid_${field}` };
    }
  }

  if ("sequence" in envelope && typeof envelope.sequence !== "number") {
    return { valid: false, code: "invalid_sequence" };
  }

  if (envelope.message_type === "ACK") {
    const payload = envelope.payload;
    if (
      payload === null ||
      typeof payload !== "object" ||
      !isNonEmptyString(/** @type {{ event_id?: unknown }} */ (payload).event_id)
    ) {
      return { valid: false, code: "invalid_ack_payload" };
    }
  }

  return { valid: true };
}
