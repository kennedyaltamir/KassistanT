# IA-01 — DECISIONS

## Decision registry

### D-001 — SQLite for MVP persistence

- **Status:** APPROVED / BASELINE
- **Source:** Approved Technical Baseline, ADR-002 and repository architecture docs.
- **Fact:** SQLite is the MVP local persistence technology.
- **IA-01 consequence:** canonical schema work targets SQLite on the Desktop Core.

### D-002 — UTC persistence

- **Status:** APPROVED / BASELINE
- **Source:** Baseline §23 and backend database contract.
- **Fact:** persisted timestamps are UTC; display timezone is a Store concern.
- **IA-01 consequence:** schema timestamp representation must preserve this invariant.

### D-003 — Monetary persistence as integer cents / BRL

- **Status:** APPROVED / BASELINE
- **Source:** Baseline §15/75 and M5.1 money primitive.
- **Fact:** monetary values use integer cents and currency BRL; floats are prohibited for money.
- **IA-01 consequence:** money columns must use integer representation and compatible currency semantics.

### D-004 — UUIDv7 identifier direction

- **Status:** APPROVED / BASELINE
- **Source:** Baseline §23 and M5.1 UUIDv7 primitive.
- **Fact:** canonical entity/event identifiers use UUIDv7 where supported by the stack.
- **IA-01 consequence:** schema identifiers must remain compatible with the approved identifier strategy.

### D-005 — Store scoping

- **Status:** APPROVED / BASELINE
- **Source:** Baseline §23 and domain entity documentation.
- **Fact:** operational entities are scoped by `store_id` where defined by contract.
- **IA-01 consequence:** canonical schema must preserve store isolation and required composite uniqueness.

### D-006 — Deterministic migrations with checksum integrity

- **Status:** IMPLEMENTED FOUNDATION / APPROVED BASELINE COMPATIBILITY
- **Source:** merged M5.1 implementation.
- **Fact:** migrations are discovered deterministically, checksummed with SHA-256, applied idempotently and rejected on checksum drift.
- **IA-01 consequence:** future schema migrations must preserve compatibility with the existing migration runner.

### D-007 — Canonical schema entities are defined, but some detailed field schemas are partial

- **Status:** APPROVED SCOPE / FIELD DETAIL PARTIAL
- **Source:** `docs/domain/entities.md`.
- **Fact:** the entity inventory is normative at current contract level; several detailed field schemas remain partial.
- **IA-01 consequence:** unresolved fields must not be invented.

## Explicitly not approved by IA-01

### P-001 — Canonical migration structure/order beyond current M5.1

- **Status:** PROPOSAL / NOT_APPROVED
- **Reason:** migration grouping/order for the full canonical schema has not yet been globally approved.

### P-002 — Physical representation of unresolved DomainOutbox ownership

- **Status:** PROPOSAL / BLOCKED BY CONTRACT-001
- **Reason:** selecting a schema layout that assumes one ownership model would silently resolve an open global contract.

### P-003 — Schema changes derived from `order.status_changed`

- **Status:** PROPOSAL / NOT_APPROVED
- **Reason:** `CONTRACT-002` remains ambiguous.

## Decision rule

Any new schema decision with cross-agent architectural impact must be recorded as a proposal first and escalated through the project governance process. IA-01 cannot self-approve a global architectural decision.
