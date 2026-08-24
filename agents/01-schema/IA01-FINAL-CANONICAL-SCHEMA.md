# IA-01 Final Canonical Schema

Status: **SCHEMA_RECONCILED / DDL NOT EXECUTED**
Implementation point: `MVP2 @ 0e1897cae007530cbe8aed20b97e04a25340cc87`
Semantic source: `semantic-owner/residual-fk-lifecycle-closure-20260824 @ 6a308b86820ed8dc6a5779f5a1e9efb121faed05`
Schema version: `KASSIST-SCHEMA-MVP2-2026-08-24`

## Authority

This document is the final physical projection for the schema slice covered by the approved contracts. It does not execute DDL, create a migration, mutate Migration 0002, or implement runtime.

## Physical conventions

- SQLite.
- `lower_snake_case` table and column names.
- Primary identity column: `id`.
- Foreign keys: `<parent>_id`.
- UUID logical identity: UUIDv7 convention where supported; SQLite representation `TEXT`.
- Persisted timestamps: UTC text.
- Money: integer `*_cents`; no floating-point financial authority.
- Boolean fields: `INTEGER` constrained to `0/1` when semantically frozen.
- No implicit SQL defaults from semantic conventions.
- No sentinel values.

## Canonical entities and closed physical relationships

### Customer
`customer(id, store_id, phone_normalized, ...)`

Canonical identity: `UNIQUE(store_id, phone_normalized)`.

### Conversation
`conversation(id, store_id, customer_id, external_thread_id, lifecycle_state, ownership, ai_state, unread_count, created_at, updated_at, ...)`

- `customer_id NOT NULL` -> `customer.id` `ON DELETE RESTRICT ON UPDATE RESTRICT`.
- Customer association is immutable.
- `UNIQUE(store_id, external_thread_id)`.

### Message
`message(id, store_id, conversation_id, external_message_id, direction, sender_type, message_type, text, media_reference, reply_reference, raw_event_reference, lifecycle_state, provider_status, provider_error, correlation_id, causation_id, created_at, updated_at, ...)`

- `conversation_id NOT NULL` -> `conversation.id` `ON DELETE RESTRICT ON UPDATE RESTRICT`.
- Parent binding is immutable.
- `UNIQUE(store_id, external_message_id)` for inbound provider messages.

### Product
`product(id, store_id, category_id, name, description, price_cents, currency, available, tags, created_at, updated_at)`

- `store_id NOT NULL` -> `store.id` `RESTRICT/RESTRICT`.
- `category_id NULLABLE` -> `product_category.id` `SET NULL/RESTRICT`.
- `available NOT NULL`, allowed values `0|1`, no default.

### ProductModifier
`product_modifier(id, store_id, product_id, name, price_cents, available, min_quantity, max_quantity, ...)`

- `store_id NOT NULL` -> `store.id` `RESTRICT/RESTRICT`.
- `product_id NOT NULL` -> `product.id` `RESTRICT/RESTRICT`.
- No reparenting.

### ProductImage
`product_image(product_id NOT NULL, file_path, mime_type, dimensions, checksum, ...)`

- `product_id NOT NULL` -> `product.id` `RESTRICT/RESTRICT`.
- No independent unowned canonical image row is authorized.

### Promotion
`promotion(store_id NOT NULL, name, active, start_at, end_at, type, value, product_scope, minimum_quantity, ...)`

- `store_id NOT NULL` -> `store.id` `RESTRICT/RESTRICT`.
- Store ownership is immutable.

### Order
`order(id, store_id, display_number, customer_id, conversation_id, lifecycle_state, subtotal_cents, discount_cents, delivery_fee_cents, total_cents, currency, delivery_type, address_id, payment_method_id, notes, created_at, updated_at)`

- `store_id NOT NULL` -> `store.id` `RESTRICT/RESTRICT`.
- `customer_id`: nullable in DRAFT; required at CONFIRMED; `RESTRICT/RESTRICT`.
- `conversation_id`: nullable; not required for DRAFT or CONFIRMED; `RESTRICT/RESTRICT`; contextual traceability relationship.
- `address_id`: nullable in DRAFT; required for delivery confirmation; snapshot at confirmation; `SET NULL/RESTRICT` after snapshot preservation.
- `payment_method_id`: nullable in DRAFT; required at confirmation; `RESTRICT/RESTRICT`; frozen commercial meaning at confirmation.
- lifecycle: `DRAFT | CONFIRMED | IN_PRODUCTION | READY | OUT_FOR_DELIVERY | DELIVERED | CANCELLED`.
- `CONFIRMED` is the commercial sale milestone.
- `UNIQUE(store_id, display_number)`.

### OrderItem
`order_item(id, order_id NOT NULL, product_name_snapshot, unit_price_cents_snapshot, quantity, subtotal_cents, ...)`

- `order_id` -> `order.id` `RESTRICT/RESTRICT`.
- Order may be DRAFT with zero items.
- No reparenting.

### OrderItemModifier
`order_item_modifier(id, order_item_id NOT NULL, product_modifier_id NULLABLE, modifier_name_snapshot, unit_price_cents_snapshot, quantity, subtotal_cents, ...)`

- `order_item_id` -> `order_item.id` `RESTRICT/RESTRICT`.
- `product_modifier_id` -> `product_modifier.id` `SET NULL/RESTRICT`.
- Snapshot is authoritative; catalog reference is non-authoritative.

### OrderStatusHistory
`order_status_history(id, order_id NOT NULL, from_state, to_state, reason, actor, timestamp, ...)`

- `order_id` -> `order.id` `RESTRICT/RESTRICT`.
- Append-only evidence; current `order.lifecycle_state` remains authoritative.
- Initial DRAFT creation does not require a history row.

## Frozen uniqueness surfaces

1. `UNIQUE(store_id, phone_normalized)` — Customer.
2. `UNIQUE(store_id, external_thread_id)` — Conversation.
3. `UNIQUE(store_id, external_message_id)` — Message inbound provider identity.
4. `UNIQUE(provider, external_event_id)` — InboundInbox.
5. `UNIQUE(idempotency_key)` — DomainOutbox.
6. `UNIQUE(store_id, display_number)` — Order.
7. `UNIQUE(store_id, id)` — Device.

## Scope boundary

The canonical inventory remains 28 entities. Detailed fields that are still explicitly PARTIAL in the approved source remain outside the frozen physical slice and are not invented here. IA-01 does not blanket-add `store_id`, defaults, status values, or FK actions to entities without authoritative field semantics.

## Non-authoritative history

`apps/desktop/database/migrations/0002_c1_product_order.sql` remains a historical/non-authoritative artifact under GOV-DRIFT-0002. It is preserved and not rewritten, renamed, deleted, executed, or used as semantic authority.
