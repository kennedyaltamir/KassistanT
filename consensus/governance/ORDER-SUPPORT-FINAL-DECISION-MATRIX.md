# Order Support — Final Relationship Matrix

Effective: 2026-08-24
Authority: ORDER_SEMANTIC_OWNER

| Relation | Cardinality | Nullable | Required DRAFT | Required CONFIRMED | Snapshot/Live | ON DELETE | ON UPDATE | Lifecycle |
|---|---|---:|---:|---:|---|---|---|---|
| Order.customer_id -> Customer.id | N:1 | YES at draft boundary | NO | YES | live canonical identity; historical association retained | RESTRICT | RESTRICT | optional in DRAFT, mandatory at confirmation |
| Order.address_id -> CustomerAddress.id | N:1 when delivery address applies | YES | NO | Conditional on delivery mode | snapshot at confirmation | SET NULL after snapshot | RESTRICT | mutable in DRAFT, frozen at confirmation |
| Order.payment_method_id -> PaymentMethod.id | N:1 when selected | YES | NO | YES | frozen commercial meaning at confirmation | RESTRICT | RESTRICT | mutable in DRAFT, frozen at confirmation |

## Other support relations

No additional Order support relationship is promoted beyond relations already explicitly present in the current canonical specification. Delivery type, payment selection, address selection and customer association are represented by the three relations above; no new entity or relation is introduced by this decision round.

## Rationale

The Order lifecycle permits incomplete DRAFT construction. Confirmation is the commercial boundary: Customer must be known; payment selection must be known; a delivery address is required only when the fulfillment mode requires one. Confirmed commercial meaning must not be retroactively changed by mutable customer address data or payment catalog edits.

## Non-scope

No new Order business rule, new entity, new migration, payment processing, address versioning subsystem, or delivery integration is introduced.
