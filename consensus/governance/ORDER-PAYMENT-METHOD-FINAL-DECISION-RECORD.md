# Order -> PaymentMethod — Final Semantic Decision Record

Decision ID: SCHEMA-ORDER-PAYMENT-001
Owner: ORDER_SEMANTIC_OWNER
Effective: 2026-08-24

## Decision

Order.payment_method_id identifies the payment method selected for the Order.

- cardinality: Order N:1 PaymentMethod when selected
- nullable: TRUE
- required_for_draft: FALSE
- required_for_confirmation: TRUE
- snapshot_or_live_reference: selected payment method is frozen at confirmation as commercial meaning; the referenced catalog method is not allowed to change the meaning of the confirmed Order
- ON DELETE: RESTRICT while confirmed Orders reference the method
- ON UPDATE: RESTRICT
- lifecycle: mutable while DRAFT; frozen at confirmation

## Rationale

A draft Order may be created before a payment method is selected. Confirmation requires the method selection to be known. A confirmed commercial Order must not change historical payment meaning because a payment-method catalog entry was later edited or removed.

## Schema impact

PaymentMethod must remain referenceable by confirmed Orders. The exact persistence representation of the frozen payment meaning is part of IA-01 physical reconciliation and must not alter the approved Order lifecycle.

## Non-scope

No payment processing implementation, gateway integration, card-data storage, authorization rule, or new payment method type is introduced.

## Evidence

IA-04 explicitly owns SetPaymentMethod and confirmation lifecycle. PaymentMethod is a canonical domain entity; detailed field schemas remain partial.
