# CustomerAddress — Physical Schema Specification

Status: **BLOCKED**
Implementation point: `MVP2 @ 0e1897cae007530cbe8aed20b97e04a25340cc87`

## Evidence
`CANONICAL-SCHEMA-SPEC.md` includes `CustomerAddress` in the canonical inventory but explicitly says its detailed field schema is partial. `RELATIONSHIP-SPEC.md` records `Order.address_id -> CustomerAddress` but marks the target identity as unspecified. PR #29 closes the Order.address_id lifecycle semantics without defining the CustomerAddress physical identity.

## Deterministic facts
- Proposed table name: `customer_address`.
- Order reference target exists conceptually as `CustomerAddress`.
- `Order.address_id` remains nullable in DRAFT and required for delivery confirmation when applicable; confirmed commercial address is snapshotted. This prior decision is not reopened.

## Unresolved physical properties
- CustomerAddress primary identity.
- Explicit CustomerAddress -> Customer relationship and FK semantics.
- Complete address field inventory.
- Required fields and nullability.
- SQL defaults.
- Timestamps.
- Uniqueness.
- Lifecycle semantics.
- Exact physical relationship between reusable address record and confirmed Order snapshot.

## Why BLOCKED
The repository does not define the target identity or complete field model. The semantic Order.address_id decision intentionally leaves the target field schema partial. Inventing `id`, `customer_id`, address components, defaults or deletion behavior would extend the approved domain contract.

## Required authority to close
A CustomerAddress entity contract must define identity, customer ownership relation, fields, nullability/defaults and lifecycle. The existing Order.address_id contract must remain unchanged.

## Non-scope
No DDL, migration, runtime, address versioning subsystem, or Migration 0002 change.
