# IA-06 — First Implementation Slice

## Proposed first slice

**Signature Verification Boundary** — `READY_AFTER_MINIMUM_DR02_CLOSURE`.

This is a pure, deterministic verification boundary. It does not require closure of enrollment, session, authorization, rate limiting, endpoint idempotency or key rotation unless the eventual implementation boundary proves a concrete dependency.

### Minimum entry gate

Only the following DR-02 subset must be approved:

1. Ed25519 verification primitive.
2. Logical signed challenge context.
3. Exact bytes presented to the verifier.
4. Public-key representation.
5. Signature representation.
6. Freshness/replay binding requirement relevant to the signed context.
7. Deterministic valid/invalid verification result semantics.

No HTTP schema, session TTL, authorization rule, rate limit, idempotency TTL or rotation policy is required for this pure boundary.

### Intended boundary

Input: approved canonical signed bytes + approved public key representation + signature representation.

Output: deterministic verification result defined by the approved cryptographic contract.

### Explicit non-scope

No network transport, HTTP endpoint, session creation, authorization decision, key storage, key rotation, enrollment state mutation, rate limiting or audit persistence.

## Layer separation

| Layer | Status | Blocks this slice? |
|---|---|---|
| Device identity semantics | PARTIAL | NO, unless verifier requires physical persistence. |
| Ed25519 primitive | DEFINED | YES — already satisfied by baseline. |
| Crypto wire contract | OPEN | YES — only the minimum DR-02 subset. |
| Replay/session runtime | OPEN | NO. |
| Authorization | OPEN | NO. |
| Rate limiting | OPEN | NO. |
| Idempotency | OPEN | NO. |
| Rotation | BLOCKED | NO. |
| Secure Storage | EXTERNAL | NO for pure verification. |

## Other slices

| Slice | Status | Gate |
|---|---|---|
| Device identity abstraction | READY_AFTER_DECISION | IA-01 logical/physical identity boundary |
| Challenge model | BLOCKED | DR-02 challenge closure |
| Signature verification abstraction | READY_AFTER_MINIMUM_DR02_CLOSURE | Minimum DR-02 subset |
| Session state abstraction | BLOCKED | DR-03 |
| Authorization decision abstraction | BLOCKED | DR-04 |
| Secure-storage interface | READY_AFTER_DECISION | Logical contract closure; concrete mechanism external |
| Deterministic crypto test vectors | READY_AFTER_MINIMUM_DR02_CLOSURE | Minimum DR-02 subset |

## Exit criteria for the first slice

- The exact signed bytes are contractually defined.
- Public-key and signature representations are contractually defined.
- The verifier result is deterministic.
- Valid and invalid test vectors can be defined without inventing protocol semantics.
- No product runtime integration is required to exercise the pure boundary.

## Rule

This document proposes sequencing only. It does not authorize implementation or approve unresolved protocol details.
