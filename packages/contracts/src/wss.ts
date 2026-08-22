export const WSS_PROTOCOL_VERSION = "1.0" as const;

export const WSS_MESSAGE_TYPES = [
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
] as const;

export type WssMessageType = typeof WSS_MESSAGE_TYPES[number];

export interface WssEnvelope<TPayload = unknown> {
  protocol_version: typeof WSS_PROTOCOL_VERSION;
  message_id: string;
  message_type: WssMessageType;
  event_id?: string;
  device_id: string;
  correlation_id?: string;
  causation_id?: string;
  sequence?: number;
  timestamp_utc: string;
  payload: TPayload;
}

export interface AckPayload {
  event_id: string;
}
