# IA-06 Decisions

## Approved / normative

- D-001: Ed25519 challenge-response.
- D-002: Desktop private key remains in Windows Secure Storage; Gateway stores public key.
- D-003: Provisioning Service is authority for enrollment authorization, revoke, rotate and status.
- D-004: Revocation sets `REVOKED`, emits `DEVICE_REVOKED` and terminates the Desktop session.

## Contract-closure decision requests

- DR-01: Enrollment HTTP schemas/status/authn/authz/idempotency.
- DR-02: Challenge/signature wire semantics and replay protection.
- DR-03: Session identity/lifecycle/renewal/reauthentication.
- DR-04: Authorization matrix.
- DR-05: Numeric rate-limit policy.
- DR-06: Endpoint idempotency semantics.
- DR-07: Key-rotation lifecycle.
- DR-08: Device-auth error taxonomy and HTTP mapping.

All eight are OPEN PROJECT DECISIONS, not approved decisions.

## Explicit governance constraints

IA-06 does not choose missing schemas, status mappings, authorization rules, numeric limits, rotation semantics, replay/TTL behavior or a concrete Windows Secure Storage technology.

## Global open contracts

`CONTRACT-001`, `CONTRACT-002` and `GOV-001` remain outside IA-06 authority.
