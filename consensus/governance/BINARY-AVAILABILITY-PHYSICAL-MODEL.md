# Binary Availability — Physical Model

Status: **DETERMINISTIC**
Authority: `STOCK-MODEL-MVP-001 = APPROVED_OPTION_A`

## Canonical meaning

MVP stock semantics are binary product availability only:

- `AVAILABLE`
- `UNAVAILABLE`

No quantitative stock balance exists in the MVP.

## Physical representation

Canonical logical field:

`product.available`

Recommended SQLite representation:

- type: `INTEGER`
- allowed values: `0` / `1`
- nullability: `NOT NULL`
- SQL default: **NONE**

The absence of an SQL default is intentional: product creation must provide an explicit availability state rather than silently manufacturing business state.

## Scope

`available` belongs to `Product` and is therefore store-scoped through `Product.store_id`.

No separate quantitative `inventory` table is required for this MVP decision.

No `inventory_movement` table is required for the MVP stock model.

## Exclusions

- `quantity_on_hand`
- quantitative stock ledger
- movement quantities
- stock reservations
- quantitative overselling control
- quantitative stock idempotency/concurrency

## Readiness

The binary-availability physical surface is deterministic for schema handoff. This does not authorize runtime implementation or migration execution.
