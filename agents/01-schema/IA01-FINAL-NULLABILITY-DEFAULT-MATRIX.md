# IA-01 Final Nullability / Default Matrix

Status: **CLOSED / RECONCILED**
Implementation point: `0e1897cae007530cbe8aed20b97e04a25340cc87`

| Field / relation | Nullable | Required state | Default | Sentinel | Authority |
|---|---:|---|---|---|---|
| customer.id | NO | identity | NONE | FORBIDDEN | canonical identity rule |
| customer.store_id | NO | customer creation | NONE | FORBIDDEN | Customer identity/store scope |
| customer.phone_normalized | NO | customer creation | NONE | FORBIDDEN | Customer identity |
| conversation.customer_id | NO | conversation creation | NONE | FORBIDDEN | residual owner closure |
| conversation.external_thread_id | NO | conversation identity | NONE | FORBIDDEN | uniqueness contract |
| message.conversation_id | NO | message creation | NONE | FORBIDDEN | residual owner closure |
| message.external_message_id | NO for inbound identity | inbound provider identity | NONE | FORBIDDEN | uniqueness contract |
| product.store_id | NO | product creation | NONE | FORBIDDEN | residual owner closure |
| product.category_id | YES | never required | NONE | FORBIDDEN | PR #29 |
| product.available | NO | product validity/availability | NONE | FORBIDDEN | BINARY_AVAILABILITY |
| product_modifier.store_id | NO | modifier creation | NONE | FORBIDDEN | residual owner closure |
| product_modifier.product_id | NO | modifier creation | NONE | FORBIDDEN | residual owner closure |
| product_image.product_id | NO | image creation | NONE | FORBIDDEN | residual owner closure |
| promotion.store_id | NO | promotion creation | NONE | FORBIDDEN | residual owner closure |
| order.store_id | NO | order creation | NONE | FORBIDDEN | residual owner closure |
| order.customer_id | YES at DRAFT | required at CONFIRMED | NONE | FORBIDDEN | PR #29 |
| order.conversation_id | YES | not required for DRAFT/CONFIRMED | NONE | FORBIDDEN | residual owner closure |
| order.address_id | YES | conditional at delivery confirmation | NONE | FORBIDDEN | PR #29 |
| order.payment_method_id | YES | required at CONFIRMED | NONE | FORBIDDEN | PR #29 |
| order_item.order_id | NO | OrderItem creation | NONE | FORBIDDEN | PR #28 |
| order_item_modifier.order_item_id | NO | OrderItemModifier creation | NONE | FORBIDDEN | PR #28 |
| order_item_modifier.product_modifier_id | YES | optional catalog reference | NONE | FORBIDDEN | PR #28 |
| order_status_history.order_id | NO | history row creation | NONE | FORBIDDEN | PR #28 |
| order lifecycle_state | NO | Order creation | NONE | FORBIDDEN | Order lifecycle contract |
| money `*_cents` | NO where semantically required | financial persistence | NONE | FORBIDDEN | Money contract |
| boolean `available` | NO when semantically frozen | entity validity | NONE | FORBIDDEN | BINARY_AVAILABILITY |

## Default policy

No SQL default is authorized merely because a semantic convention has a common value. In particular, `currency = BRL` does not authorize `DEFAULT 'BRL'`.

## Gate

All nullability/default decisions required by the closed commercial schema slice are deterministic. Unresolved fields in explicitly partial, non-required future entity slices are not invented and do not modify the closed contracts listed above.
