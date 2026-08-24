# IA-06 Memory

## Permanent confirmed facts

- KassisT is a Windows Electron local-first product with a cloud Gateway transport boundary.
- Device authentication for the MVP is based on Ed25519 challenge-response.
- Gateway stores the device public key; Desktop stores the private key in Windows Secure Storage.
- Enrollment uses an `enrollment_id`, `device_id`, one-time short-lived `pairing_code` and `expires_at`.
- Enrollment associates Store, Device and Ed25519 public key. The private key remains on the Desktop side.
- Enrollment states are `PENDING`, `AUTHORIZED`, `COMPLETED`, `EXPIRED`, `CANCELLED`, `REVOKED`.
- Provisioning Service is the MVP authority for enrollment authorization, revocation, key rotation and device-status reads.
- Authentication flow is Gateway challenge -> Desktop signs nonce plus session context -> Gateway verifies -> `AUTH_OK`; failure is `AUTH_FAILED`; revocation yields `DEVICE_REVOKED` and session termination.
- Authentication must not rely exclusively on the local clock.
- Conceptual rate limits exist for enrollment, AUTH, RESUME and reconnect; numerical policies are not defined.
- WSS defines `AUTH`, `AUTH_OK`, `AUTH_FAILED`, `RESUME`, `RESUME_OK`, `DEVICE_REVOKED` and related protocol messages, but exact auth/session payloads remain partial.
- Generic HTTP errors expose `code`, `message`, `retryable` and `correlation_id`; device-specific error mappings remain incomplete.
- Endpoint-specific `Idempotency-Key` replay/TTL semantics are not defined.
- The exact Windows Secure Storage mechanism is not defined by the repository contract.
- Device-auth runtime is not implemented in the audited ownership paths.

## Readiness facts added 2026-08-24

- Device Authentication is **PARTIAL/BLOCKED** for production implementation.
- Enrollment, authorization, rate limiting, endpoint idempotency and rotation lifecycle are the principal contract gaps.
- `DEVICE_REVOKED` behavior is sufficiently explicit at the event/outcome level, but exact HTTP and session semantics remain partial.
- The canonical `Device` entity exists in the domain inventory, but detailed field schema is partial.
- IA-06 owns `apps/desktop/electron/auth/**`, `gateway/src/device-auth/**` and directly associated tests; shared/global contracts remain protected.

## Memory hygiene

This file stores stable facts only. Audit findings, hypotheses and unapproved designs belong in the corresponding readiness/operational documents.
