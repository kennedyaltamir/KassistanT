# IA-01 — ERRORS

## Known inconsistencies, risks and traps

### E-001 — CONTRACT-001: DomainOutbox ownership/scope

- **Status:** OPEN / BLOCKING FOR AFFECTED DESIGN
- **Evidence:** contract registry, persistence and Inbox/Outbox documentation.
- **Impact:** physical ownership, fields, transaction boundary and cross-system semantics.
- **Rule:** do not silently resolve.

### E-002 — CONTRACT-002: `order.status_changed`

- **Status:** OPEN / CONDITIONAL FOR SCHEMA
- **Evidence:** baseline §24/§74 and domain events documentation.
- **Impact:** event-derived schema semantics only; lifecycle state itself is defined.
- **Rule:** do not encode disputed event semantics.

### E-003 — GOV-001: documentation authority/history mismatch

- **Status:** OPEN
- **Evidence:** baseline version/history and `docs/product` copy.
- **Impact:** selecting the wrong normative source for field details.
- **Rule:** use current protected authority and escalate conflicts.

### E-004 — Canonical field specifications are incomplete

- **Status:** OPEN / SCHEMA-SPECIFICATION GAP
- **Evidence:** baseline §23 and `docs/domain/entities.md`.
- **Impact:** prevents deterministic nullability/default/type/constraint decisions.
- **Rule:** classify missing detail as UNKNOWN/PARTIAL.

### E-005 — Parent key names absent for child entities

- **Status:** OPEN / SCHEMA-SPECIFICATION GAP
- **Entities:** `OrderItem`, `OrderItemModifier`, `OrderStatusHistory`.
- **Impact:** deterministic FK DDL cannot be generated without inventing field names.
- **Rule:** do not assume `order_id`, `order_item_id` or similar names.

### E-006 — Seven entities remain especially underspecified

- **Status:** OPEN
- **Entities:** `Settings`, `ProductCategory`, `CustomerAddress`, `PaymentMethod`, `Integration`, `IntegrationCredential`, `KnowledgeItem`.
- **Impact:** insufficient evidence for deterministic canonical DDL.

### E-007 — Physical SQL table naming is not explicitly frozen

- **Status:** OPEN
- **Impact:** a migration requires concrete table names while current protected sources only freeze canonical entity names.
- **Rule:** table naming convention must be established through an approved decision; do not hide it inside implementation.

### E-008 — Store scoping is conceptually normative but not enumerated as a field for every entity

- **Status:** OPEN / SPECIFICATION GAP
- **Impact:** automatically adding `store_id` to all 28 tables would be an unsupported schema invention.
- **Rule:** use explicit field evidence or an approved decision per entity.

### E-009 — Existing migration is foundation-only

- **Status:** CONFIRMED
- **Evidence:** `0001_bootstrap.sql` creates only `_schema_metadata`.
- **Impact:** downstream agents must not assume canonical business tables exist.

### E-010 — SQLite runtime files remain outside IA-01 ownership

- **Status:** CONFIRMED
- **Evidence:** OWNERSHIP.md.
- **Impact:** editing M5.1 runtime files would cross ownership.
- **Rule:** preserve `apps/desktop/electron/database/**` unless integration authority explicitly changes ownership.

### E-011 — No performance-only index contract is currently established

- **Status:** CONFIRMED
- **Impact:** adding indexes based only on expected query patterns would create unapproved schema decisions.
- **Rule:** restrict Phase 1 normative index set to explicit unique constraints.

## Error handling rule

This file records verified problems and schema-specific traps. Proposals remain proposals and are not treated as implementation errors.
