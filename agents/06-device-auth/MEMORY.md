# IA-06 Memory

## Permanent facts

- MVP device authentication uses Ed25519 challenge-response.
- Gateway stores device public key; Desktop private key remains in Windows Secure Storage.
- Provisioning Service is authority for enrollment authorization, revoke, rotate and status.
- Revocation yields `DEVICE_REVOKED` and session termination.
- Enrollment routes/states exist, but exact HTTP schemas and endpoint semantics remain partial.
- WSS AUTH-related message types exist, but authentication/session payload details remain partial.

## Contract closure facts

- DR-01..DR-08 are OPEN project decisions, not local decisions.
- No rate-limit numbers, HTTP schemas, authorization matrix, idempotency TTL/replay semantics or rotation lifecycle are invented.
- Concrete Windows Secure Storage technology is not selected locally.
- Proposed first slice is pure signature verification after DR-02 closure.
- Runtime remains NOT_STARTED.

## Memory hygiene

Stable facts only. Decision requests and unapproved designs belong in the decision package.
