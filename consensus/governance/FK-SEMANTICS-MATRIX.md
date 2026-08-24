# FK Semantics Matrix

Status: **BLOCKED — SEMANTIC OWNER REQUIRED**

| Child | Parent | Delete | Update | Status |
|---|---|---|---|---|
| `conversation.customer_id` | `customer.id` | UNKNOWN | UNKNOWN | BLOCKED |
| `message.conversation_id` | `conversation.id` | UNKNOWN | UNKNOWN | BLOCKED |
| `order_item.order_id` | `order.id` | UNKNOWN | UNKNOWN | BLOCKED — IA-04 |
| `order_item_modifier.order_item_id` | `order_item.id` | UNKNOWN | UNKNOWN | BLOCKED — IA-04 |
| `order_item_modifier.product_modifier_id` | `product_modifier.id` | UNKNOWN | UNKNOWN | BLOCKED — IA-04 |
| `order_status_history.order_id` | `order.id` | UNKNOWN | UNKNOWN | BLOCKED — IA-04/IA-02 |

## Authority

`SCHEMA-AUTHORITY-MATRIX.md` assigns FK delete/update behavior to the relevant semantic owner. The relationship specification explicitly keeps these actions `UNKNOWN` until semantically determined.

Migration 0002 `CASCADE` values are historical evidence only and are not promoted.

IA-01 therefore cannot close this matrix unilaterally.
