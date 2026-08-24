# KassisT WSS v1

Status: DEFINED / PARTIAL.
Protocol version: `1.0`.

## Message types

CONNECT, AUTH, AUTH_OK, AUTH_FAILED, PING, PONG, EVENT, ACK, COMMAND, COMMAND_RESULT, REQUEST, REQUEST_RESULT, RESUME, RESUME_OK, STATE_SYNC_REQUIRED, STATE_SYNC_START, STATE_SYNC_COMPLETE, DEVICE_REVOKED, DISCONNECT, ERROR.

## Envelope

`protocol_version`, `message_id`, `message_type`, `device_id`, `timestamp`, `payload`; `event_id`, `correlation_id`, `causation_id` and `sequence` when applicable.

## ACK

ACK means only durable local persistence of the inbound event in `InboundInbox`. Database failure means no ACK. ACK does not mean that customer processing completed.

## Sequence / resume / resync

Sequence is monotonic per `(store_id, device_id)`. Resume replays pending events. A detected gap may require `STATE_SYNC_REQUIRED` and subsequent snapshot/replay. Exact retention and state-sync payload remain PARTIAL.

## Heartbeat / reconnect

Baseline defines PING/PONG at 30 seconds and reconnect after three consecutive losses. Backoff uses jitter and a 5 minute ceiling. Exact jitter algorithm is PARTIAL.

## Backpressure / revocation

Baseline defines NORMAL, PRESSURED, CRITICAL and BLOCKED states and Gateway-driven `DEVICE_REVOKED`. Exact numerical queue limits are MISSING.

Runtime WSS implementation is NOT_IMPLEMENTED.