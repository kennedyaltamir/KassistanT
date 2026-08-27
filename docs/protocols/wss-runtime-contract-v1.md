# KassisT WSS Runtime Contract v1

**Status:** FROZEN_FOR_IMPLEMENTATION  
**Contract ID:** WSS-RUNTIME-V1  
**Technical territory:** IA-07 (`agents/07-gateway-wss/`)  
**Related contract:** WSS-V1  
**Decision gate:** D-003  
**Scope:** Desktop ↔ Gateway runtime transport only

## 1. Authority

This document closes the runtime contract needed to implement the existing WSS v1 envelope. It does not authorize changes to business-domain semantics, device authentication policy, canonical persistence, or shared contracts outside the IA-07 boundary.

The existing `packages/contracts/src/wss.ts` remains the wire-shape source for `WssEnvelope`, protocol version `1.0`, message types, correlation fields and `AckPayload`.

## 2. Runtime responsibilities

IA-07 owns:

- WSS listener/upgrade integration;
- connection lifecycle;
- authentication handoff to IA-06;
- envelope parsing and validation;
- routing of protocol messages;
- ACK correlation and delivery state at the transport boundary;
- reconnect/resume transport semantics;
- transport-level errors and close behavior;
- transport tests.

IA-07 does **not** own:

- business authorization;
- canonical domain state;
- order lifecycle;
- canonical SQLite schema;
- AI decisions;
- device credential issuance/revocation policy.

Cross-boundary changes must be recorded and coordinated with the owning agent.

## 3. Connection lifecycle

The runtime state machine is:

`DISCONNECTED → CONNECTING → AUTHENTICATING → READY → CLOSING → DISCONNECTED`

A connection is not `READY` until device authentication has succeeded.

Invalid authentication or protocol violations terminate the connection with a deterministic transport error.

## 4. Handshake

The client initiates with `CONNECT` and presents the protocol version and device identity.

The Gateway validates envelope structure before business processing and delegates device authentication to IA-06. On successful authentication the Gateway emits `AUTH_OK`; otherwise it emits `AUTH_FAILED` and closes the connection after the failure response is delivered.

No business command is accepted before `READY`.

## 5. Envelope invariants

Every message must satisfy the existing WSS envelope contract:

- `protocol_version` is exactly `1.0`;
- `message_id` is non-empty and unique for the sending side within the deduplication window;
- `message_type` is one of the registered protocol types;
- `device_id` is present;
- `timestamp_utc` is a valid UTC timestamp;
- `payload` is present;
- `correlation_id` is required for request/response and command/result pairs;
- `causation_id` is preserved when the message is derived from another message;
- `event_id` is required for event delivery and ACK correlation;
- `sequence` is used when ordered stream semantics apply.

## 6. ACK semantics

`ACK` acknowledges transport receipt/acceptance of an identified event. It does not mean the business transaction completed successfully.

`AckPayload.event_id` MUST identify the event being acknowledged.

Business success/failure is communicated through the relevant result message or domain event, not through ACK semantics.

Duplicate ACKs are idempotent. Unknown event IDs are rejected as protocol errors or recorded as stale acknowledgements according to the runtime implementation, but must never mutate business state.

## 7. Correlation semantics

- `message_id` identifies one wire message.
- `event_id` identifies a delivered event when applicable.
- `correlation_id` groups a request/command and its result(s).
- `causation_id` points to the message that caused the current message.

The Gateway MUST preserve these identifiers across forwarding and must not generate a new correlation identity when one already exists.

## 8. Ordering and deduplication

The Gateway MUST tolerate duplicate delivery and reconnect replay without producing duplicate business effects.

Ordering is guaranteed only within an explicitly sequenced stream identified by `device_id` and active connection/session context.

When a sequence gap is detected, the Gateway MUST NOT silently invent missing state. It requests resume/state synchronization through the defined `RESUME` / `STATE_SYNC_REQUIRED` flow.

## 9. Reconnect and resume

Reconnect is expected behavior, not an exceptional fatal state.

The client may reconnect after network failure and present its last acknowledged sequence/state token. The Gateway evaluates whether the session can resume from retained data.

If resume is valid: `RESUME → RESUME_OK`.

If resume is not valid or the retention window is insufficient: `STATE_SYNC_REQUIRED → STATE_SYNC_START → STATE_SYNC_COMPLETE`.

Business state reconstruction remains outside the transport contract.

## 10. Error model

Transport errors are deterministic and machine-readable. At minimum the implementation must distinguish:

- unsupported protocol version;
- malformed envelope;
- unauthenticated client;
- authentication failure;
- invalid message type;
- missing required field;
- invalid correlation;
- sequence/resume failure;
- device revoked;
- internal transport failure.

Errors MUST NOT expose credentials, tokens or sensitive internal stack traces.

## 11. Security boundary

IA-07 validates protocol shape and transport/session state. IA-06 owns device authentication and device identity decisions. Domain authorization remains outside WSS transport.

A syntactically valid message is not automatically authorized to perform a business action.

## 12. Implementation acceptance criteria

Implementation is considered contract-complete only when:

1. all lifecycle states above are represented;
2. authentication gates transition to `READY`;
3. all envelope invariants are enforced;
4. ACK semantics are covered by tests;
5. correlation/causation identifiers are preserved;
6. duplicates are idempotent at the transport boundary;
7. reconnect/resume behavior is explicit;
8. sequence gaps trigger synchronization rather than silent recovery;
9. protocol errors are deterministic and sanitized;
10. tests cover happy path, malformed input, auth failure, duplicate delivery, reconnect, resume, sequence gap and shutdown.

## 13. Forbidden shortcuts

The implementation MUST NOT:

- move business authorization into the WSS transport;
- write business state directly from an unvalidated wire payload;
- bypass IA-06 authentication;
- treat ACK as business completion;
- silently drop correlation IDs;
- claim end-to-end readiness from envelope tests alone.

## 14. Gate

**CONTRACT STATUS: FROZEN_FOR_IMPLEMENTATION**

This contract authorizes IA-07 to implement the runtime transport **only within its ownership boundary**. It does not authorize modifications to protected shared files without the existing integration-approval process.
