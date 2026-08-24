# IA-01 — Canonical Physical Schema Specification

Status: **SCHEMA DECISION PACKAGE / POST-DECISION RECONCILIATION**
Branch baseline: `MVP2`
Migration `0002`: **NON-AUTHORITATIVE HISTORICAL ARTIFACT**
M5.1: **PRESERVED**

## 1. Purpose

This document is the physical-schema authority package for IA-01. It records physical implications of approved semantics without silently promoting unresolved implementation details to normative business rules.

Supporting decision artifacts:

- `SCHEMA-DECISION-MATRIX.md`
- `SCHEMA-AUTHORITY-MATRIX.md`
- `TABLE-READINESS-MATRIX.md`
- `ENTITY-PHYSICAL-MAP.md`
- `RELATIONSHIP-SPEC.md`
- `CONSTRAINT-SPEC.md`
- `INDEX-SPEC.md`
- `MIGRATION-0002-READINESS.md`
- `MIGRATION-0002-PROJECTION.md`
- `consensus/governance/MIGRATION-0002-RECONCILIATION.md`

## 2. Frozen repository facts and approved contracts

- SQLite is the MVP persistence technology.
- UUIDv7 is the logical identifier direction where supported.
- Persisted timestamps are UTC.
- Monetary values use integer cents / BRL semantics.
- Canonical inventory contains exactly 28 entities.
- `Customer(store_id, phone_normalized)` is normatively frozen.
- `Conversation` is Customer 1:N; `Conversation.id` is distinct from `external_thread_id`; `UNIQUE(store_id, external_thread_id)` is normatively frozen.
- Inbound provider `Message` identity is `UNIQUE(store_id, external_message_id)`.
- `DomainOutbox(idempotency_key)` remains a required uniqueness surface; its semantic ownership is now resolved by CONTRACT-001.

## 3. Physical decisions and authority

Physical SQLite representation remains an implementation concern unless explicitly frozen by an approved schema contract. No unresolved physical proposal is promoted by this reconciliation.

| Concern | Current classification | Resolution |
|---|---|---|
| Table naming | PROPOSAL | `lower_snake_case` remains pending physical confirmation |
| Column naming | PROPOSAL | documented logical field names remain candidates; physical freeze requires DDL determinism |
| UUID SQLite type | PROPOSAL | textual UUID remains a candidate physical convention |
| UTC timestamp SQLite type | PROPOSAL | RFC3339/ISO-8601 text remains a candidate physical convention |
| Money SQLite type | FROZEN | integer cents; BRL semantics |
| Boolean SQLite type | PROPOSAL | integer 0/1 only when semantic field is frozen |
| JSON/payload encoding | PROPOSAL | canonical JSON TEXT only when contract explicitly identifies JSON |
| Status/lifecycle encoding | BLOCKED | semantic owner must freeze value representation before DDL |
| FK delete/update | BLOCKED | no action inferred by convention |
| Performance indexes | DEFERRED | no performance-only index is required by this package |

## 4. Entity physical map

Proposed table names remain the 28 canonical entity names in lower snake case. They are not automatically DDL-ready merely because the logical entities are canonical.

## 5. Approved Customer / Conversation / Message implications

### Customer

Canonical identity: `(store_id, phone_normalized)`.

The same store plus the same normalized phone represents the same canonical Customer. Transport identity must pass through normalization before canonical resolution. No provider-specific identity is itself canonical business identity.

### Conversation

`Customer 1 -> N Conversation`.

`Conversation.id != external_thread_id`.

`UNIQUE(store_id, external_thread_id)` is mandatory at the contract level.

Cross-channel merge, automatic stitching and identity graphs are out of scope.

### Message

Inbound provider idempotency uses `UNIQUE(store_id, external_message_id)`.

Outbound identity is deliberately not frozen by this decision package and requires an explicit future contract before physical identity is selected.

## 6. Field authority rule

A field is DDL-ready only when its meaning, physical type, nullability/default, key semantics and relevant constraints are deterministic. IA-01 must not invent missing fields or parent keys.

The existing explicit logical field inventories remain valid candidates. Unresolved field-level gaps remain implementation/schema-owner work, not governance contradictions.

## 7. Relationships

The relationship matrix remains the controlling source for physical relationship readiness. The following remain intentionally unresolved:

- OrderItem parent key;
- OrderItemModifier parent/target keys;
- OrderStatusHistory parent key;
- FK delete/update actions.

### DomainOutbox

CONTRACT-001 is no longer a governance blocker. The semantic ownership is resolved:

- Domain defines event intent.
- IA-03 owns durable Outbox mechanics and worker.
- Business state and event intent share the required atomic transaction boundary where applicable.
- Provider invocation occurs only after durable intent exists.

Physical representation, indexing and worker implementation remain future implementation work.

## 8. Nullability and defaults

No blanket `NOT NULL` policy is authorized. Exact nullability/defaults remain field-level decisions. Semantic `currency = BRL` does not by itself authorize a SQL `DEFAULT` clause.

## 9. Idempotency and traceability

Frozen contract-level uniqueness surfaces are:

- Customer `(store_id, phone_normalized)`
- Conversation `(store_id, external_thread_id)`
- inbound Message `(store_id, external_message_id)`
- InboundInbox `(provider, external_event_id)`
- DomainOutbox `(idempotency_key)`
- Order `(store_id, display_number)`
- Device `(store_id, id)`

Correlation/causation fields remain contractually required where documented, but physical nullability/encoding may remain partial.

## 10. Migration authority

`apps/desktop/database/migrations/0002_c1_product_order.sql` exists physically but is **NON-AUTHORITATIVE HISTORICAL** under GOV-DRIFT-0002 Option B.

It must not be treated as the canonical schema baseline and must not be executed, removed, renamed, replaced or modified by this reconciliation.

## 11. Readiness

The semantic decisions necessary for the IA-02 governance gate are reconciled. The entire SQLite schema is not DDL-deterministic because unrelated field-level and relationship implementation gaps remain open. This distinction does not reopen the six Operator decisions.

## 12. Rule

`RECONCILED CONTRACT != DDL AUTHORIZATION`.
