# Final FK Semantics Matrix

Status: **PARTIALLY CLOSED / RESIDUAL BLOCKERS**

## Closed by PR #28

| Child field | Parent | Cardinality | Nullable | ON DELETE | ON UPDATE |
|---|---|---|---|---|---|
| `order_item.order_id` | `order.id` | N:1 | NO | RESTRICT | RESTRICT |
| `order_item_modifier.order_item_id` | `order_item.id` | N:1 | NO | RESTRICT | RESTRICT |
| `order_item_modifier.product_modifier_id` | `product_modifier.id` | N:1 optional | YES | SET NULL | RESTRICT |
| `order_status_history.order_id` | `order.id` | N:1 | NO | RESTRICT | RESTRICT |

## Still unresolved in canonical authority

The repository relationship specification still marks the following relationship actions as UNKNOWN:

- `conversation.customer_id -> customer.id`
- `message.conversation_id -> conversation.id`
- Product relationships such as `product.store_id` and `product.category_id`
- `product_modifier.product_id` / `product_modifier.store_id`
- Order relationships whose lifecycle actions are not explicitly closed by a semantic owner

IA-01 must not invent these actions. They remain blockers for the global `SCHEMA_IMPLEMENTATION_READY` gate.

## Rule

`CASCADE` from Migration 0002 is historical evidence only. No action is promoted without semantic authority.