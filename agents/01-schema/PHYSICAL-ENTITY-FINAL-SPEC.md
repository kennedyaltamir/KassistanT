# IA-SCHEMA-PHYSICAL — Final Physical Entity Specification

Protocol: `KASSIST-PHYSICAL-ENTITY-CLOSURE` v1.0.0
Implementation point: `0e1897cae007530cbe8aed20b97e04a25340cc87`
Branch: `ia01/physical-entity-schema-closure-20260824`

## Result

`PHYSICAL_ENTITY_SCHEMA_READY = FALSE`

The five requested entities are **BLOCKED**, not because the mandate is incomplete, but because authoritative evidence is insufficient to produce deterministic DDL without inventing identity, fields, nullability, defaults or lifecycle semantics.

| Entity | Status | Exact blocker |
|---|---|---|
| ProductCategory | BLOCKED | no authoritative field inventory or physical identity |
| ProductImage | BLOCKED | identity/key not authorized; remaining field nullability/timestamps unresolved |
| Promotion | BLOCKED | identity and physical representation of `value` / `product_scope` unresolved |
| CustomerAddress | BLOCKED | identity, customer relation, address fields and snapshot/source model unresolved |
| PaymentMethod | BLOCKED | identity and complete registered-method field/security model unresolved |

## Cross-agent authority

`docs/domain/entities.md` remains `DEFINED / PARTIAL` and explicitly prohibits inference from implementation. `ENTITY-PHYSICAL-MAP.md` already classifies these entities as blocked by field/key gaps. `CONSTRAINT-SPEC.md` states that no canonical entity currently has a fully DDL-ready PK definition. fileciteturn79file0 fileciteturn81file0 fileciteturn86file0

## Preserved decisions

- `Product.category_id` semantics from PR #29 are not reopened.
- `Order.address_id` semantics from PR #29 are not reopened.
- `Order.payment_method_id` semantics from PR #29 are not reopened.
- `ProductImage.product_id` residual FK semantics remain closed.
- `Promotion.store_id` residual FK semantics remain closed.

## Migration boundary

Migration `0002_c1_product_order.sql` remains non-authoritative and untouched. No migration was created or executed. The physical entity closure produces specification only.

## Stop condition

A new normative decision is required before any of the five entities can advance to `CLOSED`. IA-01 must not fabricate a primary key or fill missing field models merely to achieve a green gate.
