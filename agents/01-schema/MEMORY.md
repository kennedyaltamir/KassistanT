# IA-01 — MEMORY

## Permanent verified facts

- Repository: `kennedyaltamir/KassistanT`.
- Integration authority: `main`.
- Active branch: `Agent01-schema-canonical-sqlite`.
- Phase 1, Phase 2 and schema decision work remain documentation-only; protected contracts and M5.1 runtime remain untouched.
- Canonical schema inventory: 28 entities.

## M5.1 foundation

M5.1 provides SQLite lifecycle, deterministic migration discovery, SHA-256 checksums, idempotent migration application, checksum drift detection, transaction boundaries, database errors, health checks and UUIDv7/UTC/BRL primitives.

`0001_bootstrap.sql` still creates only `_schema_metadata`; canonical business tables are not implemented.

## Latest verified cross-agent evidence

### IA-02
- DREQ-001: Order aggregate root; OrderItem and OrderItemModifier aggregate-owned; OrderStatusHistory deferred for V1 aggregate boundary.
- DREQ-002: `DRAFT -> CONFIRMED` via `ConfirmOrder`, event `order.confirmed`.
- DREQ-005: domain error categories do not define persistence/idempotency/concurrency storage.
- DREQ-006: authentication outside aggregate; authorization at application/application-service boundary; ActorContext shape not frozen.

### IA-03
- Durable Inbox ACK corresponds to local persistence in `InboundInbox`.
- DomainOutbox remains blocked under CONTRACT-001.
- Exact physical field inventory for Inbox/Job/Audit is still incomplete.

### IA-04
- `CONFIRMED` remains the operational sale milestone.
- Parent-key persistence details for OrderItem/OrderItemModifier and OrderStatusHistory remain unresolved.

### IA-05
- AIExecution requires cross-agent logical closure with IA-01/IA-03.
- Conversation transition semantics come from IA-02.
- No complete canonical physical AI field inventory is frozen.

### IA-06
- Device authentication security boundaries are established, but schema-specific status/field decisions remain open.

### IA-07
- Gateway remains the external integration boundary.
- CONTRACT-001 remains ambiguous and is not locally resolved.

## Readiness

- `DETERMINISTIC`: 0.
- `DETERMINISTIC_AFTER_APPROVAL`: 3 (`store`, `product_image`, `log`).
- `DETERMINISTIC_AFTER_CROSS_AGENT_DECISION`: 14.
- `DETERMINISTIC_AFTER_GLOBAL_DECISION`: 1 (`domain_outbox`).
- `BLOCKED`: 10.
- `UNKNOWN`: 0.
- `READY_FOR_DDL`: 0.

## Local physical proposals awaiting operator confirmation

- `lower_snake_case` physical naming.
- UUID as canonical textual `TEXT`.
- UTC timestamps as canonical RFC3339/ISO-8601 `TEXT`.
- booleans as SQLite `INTEGER 0/1` where semantics are frozen.
- contract-defined JSON payloads as `TEXT` JSON.

These remain proposals, not approved decisions.

## Schema-critical blockers

- `FIELD-GAPS`.
- `CHILD-KEY-GAPS`.
- `NULLABILITY-DEFAULT-GAPS`.
- `FK-ACTION-GAPS`.
- `ENUM-PHYSICAL-GAPS`.
- `CONTRACT-001` only for affected DomainOutbox physical semantics.
- `CONTRACT-002` currently non-blocking for schema.
- `GOV-001` deferred unless a real source conflict changes schema interpretation.

## Decision protocol

No field, key, FK action, default, status encoding or persistence model is inferred from assertive language or runtime requirements. Physical readiness changes only after explicit owner evidence and/or operator approval is validated against the exact schema question.
