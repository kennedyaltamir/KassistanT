# PaymentMethod — Physical Schema Specification

Status: **BLOCKED**
Implementation point: `MVP2 @ 0e1897cae007530cbe8aed20b97e04a25340cc87`

## Evidence
`CANONICAL-SCHEMA-SPEC.md` states that MVP records a payment method only and that exact physical fields remain blocked. PR #29 closes only the Order.payment_method_id relationship semantics. `SCHEMA-AUTHORITY-MATRIX.md` assigns domain meaning to semantic owners; IA-01 only materializes once explicit.

## Deterministic facts
- Proposed table name: `payment_method`.
- Order.payment_method_id is nullable in DRAFT, required at confirmation, `RESTRICT/RESTRICT`, and its commercial meaning is frozen at confirmation.
- MVP payment is a registered method, not a payment gateway.
- Sensitive payment credentials must not be stored without explicit authorization.

## Unresolved physical properties
- PaymentMethod identity / primary key.
- Complete field inventory.
- Customer relation, if any, and its cardinality/FK semantics.
- Required fields and nullability.
- SQL defaults.
- Lifecycle/status fields.
- Uniqueness constraints.
- Security classification of each persisted field.

## Security boundary
The current evidence does not authorize storage of card number, CVV, authentication secrets, gateway credentials or equivalent sensitive payment material. A physical contract must explicitly define any permitted reference/token representation before persistence is designed.

## Why BLOCKED
The canonical contract deliberately leaves the physical model partial. Choosing an `id`, customer relation, method type catalog, reference token fields or defaults would create new domain/schema meaning.

## Required authority to close
A PaymentMethod physical/entity contract defining identity, fields, customer relation, nullability/defaults, lifecycle and security classification. The existing Order.payment_method_id semantics must remain unchanged.

## Non-scope
No DDL, migration, payment integration, credential storage, runtime implementation, or Migration 0002 change.
