# Sale — Canonical Contract

Status: **CLOSED_FOR_MVP_PHYSICAL_SCHEMA**

## Canonical interpretation

The approved MVP does not define a separate `Sale` persistence entity.

`Order` is the authoritative persisted commercial record and `Order.lifecycle_state = CONFIRMED` is the operational sale milestone. The canonical entity inventory contains `Order` and related order records, but no `Sale` entity/table. fileciteturn190file0

## Physical consequence

No `sale` table is introduced by the MVP schema.

No `sale.id`, `sale.order_id`, `sale.customer_id` or duplicated sale monetary snapshot is required.

The authoritative monetary values remain on `Order`:

- `subtotal_cents`
- `discount_cents`
- `delivery_fee_cents`
- `total_cents`
- `currency`

with integer cents / BRL semantics. fileciteturn187file0

## Relationship consequence

No `Order -> Sale` FK exists because no separate Sale entity exists in the canonical MVP schema.

Customer and store relationships remain represented through `Order.customer_id` and `Order.store_id`.

## Operational consequence

A confirmed Order is the persisted sale milestone. This does not create a second persistence aggregate.

## Non-scope

- separate Sale aggregate
- separate Sale lifecycle
- duplicated Sale monetary snapshot
- `UNIQUE(store_id, order_id)` on a Sale table
- Sale-specific migration

## Boundary

This closes the physical Sale question for the MVP without introducing new business semantics. It does not implement the Order runtime or the confirmation flow.
