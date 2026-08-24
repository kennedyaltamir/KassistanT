# IA-01 — Final Schema Closure

Status: **SCHEMA_CLOSURE_BLOCKED**
Implementation point: `0e1897cae007530cbe8aed20b97e04a25340cc87`
Branch: `ia01/schema-closure-20260824`
PR: `#26`

## Closed

- `STOCK-MODEL-MVP-001 = APPROVED_OPTION_A / BINARY_AVAILABILITY`.
- `Sale` is not a canonical persistence entity; `Order.CONFIRMED` is the commercial sale milestone.
- `GOV-DRIFT-0002 = OPTION_B`; Migration 0002 remains historical/non-authoritative and untouched.
- PR #28 closes all Order-child semantics: mandatory parent relations use `RESTRICT/RESTRICT`; optional `product_modifier_id` uses `SET NULL/RESTRICT`; mandatory parent keys are NOT NULL; no relationship defaults/sentinels.
- Canonical physical naming is closed for IA-01 local materialization.
- Product availability is binary: `INTEGER NOT NULL`, allowed `0/1`, no SQL default.

## Residual blockers

1. Canonical authority still leaves `ON DELETE` / `ON UPDATE` UNKNOWN for Customer/Conversation/Message and several Product/Order relationships outside the PR #28 semantic scope.
2. Field-level nullability/default semantics remain incomplete for some supporting entities and Order support relationships.

These are cross-agent semantic-authority blockers, not implementation effort. IA-01 must not invent the missing actions/defaults.

## Gate

`SCHEMA_IMPLEMENTATION_READY = FALSE`

## Truth boundary

`SCHEMA_READY != SCHEMA_IMPLEMENTED != VERIFIED != AUDIT_ACCEPTED != MERGE_AUTHORIZED != PRODUCTION_READY`.

## Next owner

Relevant semantic owners for unresolved FK actions and field-level optionality/defaults.

## Next action

Close the remaining semantic contracts, then rerun IA-01 physical reconciliation. IA-02 must not invent the unresolved schema semantics.