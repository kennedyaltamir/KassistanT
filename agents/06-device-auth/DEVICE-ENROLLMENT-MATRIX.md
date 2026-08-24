# IA-06 Device Enrollment Matrix

Status: CONTRACT READINESS AUDIT; no runtime implementation.

## Endpoint matrix

| Operation | Method | Path | Authentication | Authorization | Success | Errors | Idempotency | Retry | Rate limit | Audit | Status |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Start enrollment | POST | `/v1/devices/enrollment/start` | NOT SPECIFIED | PARTIAL | `200` documented | Exact 4XX mapping missing | Missing endpoint-specific semantics | UNKNOWN | Concept exists; number missing | Enrollment action is in scope; exact requirement PARTIAL | PARTIAL/BLOCKED |
| Complete enrollment | POST | `/v1/devices/enrollment/complete` | NOT SPECIFIED | PARTIAL | `200` documented | Exact 4XX mapping missing | Missing endpoint-specific semantics | UNKNOWN | Concept exists; number missing | Completion audit semantics not fully defined | PARTIAL/BLOCKED |
| Cancel enrollment | POST | `/v1/devices/enrollment/cancel` | NOT SPECIFIED | PARTIAL | `200` documented | Exact 4XX mapping missing | Missing endpoint-specific semantics | UNKNOWN | Concept exists; number missing | Cancellation audit semantics not fully defined | PARTIAL/BLOCKED |

## Confirmed request/response semantics

### Start

Documented outputs: `enrollment_id`, `device_id`, `pairing_code`, `expires_at`. The pairing code is one-time/short-lived, contains no private key and must not appear in logs.

Request fields, response schema, exact status mapping, authentication source and authorization condition are not sufficiently specified.

### Complete

Completion associates Store, Device and Ed25519 public key. The private key remains on the Desktop side in Windows Secure Storage.

The exact request/response schema, status mapping, proof-of-possession fields and endpoint idempotency behavior are not specified.

### Cancel

The endpoint exists and enrollment has a `CANCELLED` lifecycle state. Exact request/response shape, actor constraints, duplicate semantics and status mapping are not specified.

## Cross-cutting controls

- **Correlation:** generic backend/public error handling defines `correlation_id`; endpoint-specific correlation requirements are not separately specified.
- **Timeout:** no enrollment-specific normative timeout was found.
- **Retry:** generic critical-operation idempotency is defined; enrollment-specific retry safety is not.
- **Audit:** audit infrastructure records actor/action/entity/correlation/timestamp and explicitly names device revocation/credential rotation as critical. Enrollment-specific audit coverage is not fully enumerated.
- **Security:** pairing code must not be logged; private key must not leave Desktop secure boundary.

## Contract closure required before implementation

1. Exact request/response schemas.
2. Authentication mechanism per endpoint.
3. Endpoint-by-endpoint authorization.
4. Success and error status-code mapping.
5. Device/enrollment error codes.
6. Idempotency key semantics, duplicate result behavior and retention.
7. Retry contract.
8. Numeric rate limits.
9. Correlation and audit requirements.
10. Exact proof-of-possession fields for completion.

No values are proposed here as normative.
