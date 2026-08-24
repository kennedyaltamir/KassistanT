# IA-01 — LEARNINGS

## Audit-derived learnings

### L-001 — M5.1 is a foundation, not the canonical schema

**Evidence:** `0001_bootstrap.sql` creates only `_schema_metadata`; business tables remain NOT_IMPLEMENTED.

**Operational consequence:** no canonical entity is considered implemented merely because it appears in the baseline.

### L-002 — Migration integrity is already a concrete contract

**Evidence:** M5.1 provides deterministic migration discovery, SHA-256 checksums, idempotent application and checksum-drift rejection.

**Operational consequence:** future canonical migrations must remain compatible with that mechanism.

### L-003 — Field-level schema is materially incomplete

**Evidence:** baseline §23 and `docs/domain/entities.md` define the entity inventory and selected fields but explicitly leave several detailed field schemas partial.

**Operational consequence:** missing names, types, nullability, defaults and constraints must be classified UNKNOWN/PARTIAL rather than invented.

### L-004 — Seven entities have especially low field-level specification coverage

**Evidence:** Phase 1 matrix audit.

**Entities:** `Settings`, `ProductCategory`, `CustomerAddress`, `PaymentMethod`, `Integration`, `IntegrationCredential`, `KnowledgeItem`.

**Operational consequence:** these entities are not deterministic-DDL ready.

### L-005 — Parent key fields are missing for some child entities

**Evidence:** baseline names fields for `OrderItem`, `OrderItemModifier` and `OrderStatusHistory`, but does not explicitly enumerate parent key fields.

**Operational consequence:** do not invent `order_id`, `order_item_id` or equivalent names solely from relational intuition.

### L-006 — Normative uniqueness is stronger than general indexing evidence

**Evidence:** baseline §23.1 explicitly declares seven unique constraints.

**Operational consequence:** only those uniqueness indexes are currently REQUIRED_BY_CONTRACT. Performance indexes are not to be invented during schema design.

### L-007 — Store scoping is an invariant but not mechanically enumerated for every entity

**Evidence:** baseline states canonical entities are scoped by Store, while §23 does not list `store_id` for every entity.

**Operational consequence:** add store keys only where authoritative evidence establishes them; do not normalize the schema by assumption.

### L-008 — Money representation is fully established

**Evidence:** baseline §75 and `packages/domain/src/money.ts`.

**Operational consequence:** monetary persistence uses integer cents and BRL; floating point is prohibited.

### L-009 — Lifecycle values are established for Conversation, AI state, Message and Order

**Evidence:** `docs/domain/state-machines.md` and `packages/domain/src/index.ts`.

**Operational consequence:** schema may preserve those exact semantic values, but SQL representation and nullability remain to be specified.

### L-010 — DomainOutbox remains a schema blocker

**Evidence:** `CONTRACT-001`, persistence and Inbox/Outbox documentation.

**Operational consequence:** do not choose a physical schema that silently resolves local-Core vs Gateway ownership.

### L-011 — `order.status_changed` is an event-contract issue, not a reason to alter schema now

**Evidence:** `docs/domain/events.md` and baseline §24/§74.

**Operational consequence:** keep lifecycle state neutral and defer event-derived schema semantics until `CONTRACT-002` is resolved.

### L-012 — Phase 1 is complete as an evidence audit, not as a DDL authorization

**Evidence:** `CANONICAL_SCHEMA_AUDIT.md`.

**Operational consequence:** migration `0002` remains unauthorized until field-level gaps and schema-critical ambiguities are closed.
