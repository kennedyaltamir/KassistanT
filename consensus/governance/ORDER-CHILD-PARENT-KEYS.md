# Order Child Parent Keys

Status: **BLOCKED — SEMANTIC OWNER REQUIRED**

| Child | Parent | Canonical candidate | Status | Authority |
|---|---|---|---|---|
| `order_item` | `order` | `order_id` | BLOCKED | IA-04 Order/OrderItem semantic owner |
| `order_item_modifier` | `order_item` | `order_item_id` | BLOCKED | IA-04 OrderItemModifier semantic owner |
| `order_item_modifier` | `product_modifier` | `product_modifier_id` | BLOCKED | IA-04 semantic owner |
| `order_status_history` | `order` | `order_id` | BLOCKED | IA-04 + IA-02 semantic owners |

## Authority finding

`SCHEMA-AUTHORITY-MATRIX.md` explicitly assigns:

- OrderItem parent key → IA-04;
- OrderItemModifier parent keys → IA-04;
- OrderStatusHistory semantics → IA-04 + IA-02.

The physical names above follow the local IA-01 naming convention only as candidates. They are not frozen until the semantic owners confirm the parent relationships, cardinality and optionality.

IA-01 must not promote the candidates to canonical DDL independently.
