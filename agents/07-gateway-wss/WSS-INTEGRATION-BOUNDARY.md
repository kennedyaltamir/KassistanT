# IA-07 — WSS Integration Boundary

Status: AUDITED / CONTRACTUAL BOUNDARY ONLY
Date: 2026-08-24

## Purpose

Define the ownership boundary between IA-06 Device Authentication, IA-03 Event Infrastructure, IA-07 Gateway/WSS transport and IA-08 Desktop UI without creating a new global contract.

This document records only evidence already present in the repository. Missing semantics remain PARTIAL, UNKNOWN or BLOCKED.

## 1. Identity and transport sequence

The currently supported conceptual sequence is:

`Device Identity → Authentication → Authenticated Session Identity → WSS Connection → InboundInbox persistence → ACK → Business Processing`

This is an integration model, not an executable implementation contract.

## 2. IA-06 → IA-07

| Contract | Payload / fact | Owner | Direction | Dependency | Readiness |
|---|---|---|---|---|---|
| Device Identity | `device_id`, registered Ed25519 public key | IA-06 | IA-06 provides to IA-07 | Device enrollment | PARTIAL |
| Enrollment result | `enrollment_id`, `device_id`, one-time `pairing_code`, `expires_at` | IA-06 | IA-06 → IA-07 boundary | Provisioning/enrollment | PARTIAL |
| Authentication | Gateway challenge; Desktop proof-of-possession; `AUTH_OK` / `AUTH_FAILED` | IA-06 | shared boundary, cryptographic authority IA-06 | Device auth runtime | BLOCKED |
| Session identity | Authenticated device/session identity exists as part of device-auth boundary | IA-06 | IA-06 → IA-07 | Session semantics not fully specified | BLOCKED |
| Revocation | `DEVICE_REVOKED` and session termination | IA-06 authority; IA-07 transport reaction | IA-06 → IA-07 | Revocation contract | PARTIAL / BLOCKED |
| Key rotation | Device key lifecycle | IA-06 | IA-06 → IA-07 | Rotation runtime absent | BLOCKED |

### Boundary rule

IA-06 owns device identity, enrollment, Ed25519 proof-of-possession, authentication verification, revocation and key rotation. IA-07 must consume authenticated identity/session outcomes and must not recreate cryptographic authority. fileciteturn95file0turn97file0turn102file0

## 3. IA-03 → IA-07

| Contract | Payload / fact | Owner | Direction | Dependency | Readiness |
|---|---|---|---|---|---|
| InboundInbox intake | Inbound event becomes durable before ACK | IA-03 | IA-07 → IA-03 | Durable persistence | BLOCKED |
| Deduplication | External event uniqueness / duplicate processing protection | IA-03 | IA-03 ↔ IA-07 | Inbox runtime | BLOCKED |
| ACK durability boundary | ACK only after durable local Inbox persistence; ACK != business completion | IA-03 | IA-03 → IA-07 | Inbox commit | BLOCKED |
| Replay / recovery | Pending event replay after reconnect; recovery semantics | IA-03 | IA-03 → IA-07 | Retention/replay implementation | BLOCKED |
| Correlation / causation | Preserve metadata across infrastructure boundaries | IA-03 | IA-03 ↔ IA-07 | Event infrastructure | PARTIAL |
| DomainOutbox | External-effect durability boundary | IA-03 subject to `CONTRACT-001` | IA-03 ↔ IA-07 | Ownership unresolved | BLOCKED |

### Boundary rule

IA-07 owns transport framing and network delivery mechanics. IA-03 owns durable event intake, deduplication, replay/recovery and the ACK persistence boundary. IA-07 must not implement a competing Inbox, Outbox or replay store. fileciteturn99file0turn100file0turn101file0

## 4. IA-07 → IA-08

| Contract | Payload / fact | Owner | Direction | Dependency | Readiness |
|---|---|---|---|---|---|
| WSS event delivery | WSS envelope with `protocol_version`, `message_id`, `message_type`, `device_id`, optional IDs, sequence and payload | IA-07 transport; semantics owned upstream | IA-07 → IA-08 | WSS runtime | PARTIAL |
| ACK surface | Desktop acknowledges persisted inbound event | IA-08 client behavior; persistence boundary IA-03 | IA-08 → IA-07 → IA-03 | Inbox durability | BLOCKED |
| Connection status | Connected/disconnected/reconnecting state for UI | IA-07 transport | IA-07 → IA-08 | Connection lifecycle runtime | BLOCKED |
| Revocation notification | `DEVICE_REVOKED` transport event | IA-06 authority, IA-07 transport | IA-07 → IA-08 | Device revocation runtime | BLOCKED |

IA-08 owns renderer/UI presentation and client UX; it does not own WSS authentication, durable persistence or transport protocol authority. fileciteturn105file0

## 5. Runtime ownership split

### IA-06
Owns:
- device identity
- enrollment
- Ed25519 challenge-response
- authentication verification
- revocation
- key rotation
- authenticated device/session identity at the device-auth boundary

### IA-07
Owns:
- HTTP Gateway boundary
- WSS transport
- connection lifecycle mechanics after authenticated identity is supplied
- envelope validation
- sequence transport handling once the authoritative sequence contract exists
- connection/disconnection signaling
- transport reaction to revocation

Does not own cryptographic authority or durable Inbox/Outbox persistence.

### IA-03
Owns:
- InboundInbox
- deduplication
- durable ACK boundary
- replay/recovery
- EventBus and related infrastructure
- DomainOutbox subject to `CONTRACT-001`

### IA-08
Owns:
- Desktop renderer
- UI state/presentation
- operational display of connection/session state
- user-facing diagnostics

## 6. Current blocking dependencies

- IA-06 runtime is NOT_IMPLEMENTED and session semantics are only partially specified.
- IA-03 runtime is NOT_IMPLEMENTED; ACK/replay durability cannot be consumed yet.
- `CONTRACT-001` remains ambiguous.
- `CONTRACT-002` may affect event delivery semantics.
- `GOV-001` remains unresolved.
- Exact sequence persistence/replay and recovery semantics remain partial.
- Backpressure limits remain unspecified. fileciteturn98file0turn100file0turn101file0

## 7. External configuration — identification only

| Platform | URL | Menu / section | Expected value | Validation | Status |
|---|---|---|---|---|---|
| Gateway hosting | NOT_VERIFIED | Provider-specific | Public HTTPS/WSS endpoint | External deployment check | EXTERNAL / NOT_CONFIGURED |
| DNS | NOT_VERIFIED | DNS management | Gateway public hostname | DNS resolution | EXTERNAL / NOT_CONFIGURED |
| TLS certificate | NOT_VERIFIED | Hosting/TLS | Valid certificate for Gateway hostname | TLS handshake | EXTERNAL / NOT_CONFIGURED |
| GitHub Secrets | GitHub repository settings | Actions / Secrets | Runtime CI/CD secrets only as approved | Workflow/secret checks | NOT_EXECUTED |
| Device signing | NOT_VERIFIED | Device-auth boundary | Ed25519 proof-of-possession | IA-06 security validation | IA-06 |
| WSS deployment | NOT_VERIFIED | Gateway hosting/runtime | Secure WebSocket endpoint | WSS interoperability test | NOT_CONFIGURED |

No external configuration was executed.
