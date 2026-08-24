# Product / Order — Canonical Physical Model

Status: **PARTIALLY_CLOSED / PHYSICAL NAMING + FK DETAIL PENDING**

## Authoritative semantics

- Money uses integer cents / BRL.
- Product and Order are store-scoped where explicitly documented.
- Product availability is the authoritative binary stock state.
- Order lifecycle includes `DRAFT`, `CONFIRMED`, `IN_PRODUCTION`, `READY`, `OUT_FOR_DELIVERY`, `DELIVERED`, `CANCELLED`.
- `CONFIRMED` is the operational sale milestone.
- OrderItem and OrderItemModifier retain order-time price snapshots.

## Historical physical evidence

Migration `0002_c1_product_order.sql` uses historical names such as `price_amount_cents`, `price_currency`, `total_amount_cents` and `total_currency`.

These are semantic evidence only. Migration 0002 remains non-authoritative and is not used as the canonical naming source.

## Canonical logical-to-physical mapping

| Concept | Historical field | Canonical physical candidate | Status |
|---|---|---|---|
| Product price cents | `price_amount_cents` | `price_cents` | DETERMINISTIC semantic mapping |
| Product currency | `price_currency` | `currency` | DETERMINISTIC semantic mapping |
| Product availability | historical availability field | `available` | DETERMINISTIC |
| Order total cents | `total_amount_cents` | `total_cents` | DETERMINISTIC semantic mapping |
| Order currency | `total_currency` | `currency` | DETERMINISTIC semantic mapping |
| OrderItem unit price snapshot | `unit_price_cents` | `unit_price_cents_snapshot` | DETERMINISTIC semantic mapping |
| OrderItemModifier price snapshot | `price_cents` | `unit_price_cents_snapshot` | DETERMINISTIC semantic mapping |

The canonical logical names are derived from the current schema specification and domain entity contract. No duplicate compatibility columns are introduced.

## Money

SQLite representation:

- monetary amount: `INTEGER` cents
- currency semantic authority: `BRL`
- no SQL currency default is inferred solely from the semantic convention

## Availability

Product availability is implemented physically as `product.available INTEGER NOT NULL` constrained to `0/1`. No quantitative inventory table is required by `STOCK-MODEL-MVP-001`.

## Remaining blockers

1. Repository schema authority still classifies table/column naming as a local proposal requiring operator confirmation before it becomes repository-wide physical convention.
2. Order child parent-key names remain blocked by the semantic owner matrix.
3. FK delete/update actions remain UNKNOWN and cannot be copied from historical Migration 0002.
4. Final field-level nullability/defaults for Order and child records remain incomplete.

No runtime or migration is introduced by this document.
