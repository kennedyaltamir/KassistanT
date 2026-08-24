# IA-06 Device Authentication — Readiness Package

Status: CONTRACT REVIEW READY / IMPLEMENTATION FROZEN.

The original readiness audit is now superseded for decision tracking by `DEVICE-AUTH-DECISION-PACKAGE.md`, `DEVICE-GLOBAL-DECISIONS.md` and `IMPLEMENTATION-GATES.md`.

## Current classification

- Device identity: PARTIAL.
- Enrollment: PARTIAL / BLOCKED.
- Challenge-response: PARTIAL / BLOCKED.
- Cryptography: PARTIAL.
- Secure Storage: PARTIAL / EXTERNAL.
- Session identity: BLOCKED.
- Authorization: BLOCKED.
- Rate limiting: BLOCKED.
- Idempotency: BLOCKED.
- Rotation: BLOCKED.
- Revocation: PARTIAL.
- Errors: PARTIAL / BLOCKED.
- Audit: PARTIAL.
- Gateway/WSS integration: PARTIAL / BLOCKED.

## Normative facts

Ed25519 challenge-response is defined. Gateway stores the public key; Desktop stores the private key in Windows Secure Storage. Enrollment has defined routes and lifecycle states. Provisioning Service is the authority for enrollment authorization, revoke, rotate and status. Successful authentication yields `AUTH_OK`; failure yields `AUTH_FAILED`. Revocation yields `DEVICE_REVOKED` and terminates the Desktop session.

## Decision closure

DR-01 through DR-08 in `DEVICE-AUTH-DECISION-PACKAGE.md` identify the minimum remaining project decisions. No local proposal is promoted to a project decision by IA-06.

## Implementation gate

Implementation remains frozen until the decision requests are resolved and the cross-agent contracts with IA-01, IA-03 and IA-07 are stable.
