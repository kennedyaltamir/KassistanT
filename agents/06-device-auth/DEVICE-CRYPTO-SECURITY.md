# IA-06 Device Crypto and Security Readiness

Status: STRATIFIED DR-02 REVIEW / IMPLEMENTATION FROZEN.

## Layer 1 — Cryptographic primitive

**Status: DEFINED**

- Device authentication uses Ed25519 challenge-response.
- Gateway verifies proof of possession using the registered device public key.
- Public/private key separation is normative.

This layer does not define HTTP, session, authorization or rate-limit behavior.

## Layer 2 — DR-02A Cryptographic Verification Contract

**Status: OPEN / GLOBAL_DECISION_REQUIRED**

The minimum contract required by the pure Signature Verification Boundary must define:

1. the logical signed-context concept;
2. the exact bytes presented to the verifier;
3. public-key representation;
4. signature representation;
5. context binding required to prevent incompatible-context signature reuse, where required by the approved protocol;
6. deterministic verification result semantics (`valid` / `invalid`).

The repository does not yet provide these wire-level details completely. They must be approved; they must not be invented locally.

## Layer 3 — DR-02B Operational Replay Protocol

**Status: OPEN / REPLAY RUNTIME**

Replay/challenge runtime is separate from the pure cryptographic verifier and includes:

- challenge uniqueness;
- challenge freshness policy;
- challenge lifecycle/storage;
- reuse rejection;
- expiration;
- replay detection;
- replay error semantics;
- persistence and recovery behavior.

A DR-02A approval does not approve DR-02B. No numeric freshness window, TTL or replay-store design is defined here.

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

Pure signature verification can be tested after DR-02A is approved. Replay/session/authorization/rate-limit/rotation/secure-storage tests require their respective contracts and must not be conflated with the pure verifier boundary.
