# IA-01 — HANDOFF

## Purpose

Permitir continuidade do território IA-01 sem depender de memória conversacional.

## Identity

- Agent: **IA-01 — Schema / Canonical SQLite**
- Territory: Canonical SQLite Schema e Persistence Schema Foundation
- Active branch: `Agent01-schema-canonical-sqlite`
- Integration authority: `main`

## Phase 1 result

Phase 1 — Contract-to-Schema Audit / Canonical Schema Specification — is **COMPLETE WITH BLOCKERS**.

Primary artifact:

`agents/01-schema/CANONICAL_SCHEMA_AUDIT.md`

The artifact contains:

- 28 canonical entities;
- field-level evidence classifications;
- relationship matrix;
- constraint matrix;
- index matrix;
- blocker matrix;
- implementation readiness matrix.

## Verified technical state

1. M5.1 SQLite foundation remains unchanged.
2. `0001_bootstrap.sql` remains unchanged and creates only `_schema_metadata`.
3. No canonical business tables are implemented.
4. No migration `0002` exists from this Phase 1 work.
5. Protected global contracts and documentation were not modified.
6. Phase 1 identified seven explicit normative unique constraints, money/BRL, UTC and UUIDv7 conventions, and several field-level gaps.

## Important unresolved schema gaps

- `Settings`, `ProductCategory`, `CustomerAddress`, `PaymentMethod`, `Integration`, `IntegrationCredential`, `KnowledgeItem` have materially incomplete field-level definitions.
- Parent key field names for `OrderItem`, `OrderItemModifier` and `OrderStatusHistory` are not explicitly named.
- Physical SQL table naming is not frozen by current protected documentation.
- Nullability/defaults are mostly not normative and remain UNKNOWN.
- FK delete/update behavior is not specified.

## Open global contracts

- `CONTRACT-001` — DomainOutbox ownership/scope.
- `CONTRACT-002` — `order.status_changed` semantics; only schema-impacting if final decision changes physical schema.
- `GOV-001` — baseline/document authority/history.

## Downstream dependencies

### IA-02 — Domain Runtime
Consumes persistence structure; business behavior remains outside IA-01.

### IA-03 — Event Infrastructure
Depends on `InboundInbox`, `DomainOutbox`, `Job`, `AuditLog`; DomainOutbox remains blocked by CONTRACT-001.

### IA-04 — Order Engine
Depends on product, promotion, customer, address, order, payment structures and lifecycle representation.

### IA-05 — Conversation + LLM
Depends on conversation, message, customer and AI persistence structures.

### IA-06 — Device Authentication
Depends on Store/Device persistence and secure credential references.

### IA-07 — Gateway + WSS
Cross-boundary semantics must follow protected contracts; Gateway persistence is not owned by IA-01.

### IA-08 — Desktop UI
Consumes application-level services/contracts; no direct database authority.

## Next gate

Do not create `0002` until Phase 2 closes schema-critical field and contract gaps and the matrix can deterministically generate the migration.
