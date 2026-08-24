# IA-06 — Device Authentication Approval Request

Status: READY FOR PROJECT AUTHORITY REVIEW / NO IMPLEMENTATION.

## Purpose

Provide a single approval surface for the remaining Device Authentication contract decisions, while keeping cryptographic, session, authorization, rate-limit, idempotency, rotation and external-storage concerns independently gated.

## Decision requests

| ID | Decision | Blocks | Scope |
|---|---|---|---|
| DR-01 | Enrollment HTTP contract | Enrollment runtime | HTTP request/response/status/authz/idempotency |
| DR-02 | Challenge/signature protocol | Signature verification + challenge runtime | Only cryptographic wire semantics required by each slice |
| DR-03 | Session lifecycle | Session runtime | Session identity/expiry/renewal/reauth/resume |
| DR-04 | Authorization | Authorization runtime | Actor/action/resource/condition matrix |
| DR-05 | Rate limiting | Rate-limit runtime | Applicable operations and concrete policy |
| DR-06 | Endpoint idempotency | Enrollment/revoke/rotate runtime | Key/scope/duplicate/replay/retention |
| DR-07 | Rotation lifecycle | Rotation runtime | Old/new key lifecycle/overlap/rollback/session continuity |
| DR-08 | Error taxonomy | Public device-auth error mapping | Canonical identifiers/retryability/HTTP mapping |

## Stratified approval rule

Approval of one layer does not implicitly approve another layer.

- Approval of Ed25519 as the primitive does not approve wire encoding.
- Approval of challenge signing does not approve session TTL.
- Approval of authentication does not approve authorization.
- Approval of revocation does not approve rotation.
- Approval of the logical Secure Storage boundary does not select a Windows technology.
- Approval of audit requirements does not authorize logging secrets.

## Minimum DR-02 closure for first slice

The `Signature Verification Boundary` requires only:

1. Ed25519 as the verification primitive.
2. A logically defined signed message/challenge context.
3. An approved rule for what bytes are presented to the verifier.
4. A deterministic signature representation and public-key representation contract.
5. A deterministic verification result: valid or invalid.

It does not require enrollment HTTP semantics, session TTL, authorization policy, rate limits, endpoint idempotency or rotation lifecycle.

## Evidence / authority rule

This document records decision requests only. It does not create project decisions. Unresolved items remain OPEN until approved by the project authority.

## Approval outcomes expected

For each DR, the authority should return one of:

- APPROVED
- APPROVED_WITH_CONSTRAINTS
- REJECTED
- NEEDS_EVIDENCE
- DEFERRED

## Security evidence minimum

No decision may require storing or logging private key material. Audit evidence must identify actor/device/result/time/correlation as contractually appropriate without exposing secrets.
