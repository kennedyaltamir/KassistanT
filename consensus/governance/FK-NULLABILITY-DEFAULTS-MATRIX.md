# FK / Nullability / Defaults Matrix

Status: **PARTIALLY_CLOSED / READINESS BLOCKED**
Implementation point: `0e1897cae007530cbe8aed20b97e04a25340cc87`

## Closed physical semantics

| Concern | Result |
|---|---|
| Product price | `INTEGER` cents |
| Product currency | `BRL` semantic authority; no SQL default inferred |
| Product availability | `INTEGER NOT NULL`, allowed values `0/1`, no SQL default |
| Order money | `INTEGER` cents + BRL semantic authority |
| Sale persistence | no separate Sale table; Order is the persisted sale record |
| Quantitative inventory | outside MVP |
| InventoryMovement | outside MVP |

## Foreign keys

| Child | Parent | Mapping | Cardinality | ON DELETE | ON UPDATE | Status |
|---|---|---|---|---|---|---|
| conversation | customer | `customer_id -> customer.id` | Customer 1:N Conversation | UNKNOWN | UNKNOWN | BLOCKED |
| message | conversation | `conversation_id -> conversation.id` | Conversation 1:N Message | UNKNOWN | UNKNOWN | BLOCKED |
| order | customer | `customer_id -> customer.id` | Customer 1:N Order | UNKNOWN | UNKNOWN | BLOCKED |
| order | conversation | `conversation_id -> conversation.id` | Conversation 1:N Order | UNKNOWN | UNKNOWN | BLOCKED |
| order | customer_address | `address_id -> customer_address.id` | MANY-to-ONE candidate | UNKNOWN | UNKNOWN | BLOCKED |
| order | payment_method | `payment_method_id -> payment_method.id` | MANY-to-ONE candidate | UNKNOWN | UNKNOWN | BLOCKED |
| order_item | order | parent reference | Order 1:N | UNKNOWN | UNKNOWN | BLOCKED — parent key name not frozen |
| order_item_modifier | order_item | parent reference | OrderItem 1:N | UNKNOWN | UNKNOWN | BLOCKED — parent key name not frozen |
| order_status_history | order | parent reference | Order 1:N | UNKNOWN | UNKNOWN | BLOCKED — parent key name not frozen |

Historical `CASCADE` in Migration 0002 is evidence only and is not promoted.

No Sale FKs are required because no separate Sale table exists in the canonical MVP schema.

## Nullability / defaults

Deterministic rules now established:

- identity fields are non-null by identity semantics;
- explicitly store-scoped fields such as `store_id` are required;
- `product.available` is `NOT NULL` with no SQL default;
- monetary amounts are persisted as integer cents;
- semantic BRL authority does not imply a SQL currency default;
- no NULL sentinel or magic default is introduced.

Remaining field-level nullability/default blockers are concentrated in Order child records and partially specified support entities.

## Gate

`FK-NULLABILITY-DEFAULTS = BLOCKED` because FK lifecycle actions and several parent-key/field-level optionality semantics remain UNKNOWN in the authoritative relationship matrix.
