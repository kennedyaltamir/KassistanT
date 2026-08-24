# IA-01 — DECISIONS

## Decision registry

### D-001 — SQLite for MVP persistence

- **Status:** APPROVED / BASELINE
- **Source:** Approved Technical Baseline, ADR-002 and repository architecture docs.

### D-002 — UTC persistence

- **Status:** APPROVED / BASELINE
- **Source:** Baseline §23 and backend database contract.

### D-003 — Monetary persistence as integer cents / BRL

- **Status:** APPROVED / BASELINE
- **Source:** Baseline §15/75 and M5.1 money primitive.

### D-004 — UUIDv7 identifier direction

- **Status:** APPROVED / BASELINE
- **Source:** Baseline §23 and M5.1 UUIDv7 primitive.

### D-005 — Store scoping

- **Status:** APPROVED / BASELINE
- **Source:** Baseline §23 and domain entity documentation.

### D-006 — Deterministic migrations with checksum integrity

- **Status:** IMPLEMENTED FOUNDATION / APPROVED BASELINE COMPATIBILITY
- **Source:** merged M5.1 implementation.

### D-007 — Canonical schema entities are defined, but several field schemas are partial

- **Status:** APPROVED SCOPE / FIELD DETAIL PARTIAL
- **Source:** `docs/domain/entities.md` and baseline §23.

### D-008 — Phase 1 matrix is the current schema specification baseline

- **Status:** DOCUMENTED / NOT YET APPROVED DDL
- **Source:** `agents/01-schema/CANONICAL_SCHEMA_AUDIT.md`.
- **Decision:** use the matrix as the authoritative local audit artifact for Phase 1; it records UNKNOWN/PARTIAL gaps rather than inventing schema details.
- **Consequence:** migration `0002` must not be generated from assumptions outside the matrix.

### D-009 — Normative unique constraints are limited to those explicitly declared

- **Status:** APPROVED EVIDENCE CLASSIFICATION
- **Source:** baseline §23.1.
- **Decision:** treat the seven declared unique constraints as `REQUIRED_BY_CONTRACT`; do not elevate performance-only indexes to normative status during Phase 1.

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

### P-004 — SQL table naming convention

- **Status:** PROPOSAL / OPEN
- **Reason:** canonical entity names are defined, but physical SQL table naming is not explicitly frozen by current protected schema documentation.

### P-005 — Missing parent-key field names for OrderItem/OrderItemModifier/OrderStatusHistory

- **Status:** PROPOSAL / BLOCKED BY FIELD SPECIFICATION GAP
- **Reason:** adding assumed keys would invent schema.

### P-006 — Exact storage model for Settings, CustomerAddress, PaymentMethod, Integration, IntegrationCredential and KnowledgeItem

- **Status:** PROPOSAL / BLOCKED BY FIELD SPECIFICATION GAP
- **Reason:** authoritative field-level schemas are incomplete.

## Decision rule

Any new schema decision with cross-agent architectural impact must be recorded as a proposal first and escalated through project governance. IA-01 cannot self-approve a global architectural decision.
