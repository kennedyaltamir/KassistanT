# IA-06 Errors and Risks

## Current blockers

E-002 enrollment contract partial.
E-003 rate-limit policy missing.
E-004 authorization matrix incomplete.
E-006 Secure Storage mechanism/runtime unverified.
E-008 session lifecycle incomplete.
E-009 challenge replay contract incomplete.
E-010 rotation lifecycle incomplete.
E-011 Device field schema incomplete.
E-012 device-auth error catalog incomplete.
E-013 endpoint idempotency incomplete.
E-014 audit scope incomplete.
E-015 cross-agent dependency chain not closed.

## Stratification corrections

E-016 crypto primitive vs wire contract was previously too broad.
**Status:** CLOSED AS MODELING ERROR
Ed25519 primitive is defined independently from signed-byte representation, canonicalization and encoding.

E-017 first-slice gate was previously too broad.
**Status:** CLOSED AS MODELING ERROR
The pure Signature Verification Boundary depends only on the minimum DR-02 cryptographic subset plus explicit implementation authorization.

E-018 audit security layers were previously aggregated.
**Status:** CLOSED AS MODELING GAP
The minimum audit set is now separated from cryptographic correctness, session security and operational policy.

## Decision-package mapping

- DR-01 closes E-002.
- DR-02 closes E-009 and cryptographic wire gaps.
- DR-03 closes E-008.
- DR-04 closes E-004.
- DR-05 closes E-003.
- DR-06 closes E-013.
- DR-07 closes E-010.
- DR-08 closes E-012.

## Global blockers

`CONTRACT-001`, `CONTRACT-002` and `GOV-001` remain outside IA-06 authority.

No error code, rate limit, HTTP status or security mechanism is promoted to normative status by this document.
