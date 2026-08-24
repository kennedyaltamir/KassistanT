# IA-01 — MEMORY

## Permanent verified facts

### Repository and authority

- Repository: `kennedyaltamir/KassistanT`.
- IA-01 territory: Canonical SQLite Schema / Persistence Schema Foundation.
- Integration authority is `main`.
- Configuration branch: `agents/configuring`.
- The agent configuration scaffold initially contained empty operational files under `agents/01-schema/`.

### Baseline

- Approved baseline file: `KassisT_Approved_Technical_Baseline_v1.0.1.md`.
- Baseline blob SHA observed in the repository: `02830152099f58307912ce382c064a3c4075f505`.
- The baseline defines SQLite as the MVP local persistence technology.
- Canonical persistence uses UTC timestamps, integer monetary cents/BRL and store scoping.
- UUIDv7 is the normative identifier direction where supported by the stack.

### M5.1 persistence foundation

M5.1 merged through PR #2 and provides:

- SQLite connection lifecycle;
- deterministic migration discovery;
- SHA-256 migration checksums;
- idempotent migration application;
- checksum drift detection;
- transaction boundary;
- database error taxonomy;
- database health check;
- UUIDv7, UTC and BRL integer-cent primitives;
- schema/migration/transaction tests.

### Current schema state

The repository currently contains one bootstrap migration:

`apps/desktop/database/migrations/0001_bootstrap.sql`

It creates only `_schema_metadata` and records schema version `0001`. Canonical business tables are not implemented.

### Canonical entity set

The assigned canonical entities are:

`Store`, `Device`, `Settings`, `ProductCategory`, `Product`, `ProductModifier`, `ProductImage`, `Promotion`, `Customer`, `CustomerAddress`, `Conversation`, `Message`, `Order`, `OrderItem`, `OrderItemModifier`, `OrderStatusHistory`, `PaymentMethod`, `Notification`, `Integration`, `IntegrationCredential`, `InboundInbox`, `DomainOutbox`, `Job`, `AuditLog`, `Log`, `AIProfile`, `AIExecution`, `KnowledgeItem`.

### Normative uniqueness recorded in the current contract layer

- `Customer(store_id, phone_normalized)`
- `Conversation(store_id, external_thread_id)`
- `Message(store_id, external_message_id)`
- `InboundInbox(provider, external_event_id)`
- `DomainOutbox(idempotency_key)`
- `Order(store_id, display_number)`

The detailed field schemas for several entities remain partial and must not be inferred from implementation.

### Open contracts relevant to schema

- `CONTRACT-001`: DomainOutbox ownership/scope is ambiguous across local Core and Gateway architecture.
- `CONTRACT-002`: `order.status_changed` semantics are contradictory in normative material.
- `GOV-001`: version/document authority history remains ambiguous.

### Architectural boundary

Desktop Core owns deterministic business rules and local SQLite persistence. Gateway is a transport/integration boundary and is not business-rule authority. Inbox/Outbox/Queue/EventBus/AuditLog are distinct reliability boundaries; Event Sourcing is not used in the MVP.

## Memory policy

This file stores durable verified facts only. Activity logs, hypotheses and pending work belong in `PROGRESS.md`, `LEARNINGS.md`, `DECISIONS.md` or `ERRORS.md`.
