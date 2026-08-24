# Final Nullability / Defaults Matrix

Status: **PARTIALLY CLOSED / RESIDUAL BLOCKERS**

## Closed

- Identity fields are `NOT NULL`.
- Required parent keys closed by PR #28 are `NOT NULL`.
- `order_item_modifier.product_modifier_id` is nullable.
- Relationship fields receive no DEFAULT or sentinel.
- `Product.available` is `INTEGER NOT NULL`, allowed `0/1`, no SQL default.
- Money amounts are integer cents; currency is semantically BRL without an implicit SQL default.

## Remaining unresolved field-level semantics

The canonical schema package still does not provide complete field-level nullability/default authority for all supporting entities and relationships. In particular, Order support fields and some Product/Customer/Conversation/Message optionality are not all explicitly frozen in the semantic source set.

IA-01 must not convert these gaps into `NOT NULL` or SQL defaults merely to complete DDL. They remain residual blockers for the global `SCHEMA_IMPLEMENTATION_READY` gate.

## Closed Order-child fields

| Field | Nullability | Default |
|---|---|---|
| `order_item.order_id` | NOT NULL | none |
| `order_item_modifier.order_item_id` | NOT NULL | none |
| `order_item_modifier.product_modifier_id` | NULLABLE | none |
| `order_status_history.order_id` | NOT NULL | none |