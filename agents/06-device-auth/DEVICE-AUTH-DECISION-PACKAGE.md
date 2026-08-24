# IA-06 — Device Authentication Decision Package

Status: CONTRACT CLOSURE / IMPLEMENTATION FROZEN.

## Decision classes

- FACT: directly stated by approved/current sources.
- GLOBAL_DECISION_REQUIRED: implementation would otherwise invent externally observable behavior.
- EXTERNAL_CONFIGURATION_REQUIRED: depends on Windows/provider/environment validation.
- NON_BLOCKING: useful but not required for a currently authorized slice.
- BLOCKED: cannot safely implement before an upstream decision.

## Security layer model

| Layer | Status | Meaning |
|---|---|---|
| Device identity semantics | PARTIAL | Logical device identity is defined; physical persistence remains IA-01 dependent. |
| Cryptographic primitive | DEFINED | Ed25519 is the approved primitive/trust boundary. |
| Cryptographic wire contract | OPEN | Signed bytes, key/signature representation and canonicalization are not fully defined. |
| Challenge/replay protocol | OPEN | Freshness, challenge lifecycle and replay binding remain to be decided. |
| Session security | OPEN | Session lifecycle is independent from signature verification. |
| Authorization | OPEN | Authentication does not imply provisioning authority. |
| Rate limiting | OPEN | Operational security policy, separate from cryptographic correctness. |
| Endpoint idempotency | OPEN | Request/retry safety, separate from signature verification. |
| Key rotation | BLOCKED | Key lifecycle/overlap/rollback/session continuity unresolved. |
| Revocation | PARTIAL | `REVOKED`, `DEVICE_REVOKED` and session termination are evidenced. |
| Auditability | PARTIAL | Minimum security-event evidence identified; IA-03 durability remains dependency. |
| Secure Storage logical contract | DEFINED AS BOUNDARY | Private key remains privileged and out of Renderer/logs. |
| Secure Storage technology | EXTERNAL | Concrete Windows mechanism/runtime validation not selected. |

## Minimum secure path

`Enrollment -> Challenge -> Signature -> Verification -> AUTH_OK/AUTH_FAILED -> Session Identity -> Authorization -> Revoke/Rotate`

The path is intentionally decomposed. Closure of one layer does not implicitly approve another.

## Decision requests

### DR-01 — Enrollment contract

Approve exact HTTP request/response schemas, success/error mapping, endpoint authentication/authorization, correlation and idempotency for start/complete/cancel. IA-06 proposes no schema.

### DR-02 — Challenge/signature protocol

Approve only the minimum cryptographic wire contract needed by each slice:

1. Ed25519 verification primitive.
2. Logical definition of the signed challenge context.
3. Rule defining the exact bytes presented to the verifier.
4. Deterministic public-key representation.
5. Deterministic signature representation.
6. Freshness/replay binding requirement.
7. Deterministic verifier result semantics.

A separate later decision may close full transport/session semantics. No arbitrary TTL, encoding or HTTP behavior is created here.

Affected: IA-06, IA-07, IA-01 only where persistence is required.

### DR-03 — Session lifecycle

Approve session identity, expiry/renewal, reconnect/resume binding, reauthentication and revocation invalidation. No TTL value is proposed.

### DR-04 — Authorization matrix

Approve actor/action/resource/condition rules for provisioning, enrollment, authentication, revoke, rotate, status and authenticated session use. Authentication must remain distinct from authorization.

### DR-05 — Rate limits

Approve applicable operations and concrete policy. Required policy dimensions: limit, window, burst, lockout/penalty and retry-after. No values are proposed.

### DR-06 — Endpoint idempotency

Approve key source, scope, persistence, duplicate response, conflict response, replay behavior and retention/TTL for enrollment/start, complete, cancel, revoke and rotate.

### DR-07 — Rotation lifecycle

Approve old/new key state transitions, overlap, atomicity, rollback, revocation ordering, session continuity and reauthentication.

### DR-08 — Error taxonomy

Approve canonical device-auth error identifiers, retryability, client-visible semantics and HTTP mapping. Candidate labels are analysis-only until approved.

## First-slice gate

The `Signature Verification Boundary` does **not** require closure of DR-01, DR-03, DR-04, DR-05, DR-06 or DR-07 unless an approved implementation boundary later proves otherwise.

It requires only the minimum cryptographic subset of DR-02 plus the already-approved Ed25519 primitive.

## Non-blocking items

- Final documentation wording.
- Extended diagnostics detail.
- Broader test-case inventory after contract lock.
- Full enrollment/session/authorization policy for slices that do not consume those boundaries.

## External configuration

The logical Secure Storage contract is architectural. Concrete Windows technology selection and supported-Windows runtime validation remain separate implementation/external decisions.

## Gate

Full runtime remains blocked by its respective layer gates. No DR is implicitly closed by this package.
