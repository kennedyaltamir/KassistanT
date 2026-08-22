# WSS v1 Contract

Protocol version: `1.0`.

Envelope fields include protocol version, message id, message type, device id, timestamps and correlation identifiers; `event_id` and sequence are present when applicable.

Gateway -> Desktop: `EVENT`, `COMMAND`, `DEVICE_REVOKED`.
Desktop -> Gateway: `REQUEST`, `ACK`.
Bidirectional: `PING`, `PONG`.

ACK means only that the inbound event was durably persisted in the local `InboundInbox` transaction. A database failure must not produce ACK.

Sequences are monotonic per `(store_id, device_id)`. Reconnection uses resume/replay semantics defined by the approved baseline.
