# IA-06 Handoff

## Purpose

This document is the minimum continuity context for a future IA-06 operator.

## Current state

IA-06 is configured for Device Authentication, but product implementation is frozen in the current phase. The audited repository state contains contractual documentation and no verified production device-auth runtime.

## Authoritative facts

- Ed25519 challenge-response is the approved authentication model.
- Desktop private key belongs in Windows Secure Storage.
- Gateway stores the device public key.
- Enrollment uses a one-time, short-lived pairing code and explicit Store/Device/public-key association.
- Provisioning Service is the MVP authority for enrollment authorization, revoke, rotate and device status.
- Revocation results in `DEVICE_REVOKED` and session termination.
- Local clock must not be the sole authentication authority.

## Contract gaps that must be resolved before implementation encodes them

- Enrollment exact request/response schemas.
- Status codes.
- Authorization matrix.
- Endpoint idempotency.
- Numerical rate limits.
- Any unspecified key-rotation/session details required by runtime.

## Cross-agent dependencies

- IA-01: persistence schema.
- IA-02: domain conventions.
- IA-03: audit/event infrastructure.
- IA-07: Gateway/WSS transport boundary.
- IA-08: UI exposure of device state.

## Safety rules

Do not expose the private key to the Renderer. Do not log pairing codes or private material. Do not invent cryptographic protocol fields, authorization rules or rate limits. Do not alter protected contracts without explicit authority.

## Handoff status

Prepared for future continuation after configuration-phase acceptance and explicit implementation authorization.
