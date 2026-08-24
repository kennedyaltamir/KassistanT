# Product / Order — Final Physical Reconciliation

Status: **CLOSED**
Implementation point: `0e1897cae007530cbe8aed20b97e04a25340cc87`

## Canonical representation

- Product: `id`, `store_id`, `category_id`, `name`, `description`, `price_cents`, `currency`, `available`, `tags`, timestamps.
- Order: `id`, `store_id`, `display_number`, `customer_id`, `conversation_id`, `lifecycle_state`, `subtotal_cents`, `discount_cents`, `delivery_fee_cents`, `total_cents`, `currency`, `delivery_type`, `address_id`, `payment_method_id`, `notes`, timestamps.
- OrderItem: `id`, `order_id`, `product_name_snapshot`, `unit_price_cents_snapshot`, `quantity`, `subtotal_cents`.
- OrderItemModifier: `id`, `order_item_id`, optional `product_modifier_id`, `modifier_name_snapshot`, `unit_price_cents_snapshot`, `quantity`, `subtotal_cents`.
- OrderStatusHistory: `id`, `order_id`, `from_state`, `to_state`, `reason`, `actor`, `timestamp`.

## Money

All persisted money amounts are integer cents and currency is `BRL`. Historical 0002 names such as `price_amount_cents`, `total_amount_cents`, and snapshot aliases are semantic evidence only; they are not canonical duplicate columns.

## Sale

No separate `sale` table is introduced. `Order.CONFIRMED` remains the operational commercial sale milestone.

## Stock

`Product.available` is the authoritative binary availability state. Quantitative inventory is post-MVP.

## Migration

Migration `0002_c1_product_order.sql` remains `NON_AUTHORITATIVE_HISTORICAL_ARTIFACT` and is not modified or executed.