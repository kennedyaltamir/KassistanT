# IA-02 / IA-04 / IA-01 Schema Handoff

Status: **READY_FOR_IA01_FINAL_SCHEMA_CLOSURE**

Implementation point: `MVP2 @ 0e1897cae007530cbe8aed20b97e04a25340cc87`.

## Authority reconciliation

- IA-04 owns Order child relationship semantics.
- IA-02 owns Order domain compatibility.
- IA-01 owns canonical physical SQLite realization.
- No schema, migration or runtime implementation was performed by this closure.

## Closed semantic decisions

### OrderItem
- Parent: Order.
- Parent key: `order_id`.
- Mandatory relation; cardinality `Order 1:N OrderItem`.
- Order may be `DRAFT` with zero items.
- Reparenting forbidden.
- `ON DELETE RESTRICT`.
- `ON UPDATE RESTRICT`.

### OrderItemModifier
- Parent: OrderItem.
- Parent key: `order_item_id`.
- Mandatory relation; cardinality `OrderItem 1:N OrderItemModifier`.
- Optional catalog reference: `product_modifier_id -> product_modifier.id`.
- Order modifier snapshot is authoritative; catalog row is not authoritative for an existing order modifier.
- Required parent FK: `ON DELETE RESTRICT`, `ON UPDATE RESTRICT`.
- Optional catalog FK: `ON DELETE SET NULL`, `ON UPDATE RESTRICT`.

### OrderStatusHistory
- Parent: Order.
- Parent key: `order_id`.
- Mandatory relation; cardinality `Order 1:N OrderStatusHistory`.
- Current Order state remains authoritative.
- History is append-only immutable evidence of accepted transitions.
- Initial DRAFT creation does not require a history row.
- `ON DELETE RESTRICT`.
- `ON UPDATE RESTRICT`.

## Nullability/defaults

- Mandatory parent keys are `NOT NULL` semantically.
- `product_modifier_id` is nullable because the catalog relationship is optional.
- No relationship receives a DEFAULT or sentinel value.

## Remaining blockers

None within the semantic scope of this mandate.

## Next owner

IA-01.

## Next action

Translate the closed semantics into canonical physical schema and apply the authorized migration strategy. Do not invent relationship meaning during physical realization.

## Truth boundary

`CONTRACT_CLOSED != SCHEMA_IMPLEMENTED != VERIFIED`.
