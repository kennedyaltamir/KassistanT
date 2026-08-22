# Device Authentication Contract

Status: DEFINED / PARTIAL.

Authentication uses Ed25519 challenge-response. Gateway stores the device public key; Desktop stores the private key in Windows Secure Storage.

Flow: Gateway challenge -> Desktop signs nonce + session context -> Gateway verifies -> AUTH_OK. Failure yields AUTH_FAILED. Revocation yields DEVICE_REVOKED and session termination.

Authentication must not rely exclusively on local clock. Rate limits conceptually exist for enrollment, AUTH, RESUME and reconnect; numerical policies are MISSING. Runtime is NOT_IMPLEMENTED.