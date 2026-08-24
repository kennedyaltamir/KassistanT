# IA-07 — Progress

## Current state

- Territory audit: COMPLETE for the currently verified Gateway/WSS surface.
- Product implementation: PARTIAL.
- HTTP runtime: `/health` and `/ready` implemented; remaining normative routes NOT_IMPLEMENTED.
- WSS runtime: transport NOT_IMPLEMENTED; structural envelope validation implemented.
- Device-auth runtime: OUTSIDE IA-07.
- Global contracts: READ-ONLY in this phase.

## HTTP Contract-to-Runtime Audit — 2026-08-24

| ID | Endpoint | Gate | Main status | Key blockers |
|---|---|---|---|---|
| GW-001 | GET /health | READY_TO_IMPLEMENT | IMPLEMENTED | Detailed health semantics PARTIAL |
| GW-002 | GET /ready | PARTIAL_CONTRACT | IMPLEMENTED | Exact readiness predicates PARTIAL |
| GW-003 | GET /webhooks/whatsapp | BLOCKED | NOT_IMPLEMENTED | Meta verification semantics/payload/auth/status/idempotency PARTIAL/EXTERNAL |
| GW-004 | POST /webhooks/whatsapp | BLOCKED | NOT_IMPLEMENTED | Signature/payload/retry/idempotency/rate limits PARTIAL/EXTERNAL |
| GW-005 | POST /v1/devices/enrollment/start | PARTIAL_CONTRACT | NOT_IMPLEMENTED | IA-06 + schemas/status/auth/idempotency PARTIAL/MISSING |
| GW-006 | POST /v1/devices/enrollment/complete | PARTIAL_CONTRACT | NOT_IMPLEMENTED | IA-06 + schemas/status/auth/idempotency PARTIAL/MISSING |
| GW-007 | POST /v1/devices/enrollment/cancel | PARTIAL_CONTRACT | NOT_IMPLEMENTED | IA-06 + schemas/status/auth/idempotency PARTIAL/MISSING |
| GW-008 | POST /v1/devices/revoke | BLOCKED | NOT_IMPLEMENTED | IA-06 authorization/auth semantics incomplete |
| GW-009 | POST /v1/devices/rotate | BLOCKED | NOT_IMPLEMENTED | IA-06 authorization/auth semantics incomplete |
| GW-010 | GET /v1/devices/{device_id}/status | PARTIAL_CONTRACT | NOT_IMPLEMENTED | IA-06 + response/status/auth incomplete |

### Matrix notes

- Authentication/authorization for device endpoints: PARTIAL/EXTERNAL through IA-06.
- Webhook verification and provider signatures: EXTERNAL/PARTIAL; no Meta parameters were invented.
- Endpoint-specific `Idempotency-Key` scope/replay/TTL/conflict semantics: UNKNOWN/PARTIAL wherever not explicitly defined.
- Timeout and rate-limit numerical values: UNKNOWN/MISSING unless explicitly defined elsewhere.
- Correlation: supported as a transport concern and propagated by existing HTTP runtime; endpoint-specific correlation requirements remain PARTIAL.
- Audit/observability semantics: defined at architecture level but runtime behavior is not implemented for the pending endpoints.

## WSS Contract-to-Runtime Audit — 2026-08-24

| Concern | Contract | Runtime | Test | Gap / blocker | Readiness |
|---|---|---|---|---|---|
| Protocol version | 1.0 explicit | validator implemented | PASS | full transport absent | PARTIAL |
| Message types | explicit list | validator implemented | PASS | dispatch/transport absent | PARTIAL |
| Envelope fields | mostly explicit | validator implemented | PASS | exact lexical rules remain partial | PARTIAL |
| ACK | durable Inbox boundary explicit | NOT_IMPLEMENTED | MISSING | IA-03 dependency | BLOCKED |
| Handshake/AUTH | flow explicit, IA-06 dependency | NOT_IMPLEMENTED | MISSING | IA-06 | BLOCKED |
| Sequence | monotonic per store/device | NOT_IMPLEMENTED | MISSING | persistence/replay dependency | BLOCKED |
| Resume/replay | partial | NOT_IMPLEMENTED | MISSING | retention/state semantics partial | BLOCKED |
| Resync | partial | NOT_IMPLEMENTED | MISSING | state-sync payload partial | BLOCKED |
| Heartbeat | PING/PONG 30s, 3 losses | NOT_IMPLEMENTED | MISSING | runtime transport absent | BLOCKED |
| Backpressure | states explicit | NOT_IMPLEMENTED | MISSING | numerical limits missing | BLOCKED |
| Revocation | DEVICE_REVOKED explicit | NOT_IMPLEMENTED | MISSING | IA-06 dependency | BLOCKED |
| Errors | ERROR type explicit | NOT_IMPLEMENTED | MISSING | full error catalog partial | BLOCKED |

## WSS Envelope Contract Closure — 2026-08-24

### Field status

- `protocol_version`: EXPLICIT `1.0`; negotiation/compatibility behavior UNKNOWN.
- `message_id`: EXPLICIT non-empty string at current contract boundary; exact identifier format UNKNOWN.
- `message_type`: EXPLICIT closed enumeration.
- `device_id`: EXPLICIT non-empty string at current contract boundary; exact identifier format UNKNOWN.
- `timestamp_utc`: EXPLICIT field; strict lexical/timezone grammar UNKNOWN.
- `payload`: EXPLICIT field; individual message payload schemas PARTIAL.
- `event_id`: OPTIONAL WHEN APPLICABLE; format UNKNOWN.
- `correlation_id`: OPTIONAL WHEN APPLICABLE; propagation/storage rules PARTIAL.
- `causation_id`: OPTIONAL WHEN APPLICABLE; propagation/storage rules PARTIAL.
- `sequence`: OPTIONAL WHEN APPLICABLE; monotonic scope explicit, persistence/gap/replay semantics PARTIAL.
- ACK payload `event_id`: EXPLICIT.

### Validation boundary

The existing validator checks object-ness, protocol version, message type, required identifiers, payload presence, basic optional-field string types, numeric `sequence` type and ACK payload shape. It intentionally does not invent stricter lexical rules, unknown-field policy or version negotiation.

### Runtime readiness gate

The next functional WSS transport slice is **BLOCKED**. It requires IA-06 device authentication/session identity, IA-03 Inbox durability and ACK/replay infrastructure, and completion of currently partial recovery/backpressure semantics. No socket, handshake, ACK, replay, resume, resync, heartbeat or backpressure runtime was added in this phase.

## Evidence rule

Progress entries describe repository state, not intended future implementation. Documentation is not treated as runtime evidence.
