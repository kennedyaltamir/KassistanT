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
| Envelope fields | mostly explicit | validator implemented | PASS | message semantics remain partial | PARTIAL |
| ACK | durable Inbox boundary explicit | NOT_IMPLEMENTED | MISSING | IA-03 dependency | BLOCKED |
| Handshake/AUTH | flow explicit, IA-06 dependency | NOT_IMPLEMENTED | MISSING | IA-06 | BLOCKED |
| Sequence | monotonic per store/device | NOT_IMPLEMENTED | MISSING | persistence/replay dependency | BLOCKED |
| Resume/replay | partial | NOT_IMPLEMENTED | MISSING | retention/state semantics partial | BLOCKED |
| Resync | partial | NOT_IMPLEMENTED | MISSING | state-sync payload partial | BLOCKED |
| Heartbeat | PING/PONG 30s, 3 losses | NOT_IMPLEMENTED | MISSING | runtime transport absent | BLOCKED |
| Backpressure | states explicit | NOT_IMPLEMENTED | MISSING | numerical limits missing | BLOCKED |
| Revocation | DEVICE_REVOKED explicit | NOT_IMPLEMENTED | MISSING | IA-06 dependency | BLOCKED |
| Errors | ERROR type explicit | NOT_IMPLEMENTED | MISSING | full error catalog partial | BLOCKED |

## Implemented increment

Added `gateway/src/wss-envelope.mjs`, a pure validator for the existing WSS v1 envelope contract. It does not implement sockets, authentication, persistence, replay, resume, resync, heartbeat or business behavior.

## Evidence rule

Progress entries describe repository state, not intended future implementation. Documentation is not treated as runtime evidence.
