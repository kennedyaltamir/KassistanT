# ProductCategory — Physical Schema Specification

Status: **BLOCKED**
Implementation point: `MVP2 @ 0e1897cae007530cbe8aed20b97e04a25340cc87`

## Evidence
- Canonical entity exists: `ProductCategory`.
- `docs/domain/entities.md` explicitly states that detailed field schemas remain PARTIAL.
- IA-01 `CANONICAL-SCHEMA-SPEC.md` lists `product_category` but provides no explicit logical field set for the entity.
- `ENTITY-PHYSICAL-MAP.md` classifies `ProductCategory` as `BLOCKED` by `FIELD-GAPS`.
- `CONSTRAINT-SPEC.md` states that physical PK identity is not frozen for canonical entities.

## Deterministic facts
- Proposed physical table name: `product_category` (mechanical name only; not independently normative).
- It is the target of `product.category_id`.
- `product.category_id` is already semantically closed as nullable with `SET NULL/RESTRICT`; this decision is not reopened.

## Unresolved physical properties
- Identity / primary key definition.
- Complete field inventory.
- Required fields.
- Field nullability.
- SQL defaults.
- Entity-level uniqueness beyond the already closed Product -> Category FK.
- Timestamp fields.
- Lifecycle representation.

## Why BLOCKED
No authoritative source in the audited evidence set defines the missing physical field model or identity. Assigning `id`, `name`, timestamps, defaults, or a uniqueness rule would be invention.

## Required authority to close
A normative ProductCategory field/identity contract must define the missing physical properties. IA-01 can then materialize the SQLite representation without reopening `Product.category_id` semantics.

## Non-scope
No DDL, migration, runtime, or modification of Migration 0002.
