# IA-06 Memory

## Permanent facts

- MVP device authentication uses Ed25519 challenge-response.
- Gateway stores device public key; Desktop private key remains in Windows Secure Storage.
- Provisioning Service is authority for enrollment authorization, revoke, rotate and status.
- Revocation yields `DEVICE_REVOKED` and session termination.
- Enrollment routes/states exist, but exact HTTP schemas and endpoint semantics remain partial.
- WSS AUTH-related message types exist, but authentication/session payload details remain partial.

## Contract closure facts

- DR-01 and DR-03..DR-08 remain OPEN project decisions.
- DR-02 is intentionally split into DR-02A (cryptographic verification contract) and DR-02B (operational replay protocol).
- DR-02A is the only DR-02 subset required by the proposed pure Signature Verification Boundary.
- DR-02B remains open for challenge uniqueness/freshness, challenge lifecycle/storage, reuse rejection, expiration, replay detection, replay error semantics and persistence/recovery.
- A DR-02A approval must never be interpreted as approval of DR-02B.
- No rate-limit numbers, HTTP schemas, authorization matrix, idempotency TTL/replay semantics or rotation lifecycle are invented.
- Concrete Windows Secure Storage technology is not selected locally.
- Runtime remains NOT_STARTED.

## Memory hygiene

Stable facts only. Decision requests and unapproved designs belong in the decision package.
