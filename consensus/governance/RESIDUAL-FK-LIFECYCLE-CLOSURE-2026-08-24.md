# Residual FK / Nullability / Lifecycle Closure

Protocol: `KASSIST-RESIDUAL-SEMANTICS` v1.0.0
Effective: 2026-08-24
Baseline: `MVP2 @ 0e1897cae007530cbe8aed20b97e04a25340cc87`
Authority: semantic owners within the mandate scope
Status: `SEMANTIC_CLOSED` for all listed relations

## Decision register

| Decision ID | Relation | Owner | Nullable | Required state | ON DELETE | ON UPDATE | Lifecycle | Rationale |
|---|---|---|---|---|---|---|---|---|
| SCHEMA-CONV-CUSTOMER-001 | `conversation.customer_id -> customer.id` | CUSTOMER_CONVERSATION_SEMANTIC_OWNER | NO | Required at Conversation creation; remains required in all lifecycle states | RESTRICT | RESTRICT | Customer association is immutable for the lifetime of the Conversation; `OPEN/CLOSED` changes do not detach the Customer | Conversation identity is customer-bound by the frozen Customer 1:N Conversation contract; detaching the parent would destroy historical ownership meaning |
| SCHEMA-MESSAGE-CONVERSATION-001 | `message.conversation_id -> conversation.id` | CUSTOMER_CONVERSATION_MESSAGE_SEMANTIC_OWNER | NO | Required at Message creation; remains required in all Message lifecycle states | RESTRICT | RESTRICT | Parent binding is immutable; Message lifecycle changes (`RECEIVED` through terminal/error states) never reparent the Message | A Message is evidence inside one Conversation; reparenting or automatic detachment would change historical meaning |
| SCHEMA-PRODUCT-STORE-001 | `product.store_id -> store.id` | PRODUCT_SEMANTIC_OWNER | NO | Required for Product creation and required for Product validity/activation | RESTRICT | RESTRICT | Store tenancy is immutable for the Product lifetime; Product cannot migrate between Stores through FK mutation | Product is explicitly store-scoped; cross-store reassignment would violate tenant identity and uniqueness boundaries |
| SCHEMA-PRODUCT-MODIFIER-PRODUCT-001 | `product_modifier.product_id -> product.id` | PRODUCT_SEMANTIC_OWNER | NO | Required for ProductModifier creation; not a separate Product activation prerequisite | RESTRICT | RESTRICT | Modifier remains bound to its Product; no reparenting | A ProductModifier is a child catalog object of one Product and has no independent parent identity |
| SCHEMA-PRODUCT-MODIFIER-STORE-001 | `product_modifier.store_id -> store.id` | PRODUCT_SEMANTIC_OWNER | NO | Required for ProductModifier creation and required for its validity/activation | RESTRICT | RESTRICT | Store tenancy is immutable; no cross-store reassignment | ProductModifier is explicitly store-scoped and must not escape its owning Store boundary |
| SCHEMA-PRODUCT-IMAGE-PRODUCT-001 | `product_image.product_id -> product.id` | PRODUCT_SEMANTIC_OWNER | NO | Required for ProductImage creation; not a Product activation prerequisite | RESTRICT | RESTRICT | Image remains attached to one Product; no reparenting | ProductImage is a dependent representation of a Product; detachment would leave an unowned canonical image record |
| SCHEMA-PROMOTION-STORE-001 | `promotion.store_id -> store.id` | PRODUCT_SEMANTIC_OWNER | NO | Required for Promotion creation and required for an active Promotion | RESTRICT | RESTRICT | Store tenancy is immutable; promotion lifecycle (`active`/date window) does not alter Store ownership | Promotion is explicitly store-scoped; cross-store reassignment would violate tenant isolation |
| SCHEMA-ORDER-STORE-001 | `order.store_id -> store.id` | ORDER_SEMANTIC_OWNER | NO | Required for Order creation and confirmation | RESTRICT | RESTRICT | Store association is immutable for the entire Order lifecycle | Store scope is explicit on Order and participates in its canonical display-number uniqueness boundary |
| SCHEMA-ORDER-CONVERSATION-001 | `order.conversation_id -> conversation.id` | ORDER_SEMANTIC_OWNER | YES | Not required for DRAFT creation or confirmation; association is contextual/traceability-only when present | RESTRICT | RESTRICT | Optional association may be assigned only while the Order is mutable; confirmed meaning does not change by conversation lifecycle | The documented CreateDraftOrder contract requires order/customer/store context but does not require a Conversation. The field therefore remains optional while preserving historical traceability once set |
| SCHEMA-PC-001 | `product.category_id -> product_category.id` | PRODUCT_CATEGORY_SEMANTIC_OWNER | YES | Not required for creation or publication | SET NULL | RESTRICT | Mutable classification while Product exists | Already closed by PR #29; this record only registers that no reopening occurs |

## Defaults and sentinel policy

All relations above use **no default** and **no sentinel value**. Nullability represents the semantic absence of an optional relationship only; it does not encode state-machine values.

## Owner conflict status

No conflict found across the decisions in this scope. No decision reopens Customer identity, Conversation identity/cardinality, Message identity, ProductCategory semantics, Order child semantics, Stock or Sale semantics.

## Schema impact

These are semantic contracts only. IA-01 may materialize the approved nullability and FK actions in the canonical SQLite schema. This record does not define SQL, migration ordering, runtime behavior, triggers, or physical defaults.

## Non-scope

- No schema mutation.
- No migration creation or execution.
- No modification of Migration 0002.
- No runtime implementation.
- No frontend changes.
- No changes to OrderItem, OrderItemModifier or OrderStatusHistory semantics already closed by PR #28.

## Evidence

- `agents/01-schema/RELATIONSHIP-SPEC.md` lists the residual relationships and explicitly marks nullability/FK actions as unresolved rather than assigning them by convention.
- `agents/01-schema/CANONICAL-SCHEMA-SPEC.md` states that required/optional semantics and FK actions must be closed by semantic owners before DDL is frozen, and that no blanket `NOT NULL` or default policy may be inferred.
- `docs/domain/entities.md` defines the 28 canonical entities and states that detailed field schemas may remain partial.
- `docs/domain/state-machines.md` defines Conversation and Message lifecycle value sets and rejects invalid transitions.
- `consensus/governance/CUSTOMER-CONVERSATION-MESSAGE-DECISION-PACKAGE.md` freezes Customer 1:N Conversation identity/cardinality and inbound Message uniqueness.
- PR #29 closes `Product.category_id`, `Order.customer_id`, `Order.address_id` and `Order.payment_method_id`, with no additional Order support relation promoted.
- PR #28 closes OrderItem/OrderItemModifier/OrderStatusHistory semantics and explicitly preserves the IA-01 physical realization boundary.
