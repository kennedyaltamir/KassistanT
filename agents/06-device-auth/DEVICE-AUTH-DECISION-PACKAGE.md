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
| Cryptographic wire contract | OPEN / DR-02A | Signed bytes, approved context, key/signature representation and deterministic derivation remain to be approved. |
| Cryptographic context binding | OPEN / DR-02A | Defines which approved logical context elements are authenticated by the signature; does not define replay lifecycle. |
| Challenge/replay protocol | OPEN / DR-02B | Freshness, challenge lifecycle and replay prevention remain to be decided. |
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

### DR-02 — Challenge/signature contract

DR-02 is divided into two independent decision scopes:

- **DR-02A — Cryptographic Verification Contract**
- **DR-02B — Operational Replay / Challenge Runtime**

#### DR-02A — Cryptographic Verification Contract

Approve only the minimum cryptographic contract needed by the `Signature Verification Boundary`:

1. Ed25519 verification primitive.
2. Logical signed-context concept.
3. Explicit set of approved logical context elements.
4. Deterministic rule deriving the exact bytes presented to the verifier from that approved context.
5. Public-key representation.
6. Signature representation.
7. Deterministic verifier result semantics (`valid` / `invalid`).

#### CRYPTOGRAPHIC_CONTEXT_BINDING_BOUNDARY

Context binding belongs to DR-02A only to the extent required to prevent a valid signature over one authenticated context from being accepted as valid in an incompatible context.

The logical context is the set of protocol elements authenticated by the signature. Candidate elements for authority review are:

- device identity;
- protocol/domain separation;
- authentication purpose or operation identifier;
- challenge identity;
- protocol version, if required by the approved contract.

These are analysis candidates only. An element becomes part of the cryptographic context only after explicit project approval.

The final boundary must satisfy:

1. signer and verifier derive the same logical context deterministically;
2. approved context elements are represented deterministically in the bytes verified by Ed25519;
3. no unapproved context element is silently added to or removed from the verified bytes.

This boundary specifies **what is cryptographically authenticated**. It does not specify challenge freshness, uniqueness, expiration, storage, reuse rejection or replay detection.

#### DR-02B — Operational Replay / Challenge Runtime

DR-02B remains **OPEN** and covers:

- challenge uniqueness;
- challenge freshness policy;
- challenge lifecycle/storage;
- reuse rejection;
- expiration;
- replay detection;
- replay error semantics;
- persistence and recovery behavior.

No numeric TTL, freshness window, replay store or operational detection rule is created by DR-02A.

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

It requires only the minimum cryptographic subset of DR-02A.

DR-02B remains independent and OPEN.

## Non-blocking items

- Final documentation wording.
- Extended diagnostics detail.
- Broader test-case inventory after contract lock.
- Full enrollment/session/authorization policy for slices that do not consume those boundaries.

## External configuration

The logical Secure Storage contract is architectural. Concrete Windows technology selection and supported-Windows runtime validation remain separate implementation/external decisions.

## Gate

Full runtime remains blocked by its respective layer gates. No DR is implicitly closed by this package, and approval of DR-02A does not approve DR-02B or authorize implementation.
