# Final Nullability / Defaults Matrix

Status: **CLOSED**

## General rules

- Identity columns are `NOT NULL`.
- Required foreign keys are `NOT NULL`.
- Optional `product_modifier_id` is nullable.
- No relationship field receives a DEFAULT or sentinel.
- `Product.available` is `INTEGER NOT NULL` with allowed values `0/1` and no SQL default.
- Money amounts are `INTEGER` cents; `currency` is semantically `BRL` and is not given an implicit SQL default.
- Persisted timestamps are UTC text under the project time contract.

## Closed Order child fields

| Field | Nullability | Default |
|---|---|---|
| `order_item.order_id` | NOT NULL | none |
| `order_item_modifier.order_item_id` | NOT NULL | none |
| `order_item_modifier.product_modifier_id` | NULLABLE | none |
| `order_status_history.order_id` | NOT NULL | none |

## Canonical core fields

| Entity/field | Nullability/default interpretation |
|---|---|
| `customer.store_id` | NOT NULL; no implicit default |
| `customer.phone_normalized` | NOT NULL; no implicit default |
| `conversation.customer_id` | NOT NULL; relationship is mandatory |
| `conversation.external_thread_id` | NOT NULL; canonical external identity |
| `message.conversation_id` | NOT NULL; message belongs to conversation |
| `message.external_message_id` | NOT NULL for inbound provider identity |
| `product.available` | NOT NULL; `0/1`; no default |
| `order.store_id` | NOT NULL; no implicit default |
| `order.customer_id` | NOT NULL where the approved Order contract requires Customer ownership |
| `order.conversation_id` | nullable only where the approved Order contract permits absence |

No SQL default is added merely because a semantic convention exists.