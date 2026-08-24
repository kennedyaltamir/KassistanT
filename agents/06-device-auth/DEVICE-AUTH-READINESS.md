# IA-06 Device Authentication — Readiness Package

Status: CONTRACT REVIEW READY / IMPLEMENTATION FROZEN.

## Current classification by layer

- Device identity semantics: PARTIAL.
- Device persistence schema: PARTIAL / IA-01.
- Enrollment: PARTIAL / BLOCKED.
- Challenge protocol: OPEN / DR-02.
- Cryptographic primitive: DEFINED.
- Cryptographic wire contract: OPEN / DR-02.
- Replay security: OPEN / DR-02.
- Session identity/security: OPEN / DR-03.
- Authorization: OPEN / DR-04.
- Rate limiting: OPEN / DR-05.
- Idempotency: OPEN / DR-06.
- Rotation: BLOCKED / DR-07.
- Revocation: PARTIAL / defined outcome.
- Error taxonomy: OPEN / DR-08.
- Auditability: PARTIAL / IA-03 dependency.
- Secure Storage logical boundary: DEFINED.
- Secure Storage technology/runtime: EXTERNAL.
- Gateway/WSS integration: PARTIAL / cross-agent.

## Normative facts

Ed25519 challenge-response is defined. Gateway stores the public key; Desktop stores the private key in Windows Secure Storage. Enrollment has defined routes and lifecycle states. Provisioning Service is the authority for enrollment authorization, revoke, rotate and status. Successful authentication yields `AUTH_OK`; failure yields `AUTH_FAILED`. Revocation yields `DEVICE_REVOKED` and terminates the Desktop session.

## Stratification rule

A `PARTIAL` result must not be interpreted as one monolithic blocker. Each layer has an independent gate and dependency list.

In particular:

- `CRYPTO_PRIMITIVE = DEFINED` does not imply `CRYPTO_WIRE_CONTRACT = DEFINED`.
- `AUTHENTICATION_PROOF = READY_AFTER_MINIMUM_DR02` does not imply `SESSION = READY`.
- Logical Device identity does not imply physical persistence schema is closed.
- Secure Storage logical boundary does not imply technology selection or runtime validation.
- Authentication does not imply authorization.
- Revocation does not imply rotation.

## Minimum audit requirements

The future runtime must be able to produce auditable evidence, subject to approved privacy/data-minimization rules, for at least:

1. enrollment attempt/result;
2. authentication success/failure;
3. replay rejection;
4. authorization denial;
5. rate-limit decision;
6. revocation;
7. rotation;
8. session termination.

Minimum evidence dimensions are conceptually `who`, `what`, `when`, `device`, `result`, `reason` and `correlation`, without logging private keys, pairing codes or secret material.

IA-03 owns durable audit infrastructure; IA-06 owns the device-auth event requirements at its boundary.

## First-slice readiness

The proposed `Signature Verification Boundary` is `READY_AFTER_MINIMUM_DR02_CLOSURE`.

It does not require closure of DR-01, DR-03, DR-04, DR-05, DR-06 or DR-07 unless an implementation dependency is demonstrated.

## Decision closure

DR-01 through DR-08 remain project decisions. No local proposal is promoted to a project decision by IA-06.

## Implementation gate

Full implementation remains frozen until the applicable layer gates, cross-agent contracts and project approvals are satisfied. This package itself is not implementation authorization.
