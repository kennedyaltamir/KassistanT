# Device Enrollment Contract

Status: DEFINED / PARTIAL.

Routes: POST `/v1/devices/enrollment/start`, `/complete`, `/cancel`.

States: PENDING, AUTHORIZED, COMPLETED, EXPIRED, CANCELLED, REVOKED.

Start produces `enrollment_id`, `device_id`, `pairing_code` and `expires_at`. Pairing codes are one-time/short-lived, contain no private key and must not appear in logs. Completion associates Store, Device and Ed25519 public key; private key remains in Windows Secure Storage.

Exact request/response schemas, status codes, authorization and endpoint idempotency remain PARTIAL/MISSING. Runtime is NOT_IMPLEMENTED.