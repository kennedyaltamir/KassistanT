# IA-01 — Constraint Specification

## Constraint authority

Only explicitly supported constraints are classified `REQUIRED_BY_CONTRACT`. Domain invariants are not converted into SQL constraints unless the protected schema contract specifies their physical enforcement.

### Primary keys

All canonical entities use a UUIDv7-oriented identity direction where supported. However, the physical identity column name and SQLite representation are not frozen for every entity. Therefore the PK *semantic* is known but DDL-ready PK definitions are generally **PARTIAL**.

Exceptions: none are fully DDL-ready because physical name/type encoding remains open.

### Normative UNIQUE constraints — REQUIRED_BY_CONTRACT

| # | Entity | Unique key | Status | Source |
|---:|---|---|---|---|
| 1 | Customer | `(store_id, phone_normalized)` | FROZEN | Baseline §23.1 |
| 2 | Conversation | `(store_id, external_thread_id)` | FROZEN | Baseline §23.1 |
| 3 | Message | `(store_id, external_message_id)` | FROZEN | Baseline §23.1 |
| 4 | InboundInbox | `(provider, external_event_id)` | FROZEN | Baseline §23.1 |
| 5 | DomainOutbox | `(idempotency_key)` | FROZEN semantic key; physical table blocked | Baseline §23.1; CONTRACT-001 |
| 6 | Order | `(store_id, display_number)` | FROZEN | Baseline §23.1 |
| 7 | Device | `(store_id, id)` | FROZEN | Baseline §23.1 |

### NOT NULL

No blanket NOT NULL policy is authorized. Exact nullability for most fields is not frozen. Therefore `NOT NULL` remains UNKNOWN unless a field is later explicitly constrained by approved contract.

### DEFAULT

No SQL defaults are frozen except semantic currency = BRL. A semantic default does not automatically authorize a database `DEFAULT` clause. All SQL DEFAULT clauses remain UNKNOWN pending physical contract.

### CHECK

Semantic sets known from protected state/domain contracts:

- Conversation lifecycle: `OPEN`, `CLOSED`.
- Conversation ownership: `AI`, `HUMAN`.
- AI state: `ACTIVE`, `PAUSED`, `UNAVAILABLE`.
- Message lifecycle: `RECEIVED`, `QUEUED`, `PROCESSING`, `SENT`, `DELIVERED`, `READ`, `FAILED`, `REJECTED`.
- Order lifecycle: `DRAFT`, `CONFIRMED`, `IN_PRODUCTION`, `READY`, `OUT_FOR_DELIVERY`, `DELIVERED`, `CANCELLED`.
- Promotion type: `FIXED_AMOUNT`, `PERCENTAGE`.

The SQL representation of these semantic enums is not frozen. Therefore physical CHECK constraints are **PARTIAL**, not DDL-ready.

### Quantity

`quantity` is a positive integer domain invariant. It applies to ProductModifier quantity bounds and OrderItem/OrderItemModifier quantities where those fields exist. SQL CHECK enforcement is not frozen and must not be invented here.

### Money

`price_cents`, `subtotal_cents`, `discount_cents`, `delivery_fee_cents`, `total_cents`, `unit_price_cents_snapshot`, `modifier unit_price_cents_snapshot` and similar monetary fields use integer cents / BRL semantics. Integer physical storage is strongly supported by the domain primitive. Floating point is prohibited.

### Foreign keys

The target relationships listed in `RELATIONSHIP-SPEC.md` are partially known. FK DDL is blocked where source/target column identity is not explicit or where delete/update behavior is unknown and contractually relevant.

### Idempotency / deduplication

Normative uniqueness keys provide current contract-level deduplication. Message `correlation_id` and `causation_id` are traceability identifiers; their SQL type/nullability is not frozen.

## Summary

The constraint model is semantically well-defined for the seven unique constraints and core state/money invariants, but it is **not yet a complete deterministic SQLite DDL contract** because physical PK/FK types, nullability, defaults, SQL enum encoding and FK actions remain open.
