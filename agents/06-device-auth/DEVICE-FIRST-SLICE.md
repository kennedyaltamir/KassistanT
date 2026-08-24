# IA-06 — First Implementation Slice

## Proposed first slice

**Device Authentication verification boundary** — `READY_AFTER_DECISION`.

The first runtime slice should be limited to a pure verification abstraction with no HTTP routing, session persistence, Secure Storage implementation, rate limiting or authorization policy.

### Preconditions

1. DR-02 closes signed-payload/challenge wire semantics.
2. Ed25519 public-key/signature representation is normative.
3. Verification failure/error semantics are approved.
4. IA-01 exposes the required Device identity persistence contract if persistence is needed.

### Intended boundary

Input: canonical challenge context + signature + registered public key.

Output: deterministic verification success/failure result defined by the approved contract.

### Explicit non-scope

No network transport, session creation, authorization decision, key storage, key rotation, enrollment state mutation or audit persistence is included in this first slice.

## Other slices

| Slice | Status | Gate |
|---|---|---|
| Device identity abstraction | READY_AFTER_DECISION | IA-01 schema closure |
| Challenge model | BLOCKED | DR-02 |
| Signature verification abstraction | READY_AFTER_DECISION | DR-02 |
| Session state abstraction | BLOCKED | DR-03 |
| Authorization decision abstraction | BLOCKED | DR-04 |
| Secure-storage interface | READY_AFTER_DECISION | logical contract closure; concrete mechanism external |
| Deterministic crypto test vectors | READY_AFTER_DECISION | DR-02 |

## Rule

This document proposes sequencing only. It does not authorize implementation or approve any unresolved protocol detail.
