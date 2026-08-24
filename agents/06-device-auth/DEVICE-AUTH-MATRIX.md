# IA-06 Device Authentication Matrix

Status: CONTRACT READINESS AUDIT; no runtime implementation.

## Authentication flow

| Step | Actor | Input | Output | Persistence | Evidence | Status |
|---|---|---|---|---|---|---|
| Challenge issuance | Gateway | authenticated device context / connection | challenge message | Session/challenge state implied but not specified | WSS `AUTH` exists; exact challenge schema missing | PARTIAL |
| Challenge signing | Desktop | nonce/challenge + session context | Ed25519 signature | Private key remains Secure Storage | Authentication contract | PARTIAL |
| Verification | Gateway | public key + signed challenge context | `AUTH_OK` or `AUTH_FAILED` | Device identity/session state implied | Authentication contract | PARTIAL |
| Revocation check | Gateway | device identity/state | reject with `DEVICE_REVOKED` when revoked | Device state in persistence | Revocation contract/baseline | PARTIAL |
| Session establishment | Gateway/Desktop | successful proof of possession | authenticated device session | Exact session model not defined | WSS protocol + auth docs | BLOCKED |
| Reauthentication | Gateway/Desktop | future challenge/session context | success/failure | Exact semantics missing | No complete contract found | UNKNOWN/BLOCKED |

## Required protocol decisions

### Challenge generation
The Gateway is the trust authority for challenge validity; the Desktop local clock cannot be the sole authority. The exact challenge lifetime is not defined.

### Challenge uniqueness / nonce
A nonce/challenge exists conceptually, but the exact encoding, length, uniqueness requirement and generation algorithm are not specified. Do not invent them.

### Signed payload
The contract says the Desktop signs `nonce + session context`. Exact serialization/canonicalization and field ordering are not defined.

### Verification
The Gateway verifies using the registered Ed25519 public key. Exact public-key representation and signature encoding are not specified.

### Replay protection
Fresh challenge/verification flow implies replay resistance, but the repository does not fully define challenge storage, reuse rejection, expiration handling or replay error semantics. Status: BLOCKED for implementation.

### Failure handling
`AUTH_FAILED` is defined. Exact public error code mapping, retryability and lockout behavior are not defined.

### Session establishment
A successful authentication establishes a trusted device session, but exact session identifier, lifetime, idle timeout, reauthentication, reconnect/resume binding and invalidation semantics remain undefined.

## WSS integration

Defined WSS message types include `AUTH`, `AUTH_OK`, `AUTH_FAILED`, `RESUME`, `RESUME_OK`, `DEVICE_REVOKED` and `ERROR`. The WSS envelope defines `protocol_version`, `message_id`, `message_type`, `device_id`, `timestamp`, `payload`, plus event/correlation/causation/sequence fields when applicable.

The exact authentication payload schemas and session semantics are not defined in the current contract projection.

## Authentication readiness

**PARTIAL / BLOCKED.** The cryptographic direction and trust boundary are explicit. The protocol cannot be implemented safely until payload canonicalization, freshness/replay, session lifecycle, error mapping and authorization interactions are closed.
