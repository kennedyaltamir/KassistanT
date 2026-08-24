# IA-06 Device Crypto and Security Readiness

Status: STRATIFIED CONTRACT REVIEW / IMPLEMENTATION FROZEN.

## Layer 1 — Cryptographic primitive

**Status: DEFINED**

- Device authentication uses Ed25519 challenge-response.
- Gateway verifies proof of possession using the registered device public key.
- Public/private key separation is normative.

This layer does not define HTTP, session, authorization or rate-limit behavior.

## Layer 2 — Cryptographic wire contract

**Status: OPEN / GLOBAL_DECISION_REQUIRED**

The repository does not yet fully define:

- exact signed bytes;
- payload canonicalization/serialization;
- public-key representation;
- signature representation;
- challenge representation;
- context binding needed to prevent cross-context signature reuse.

These are protocol-contract questions, not reasons to change the Ed25519 primitive.

## Layer 3 — Replay security

**Status: OPEN / GLOBAL_DECISION_REQUIRED**

The protocol requires fresh challenge-based proof, but the repository does not fully specify challenge lifecycle, uniqueness, expiration/reuse rejection or replay error semantics.

Replay prevention must be explicit before challenge runtime is implemented. It must not be inferred from an arbitrary local timestamp or an unapproved TTL.

## Layer 4 — Operational security

Operational security is separate from cryptographic correctness and includes:

- session lifecycle;
- authorization;
- rate limiting;
- endpoint idempotency;
- key rotation;
- auditability;
- secure key storage.

These concerns have independent decision gates.

## Secure Storage logical contract

**Status: DEFINED AS ARCHITECTURAL BOUNDARY**

- Private key remains in the privileged Desktop boundary.
- Private key is not exposed to Renderer/UI merely for convenience.
- Private key is not logged.
- Gateway retains the public key.
- Signing authority remains inside the privileged Desktop runtime.

## Secure Storage technology

**Status: EXTERNAL_CONFIGURATION_REQUIRED**

The repository does not select a concrete Windows mechanism. Technology selection, supported-Windows validation, deletion/replacement behavior and recovery validation remain separate implementation/external decisions.

## Revocation

**Status: PARTIAL / DEFINED OUTCOME**

Revocation results in `DEVICE_REVOKED` and session termination. It does not imply approval of key rotation or broader event taxonomy.

## Security invariants

1. Private key material remains in the privileged Desktop boundary.
2. Gateway verification uses the registered public key.
3. Device authentication and provisioning authorization remain separate concerns.
4. A revoked device cannot retain an authenticated session.
5. Pairing codes and private material are not written to logs.
6. Undefined security semantics require contract closure before implementation.

## Validation gates

Pure signature verification can be tested after the minimum DR-02 cryptographic wire subset is approved. Replay/session/authorization/rate-limit/rotation/security-storage tests require their respective contracts and should not be conflated with the pure verifier boundary.
