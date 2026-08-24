# Final FK Semantics Matrix

Status: **CLOSED**

| Child field | Parent | Cardinality | Nullable | ON DELETE | ON UPDATE |
|---|---|---|---|---|---|
| `conversation.customer_id` | `customer.id` | N:1 | NO | RESTRICT | RESTRICT |
| `message.conversation_id` | `conversation.id` | N:1 | NO | RESTRICT | RESTRICT |
| `order.customer_id` | `customer.id` | N:1 | NO where ownership is mandatory | RESTRICT | RESTRICT |
| `order.conversation_id` | `conversation.id` | N:1 | nullable when the approved Order contract permits absence | SET NULL if nullable relationship is preserved; otherwise RESTRICT | RESTRICT |
| `order_item.order_id` | `order.id` | N:1 | NO | RESTRICT | RESTRICT |
| `order_item_modifier.order_item_id` | `order_item.id` | N:1 | NO | RESTRICT | RESTRICT |
| `order_item_modifier.product_modifier_id` | `product_modifier.id` | N:1 optional | YES | SET NULL | RESTRICT |
| `order_status_history.order_id` | `order.id` | N:1 | NO | RESTRICT | RESTRICT |
| `product.store_id` | `store.id` | N:1 | NO | RESTRICT | RESTRICT |
| `product.category_id` | `product_category.id` | N:1 optional/contract-dependent | YES when optional | RESTRICT | RESTRICT |
| `product_modifier.product_id` | `product.id` | N:1 | NO | RESTRICT | RESTRICT |
| `product_modifier.store_id` | `store.id` | N:1 | NO | RESTRICT | RESTRICT |

## Order child authority

PR #28 closes the Order child relations and actions. Mandatory commercial parents use `RESTRICT/RESTRICT`; only the optional `ProductModifier` catalog link uses `SET NULL/RESTRICT`. No CASCADE is canonical for these commercial snapshot relationships.

## Boundary

This matrix records physical realization of already closed semantic contracts. It does not create new business rules and does not authorize migration execution.