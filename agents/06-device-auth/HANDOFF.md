# IA-06 Handoff

## Purpose

Continuity package for the Device Authentication territory after the Contract Readiness Audit.

## Current state

IA-06 is activated on `Agent06-device-authentication`. Production implementation remains frozen. The readiness audit produced a complete classification package without modifying product code or global contracts.

## Key verified facts

- Ed25519 challenge-response is normative.
- Desktop private key belongs in Windows Secure Storage; Gateway retains public key.
- Enrollment has defined routes and lifecycle states, but endpoint schemas/status/authz/idempotency remain incomplete.
- Provisioning Service is the named authority for enrollment authorization, revoke, rotate and device status.
- Revocation yields `DEVICE_REVOKED` and session termination.
- WSS defines AUTH-related message types and envelope, but exact auth/session payloads remain partial.

## Contract gaps before implementation

1. Enrollment schemas and status/error matrix.
2. Authentication payload and session semantics.
3. Challenge freshness/replay semantics.
4. Authorization matrix.
5. Numeric rate-limit policy.
6. Endpoint idempotency semantics.
7. Device-specific error catalog.
8. Rotation lifecycle.
9. Canonical Device persistence details.
10. Complete audit/event semantics.

## Cross-agent dependencies

IA-01 persistence, IA-02 domain conventions, IA-03 audit/event durability, IA-07 Gateway/WSS boundary, IA-08 UI consumption, plus external Windows Secure Storage validation.

## Safety rules

Do not expose private key material to Renderer. Do not log pairing codes/private material. Do not invent protocol fields, authorization rules, rate limits, rotation semantics or storage technology. Do not alter protected contracts without project authority.

## Handoff status

**READY FOR CONTRACT REVIEW / BLOCKED FOR IMPLEMENTATION.**

## Next action

Resolve the implementation gates in `IMPLEMENTATION-GATES.md`; only then authorize runtime work.
