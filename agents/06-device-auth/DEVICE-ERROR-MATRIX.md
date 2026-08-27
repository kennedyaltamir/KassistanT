# IA-06 Device Error Matrix

Status: CONTRACT READINESS AUDIT. No final error catalog is claimed.

| Failure | Code/name | HTTP mapping | Retryability | Client behavior | Audit | Evidence | Status |
|---|---|---|---|---|---|---|---|
| Invalid challenge | UNKNOWN | UNKNOWN | UNKNOWN | `AUTH_FAILED` is the protocol outcome | Security/audit requirement not fully enumerated | Device auth contract | PARTIAL |
| Invalid signature | UNKNOWN | UNKNOWN | UNKNOWN | `AUTH_FAILED` | Cryptographic failure audit not fully specified | Device auth contract | PARTIAL |
| Expired challenge | UNKNOWN | UNKNOWN | UNKNOWN | Authentication failure implied | Audit semantics missing | No exact catalog | BLOCKED |
| Revoked device | `DEVICE_REVOKED` protocol outcome | UNKNOWN | No retry until authorized lifecycle change | Terminate session | Revocation is critical audit event | Device auth + WSS | PARTIAL |
| Unknown device | UNKNOWN | UNKNOWN | UNKNOWN | Reject authentication | Audit not fully defined | No final catalog | BLOCKED |
| Duplicate enrollment | UNKNOWN | UNKNOWN | UNKNOWN | Duplicate behavior not defined | Unknown | Idempotency contract partial | BLOCKED |
| Invalid rotation | UNKNOWN | UNKNOWN | UNKNOWN | Reject | Rotation audit not fully defined | Rotation contract partial | BLOCKED |
| Authorization failure | UNKNOWN | Generic public error envelope exists | UNKNOWN | Reject; exact status/code missing | Not fully defined | Authorization/error docs | BLOCKED |
| Rate limit | UNKNOWN | Generic public error envelope exists | UNKNOWN | Reject/throttle; exact response missing | Not fully defined | Rate-limit policy absent | BLOCKED |
| Persistence failure | Generic infrastructure error family; exact device code unknown | Generic error envelope | Depends on operation | Fail safely; exact mapping missing | Should preserve evidence | Backend error handling | PARTIAL |
| Replay attempt | UNKNOWN | UNKNOWN | UNKNOWN | Reject if detected; exact mechanism not fully specified | Suspicious replay audit requirement is not closed | Auth readiness audit | BLOCKED |

## Generic error envelope

Backend error handling defines public HTTP errors with `code`, `message`, `retryable` and `correlation_id`, and forbids stack traces from being exposed. The complete device/domain error catalog is missing.

## Gate

No final error code, HTTP mapping or retry policy is to be invented by IA-06 during this readiness phase.
