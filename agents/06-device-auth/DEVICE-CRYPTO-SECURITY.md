# IA-06 Device Crypto and Security Readiness

Status: STRATIFIED CONTRACT REVIEW / IMPLEMENTATION FROZEN.

## Layer 1 — Cryptographic primitive

**Status: DEFINED**

- Device authentication uses Ed25519 challenge-response.
- Gateway verifies proof of possession using the registered device public key.
- Public/private key separation is normative.

This layer does not define HTTP, session, authorization or rate-limit behavior.

## Layer 2 — Cryptographic verification contract

**Status: OPEN / DR-02A**

The minimum verification boundary requires:

- Ed25519 verification;
- a logically defined signed context;
- an explicit set of approved logical context elements;
- a deterministic rule deriving the exact bytes presented to the verifier;
- deterministic public-key representation;
- deterministic signature representation;
- deterministic valid/invalid result semantics.

### CRYPTOGRAPHIC_CONTEXT_BINDING_BOUNDARY

Context binding is part of the cryptographic verification contract only to the extent required to prevent a valid signature over one authenticated context from being accepted in an incompatible context.

The logical context is the set of protocol elements authenticated by the signature. Candidate elements for authority review are:

- device identity;
- protocol/domain separation;
- authentication purpose or operation identifier;
- challenge identity;
- protocol version, if required by the approved contract.

These are analysis candidates only. Only explicitly approved elements become part of the signed context.

The boundary is satisfied when:

1. signer and verifier derive the same logical context deterministically;
2. approved context elements are represented deterministically in the bytes verified by Ed25519;
3. no unapproved context element is silently added to or removed from those bytes.

This boundary does not define challenge freshness, uniqueness, expiration, persistence, reuse rejection or replay detection.

## Layer 3 — Operational replay security

**Status: OPEN / DR-02B**

The protocol requires fresh challenge-based proof, but the repository does not fully specify:

- challenge uniqueness;
- freshness policy;
- challenge lifecycle/storage;
- reuse rejection;
- expiration;
- replay detection;
- replay error semantics;
- persistence and recovery behavior.

Replay prevention must remain explicit before challenge runtime is implemented. It must not be inferred from the context-binding boundary or from an arbitrary local timestamp/TTL.

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

Pure signature verification can be tested after DR-02A approval. Replay/session/authorization/rate-limit/rotation/secure-storage tests require their respective contracts and should not be conflated with the pure verifier boundary.
