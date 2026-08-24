# IA-01 — MEMORY

## Permanent verified facts

### Repository and authority

- Repository: `kennedyaltamir/KassistanT`.
- IA-01 territory: Canonical SQLite Schema / Persistence Schema Foundation.
- Integration authority is `main`.
- Active implementation branch: `Agent01-schema-canonical-sqlite`.
- Phase 1 audit matrix was created without modifying protected contracts or M5.1 runtime.

### Baseline

- Approved baseline file: `KassisT_Approved_Technical_Baseline_v1.0.1.md`.
- Baseline blob SHA observed in the repository: `02830152099f58307912ce382c064a3c4075f505`.
- SQLite is the MVP local persistence technology.
- Canonical persistence uses UTC timestamps, integer monetary cents/BRL and store scoping.
- UUIDv7 is the normative identifier direction where supported by the stack.

### M5.1 persistence foundation

M5.1 provides SQLite lifecycle, deterministic migration discovery, SHA-256 checksums, idempotent migration application, checksum drift detection, transaction boundaries, database errors, database health checks and UUIDv7/UTC/BRL integer-cent primitives.

The current bootstrap migration creates only `_schema_metadata`; canonical business tables are not implemented.

### Phase 1 schema audit

- Canonical inventory verified as exactly 28 entities.
- `agents/01-schema/CANONICAL_SCHEMA_AUDIT.md` records field-level evidence, relationships, constraints, indexes, blockers and implementation readiness.
- Seven normative unique constraints are explicit: Customer `(store_id, phone_normalized)`, Conversation `(store_id, external_thread_id)`, Message `(store_id, external_message_id)`, InboundInbox `(provider, external_event_id)`, DomainOutbox `(idempotency_key)`, Order `(store_id, display_number)`, Device `(store_id, id)`.
- Baseline §23 explicitly defines fields for the major product/order/event entities, but several field-level definitions remain partial.
- `Settings`, `ProductCategory`, `CustomerAddress`, `PaymentMethod`, `Integration`, `IntegrationCredential` and `KnowledgeItem` remain particularly underspecified at field level.
- Parent relation fields for `OrderItem`, `OrderItemModifier` and `OrderStatusHistory` are not explicitly named in the current baseline; deterministic FK DDL must not invent them.

### Open contracts relevant to schema

- `CONTRACT-001`: DomainOutbox ownership/scope remains ambiguous.
- `CONTRACT-002`: `order.status_changed` semantics remain contradictory.
- `GOV-001`: baseline/document authority history remains ambiguous.

### Schema readiness fact

The Phase 1 matrix is complete as an evidence audit but does not establish enough authoritative field-level detail to generate deterministic migration `0002` yet.
