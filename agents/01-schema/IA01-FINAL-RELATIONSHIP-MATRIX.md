# IA-01 Final Relationship Matrix

Status: **CLOSED / RECONCILED**
Implementation point: `0e1897cae007530cbe8aed20b97e04a25340cc87`
Semantic source: `RESIDUAL-FK-LIFECYCLE-CLOSURE-2026-08-24.md`

| Relation | Cardinality | Nullable | Required state | ON DELETE | ON UPDATE | Lifecycle |
|---|---|---:|---|---|---|---|
| conversation.customer_id -> customer.id | N:1 | NO | Conversation creation | RESTRICT | RESTRICT | immutable binding |
| message.conversation_id -> conversation.id | N:1 | NO | Message creation | RESTRICT | RESTRICT | immutable binding |
| product.store_id -> store.id | N:1 | NO | Product creation/validity/activation | RESTRICT | RESTRICT | immutable tenant scope |
| product.category_id -> product_category.id | N:1 optional | YES | never required | SET NULL | RESTRICT | mutable classification |
| product_modifier.product_id -> product.id | N:1 | NO | ProductModifier creation | RESTRICT | RESTRICT | no reparenting |
| product_modifier.store_id -> store.id | N:1 | NO | ProductModifier creation/validity/activation | RESTRICT | RESTRICT | immutable tenant scope |
| product_image.product_id -> product.id | N:1 | NO | ProductImage creation | RESTRICT | RESTRICT | no reparenting |
| promotion.store_id -> store.id | N:1 | NO | Promotion creation/active state | RESTRICT | RESTRICT | immutable tenant scope |
| order.store_id -> store.id | N:1 | NO | Order creation/confirmation | RESTRICT | RESTRICT | immutable store scope |
| order.customer_id -> customer.id | N:1 | YES at DRAFT boundary | CONFIRMED | RESTRICT | RESTRICT | optional DRAFT, mandatory confirmation |
| order.conversation_id -> conversation.id | N:1 optional | YES | not required for DRAFT/CONFIRMED | RESTRICT | RESTRICT | contextual; mutable only before confirmation |
| order.address_id -> customer_address.id | N:1 optional | YES | confirmation only when delivery requires address | SET NULL after snapshot preservation | RESTRICT | mutable DRAFT; commercial meaning frozen at confirmation |
| order.payment_method_id -> payment_method.id | N:1 optional | YES | CONFIRMED | RESTRICT | RESTRICT | mutable DRAFT; commercial meaning frozen at confirmation |
| order_item.order_id -> order.id | N:1 | NO | OrderItem creation | RESTRICT | RESTRICT | no reparenting |
| order_item_modifier.order_item_id -> order_item.id | N:1 | NO | OrderItemModifier creation | RESTRICT | RESTRICT | no reparenting |
| order_item_modifier.product_modifier_id -> product_modifier.id | N:1 optional | YES | optional catalog reference | SET NULL | RESTRICT | snapshot authoritative |
| order_status_history.order_id -> order.id | N:1 | NO | history row creation | RESTRICT | RESTRICT | append-only evidence |

## Global FK rules

- No relationship in the closed matrix uses `CASCADE`.
- No relationship receives a SQL default.
- No sentinel value represents relationship absence.
- Stable identity keys are semantically immutable.
- Physical FK actions must not be expanded beyond this matrix by implementation convenience.

## Consistency checks

- Every child FK in the closed scope has a named parent entity and `id` identity target.
- Every optional relationship is explicitly nullable.
- Every mandatory commercial parent key is `NOT NULL`.
- Order child relations retain the PR #28 contract.
- Product category and Order support relations retain the PR #29 contracts.
- Customer/Conversation/Message relations use the residual semantic-owner decisions unchanged.
