# Product / Order — Canonical Physical Model

Status: **PARTIALLY_CLOSED / DDL_PENDING**

## Authoritative semantics

- Money uses integer cents / BRL.
- Product and Order are store-scoped where explicitly documented.
- Order lifecycle includes `DRAFT`, `CONFIRMED`, `IN_PRODUCTION`, `READY`, `OUT_FOR_DELIVERY`, `DELIVERED`, `CANCELLED`.
- OrderItem and OrderItemModifier are Order-owned records according to current domain evidence.
- `CONFIRMED` is the operational sale milestone.

## Historical physical evidence

Migration `0002_c1_product_order.sql` currently uses:

- Product: `price_amount_cents`, `price_currency`.
- Order: `total_amount_cents`, `total_currency`.
- OrderItem: `unit_price_cents`, `unit_price_currency`.
- OrderItemModifier: `price_cents`, `price_currency`.

This physical shape is **historical/non-authoritative** and cannot be promoted verbatim.

## Canonical logical mapping

| Logical concept | Historical physical field | Canonical status |
|---|---|---|
| Product price cents | `price_amount_cents` | SEMANTICALLY EQUIVALENT; canonical physical name not frozen |
| Product currency | `price_currency` | SEMANTICALLY EQUIVALENT; canonical physical name not frozen |
| Order total cents | `total_amount_cents` | SEMANTICALLY EQUIVALENT; canonical physical name not frozen |
| Order currency | `total_currency` | SEMANTICALLY EQUIVALENT; canonical physical name not frozen |
| Item unit price snapshot | `unit_price_cents` | SEMANTICALLY EQUIVALENT; snapshot semantics must remain immutable at order time |
| Item modifier price snapshot | `price_cents` | SEMANTICALLY EQUIVALENT; snapshot semantics must remain immutable at order time |

## Closure limitation

A single physical naming convention still must be selected as a local schema decision before deterministic DDL. Nullability/defaults and FK actions also remain open. IA-01 does not create compatibility aliases or duplicate columns.
