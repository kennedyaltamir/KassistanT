# IA-06 Errors and Risks

## Existing risks

### E-001 — Runtime absent
**Status:** OPEN / NOT_IMPLEMENTED

### E-002 — Enrollment contract partial
**Status:** OPEN / CONTRACT GAP
Exact schemas, status codes, authorization and endpoint idempotency remain incomplete.

### E-003 — Authentication rate limits underspecified
**Status:** OPEN / POLICY GAP
Conceptual limits exist; numerical policy is missing.

### E-004 — Authorization matrix incomplete
**Status:** OPEN / CONTRACT GAP
Provisioning Service authority is defined, but endpoint-by-endpoint permissions are not.

### E-005 — Gateway ownership boundary
**Status:** OPEN / COORDINATION RISK
IA-06 owns `gateway/src/device-auth/**`; IA-07 owns the remainder of Gateway.

### E-006 — Secure-storage behavior not verified
**Status:** NOT_VERIFIED / EXTERNAL DEPENDENCY
The boundary is normative; the supported Windows mechanism/runtime behavior is not yet verified.

### E-007 — No cryptographic implementation claim
**Status:** CONTROL
No device-auth runtime was found in the audited territory.

## New readiness risks

### E-008 — Session lifecycle incomplete
**Status:** BLOCKED
Successful proof-of-possession is specified, but session identifier/lifetime/reauthentication/reconnect binding is not sufficiently defined.

### E-009 — Replay contract incomplete
**Status:** BLOCKED
Challenge freshness is conceptually required but challenge persistence, expiration and replay rejection semantics are not complete.

### E-010 — Rotation lifecycle incomplete
**Status:** BLOCKED
Old/new key lifecycle, overlap, rollback and session continuity are unspecified.

### E-011 — Device field schema incomplete
**Status:** PARTIAL
Canonical `Device` exists, but several requested fields are not defined by the contract and must not be invented.

### E-012 — Device error catalog incomplete
**Status:** BLOCKED
Generic error envelope exists, but device-specific codes and HTTP mappings remain absent.

### E-013 — Endpoint idempotency incomplete
**Status:** BLOCKED
Generic idempotency exists, but endpoint-specific key/replay/retention rules are missing.

### E-014 — Audit scope incomplete
**Status:** PARTIAL
Revocation and credential rotation are explicitly critical; the complete required audit set for authentication failures/replay/rate-limit events is not contractually complete.

### E-015 — Cross-agent runtime dependency chain
**Status:** BLOCKED / COORDINATION
IA-06 cannot complete end-to-end implementation independently of IA-01, IA-03 and IA-07 contract boundaries and related implementation readiness.

## Global blockers

`CONTRACT-001`, `CONTRACT-002` and `GOV-001` remain outside local authority.
