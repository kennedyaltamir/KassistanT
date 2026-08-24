# IA-06 Learnings

## Audit-derived learnings

### L-001 — Contract exists without runtime

**Classification:** FACT / AUDITED

The repository contains dedicated device enrollment and authentication contract documents, while the runtime is explicitly `NOT_IMPLEMENTED`. Documentation cannot be used as evidence that enrollment or authentication already works.

### L-002 — Device private key has a hard storage boundary

**Classification:** FACT / AUDITED

The baseline places the device private key in Windows Secure Storage and the public key in the Gateway's PostgreSQL persistence. This creates a deliberate trust boundary between local secret material and server-side identity material.

### L-003 — Pairing code is not a cryptographic private key

**Classification:** FACT / AUDITED

The enrollment contract states that pairing codes are one-time/short-lived, contain no private key and must not appear in logs.

### L-004 — Provisioning authority is separate from business logic

**Classification:** FACT / AUDITED

The MVP uses a Provisioning Service authenticated in the Gateway for enrollment authorization, device revocation, key rotation and device-status reads. This does not make the Gateway a business-rule authority.

### L-005 — Local clock cannot be the sole authentication authority

**Classification:** FACT / AUDITED

The authentication contract explicitly rejects exclusive dependence on the Desktop local clock; challenge and validity are controlled by the Gateway.

### L-006 — Numeric rate-limit policy remains unspecified

**Classification:** FACT / AUDITED

The contract names enrollment, AUTH, RESUME and reconnect rate limits but does not define their numerical values. IA-06 must not invent those values as approved policy.

### L-007 — IA-06 crosses a code-ownership boundary with IA-07

**Classification:** FACT / REGISTRY

IA-06 owns `gateway/src/device-auth/**`; IA-07 owns the rest of `gateway/**`. Device authentication therefore requires explicit interface discipline at the Gateway boundary.
