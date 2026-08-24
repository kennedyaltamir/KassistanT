# IA-01 — PROGRESS

## Current phase

**Phase 1 — Contract-to-Schema Audit / Canonical Schema Specification**

## Audit status

- Repository audit: COMPLETE for IA-01 territory.
- Baseline review: COMPLETE for schema-relevant sections.
- Domain documentation review: COMPLETE for entities, commands, invariants, events and state machines.
- Backend persistence review: COMPLETE for database, persistence, inbox/outbox, jobs and audit.
- Protected protocol/contract review: COMPLETE for schema-relevant contract registry and cross-consistency status.
- Domain package review: COMPLETE for state types, money, UTC and UUIDv7 primitives.
- Phase 1 matrix: COMPLETE WITH BLOCKERS.

## Deliverables

- `CANONICAL_SCHEMA_AUDIT.md` created under `agents/01-schema/`.
- Matrix contains the 28 canonical entities.
- Field-level evidence is classified as EXPLICIT, STRONG_INFERENCE, PARTIAL or UNKNOWN.
- Relationships, constraints, normative indexes, blockers and implementation readiness are recorded.

## Current technical reality

| Area | Status |
|---|---|
| SQLite lifecycle | FOUNDATION IMPLEMENTED |
| Migration discovery | IMPLEMENTED |
| Migration checksum | IMPLEMENTED |
| Migration idempotency | IMPLEMENTED |
| Transaction boundary | IMPLEMENTED |
| Database health | IMPLEMENTED |
| Canonical business schema | NOT_IMPLEMENTED |
| Phase 1 canonical audit matrix | DOCUMENTED / COMPLETE WITH BLOCKERS |
| Migration 0002 | NOT_CREATED |

## Confirmed schema constraints

Normative unique constraints:

- `Customer(store_id, phone_normalized)`
- `Conversation(store_id, external_thread_id)`
- `Message(store_id, external_message_id)`
- `InboundInbox(provider, external_event_id)`
- `DomainOutbox(idempotency_key)`
- `Order(store_id, display_number)`
- `Device(store_id, id)`

Normative data conventions:

- money = integer cents / BRL;
- persisted timestamps = UTC;
- UUIDv7 identifier direction;
- quantity = positive integer where domain invariant applies;
- known lifecycle sets must be preserved.

## Blockers

- `CONTRACT-001` for DomainOutbox ownership/scope.
- `CONTRACT-002` conditionally for event-derived schema semantics.
- `GOV-001` when source authority affects schema interpretation.
- Missing field-level specifications for several entities.
- Missing parent-key field names for `OrderItem`, `OrderItemModifier`, `OrderStatusHistory`.
- SQL table naming convention not explicitly frozen.

## Implementation status

`IMPLEMENTATION_STARTED = FALSE`.

No migration was created. `0001_bootstrap.sql` and the M5.1 SQLite runtime were not modified.

## Next operational gate

Phase 2 may define a concrete canonical DDL only after schema-critical field-level gaps and any contract blocker affecting physical representation are closed through authoritative evidence or approved decisions.
