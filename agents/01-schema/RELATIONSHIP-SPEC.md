# IA-01 — Relationship Specification

Status: **POST-DECISION RECONCILIATION / DDL PARTIAL**

Rule: a relationship is listed only when explicitly stated or mechanically implied by an explicitly named field/entity. Cardinality and delete/update actions remain UNKNOWN unless normatively stated.

| # | Source | Source field | Target | Target field | Cardinality | Optionality | Delete | Update | Index | Status |
|---:|---|---|---|---|---|---|---|---|---|---|
| 1 | Device | `store_id` | Store | `id` | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | REQUIRED candidate | PARTIAL |
| 2 | Product | `store_id` | Store | `id` | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | REQUIRED candidate | PARTIAL |
| 3 | Product | `category_id` | ProductCategory | `id` | MANY-to-ONE implied | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | PROPOSED inference |
| 4 | ProductModifier | `store_id` | Store | `id` | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | REQUIRED candidate | PARTIAL |
| 5 | ProductModifier | `product_id` | Product | `id` | MANY-to-ONE implied | UNKNOWN | UNKNOWN | UNKNOWN | REQUIRED candidate | STRONG_INFERENCE |
| 6 | ProductImage | `product_id` | Product | `id` | MANY-to-ONE implied | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | STRONG_INFERENCE |
| 7 | Promotion | `store_id` | Store | `id` | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | REQUIRED candidate | STRONG_INFERENCE |
| 8 | Customer | `store_id` | Store | `id` | MANY-to-ONE implied | UNKNOWN | UNKNOWN | UNKNOWN | REQUIRED_BY_UNIQUE | RECONCILED |
| 9 | Conversation | `store_id` | Store | `id` | MANY-to-ONE implied | UNKNOWN | UNKNOWN | UNKNOWN | REQUIRED_BY_UNIQUE | RECONCILED |
| 10 | Conversation | `customer_id` | Customer | `id` | MANY-to-ONE | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | RECONCILED_CARDINALITY / PHYSICAL_PARTIAL |
| 11 | Message | `store_id` | Store | `id` | MANY-to-ONE implied | UNKNOWN | UNKNOWN | UNKNOWN | REQUIRED_BY_UNIQUE | RECONCILED |
| 12 | Message | `conversation_id` | Conversation | `id` | MANY-to-ONE | UNKNOWN | UNKNOWN | UNKNOWN | REQUIRED | RECONCILED |
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
| 23 | KnowledgeItem | `store_id` | Store | `id` | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | REQUIRED candidate | PARTIAL |

## Approved identity/cardinality reconciliation

Customer identity is canonically scoped by `(store_id, phone_normalized)`. Conversation ownership is `Customer 1:N Conversation`, with internal `Conversation.id` distinct from `external_thread_id` and uniqueness scoped by `(store_id, external_thread_id)`. Message inbound provider idempotency is scoped by `(store_id, external_message_id)`.

## DomainOutbox

CONTRACT-001 is resolved. The prior statement that DomainOutbox was blocked by unresolved ownership is historical. Current semantics are:

- Domain owns event intent.
- IA-03 owns durable Outbox mechanics and delivery worker.
- Business state and outbox intent share the required atomic transaction boundary where applicable.
- Provider invocation follows durable intent.

Physical relationships and FK actions remain implementation-level and are not inferred here.

## Delete/update behavior

No protected source specifies cascade/restrict/set-null actions for the canonical schema. All actions remain UNKNOWN until semantically authorized.
