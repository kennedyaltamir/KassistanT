# IA-01 — Final Schema Closure

Status: **SCHEMA_IMPLEMENTATION_READY**
Implementation point: `0e1897cae007530cbe8aed20b97e04a25340cc87`
Branch: `ia01/schema-closure-20260824`
PR: `#26`

## Closure evidence

- `STOCK-MODEL-MVP-001 = APPROVED_OPTION_A / BINARY_AVAILABILITY`.
- `Sale` is not a canonical persistence entity; `Order.CONFIRMED` is the commercial sale milestone.
- `GOV-DRIFT-0002 = OPTION_B`; Migration 0002 remains historical/non-authoritative and untouched.
- PR #28 closes Order child semantics and FK actions: mandatory commercial parents use `RESTRICT/RESTRICT`; optional `product_modifier_id` uses `SET NULL/RESTRICT`; mandatory parent keys are NOT NULL; no relationship defaults/sentinels.
- Canonical physical naming is closed for IA-01 materialization: `lower_snake_case`, `id`, `<parent>_id`, `store_id`, `created_at`/`updated_at`, `*_cents`, `currency`, `external_*_id`.
- Product availability is binary and deterministic: `INTEGER`, `NOT NULL`, allowed `0/1`, no SQL default.
- Product/Order historical 0002 fields are mapped to the single canonical logical representation; historical aliases are not retained as duplicate physical fields.
- No runtime, SQL execution, migration creation, or Migration 0002 modification occurred.

## Gate

All schema-closure conditions required by the mandate are satisfied for IA-02 implementation against the documented canonical physical contract.

`SCHEMA_IMPLEMENTATION_READY = TRUE`

## Truth boundary

`SCHEMA_IMPLEMENTATION_READY != SCHEMA_IMPLEMENTED != VERIFIED != AUDIT_ACCEPTED != MERGE_AUTHORIZED != PRODUCTION_READY`.

## Next owner

`IA-02`

## Next action

Implement the Core against this canonical schema contract without inventing alternate table names, parent keys, FK actions, stock quantities, Sale table semantics, or migration behavior.