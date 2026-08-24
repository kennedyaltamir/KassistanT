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
| Cryptographic wire contract | OPEN / DR-02A | Signed bytes, key/signature representation and context binding are not fully defined. |
| Operational replay protocol | OPEN / DR-02B | Challenge freshness/lifecycle, reuse rejection, expiration and replay handling remain open. |
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

## DR-02 stratification

### DR-02A — Cryptographic Verification Contract

**Status:** OPEN / GLOBAL_DECISION_REQUIRED.

The minimum approval surface for the pure `Signature Verification Boundary` is limited to:

1. Ed25519 verification primitive.
2. Logical signed-context concept.
3. Rule defining the exact bytes presented to the verifier.
4. Public-key representation.
5. Signature representation.
6. Context binding required to prevent incompatible-context signature reuse, where required by the approved protocol.
7. Deterministic verification result semantics (`valid` / `invalid`).

This decision does not define challenge storage, expiration, replay persistence, HTTP behavior or session lifecycle.

### DR-02B — Operational Replay Protocol

**Status:** OPEN / REPLAY RUNTIME.

The following remain separate and unapproved:

- challenge uniqueness;
- freshness policy;
- challenge lifecycle/storage;
- reuse rejection;
- expiration;
- replay detection;
- replay error semantics;
- persistence and recovery.

A minimum DR-02A approval must not be interpreted as approval of DR-02B.

## Decision requests

### DR-01 — Enrollment contract

Approve exact HTTP request/response schemas, success/error mapping, endpoint authentication/authorization, correlation and idempotency for start/complete/cancel. IA-06 proposes no schema.

### DR-02 — Challenge/signature contract

Approve DR-02A only for the first pure verifier slice unless the authority explicitly approves DR-02B as well. No arbitrary TTL, encoding, replay store or HTTP behavior is created by IA-06.

Affected: IA-06, IA-07, and IA-01 only where persistence becomes a proven dependency.

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

It requires only DR-02A plus the already-approved Ed25519 primitive.

DR-02B remains OPEN and is not part of the first-slice approval request.

## Non-blocking items

- Final documentation wording.
- Extended diagnostics detail.
- Broader test-case inventory after contract lock.
- Full enrollment/session/authorization policy for slices that do not consume those boundaries.

## External configuration

The logical Secure Storage contract is architectural. Concrete Windows technology selection and supported-Windows runtime validation remain separate implementation/external decisions.

## Gate

Full runtime remains blocked by its respective layer gates. No DR is implicitly closed by this package.
