# IA-06 → IA-07 WSS Authenticated Session Contract

Status: GATE DEFINITION / CURRENTLY BLOCKED
Date: 2026-08-24

## Purpose

Define the minimum evidence IA-07 must receive from IA-06 before implementing WSS connection lifecycle mechanics. This document does not create a new global contract and does not implement authentication.

## Authority boundary

IA-06 owns device identity, enrollment, Ed25519 proof-of-possession, authentication verification, revocation and key rotation. IA-07 owns generic WSS transport and connection mechanics only after an authenticated identity outcome is available.

## Gate A — Authenticated session result

| Field / signal | Required for IA-07 | Current evidence | Status |
|---|---|---|---|
| device_id | YES | Explicit device identity field | READY_FOR_CONSUMPTION at conceptual level |
| authenticated | YES | AUTH_OK / AUTH_FAILED outcomes exist | PARTIAL |
| session_id | YES for lifecycle manager | Session identity is mentioned but fields/lifecycle are unspecified | BLOCKED |
| store_id | REQUIRED if session/sequence scope is keyed by store | Sequence scope uses `(store_id, device_id)`; session payload does not define it | BLOCKED |
| authentication_at | Useful audit input; not currently required by WSS envelope | Not explicitly defined as auth result field | PARTIAL |
| session_expiration | REQUIRED only if session expiry is contractual | Not currently specified | UNKNOWN |
| revocation_state | NOT consumed as an authority decision by IA-07 | IA-06 owns revocation | PARTIAL |
| reauthentication_required | REQUIRED for reconnect policy | Not specified | BLOCKED |
| protocol context | protocol version `1.0` exists independently | No auth/session binding schema is specified | PARTIAL |
| identity version | NOT established | No explicit contract evidence | UNKNOWN |

## Minimum executable interface required

IA-06 must provide a testable interface or equivalent contract artifact that answers:

1. What exact authenticated identity object is returned after successful verification?
2. Whether `session_id` exists, its format, lifecycle and uniqueness scope.
3. Whether `store_id` is attached to the authenticated session.
4. Whether sessions expire, and how expiry is represented.
5. What IA-07 receives when the device is revoked.
6. Whether reconnect always requires fresh authentication or can reuse a valid session.
7. What event/signal indicates `AUTH_FAILED`, `DEVICE_REVOKED` and session invalidation.

## Acceptance criteria

- A deterministic test can turn an unauthenticated device into an authenticated session result without IA-07 recreating cryptographic verification.
- The session result contains every field required by WSS lifecycle logic, or explicitly states that the field is unavailable/deferred.
- Revocation is delivered as an authoritative signal owned by IA-06.
- Reconnect/reauthentication behavior is explicit.
- No private key or cryptographic secret crosses into IA-07 transport code.

## Current gate

`IA06_AUTH_SESSION_GATE = BLOCKED`.

The current repository proves authentication flow and session identity conceptually, but not an executable session interface. fileciteturn95file0turn98file0turn102file0
