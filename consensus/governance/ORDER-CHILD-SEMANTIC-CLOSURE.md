# Order Child Semantic Closure

Status: **CLOSED — SEMANTIC CONTRACT**

Implementation point: `MVP2 @ 0e1897cae007530cbe8aed20b97e04a25340cc87`.

## Scope

This document closes only the semantic contracts for `OrderItem`, `OrderItemModifier` and `OrderStatusHistory`. No SQL, DDL or migration is defined.

## OrderItem

- Each OrderItem belongs to exactly one Order.
- Parent relation is mandatory; physical key candidate: `order_id`.
- Cardinality: `Order 1:N OrderItem`.
- An Order may exist without items while `DRAFT`; this matches the existing `Order.createDraft()` behavior.
- An OrderItem MUST NOT move between Orders.
- No independent lifecycle is required; mutability follows the containing Order and its confirmation boundary.
- Parent deletion is `RESTRICT`; parent-key update is `RESTRICT`.

## OrderItemModifier

- Each OrderItemModifier belongs to exactly one OrderItem.
- Parent relation is mandatory; physical key candidate: `order_item_id`.
- Cardinality: `OrderItem 1:N OrderItemModifier`.
- `ProductModifier` is an optional catalog reference; physical key candidate: `product_modifier_id`.
- The authoritative commercial representation is the modifier snapshot already defined for the order, not the current catalog row.
- Removing a catalog ProductModifier MUST NOT invalidate an existing order modifier snapshot.
- OrderItemModifier MUST NOT be reparented.
- Parent deletion is `RESTRICT`; parent-key update is `RESTRICT`.
- For an optional ProductModifier reference, catalog deletion may remove only that optional link; it must not remove the order snapshot.

## OrderStatusHistory

- Each history row belongs to exactly one Order.
- Parent relation is mandatory; physical key candidate: `order_id`.
- Cardinality: `Order 1:N OrderStatusHistory`.
- Creating a `DRAFT` Order does not require a history row.
- Each row records one accepted lifecycle transition: `from_state -> to_state` plus the existing transition context fields.
- Current Order state remains the operational authority; history is evidence of transition.
- History is append-only and immutable during normal business operation.
- Ordering follows persisted timestamp; UUIDv7 is the deterministic tie-breaker for equal timestamps.
- Parent deletion is `RESTRICT`; parent-key update is `RESTRICT`.

## Nullability/defaults

- Mandatory parent keys are semantically `NOT NULL`.
- Optional `product_modifier_id` is nullable when no catalog reference exists.
- Relationship fields receive no DEFAULT and no sentinel values.

## Closure

All semantic decisions in this scope are closed. IA-01 may translate them into the canonical physical schema without inventing relationship meaning.
