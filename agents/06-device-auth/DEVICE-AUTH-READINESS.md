# IA-06 Device Authentication — Readiness Package

**Phase:** Device Authentication Contract Readiness Audit  
**Audit branch:** `Agent06-device-authentication`  
**Audit base:** `main`  
**Main HEAD at audit:** `c9b79ae5ef90f4161261a93647d21d36773dd8e3`  
**Implementation status:** FROZEN / NOT_STARTED  
**Audit rule:** repository evidence outranks documentation assertions; absent detail remains PARTIAL/UNKNOWN.

## Executive verdict

| Area | Readiness | Implementation | Evidence summary |
|---|---|---|---|
| Device Identity | PARTIAL | NOT_STARTED | `Device` is canonical, but detailed field schema is partial. |
| Enrollment | PARTIAL / BLOCKED | NOT_STARTED | Routes/states exist; request/response, status, authz and idempotency are incomplete. |
| Provisioning | PARTIAL | NOT_STARTED | Provisioning Service is named authority; exact interface is incomplete. |
| Authentication | PARTIAL / BLOCKED | NOT_STARTED | Ed25519 challenge-response is normative; exact protocol/session details are incomplete. |
| Challenge-Response | PARTIAL / BLOCKED | NOT_STARTED | Challenge/signature flow exists conceptually; lifetime, nonce format and replay contract are incomplete. |
| Ed25519 | READY FOR CONTRACT CONSUMPTION / PARTIAL FOR IMPLEMENTATION | NOT_STARTED | Algorithm is explicit; representation and lifecycle details remain open. |
| Secure Storage | PARTIAL / EXTERNAL | NOT_STARTED | Windows Secure Storage is normative; exact mechanism and recovery semantics are not defined. |
| Session Identity | PARTIAL / BLOCKED | NOT_STARTED | Authenticated device session is implied; exact session model/lifetime is absent. |
| Revoke | PARTIAL | NOT_STARTED | Provisioning Service may revoke; `DEVICE_REVOKED` + session termination are defined. |
| Rotate | BLOCKED | NOT_STARTED | Authority exists, but lifecycle, overlap, rollback and session semantics are missing. |
| Status | PARTIAL | NOT_STARTED | Route exists; authorization and response schema are incomplete. |
| Revocation | PARTIAL | NOT_STARTED | `REVOKED` state and signal are defined; persistence/runtime semantics are not implemented. |
| Authorization | BLOCKED | NOT_STARTED | Provisioning Service authority is defined, endpoint matrix is missing. |
| Rate Limiting | BLOCKED | NOT_STARTED | Conceptual limits exist; numerical policies are absent. |
| Idempotency | BLOCKED | NOT_STARTED | Generic idempotency exists; endpoint-specific keys/replay/TTL are missing. |
| Audit | PARTIAL | NOT_STARTED | Device revocation and credential rotation are explicitly critical; broader auth audit coverage needs closure. |
| Error Model | PARTIAL | NOT_STARTED | Generic correlated HTTP error envelope exists; device-specific catalog is missing. |
| Persistence | PARTIAL / BLOCKED | NOT_STARTED | `Device` is canonical, but detailed fields and canonical schema are not yet implemented. |
| Gateway Integration | PARTIAL / BLOCKED | NOT_STARTED | IA-06 owns device-auth boundary; IA-07 owns generic Gateway/WSS. |
| WSS Integration | PARTIAL / BLOCKED | NOT_STARTED | `AUTH`, `AUTH_OK`, `AUTH_FAILED`, `DEVICE_REVOKED` exist; exact auth payloads/session semantics are incomplete. |
| Desktop Integration | PARTIAL / EXTERNAL | NOT_STARTED | Private key must remain privileged; Secure Storage runtime is unverified. |
| Security Invariants | READY AS CONSTRAINTS / PARTIAL AS PROTOCOL | NOT_STARTED | Key separation, proof-of-possession, revocation and no-local-clock-only are explicit. |
| Testing | BLOCKED | NOT_STARTED | Deterministic tests are possible only after contract gaps close. |
| Implementation Gates | BLOCKED | NOT_STARTED | Multiple contract gates remain open. |

## Normative facts confirmed

- Device authentication uses **Ed25519 challenge-response**.
- Gateway stores the **device public key**; Desktop stores the **private key in Windows Secure Storage**.
- Enrollment produces `enrollment_id`, `device_id`, one-time short-lived `pairing_code` and `expires_at`.
- Enrollment states are `PENDING`, `AUTHORIZED`, `COMPLETED`, `EXPIRED`, `CANCELLED`, `REVOKED`.
- The Provisioning Service is the MVP authority for enrollment authorization, revoke, rotate and device-status reads.
- Authentication is conceptually `Gateway challenge -> Desktop signs nonce + session context -> Gateway verifies -> AUTH_OK`; failure is `AUTH_FAILED`.
- Revocation produces `DEVICE_REVOKED` and terminates the Desktop session.
- Authentication must not rely exclusively on the Desktop local clock.
- WSS envelope fields are defined at protocol level, while exact authentication payload schemas remain partial.
- Runtime implementation is not present in the audited ownership paths.

## Global blockers

### B-01 — Enrollment contract closure
Exact request/response schemas, status codes, endpoint authorization and endpoint idempotency are incomplete.

### B-02 — Authentication protocol closure
Challenge freshness, nonce representation, signed payload representation, session establishment, expiration and reauthentication semantics are incomplete.

### B-03 — Authorization matrix
Authentication identity is not authorization. Endpoint-by-endpoint permissions and conditions are not fully specified.

### B-04 — Rate-limit policy
Enrollment, AUTH, RESUME and reconnect limits are named but concrete policy is missing.

### B-05 — Endpoint idempotency
Generic idempotency guidance exists, but endpoint-specific key scope, persistence, duplicate result and TTL/replay behavior are missing.

### B-06 — Rotation lifecycle
Old/new key status, overlap, rollback, revocation ordering and session continuity are unspecified.

### B-07 — Secure Storage mechanism
Windows Secure Storage is a normative boundary, but the exact supported mechanism and deletion/recovery/export semantics are not specified and require external validation.

### B-08 — Persistence schema
`Device` exists in the canonical entity inventory, but detailed fields and canonical business schema are still partial/not implemented.

### B-09 — Contract-001 / CONTRACT-002 / GOV-001
Global ambiguities remain outside IA-06 authority. IA-06 must not encode assumptions that resolve them.

## Readiness rule

`READY` in this package means the subject can be consumed without inventing semantics. It does **not** mean the runtime is implemented.

`PARTIAL` means normative intent exists but one or more externally observable/runtime-critical details are missing.

`BLOCKED` means implementation would require an unapproved design choice.

`UNKNOWN` means evidence was insufficient to state the behavior.

`EXTERNAL` means validation depends on the supported external platform/runtime.

## Implementation gate summary

No Device Authentication runtime implementation is authorized by this audit alone. Implementation may begin only after the gates in `IMPLEMENTATION-GATES.md` are satisfied by project authority and cross-agent dependencies are stable.

## Evidence references

- `docs/protocols/device-authentication.md`
- `docs/protocols/device-enrollment.md`
- `docs/protocols/openapi.yaml`
- `docs/protocols/wss-v1.md`
- `docs/domain/entities.md`
- `docs/backend/authentication.md`
- `docs/backend/authorization.md`
- `docs/backend/idempotency.md`
- `docs/backend/audit.md`
- `docs/backend/error-handling.md`
- `agents/06-device-auth/*`
