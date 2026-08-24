# IA-01 Physical Entity Handoff

Protocol: `KASSIST-PHYSICAL-ENTITY-CLOSURE` v1.0.0
Status: **PHYSICAL_ENTITY_SCHEMA_READY = FALSE**

## Baseline
- Repository: `kennedyaltamir/KassistanT`
- Branch: `MVP2`
- Implementation point: `0e1897cae007530cbe8aed20b97e04a25340cc87`
- Physical closure branch: `ia01/physical-entity-schema-closure-20260824`

## Entities

`entities_closed = 0`
`entities_blocked = 5`

### Blocked
1. ProductCategory
2. ProductImage
3. Promotion
4. CustomerAddress
5. PaymentMethod

## Physical facts established
- Proposed lower_snake_case table names are documented but remain subject to existing IA-01 naming authority.
- ProductImage `product_id` is deterministic: required, `RESTRICT/RESTRICT`.
- Promotion `store_id` is deterministic: required, `RESTRICT/RESTRICT`.
- Existing Order.address_id and Order.payment_method_id semantics remain unchanged from PR #29.
- No defaults or sentinels are introduced.
- No new FK semantics are introduced.

## Missing authoritative decisions
- ProductCategory identity and complete field model.
- ProductImage identity/key and complete field nullability/timestamps.
- Promotion identity and representation of `value` / `product_scope` plus field nullability/defaults.
- CustomerAddress identity, customer relation, address component model, nullability/defaults and snapshot/source semantics.
- PaymentMethod identity, registered-method field model, customer relation, nullability/defaults, lifecycle and security classification.

## Truth boundary

`PHYSICAL_SPEC_DEFINED != SCHEMA_MATERIALIZED != SCHEMA_VERIFIED`

This handoff therefore does **not** authorize migration creation, migration execution, schema implementation, or IA-02 implementation against these five entities.

## Next owner
Semantic/entity authorities supplying the missing normative physical/entity contracts.

## Next action
Close the five exact blockers above. After closure, IA-01 can produce deterministic physical DDL specifications and continue to the physical materialization gate.

## Non-scope
No CREATE TABLE, ALTER TABLE, DROP TABLE, migration creation/execution, runtime implementation, or Migration 0002 modification.
