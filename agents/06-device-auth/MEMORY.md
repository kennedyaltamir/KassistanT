# IA-06 Memory

## Permanent confirmed facts

- KassisT is a Windows Electron local-first product with a cloud Gateway transport boundary. The approved baseline describes WhatsApp → Gateway → WSS → Desktop Core → SQLite/LLM/integrations/UI.
- Device authentication for the MVP is based on Ed25519 challenge-response.
- Gateway stores the device public key; Desktop stores the private key in Windows Secure Storage.
- Enrollment creates/uses an `enrollment_id`, `device_id`, one-time short-lived `pairing_code` and `expires_at`.
- Enrollment associates Store, Device and Ed25519 public key. The private key remains on the Desktop side.
- Enrollment states are `PENDING`, `AUTHORIZED`, `COMPLETED`, `EXPIRED`, `CANCELLED`, `REVOKED`.
- The MVP uses a Provisioning Service authenticated in the Gateway as the authority for authorizing enrollment, revoking devices, rotating device keys and reading device status.
- Authentication flow is Gateway challenge → Desktop signs nonce plus session context → Gateway verifies → `AUTH_OK`; failure is `AUTH_FAILED`; revocation yields `DEVICE_REVOKED` and session termination.
- Authentication must not rely exclusively on the local clock.
- Conceptual rate limits exist independently for enrollment, AUTH, RESUME and reconnect; numerical policies are not currently defined.
- Device-auth runtime is not implemented in the audited repository state.

## Memory hygiene

This file stores stable facts only. Activity logs, hypotheses and unapproved designs belong in the corresponding operational documents.
