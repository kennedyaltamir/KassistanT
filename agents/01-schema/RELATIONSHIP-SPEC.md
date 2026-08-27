# IA-01 — Relationship Specification

Status: **PHASE 2 / BLOCKED FOR DDL**

Rule: a relationship is listed only when explicitly stated or mechanically implied by an explicitly named field/entity. Cardinality and delete/update actions remain UNKNOWN unless normatively stated.

| # | Source | Source field | Target | Target field | Cardinality | Optionality | Delete | Update | Index | Status |
|---:|---|---|---|---|---|---|---|---|---|---|
| 1 | Device | `store_id` | Store | `id` | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | REQUIRED candidate from store scoping | PARTIAL |
| 2 | Product | `store_id` | Store | `id` | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | REQUIRED candidate | PARTIAL |
| 3 | Product | `category_id` | ProductCategory | `id` | MANY-to-ONE implied | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | PROPOSED inference |
| 4 | ProductModifier | `store_id` | Store | `id` | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | REQUIRED candidate | PARTIAL |
| 5 | ProductModifier | `product_id` | Product | `id` | MANY-to-ONE implied | UNKNOWN | UNKNOWN | UNKNOWN | REQUIRED candidate | STRONG_INFERENCE |
| 6 | ProductImage | `product_id` | Product | `id` | MANY-to-ONE implied | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | STRONG_INFERENCE |
| 7 | Promotion | `store_id` | Store | `id` | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | REQUIRED candidate | STRONG_INFERENCE |
| 8 | Customer | `store_id` | Store | `id` | MANY-to-ONE implied | UNKNOWN | UNKNOWN | UNKNOWN | REQUIRED_BY_UNIQUE | STRONG_INFERENCE |
| 9 | Conversation | `store_id` | Store | `id` | MANY-to-ONE implied | UNKNOWN | UNKNOWN | UNKNOWN | REQUIRED_BY_UNIQUE | STRONG_INFERENCE |
| 10 | Conversation | `customer_id` | Customer | `id` | MANY-to-ONE implied | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | PARTIAL |
| 11 | Message | `store_id` | Store | `id` | MANY-to-ONE implied | UNKNOWN | UNKNOWN | UNKNOWN | REQUIRED_BY_UNIQUE | STRONG_INFERENCE |
| 12 | Message | `conversation_id` | Conversation | `id` | MANY-to-ONE implied | UNKNOWN | UNKNOWN | UNKNOWN | REQUIRED | STRONG_INFERENCE |
| 13 | Message | `raw_event_reference` | InboundInbox | internal identity | MANY-to-ONE/0..1 implied by reference semantics | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | PARTIAL |
| 14 | Order | `store_id` | Store | `id` | MANY-to-ONE implied | UNKNOWN | UNKNOWN | UNKNOWN | REQUIRED_BY_UNIQUE | STRONG_INFERENCE |
| 15 | Order | `customer_id` | Customer | `id` | MANY-to-ONE implied | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | PARTIAL |
| 16 | Order | `conversation_id` | Conversation | `id` | MANY-to-ONE implied | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | PARTIAL |
| 17 | Order | `address_id` | CustomerAddress | target identity | MANY-to-ONE implied | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | BLOCKED — target key unspecified |
| 18 | Order | `payment_method_id` | PaymentMethod | target identity | MANY-to-ONE implied | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | BLOCKED — target key unspecified |
| 19 | OrderItem | parent reference | Order | `id` | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | BLOCKED — source field not named |
| 20 | OrderItemModifier | parent item reference | OrderItem | target identity | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | BLOCKED — source/target fields not named |
| 21 | OrderItemModifier | modifier reference | ProductModifier | `id` | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | BLOCKED — reference not explicitly named |
| 22 | OrderStatusHistory | parent reference | Order | `id` | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | BLOCKED — source field not named |
| 23 | KnowledgeItem | `store_id` | Store | `id` | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | REQUIRED candidate from scope | PARTIAL |

## Special cases

### OrderItem / OrderItemModifier / OrderStatusHistory
The conceptual hierarchy is documented in the baseline, but the physical parent key names are not. It is not authorized to invent `order_id`, `order_item_id` or equivalent fields during Phase 2.

### DomainOutbox
The absence of a row here is intentional. `DomainOutbox` has cross-boundary semantics under CONTRACT-001. Physical relationships, ownership and any Gateway-side representation remain blocked until the contract is resolved.

### Delete/update behavior
No protected source specifies cascade/restrict/set-null actions for the canonical schema. All actions remain UNKNOWN.
