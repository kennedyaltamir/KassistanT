# IA-01 — HANDOFF

## Identity

- Agent: **IA-01 — Schema / Canonical SQLite**
- Territory: Canonical SQLite Schema / Persistence Schema Foundation
- Active branch: `Agent01-schema-canonical-sqlite`
- Integration authority: `main`

## Phase 2 result

Phase 2 — Canonical Schema Specification — is **COMPLETE AS SPECIFICATION / BLOCKED FOR DDL**.

## Primary artifacts

- `CANONICAL-SCHEMA-SPEC.md`
- `ENTITY-PHYSICAL-MAP.md`
- `RELATIONSHIP-SPEC.md`
- `CONSTRAINT-SPEC.md`
- `INDEX-SPEC.md`
- `MIGRATION-0002-READINESS.md`
- `MIGRATION-0002-PROJECTION.md`

## Verified state

1. Exactly 28 canonical entities are mapped.
2. Lower_snake_case table names are documented as PROPOSED only.
3. Seven explicit unique constraints are REQUIRED_BY_CONTRACT.
4. Twenty-three relationships are classified; missing parent keys are explicitly blocked rather than inferred.
5. Lifecycle/status semantic values are preserved, but physical SQL enum encoding remains open.
6. Money is integer cents / BRL and timestamps are UTC semantically.
7. M5.1 and `0001_bootstrap.sql` remain unchanged.
8. No `0002` migration exists.

## Schema-critical blockers

- Physical SQL naming convention.
- Incomplete schemas for Settings, ProductCategory, CustomerAddress, PaymentMethod, Integration, IntegrationCredential and KnowledgeItem.
- Parent key names for OrderItem, OrderItemModifier and OrderStatusHistory.
- Physical UUID and timestamp encoding.
- Nullability/defaults.
- FK delete/update behavior.
- SQL lifecycle/status representation.
- DomainOutbox physical semantics under CONTRACT-001.
- GOV-001 if authority history changes interpretation.

## CONTRACT-002 classification

`order.status_changed` remains ambiguous but is currently **non-blocking for existing schema**. It becomes blocking only if the final event decision requires a new physical schema element or changes an existing persisted contract.

## Migration gate

`0002` must not be created until a reviewer confirms that a second engineer can derive identical SQL from the physical specification without interpretation.
