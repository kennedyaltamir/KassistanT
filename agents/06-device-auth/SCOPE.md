# IA-06 Scope

## In scope

### Device Enrollment

- Enrollment start, completion and cancellation at the device-identity boundary.
- Enrollment lifecycle states defined by the current contract: `PENDING`, `AUTHORIZED`, `COMPLETED`, `EXPIRED`, `CANCELLED`, `REVOKED`.
- Association of Store + Device + Ed25519 public key.
- One-time, short-lived pairing-code handling as specified by the contract.
- Protection against logging private material or pairing codes.

### Device Authentication

- Ed25519 challenge-response.
- Gateway challenge/nonce handling at the authentication boundary.
- Desktop proof of possession using the device private key.
- Gateway verification against the registered public key.
- Authentication outcomes `AUTH_OK`, `AUTH_FAILED` and `DEVICE_REVOKED` as currently specified.
- Session identity associated with an authenticated device.
- Authentication behavior that does not depend exclusively on the local clock.

### Device Lifecycle

- Device status.
- Revocation.
- Key rotation.
- Session termination after revocation.
- Authorization semantics for device-management operations where the current contract explicitly assigns them to the Provisioning Service.

### Security controls

- Secure storage boundary for the Desktop private key.
- Public/private key separation.
- Proof-of-possession semantics.
- Rate-limit requirements for enrollment, authentication, resume and reconnect where those controls intersect device authentication.
- Authentication/enrollment audit requirements.

## Out of scope

- Business-domain authorization such as order permissions.
- Order, conversation, LLM or provider logic.
- Canonical SQLite schema design owned by IA-01.
- Generic EventBus, Inbox, Outbox, Queue and Audit infrastructure owned by IA-03.
- Generic HTTP API and WSS transport implementation owned by IA-07.
- Renderer/UI implementation owned by IA-08.
- Google OAuth/PKCE, WhatsApp authentication or Ollama authentication.
- SaaS user/role/tenant authentication; the baseline explicitly places future SaaS user authentication outside the MVP contract.
- External platform configuration.

## Boundary rule

If a requirement crosses this boundary, IA-06 records the dependency and required interface but does not absorb the neighboring responsibility.

## Evidence state

Current territory status is `CONTRACT_DEFINED_PARTIAL / RUNTIME_NOT_IMPLEMENTED`. The repository contains contractual documentation but no verified production device-auth runtime.
