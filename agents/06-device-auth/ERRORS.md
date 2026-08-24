# IA-06 Errors and Risks

## E-001 — Runtime absent

**Status:** OPEN / NOT_IMPLEMENTED

The repository has device enrollment/authentication contracts but no verified production runtime in the IA-06 ownership paths.

**Risk:** Documentation can be mistaken for implementation evidence.

### E-002 — Enrollment contract is partial

**Status:** OPEN / CONTRACT GAP

The enrollment contract states that exact request/response schemas, status codes, authorization and endpoint idempotency remain partial/missing.

**Risk:** Implementation would otherwise require inventing externally observable behavior.

### E-003 — Authentication rate limits are underspecified

**Status:** OPEN / POLICY GAP

The authentication contract names independent limits for enrollment, AUTH, RESUME and reconnect but provides no numerical policy.

**Risk:** Arbitrary limits could become accidental normative behavior.

### E-004 — Authorization matrix is incomplete

**Status:** OPEN / CONTRACT GAP

Backend authorization documentation identifies the Provisioning Service as authorized for enrollment authorization, revocation, key rotation and device status, but says the endpoint-by-endpoint authorization matrix is not fully defined.

**Risk:** Authentication success must not be conflated with authorization for every operation.

### E-005 — Gateway ownership boundary

**Status:** OPEN / COORDINATION RISK

IA-06 owns `gateway/src/device-auth/**` while IA-07 owns the rest of Gateway. HTTP/WSS routing and authentication integration therefore require a stable interface without ownership leakage.

### E-006 — External secure-storage behavior not yet verified

**Status:** NOT_VERIFIED / EXTERNAL DEPENDENCY

The baseline mandates Windows Secure Storage for the Desktop private key, but this audit did not perform an external Windows runtime validation of the eventual storage implementation.

### E-007 — No claim of cryptographic implementation

**Status:** CONTROL / IMPORTANT

No Ed25519 implementation, key lifecycle implementation or secure-storage implementation was found and therefore none is claimed as working.
