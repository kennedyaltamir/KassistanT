# IA-01 — Canonical Physical Schema Specification

Status: **FINAL RECONCILIATION / DDL NOT EXECUTED**
Implementation point: `0e1897cae007530cbe8aed20b97e04a25340cc87`

## Authority

This document is the physical SQLite projection of already approved semantic contracts. It does not authorize SQL execution, migration creation, runtime implementation, merge, or production release.

## Canonical physical naming

- Tables and columns: `lower_snake_case`.
- Primary key: `id`.
- Foreign keys: `<parent>_id`.
- Store scoping: `store_id` where the contract explicitly scopes the entity to a store.
- Timestamps: `created_at`, `updated_at`, UTC persistence.
- Money: integer `*_cents`; currency field `currency`; semantic currency `BRL` without an implicit SQL default.
- Provider identities: `external_*_id`.
- UUID logical identifiers use the project's UUIDv7 convention where supported; SQLite representation is textual UUID.
- Boolean physical representation uses `INTEGER` with a `0/1` constraint where a boolean field is semantically frozen.

## Canonical entities in MVP

The canonical entity inventory remains the 28 approved entities. `Sale` is not a separate persistence entity. `Order.CONFIRMED` is the commercial sale milestone.

## Product

Canonical logical fields:
`id`, `store_id`, `category_id`, `name`, `description`, `price_cents`, `currency`, `available`, `tags`, `created_at`, `updated_at`.

`available` is authoritative binary product availability:
`INTEGER NOT NULL CHECK (available IN (0,1))`, with no SQL default.

## Customer

Canonical identity: `UNIQUE(store_id, phone_normalized)`.
Required identity fields: `id`, `store_id`, `phone_normalized`.

## Conversation

Canonical relationship: `conversation.customer_id -> customer.id` and `UNIQUE(store_id, external_thread_id)`.
Internal `conversation.id` remains distinct from `external_thread_id`.

## Message

Canonical relationship: `message.conversation_id -> conversation.id`.
Inbound provider identity: `UNIQUE(store_id, external_message_id)`.

## Order

Canonical logical fields include:
`id`, `store_id`, `display_number`, `customer_id`, `conversation_id`, `lifecycle_state`, `subtotal_cents`, `discount_cents`, `delivery_fee_cents`, `total_cents`, `currency`, `delivery_type`, `address_id`, `payment_method_id`, `notes`, `created_at`, `updated_at`.

Order lifecycle remains:
`DRAFT | CONFIRMED | IN_PRODUCTION | READY | OUT_FOR_DELIVERY | DELIVERED | CANCELLED`.
`CONFIRMED` is the commercial sale milestone.

## OrderItem

- `id`
- `order_id NOT NULL`
- `product_name_snapshot`
- `unit_price_cents_snapshot`
- `quantity`
- `subtotal_cents`

FK: `order_id -> order.id`, `ON DELETE RESTRICT`, `ON UPDATE RESTRICT`.

## OrderItemModifier

- `id`
- `order_item_id NOT NULL`
- `product_modifier_id NULLABLE`
- `modifier_name_snapshot`
- `unit_price_cents_snapshot`
- `quantity`
- `subtotal_cents`

FKs:
- `order_item_id -> order_item.id`, `RESTRICT/RESTRICT`.
- `product_modifier_id -> product_modifier.id`, `SET NULL/RESTRICT`.

The snapshot is authoritative for an existing order; the catalog reference is optional and non-authoritative.

## OrderStatusHistory

- `id`
- `order_id NOT NULL`
- `from_state`
- `to_state`
- `reason`
- `actor`
- `timestamp`

FK: `order_id -> order.id`, `RESTRICT/RESTRICT`.
History is append-only, immutable during normal business operation, and evidentiary rather than authoritative for current Order state.

## DomainOutbox

Domain defines event intent; IA-03 owns durable outbox mechanics and worker. Physical implementation remains governed by the resolved CONTRACT-001 semantics. No provider-specific business fields are introduced by IA-01.

## InboundInbox

Canonical uniqueness: `UNIQUE(provider, external_event_id)`.

## Index policy

Only contract-required unique constraints are currently mandatory. Performance-only indexes are not inferred from foreseeable queries.

## Nullability/default rules

- Identity fields: NOT NULL.
- Closed mandatory parent keys: NOT NULL.
- Optional `product_modifier_id`: NULLABLE.
- No relationship DEFAULT or sentinel.
- No SQL DEFAULT inferred from semantic conventions.
- `Product.available`: NOT NULL, `0/1`, no default.

## Remaining authority blockers

The following are not closed by PR #28 and therefore must not be invented:

- `ON DELETE` / `ON UPDATE` semantics for Customer/Conversation/Message and remaining Product/Order relationships outside the closed Order-child scope.
- Complete field-level nullability/default semantics for unresolved supporting entities and relationships.

These are semantic-owner blockers for the global `SCHEMA_IMPLEMENTATION_READY` gate.

## Migration boundary

Migration `0001` and `0002_c1_product_order.sql` remain historical artifacts for this cycle. `0002` is `NON_AUTHORITATIVE_HISTORICAL_ARTIFACT` under GOV-DRIFT-0002 Option B. No migration was created, altered, renamed, executed, or replaced.

## Readiness

`SCHEMA_IMPLEMENTATION_READY = FALSE` until the remaining semantic-owner blockers above are explicitly closed.

`SCHEMA_IMPLEMENTATION_READY != SCHEMA_IMPLEMENTED != VERIFIED != AUDIT_ACCEPTED != MERGE_AUTHORIZED`.