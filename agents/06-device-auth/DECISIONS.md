# IA-06 Decisions

## Approved / normative decisions

### D-001 — Ed25519 challenge-response

**Status:** DECISION / APPROVED BY BASELINE

Device authentication uses Ed25519 challenge-response. The Gateway verifies signatures using the registered public key.

### D-002 — Private key storage boundary

**Status:** DECISION / APPROVED BY BASELINE

The Desktop private key remains in Windows Secure Storage. The Gateway stores the public key.

### D-003 — Provisioning authority

**Status:** DECISION / APPROVED BY BASELINE

The MVP Provisioning Service, authenticated in the Gateway, is authorized to authorize enrollment, revoke devices, rotate device keys and read device status.

### D-004 — Revocation behavior

**Status:** DECISION / APPROVED BY BASELINE

Revocation sets the device to `REVOKED`, causes `DEVICE_REVOKED` delivery and terminates the Desktop session.

## Open decisions / ambiguities

### CONTRACT-001 — DomainOutbox ownership/scope

**Status:** OPEN / NOT RESOLVED BY IA-06

Potentially intersects Gateway transport durability and therefore may affect device-auth integration, but IA-06 has no authority to resolve it.

### CONTRACT-002 — `order.status_changed`

**Status:** OPEN / NOT RELEVANT TO DEVICE AUTH CORE

No local resolution permitted.

### GOV-001 — Documentation version authority/history

**Status:** OPEN / GLOBAL GOVERNANCE

No local resolution permitted.

## Unapproved proposals

No technical proposal is being promoted to decision during the configuration phase.

## Decision rule

Any future design that changes cryptographic semantics, trust authority, key lifecycle, session identity semantics or protected contracts requires explicit project-level approval before implementation.
