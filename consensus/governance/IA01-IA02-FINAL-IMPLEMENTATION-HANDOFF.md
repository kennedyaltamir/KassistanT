# IA-01 → IA-02 Final Schema Handoff

Status: **SCHEMA_CLOSURE_BLOCKED**
Implementation point: `0e1897cae007530cbe8aed20b97e04a25340cc87`
Branch: `ia01/schema-closure-20260824`
PR: `#26`

## Closed for IA-02

- Canonical physical naming.
- Product binary availability.
- Product/Order logical money representation.
- OrderItem `order_id` parent key and `RESTRICT/RESTRICT`.
- OrderItemModifier `order_item_id` and optional `product_modifier_id` with `RESTRICT/RESTRICT` and `SET NULL/RESTRICT` respectively.
- OrderStatusHistory `order_id` with `RESTRICT/RESTRICT`, append-only semantics.
- Sale represented by Order; `CONFIRMED` is the commercial sale milestone.
- Migration policy `PRESERVE + APPEND LATER`.

## Remaining blockers

1. FK delete/update actions outside the PR #28 Order-child scope remain UNKNOWN in the authoritative relationship specification.
2. Complete field-level nullability/default semantics for remaining supporting entities are not frozen.

## Instruction to IA-02

Do not invent the remaining FK actions, defaults, or optionality. Do not create a Sale table, quantitative inventory, or alternate physical aliases. Implement only after the remaining semantic-owner contracts are closed.

## Truth boundary

`SCHEMA_READY != SCHEMA_IMPLEMENTED != VERIFIED != AUDIT_ACCEPTED != MERGE_AUTHORIZED`.