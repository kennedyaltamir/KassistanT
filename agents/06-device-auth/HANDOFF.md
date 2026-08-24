# IA-06 Handoff

## Current state

Post-audit contract closure package refined. Production Device Authentication remains frozen.

## Decision package

Use `DEVICE-AUTH-DECISION-PACKAGE.md` as the executive decision register, `DEVICE-AUTH-APPROVAL-REQUEST.md` as the project approval surface, and `DEVICE-GLOBAL-DECISIONS.md` for DR-01..DR-08.

## Stratified security model

Track independently:

- logical Device identity;
- Ed25519 primitive;
- cryptographic wire contract;
- challenge/replay security;
- session security;
- authorization;
- rate limiting;
- endpoint idempotency;
- rotation;
- revocation;
- auditability;
- Secure Storage logical boundary and external technology validation.

## Required decisions

Enrollment API, minimum challenge/signature wire semantics, session lifecycle, authorization, rate limits, endpoint idempotency, rotation lifecycle and error taxonomy remain open.

## External dependency

Concrete Windows Secure Storage mechanism and validation remain external. No technology was selected locally.

## First slice

`DEVICE-FIRST-SLICE.md` proposes a pure Signature Verification Boundary after only the minimum DR-02 cryptographic subset is approved. It is sequencing guidance, not authorization to implement.

## Audit minimum

Future security runtime must be able to produce evidence for enrollment attempt/result, authentication success/failure, replay rejection, authorization denial, rate-limit decision, revocation, rotation and session termination without logging private keys, pairing codes or secret material.

## Handoff status

READY FOR PROJECT DECISION REVIEW / FIRST-SLICE APPROVAL / BLOCKED FOR IMPLEMENTATION.
