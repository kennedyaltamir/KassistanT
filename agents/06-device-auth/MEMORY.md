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
- Security is tracked in independent layers: identity, crypto primitive, crypto wire contract, replay, session, authorization, rate limiting, idempotency, rotation, revocation, audit and storage.
- Ed25519 primitive is defined independently from the cryptographic wire contract.
- The logical Secure Storage boundary is defined independently from concrete Windows technology selection and runtime validation.
- The Signature Verification Boundary requires only the minimum DR-02 cryptographic subset and does not implicitly require session, authorization, rate-limit, idempotency or rotation closure.
- No rate-limit numbers, HTTP schemas, authorization matrix, idempotency TTL/replay semantics or rotation lifecycle are invented.
- Runtime remains NOT_STARTED.

## Memory hygiene

Stable facts only. Decision requests and unapproved designs belong in the decision package.
