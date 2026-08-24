# Final Optionality / Lifecycle Decision Record

Effective: 2026-08-24
Authority: semantic owners within approved scope

## Closed decisions

### Product.category_id
- nullable: YES
- required_for_creation: NO
- required_for_publication: NO
- default: NONE
- ON DELETE: SET NULL
- ON UPDATE: RESTRICT
- lifecycle: mutable classification

### Order.customer_id
- nullable: YES only during DRAFT boundary
- required_for_draft: NO
- required_for_confirmation: YES
- default: NONE
- ON DELETE: RESTRICT
- ON UPDATE: RESTRICT
- lifecycle: association becomes mandatory at confirmation

### Order.address_id
- nullable: YES
- required_for_draft: NO
- required_for_confirmation: conditional on delivery mode
- default: NONE
- ON DELETE: SET NULL after commercial address snapshot is preserved
- ON UPDATE: RESTRICT
- lifecycle: mutable in DRAFT; frozen at confirmation

### Order.payment_method_id
- nullable: YES
- required_for_draft: NO
- required_for_confirmation: YES
- default: NONE
- ON DELETE: RESTRICT
- ON UPDATE: RESTRICT
- lifecycle: mutable in DRAFT; frozen at confirmation

## General invariants

- Identity fields are never nullable.
- No sentinel values.
- No magic defaults.
- Confirmed commercial meaning cannot change silently through mutable support entities.
- No cascade deletion is introduced for commercial Order support.
