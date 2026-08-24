# IA-06 — Device Authentication Decision Package

Status: CONTRACT CLOSURE / IMPLEMENTATION FROZEN.

## Decision classes

- FACT: directly stated by approved/current sources.
- GLOBAL_DECISION_REQUIRED: implementation would otherwise invent externally observable behavior.
- EXTERNAL_CONFIGURATION_REQUIRED: depends on Windows/provider/environment validation.
- NON_BLOCKING: useful but not required to start the minimum secure runtime path.
- BLOCKED: cannot safely implement before an upstream decision.

## Minimum secure path

`Enrollment -> Challenge -> Signature -> Verification -> AUTH_OK/AUTH_FAILED -> Session Identity -> Authorization -> Revoke/Rotate`

## Current closure

| Area | Classification | Required closure |
|---|---|---|
| Device identity | PARTIAL | Final field-level schema from IA-01. |
| Enrollment HTTP contract | GLOBAL_DECISION_REQUIRED | Exact request/response, status and authz semantics. |
| Challenge | GLOBAL_DECISION_REQUIRED | Freshness, representation, canonical payload and replay semantics. |
| Ed25519 | FACT + PARTIAL | Keep algorithm/trust boundary; define wire encodings. |
| Session | GLOBAL_DECISION_REQUIRED | Session identity, expiry, renewal, reconnect and reauth. |
| Authorization | GLOBAL_DECISION_REQUIRED | Endpoint/action matrix and conditions. |
| Rate limiting | GLOBAL_DECISION_REQUIRED | Numeric policy for applicable operations. |
| Idempotency | GLOBAL_DECISION_REQUIRED | Per-operation key/scope/duplicate/replay/retention semantics. |
| Rotation | BLOCKED | Old/new key lifecycle, overlap, rollback and session continuity. |
| Revocation | PARTIAL | Normative signal/termination is defined; endpoint semantics remain partial. |
| Secure Storage | EXTERNAL_CONFIGURATION_REQUIRED | Concrete supported Windows mechanism and runtime validation. |
| Errors | GLOBAL_DECISION_REQUIRED | Device-auth catalog, mapping and retryability. |
| Audit | PARTIAL | Broader authentication/security-event coverage requires closure. |

## Decision requests

### DR-01 — Enrollment contract

Approve the exact HTTP request/response schemas, success/error status mapping, authentication/authorization requirements, correlation requirements and endpoint idempotency behavior for start/complete/cancel. No schema is proposed by IA-06.

Affected: IA-06, IA-07, IA-01.

### DR-02 — Authentication protocol

Approve challenge lifetime/freshness, nonce representation, signed payload canonicalization, public-key/signature wire representation, replay prevention and session establishment semantics. No cryptographic wire format is proposed by IA-06.

Affected: IA-06, IA-07, IA-01.

### DR-03 — Session lifecycle

Approve session identity, TTL/expiry, renewal, reconnect/resume binding, reauthentication and revocation invalidation. No TTL value is proposed.

Affected: IA-06, IA-07, IA-08.

### DR-04 — Authorization matrix

Approve actor/action/resource/condition rules for provisioning, enrollment, authentication, revoke, rotate, status and authenticated session use. Authentication must remain distinct from authorization.

Affected: IA-06, IA-07.

### DR-05 — Rate limits

Approve concrete policy for enrollment, AUTH, reconnect, RESUME and any applicable revoke/rotate/status operations. Required fields: limit, window, burst, lockout/penalty and retry-after semantics. No numeric values are proposed.

Affected: IA-06, IA-07.

### DR-06 — Endpoint idempotency

Approve key source, scope, persistence, duplicate response, conflict response, replay behavior and retention/TTL for enrollment/start, complete, cancel, revoke and rotate.

Affected: IA-06, IA-07, IA-03.

### DR-07 — Rotation lifecycle

Approve old/new key state transitions, overlap, atomicity, rollback, revocation ordering, session continuity and required reauthentication.

Affected: IA-06, IA-07, IA-01, IA-03.

### DR-08 — Error taxonomy

Approve canonical device-auth error identifiers, HTTP mapping, retryability and client-visible behavior. Candidate names in `DEVICE-ERROR-MATRIX.md` are analysis labels only, not normative codes.

Affected: IA-06, IA-07.

## Non-blocking items

- Final documentation wording.
- Additional diagnostics detail.
- Extended test-case inventory after contract lock.

## External configuration request

Windows Secure Storage must be validated against the supported Windows runtime. The concrete storage technology is intentionally not selected here.

## Gate

Runtime implementation remains blocked until DR-01 through DR-08 are resolved at the appropriate project authority, except items explicitly marked NON_BLOCKING.
