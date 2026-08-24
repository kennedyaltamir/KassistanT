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

## WSS Session Boundary Audit — 2026-08-24

### Ownership conclusions

- IA-06 owns device identity, enrollment, Ed25519 proof-of-possession, authentication verification, revocation and key rotation.
- IA-07 owns generic WSS connection/transport mechanics after an authenticated identity is supplied; it does not own cryptographic authority.
- IA-03 owns InboundInbox, deduplication, durable ACK boundary, replay/recovery and Event Infrastructure.
- IA-08 consumes connection/session state and WSS events for UI presentation; it does not own authentication or durable transport state.

### Session identity

`session identity` is explicitly part of the IA-06 device-auth boundary, but exact fields, lifecycle states, expiration and reconnect/reauthentication semantics remain unspecified. No IA-07 session contract was invented.

### Revocation

IA-06 is the revocation authority. IA-07 may only apply transport/session termination after receiving an executable revocation signal defined by the device-auth boundary.

### ACK / persistence

The sequence remains: validate envelope → durable `InboundInbox` persistence → ACK → downstream business processing. IA-07 must consume IA-03 durability interfaces and must not create competing persistence or replay stores.

### Sequence / reconnect

Sequence is documented as monotonic per `(store_id, device_id)`, but persistence ownership, duplicate/gap handling and replay storage remain PARTIAL. Reconnect/reauthentication semantics are also not closed by IA-06.

## WSS Integration Gate Package — 2026-08-24

### IA-06 gate

Required before WSS lifecycle implementation:

- executable authenticated-session result;
- authoritative `device_id`;
- definitive `session_id` if sessions exist;
- explicit session expiry semantics if applicable;
- executable revocation signal;
- explicit reconnect/reauthentication behavior.

Current: `BLOCKED`.

### IA-03 gate

Required before WSS receive/ACK/recovery implementation:

- executable durable-intake result;
- persisted / duplicate / failure outcomes;
- explicit ACK authorization semantics;
- persistence-before-ACK guarantee;
- selected replay/resume boundary, or explicit deferral;
- sequence ownership and duplicate/gap semantics for the selected slice.

Current: `BLOCKED`.

### V1 minimization

The first WSS lifecycle slice does not automatically require full replay, resync or numerical backpressure tuning. Those capabilities may be explicitly deferred only when the selected V1 contract permits the deferral. No semantics are inferred locally.

### Artifacts

- `WSS-INTEGRATION-GATE.md`
- `WSS-IA06-CONTRACT.md`
- `WSS-IA03-CONTRACT.md`
- `WSS-RUNTIME-V1-REQUIREMENTS.md`
- `WSS-INTEGRATION-BOUNDARY.md`
- `WSS-SESSION-DECISION-MATRIX.md`

### Runtime gate

`WSS connection lifecycle abstraction = BLOCKED`.

No runtime code was added in this phase.

## Evidence rule

Progress entries describe repository state, not intended future implementation. Documentation is not treated as runtime evidence.
