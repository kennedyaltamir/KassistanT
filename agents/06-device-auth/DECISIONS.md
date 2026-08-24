# IA-06 Decisions

## Approved / normative

- D-001: Ed25519 challenge-response.
- D-002: Desktop private key remains in Windows Secure Storage; Gateway stores public key.
- D-003: Provisioning Service is authority for enrollment authorization, revoke, rotate and status.
- D-004: Revocation sets `REVOKED`, emits `DEVICE_REVOKED` and terminates the Desktop session.

## Active governance rules

- D-005: Missing HTTP schemas/status/authz/idempotency remain decision requests; IA-06 does not invent values.
- D-006: No numerical rate-limit, burst, lockout or retry-after policy is invented locally.
- D-007: No concrete Windows Secure Storage technology is selected locally.
- D-008: Security status is stratified: cryptographic primitive, cryptographic verification contract, operational replay, session, authorization, rate limiting, idempotency, rotation, revocation, audit and storage have independent gates.
- D-009: The pure Signature Verification Boundary requires only the minimum DR-02A subset needed to define signed bytes, key/signature representation, context binding and deterministic verification semantics.
- D-010: Approval of DR-02A must not be interpreted as approval of DR-02B replay runtime semantics.

## Contract-closure decision requests

- DR-01: Enrollment HTTP schemas/status/authn/authz/idempotency.
- DR-02A: Cryptographic verification contract for the Signature Verification Boundary.
- DR-02B: Operational challenge/replay lifecycle, which remains open after any DR-02A approval.
- DR-03: Session identity/lifecycle/renewal/reauthentication.
- DR-04: Authorization matrix.
- DR-05: Numeric rate-limit policy.
- DR-06: Endpoint idempotency semantics.
- DR-07: Key-rotation lifecycle.
- DR-08: Device-auth error taxonomy and HTTP mapping.

DR-01, DR-02A, DR-02B and DR-03..DR-08 remain project decisions; none are approved by IA-06.

## Global open contracts

`CONTRACT-001`, `CONTRACT-002` and `GOV-001` remain outside IA-06 authority.

## Rule

IA-06 records evidence, layer gates and decision requests. It does not convert proposals into project decisions.
