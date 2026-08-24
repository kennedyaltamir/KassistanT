# IA-01 — MEMORY

## Permanent verified facts

### Repository and authority

- Repository: `kennedyaltamir/KassistanT`.
- IA-01 territory: Canonical SQLite Schema / Persistence Schema Foundation.
- Integration authority is `main`.
- Active implementation branch: `Agent01-schema-canonical-sqlite`.
- Phase 1 and Phase 2 work are documentation-only; protected contracts and M5.1 runtime remain untouched.

### Baseline

- Approved baseline: `KassisT_Approved_Technical_Baseline_v1.0.1.md`.
- Baseline SHA: `02830152099f58307912ce382c064a3c4075f505`.
- SQLite is MVP persistence.
- Timestamps persist in UTC.
- Money uses integer cents / BRL.
- UUIDv7 is the identifier direction where supported.

### M5.1 foundation

M5.1 provides SQLite lifecycle, deterministic migration discovery, SHA-256 checksums, idempotent migration application, checksum drift detection, transaction boundaries, database errors, health checks and UUIDv7/UTC/BRL primitives.

`0001_bootstrap.sql` still creates only `_schema_metadata`; canonical business tables are not implemented.

### Phase 2 physical specification

- `CANONICAL-SCHEMA-SPEC.md` now consolidates physical naming proposals, semantic fields, scope, state storage, mutability and implementation order.
- `ENTITY-PHYSICAL-MAP.md` maps all 28 canonical entities to lower_snake_case table-name proposals while explicitly keeping naming PROPOSED.
- `RELATIONSHIP-SPEC.md` records 23 relationships and refuses to invent missing parent keys or delete/update actions.
- `CONSTRAINT-SPEC.md` freezes only the seven contract-required unique constraints and keeps most NOT NULL/DEFAULT/CHECK/FK actions open.
- `INDEX-SPEC.md` limits REQUIRED_BY_CONTRACT indexes to the seven explicit unique constraints.
- `MIGRATION-0002-READINESS.md` records every table as blocked for deterministic DDL under current evidence.
- `MIGRATION-0002-PROJECTION.md` projects dependency order and migration structure without creating `0002`.

### Remaining schema-critical gaps

- Physical SQL table naming is a proposal, not an approved convention.
- UUID and timestamp physical SQLite encoding is not frozen.
- Several entities lack complete field-level definitions: Settings, ProductCategory, CustomerAddress, PaymentMethod, Integration, IntegrationCredential, KnowledgeItem.
- Parent key names are missing for OrderItem, OrderItemModifier and OrderStatusHistory.
- Nullability and SQL defaults are mostly UNKNOWN.
- FK ON DELETE / ON UPDATE behavior is UNKNOWN.
- Lifecycle/status SQL representation is not frozen, although semantic values are known.
- DomainOutbox remains blocked where physical ownership/scope depends on CONTRACT-001.

## Open contracts

- `CONTRACT-001`: DomainOutbox ownership/scope.
- `CONTRACT-002`: `order.status_changed` semantics; currently non-blocking unless its final decision changes physical schema.
- `GOV-001`: baseline/document authority history.
