# ProductImage — Physical Schema Specification

Status: **BLOCKED**
Implementation point: `MVP2 @ 0e1897cae007530cbe8aed20b97e04a25340cc87`

## Evidence
`CANONICAL-SCHEMA-SPEC.md` defines the logical fields `product_id`, `file_path`, `mime_type`, `dimensions`, `checksum`. `RELATIONSHIP-SPEC.md` defines `product_image.product_id -> product.id` as a many-to-one implied relationship. `ENTITY-PHYSICAL-MAP.md` explicitly marks `ProductImage` blocked by key detail.

## Deterministic facts
- Proposed table name: `product_image`.
- `product_id` is required and semantically closed: `NOT NULL`, `RESTRICT/RESTRICT`.
- Known logical fields: `product_id`, `file_path`, `mime_type`, `dimensions`, `checksum`.
- No independent ProductImage lifecycle semantics are currently frozen.

## Unresolved physical properties
- Primary identity / unique row identity.
- Whether an `id` field is authorized.
- Whether the identity is a composite key.
- Required/optional status for `file_path`, `mime_type`, `dimensions`, `checksum`.
- Timestamp fields and their requirement.
- Uniqueness/checksum constraints.
- Lifecycle representation.
- SQL defaults.

## Why BLOCKED
The hard rule forbids inventing an `id` or composite key. No authoritative contract supplies an alternative identity. Therefore a DDL-ready table cannot be produced without a new normative identity decision.

## Required authority to close
A ProductImage identity contract plus complete field/nullability/timestamp semantics. The existing `product_id` FK decision must remain unchanged.

## Non-scope
No DDL, migration, runtime, or Migration 0002 change.
