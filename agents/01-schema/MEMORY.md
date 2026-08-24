# IA-01 — MEMORY

## Permanent verified facts

- Repository: `kennedyaltamir/KassistanT`.
- Integration authority: `main`.
- Active branch: `Agent01-schema-canonical-sqlite`.
- Phase 1, Phase 2 and Decision Execution work remain documentation-only; protected contracts and M5.1 runtime remain untouched.
- Canonical schema inventory: 28 entities.

## M5.1 foundation

M5.1 provides SQLite lifecycle, deterministic migration discovery, SHA-256 checksums, idempotent migration application, checksum drift detection, transaction boundaries, database errors, health checks and UUIDv7/UTC/BRL primitives.

`0001_bootstrap.sql` still creates only `_schema_metadata`; canonical business tables are not implemented.

## Schema decision package

- `SCHEMA-DECISION-MATRIX.md` classifies local, cross-agent, global, deferred and non-blocking decisions and records request state.
- `SCHEMA-AUTHORITY-MATRIX.md` separates semantic authority from IA-01 physical ownership.
- `TABLE-READINESS-MATRIX.md` reclassifies the 28 tables by decision authority and request state.
- `HUMAN-SCHEMA-REVIEW.md` provides closed decision requests for operator/agent review.
- `CANONICAL-SCHEMA-SPEC.md` consolidates the physical proposal.
- `MIGRATION-0002-READINESS.md` and `MIGRATION-0002-PROJECTION.md` remain documentary and prohibit migration creation.

## Reclassified readiness

- `READY_AFTER_LOCAL_DECISION`: 3 tables.
- `READY_AFTER_CROSS_AGENT_DECISION`: 14 tables.
- `READY_AFTER_GLOBAL_DECISION`: 1 table.
- `BLOCKED`: 10 tables.
- `READY_FOR_MIGRATION`: 0 tables.

No table was promoted in this execution because no new authority response or operator approval was received.

## Local physical proposals awaiting operator confirmation

- `lower_snake_case` physical naming.
- UUID as canonical textual `TEXT`.
- UTC timestamps as canonical RFC3339/ISO-8601 `TEXT`.
- booleans as SQLite `INTEGER 0/1` where semantics are frozen.
- contract-defined JSON payloads as `TEXT` JSON.

These remain proposals, not approved global decisions.

## Schema-critical blockers

- `FIELD-GAPS`: incomplete semantic field inventories.
- `CHILD-KEY-GAPS`: missing parent key definitions for OrderItem, OrderItemModifier and OrderStatusHistory.
- `NULLABILITY-DEFAULT-GAPS`: semantic required/optional/default rules are incomplete.
- `FK-ACTION-GAPS`: delete/update actions are not contractually frozen.
- `ENUM-PHYSICAL-GAPS`: state catalog is known for several entities, but SQL representation is not frozen.
- `CONTRACT-001`: global blocker only for affected DomainOutbox physical semantics.
- `CONTRACT-002`: currently non-blocking for schema.
- `GOV-001`: deferred unless an actual source conflict changes schema interpretation.

## Decision protocol

Cross-agent requests are prepared but not answered. No semantic decision is assumed from a recommendation. The readiness matrix may only be promoted after explicit authority evidence is incorporated.
