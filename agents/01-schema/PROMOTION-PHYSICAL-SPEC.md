# Promotion — Physical Schema Specification

Status: **BLOCKED**
Implementation point: `MVP2 @ 0e1897cae007530cbe8aed20b97e04a25340cc87`

## Evidence
`CANONICAL-SCHEMA-SPEC.md` lists: `store_id`, `name`, `active`, `start_at`, `end_at`, `type`, `value`, `product_scope`, `minimum_quantity`; semantic types are `FIXED_AMOUNT` and `PERCENTAGE`. Residual semantic closure fixes `promotion.store_id` as `NOT NULL`, required for creation/active state, `RESTRICT/RESTRICT`, immutable store scope.

## Deterministic facts
- Proposed table name: `promotion`.
- `store_id` is required and immutable: `NOT NULL`, `RESTRICT/RESTRICT`.
- Known logical fields: `store_id`, `name`, `active`, `start_at`, `end_at`, `type`, `value`, `product_scope`, `minimum_quantity`.
- Promotion type semantic set: `FIXED_AMOUNT | PERCENTAGE`.
- No SQL CHECK encoding is frozen by the current constraint contract.

## Unresolved physical properties
- Primary identity / unique row identity.
- Requiredness/nullability of non-FK fields.
- Monetary versus percentage physical representation of `value`.
- Physical representation of `product_scope`.
- Nullability and semantics of dates/window fields.
- SQL defaults.
- Entity uniqueness constraints.
- Lifecycle physical encoding beyond the semantic `active` field/date window.

## Why BLOCKED
The schema source supplies a logical field list but not a complete physical identity or deterministic representation of `value` and `product_scope`. Selecting a key, default, JSON representation, or numeric encoding without authority would invent schema.

## Required authority to close
Promotion identity plus complete field-level physical contract, especially `value`, `product_scope`, nullability/defaults and uniqueness.

## Non-scope
No DDL, migration, runtime, or Migration 0002 change.
