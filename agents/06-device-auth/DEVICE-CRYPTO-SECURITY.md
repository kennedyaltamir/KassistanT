# IA-06 Device Crypto and Security Readiness

Status: CONTRACT READINESS AUDIT.

## Confirmed

- Device authentication uses Ed25519 challenge-response.
- The Gateway verifies proof of possession using the registered device public key.
- The Desktop private key remains in Windows Secure Storage.
- The private key is outside the Renderer/UI boundary.
- Authentication must not rely exclusively on the Desktop local clock.
- Revocation results in `DEVICE_REVOKED` and session termination.
- Pairing codes are one-time/short-lived and must not be logged.

## Undefined details

The current repository does not define the exact representation of keys and signatures, the detailed challenge freshness/replay contract, the concrete Windows Secure Storage mechanism, or the complete key-rotation lifecycle.

These gaps are implementation blockers, not opportunities for local design decisions.

## Security invariants

1. Private key material remains in the privileged Desktop boundary.
2. Gateway verification uses the registered public key.
3. Device authentication and provisioning authorization remain separate concerns.
4. Revoked devices cannot retain an authenticated session.
5. Pairing codes and private material must not be written to logs.
6. Undefined security semantics require project-level contract closure before implementation.

## Validation gate

Runtime security testing can be specified in detail only after the missing protocol and storage semantics are approved. Until then, the security package status is **PARTIAL / BLOCKED**.
