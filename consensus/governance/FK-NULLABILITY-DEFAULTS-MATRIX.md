# FK / Nullability / Defaults Matrix

Status: **BLOCKED / PARTIAL**
Implementation point: `0e1897cae007530cbe8aed20b97e04a25340cc87`

## Deterministic relations

| Child | Parent | Mapping | Cardinality | ON DELETE | ON UPDATE | Status |
|---|---|---|---|---|---|---|
| conversation | customer | `customer_id -> customer.id` | Customer 1:N Conversation | OPEN | OPEN | BLOCKED |
| message | conversation | `conversation_id -> conversation.id` | Conversation 1:N Message | OPEN | OPEN | BLOCKED |
| order_item | order | `order_id -> order.id` | Order 1:N OrderItem | HISTORICAL CASCADE ONLY | OPEN | NOT AUTHORITATIVE |
| order_item_modifier | order_item | `order_item_id -> order_item.id` | OrderItem 1:N | HISTORICAL CASCADE ONLY | OPEN | NOT AUTHORITATIVE |
| inventory | product | `product_id -> product.id` | candidate 1:1 | OPEN | OPEN | BLOCKED |
| inventory_movement | product | `product_id -> product.id` | candidate 1:N | OPEN | OPEN | BLOCKED |
| sale | order | `order_id -> order.id` | candidate 1:1 | OPEN | OPEN | BLOCKED |
| sale | customer | `customer_id -> customer.id` | candidate N:1 | OPEN | OPEN | BLOCKED |

`CASCADE` appearing in Migration 0002 is historical evidence only and is not promoted to canonical semantics.

## Nullability / defaults

No complete field-level normative matrix exists for the target MVP tables. The following rules are therefore authoritative for readiness:

- Primary identity fields are required by entity identity, but exact SQL representation/default generation remains physical implementation detail.
- `store_id` is required where the contract explicitly scopes the entity to a store.
- No SQL `DEFAULT` is inferred from semantic defaults.
- Currency `BRL` is a semantic convention; it does not automatically authorize a SQL default.
- Optionality is not converted into `NOT NULL` without explicit semantic evidence.
- No magic sentinel values are authorized for absent state.

## Gate

`FK-NULLABILITY-DEFAULTS = NOT CLOSED`.
