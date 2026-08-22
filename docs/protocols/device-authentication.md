# Device Authentication

Authentication model: Ed25519 challenge-response.

Gateway stores the device public key. Desktop stores the private key in Windows Secure Storage.

A successful challenge produces `AUTH_OK`; failure produces `AUTH_FAILED`. Revocation results in `DEVICE_REVOKED` and session termination.
