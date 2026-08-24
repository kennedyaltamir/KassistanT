# IA-06 Decisions

## Approved / normative decisions

### D-001 — Ed25519 challenge-response
**Status:** DECISION / APPROVED BY BASELINE
Device authentication uses Ed25519 challenge-response. Gateway verifies signatures using the registered public key.

### D-002 — Private key storage boundary
**Status:** DECISION / APPROVED BY BASELINE
Desktop private key remains in Windows Secure Storage; Gateway stores the public key.

### D-003 — Provisioning authority
**Status:** DECISION / APPROVED BY BASELINE
The MVP Provisioning Service is authorized for enrollment authorization, device revocation, key rotation and device-status reads.

### D-004 — Revocation behavior
**Status:** DECISION / APPROVED BY BASELINE
Revocation sets the device to `REVOKED`, causes `DEVICE_REVOKED` delivery and terminates the Desktop session.

## Readiness audit decisions about classification

### D-005 — No local closure of incomplete HTTP contracts
**Status:** GOVERNANCE RULE / ACTIVE
IA-06 will classify missing schemas/status/authorization/idempotency as PARTIAL/BLOCKED rather than proposing implementation values.

### D-006 — No local rate-limit policy
**Status:** GOVERNANCE RULE / ACTIVE
No numerical limit, burst, lockout or retry-after value is created by IA-06 while the source contract remains undefined.

### D-007 — No local Secure Storage technology choice
**Status:** GOVERNANCE RULE / ACTIVE
The repository defines Windows Secure Storage as the boundary, but not the concrete mechanism. IA-06 will not select one during readiness.

## Open decisions / ambiguities

### CONTRACT-001 — DomainOutbox ownership/scope
**Status:** OPEN / NOT RESOLVED BY IA-06

### CONTRACT-002 — `order.status_changed`
**Status:** OPEN / NOT RELEVANT TO DEVICE AUTH CORE; no local resolution permitted.

### GOV-001 — Documentation version authority/history
**Status:** OPEN / GLOBAL GOVERNANCE; no local resolution permitted.

### D-OPEN-01 — Enrollment endpoint contract closure
**Status:** OPEN PROJECT DECISION
Exact request/response, authn/authz, status codes and idempotency semantics remain incomplete.

### D-OPEN-02 — Authentication/session contract closure
**Status:** OPEN PROJECT DECISION
Challenge freshness, payload canonicalization, replay handling and session lifecycle remain incomplete.

### D-OPEN-03 — Rotation lifecycle closure
**Status:** OPEN PROJECT DECISION
Key overlap, rollback and session continuity remain undefined.

## Rule

No new cross-agent architectural decision is approved by IA-06 through this readiness package. It records evidence and gates only.
