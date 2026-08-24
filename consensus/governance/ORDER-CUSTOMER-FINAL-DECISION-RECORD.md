# Order -> Customer — Final Semantic Decision Record

Decision ID: `SCHEMA-ORDER-CUSTOMER-001`
Owner: `ORDER_SEMANTIC_OWNER`
Effective: `2026-08-24`

## Decision

`order.customer_id -> customer.id` identifies the Customer associated with an Order.

- Cardinality: `Order N:1 Customer`.
- `nullable`: `TRUE` at DRAFT creation boundary.
- Required for DRAFT: `FALSE`.
- Required for CONFIRMED: `TRUE`.
- `ON DELETE`: `RESTRICT`.
- `ON UPDATE`: `RESTRICT`.
- Lifecycle: Customer association is established before confirmation and becomes historically significant at confirmation.
- Confirmed-order survival: a confirmed Order remains valid independently of Customer logical lifecycle, but physical deletion of the referenced Customer is prohibited while Orders reference it.
- Reference semantics: live identity reference to the canonical Customer; confirmed Order does not silently change meaning if Customer profile attributes change.

## Rationale

The MVP can support creation of an incomplete draft before customer association is finalized, but a commercial Order cannot be confirmed without a canonical Customer. Confirmed Orders are commercial records and must retain an auditable Customer association. Therefore deleting the parent row would destroy referential history and is restricted; Customer logical lifecycle changes do not erase the Order.

## Schema impact

`customer_id` must support DRAFT nullability while the domain contract requires non-null association before confirmation. No delete cascade or automatic detachment is allowed for a confirmed Order.

## Non-scope

No anonymous confirmed Order, cross-channel customer merge, customer snapshot entity, or new customer deletion policy is introduced.

## Evidence

The frozen Customer identity is `(store_id, phone_normalized)`; Order confirmation is the commercial sale milestone and Order lifecycle is deterministic. IA-04 explicitly owns Order lifecycle and confirmation semantics, while IA-01 materializes only the decided relationship.
