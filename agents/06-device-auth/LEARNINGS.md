# IA-06 Learnings

## Audit-derived learnings

### L-001 — Contract exists without runtime
**Classification:** FACT / AUDITED
The repository contains dedicated device enrollment/authentication contracts while runtime is not implemented.

### L-002 — Private key has a hard boundary
**Classification:** FACT / AUDITED
The baseline places the device private key in Windows Secure Storage and public key in the Gateway-side identity store.

### L-003 — Pairing code is not key material
**Classification:** FACT / AUDITED
Pairing codes are one-time/short-lived and must not appear in logs.

### L-004 — Provisioning authority is separate from business logic
**Classification:** FACT / AUDITED
Provisioning Service is the named authority for enrollment authorization, revoke, rotate and device-status reads.

### L-005 — Local clock is not sole authentication authority
**Classification:** FACT / AUDITED
Challenge validity is Gateway-controlled; Desktop local time cannot be the only authentication authority.

### L-006 — Numeric rate-limit policy remains unspecified
**Classification:** FACT / AUDITED
Enrollment, AUTH, RESUME and reconnect limits are conceptually required but numbers are absent.

### L-007 — IA-06 crosses a Gateway ownership boundary
**Classification:** FACT / REGISTRY
IA-06 owns `gateway/src/device-auth/**`; IA-07 owns the remainder of Gateway.

### L-008 — Enrollment API projection is intentionally conservative
**Classification:** FACT / AUDITED
OpenAPI lists enrollment/revoke/rotate/status routes but marks schemas and exact status/authorization mappings partial. Undefined request/response structures are not to be inferred.

### L-009 — Generic error/idempotency infrastructure is not endpoint-complete
**Classification:** FACT / AUDITED
Generic correlated errors exist; endpoint-specific device-auth error mappings and `Idempotency-Key` replay/TTL semantics remain missing.

### L-010 — Rotation is more underspecified than revocation
**Classification:** FACT / AUDITED
Revocation outcome is explicit; rotation actor is known but key lifecycle, overlap, rollback and session continuity are not defined.

### L-011 — Readiness must separate protocol availability from runtime availability
**Classification:** FACT / AUDITED
A subject can be contractually defined and still be NOT_STARTED/BLOCKED for implementation.

### L-012 — Security closure is layered
**Classification:** FACT / AUDITED
Cryptographic primitive, wire contract, replay, session, authorization, rate limiting, idempotency, rotation, revocation, audit and storage have independent gates.

### L-013 — Pure verification can be isolated
**Classification:** INFERENCE / AUDITED
The Signature Verification Boundary can be a pure deterministic slice once the minimum DR-02 signed-byte/key/signature representation and context-binding rules are approved.

## Current readiness conclusion

IA-06 is ready for project-level decision review and first-slice approval, but not authorized for production implementation.
