# IA-06 Device Authentication Matrix

Status: STRATIFIED CONTRACT REVIEW; no runtime implementation.

## Layered flow

| Layer | Step | Actor | Input | Output | Status |
|---|---|---|---|---|---|
| Challenge protocol | Challenge issuance | Gateway | authenticated device context / connection | challenge message | OPEN / DR-02 |
| Crypto primitive | Challenge signing | Desktop | approved signed challenge context | Ed25519 signature | PRIMITIVE DEFINED / WIRE OPEN |
| Crypto primitive | Verification | Gateway | approved signed bytes + public key + signature | deterministic valid/invalid result | READY AFTER MINIMUM DR-02 |
| Replay security | Replay check | Gateway | challenge lifecycle/context | accept/reject | OPEN / DR-02 |
| Session security | Session establishment | Gateway/Desktop | successful proof of possession | authenticated session | OPEN / DR-03 |
| Session security | Reauthentication | Gateway/Desktop | new approved challenge/session context | success/failure | OPEN / DR-03 |
| Revocation | Revocation check | Gateway | device lifecycle state | `DEVICE_REVOKED` when revoked | PARTIAL / DEFINED OUTCOME |

## Cryptographic primitive

Ed25519 challenge-response is the approved primitive. Public/private key separation and Gateway verification with the registered public key are normative.

## Cryptographic wire contract

The following remain open and are not implied by Ed25519 itself:

- exact signed bytes;
- challenge representation;
- serialization/canonicalization;
- public-key representation;
- signature representation;
- context binding;
- replay/freshness handling.

## Session security

Session identity, expiry, renewal, reconnect/resume and reauthentication are independent from pure signature verification and remain governed by DR-03.

## Failure semantics

`AUTH_OK` and `AUTH_FAILED` are evidenced protocol outcomes. Device-specific error identifiers, retryability and HTTP mappings remain DR-08.

## WSS integration

WSS defines `AUTH`, `AUTH_OK`, `AUTH_FAILED`, `RESUME`, `RESUME_OK`, `DEVICE_REVOKED` and `ERROR`. The envelope defines `protocol_version`, `message_id`, `message_type`, `device_id`, `timestamp`, `payload`, and applicable event/correlation/causation/sequence fields.

Exact authentication payloads are not treated as closed merely because the WSS envelope exists.

## Readiness interpretation

`CRYPTO_PRIMITIVE = DEFINED` does not mean `CRYPTO_WIRE_CONTRACT = DEFINED`.

`AUTHENTICATION_PROOF = READY_AFTER_MINIMUM_DR02` does not mean `SESSION = READY`.

Authentication and authorization remain separate security layers.
