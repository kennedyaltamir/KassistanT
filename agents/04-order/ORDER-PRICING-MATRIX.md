# IA-04 — Order Pricing Matrix

Status: AUDIT / PARTIAL / BLOCKED FOR COMPLETE IMPLEMENTATION

## Pricing contract

| Component | Current evidence | Required semantics | Status |
|---|---|---|---|
| Currency | BRL is normative; Money primitive enforces BRL | All Order monetary values remain integer cents and same currency | READY |
| Item base price | Product has `price_cents` in baseline entity model | Read current catalog price when building/recalculating a draft | PARTIAL |
| Quantity | Positive integer | `unit_price_cents × quantity` deterministically | READY |
| Modifier price | ProductModifier has `price_cents`; OrderItemModifier stores snapshots | Modifier amount contributes to item subtotal according to quantity | PARTIAL |
| Item subtotal | Baseline defines OrderItem `subtotal_cents` | Deterministic sum of item base and modifier components | PARTIAL |
| Order subtotal | Baseline defines `subtotal_cents` | Deterministic sum of item subtotals | PARTIAL |
| Discount | Baseline defines `discount_cents` | Must be a non-negative deterministic amount bounded by applicable rules | PARTIAL / rule incomplete |
| Promotion | `FIXED_AMOUNT` and `PERCENTAGE` are documented | Eligibility and conflict semantics must be explicit before full implementation | BLOCKED |
| Delivery fee | `delivery_fee_cents` exists | Must be deterministic from approved delivery rules | BLOCKED |
| Taxes | No normative MVP tax calculation contract found | Do not add tax calculation silently | NOT_DEFINED / OUT_OF_SCOPE_FOR_CURRENT_CONTRACT |
| Total | `total_cents` is normative and deterministic | `subtotal - discount + delivery_fee` unless future approved contract changes this | STRONG_INFERENCE, not executable contract |
| Rounding | Baseline specifies `ROUND_HALF_UP` for percentage calculations in §75 | Use only for explicitly percentage-derived money; exact promotion calculation flow remains incomplete | PARTIAL |
| Money representation | `amount_cents: number`, `Number.isSafeInteger` | No floating point monetary representation | IMPLEMENTED PRIMITIVE |
| Price snapshot | Confirmed order freezes price state; OrderItem snapshots are documented | Confirmed historical values must remain immutable | DEFINED |
| Draft recalculation | Draft is described as recalculable | Catalog changes before confirmation trigger deterministic recalculation | DEFINED / PARTIAL |

## Important distinctions

### Confirmed price immutability

The baseline explicitly states that `CONFIRMED` is the operational sale milestone and that confirmed orders freeze price state. This is a strong invariant.

### Draft recalculation

The baseline states that `DRAFT` is recalculable and that catalog changes before confirmation cause recalculation. The exact catalog-read/versioning boundary is not executable yet.

### Total formula

The repository defines `subtotal_cents`, `discount_cents`, `delivery_fee_cents` and `total_cents`, and the baseline describes the financial semantics. A future implementation must still receive the exact ordered calculation contract rather than relying on an inferred formula where the protected contract is incomplete.

### Taxes

No MVP tax engine is specified. IA-04 must not invent one.

## Pricing blockers

- Promotion eligibility and conflict semantics are incomplete.
- Delivery fee rules are not fully executable.
- Canonical entity fields remain partial.
- Full command input/output schemas are partial.
- Complete error taxonomy is missing.

## Readiness

**Deterministic Money arithmetic:** READY as an isolated, pure slice.

**Complete Order pricing engine:** BLOCKED until promotion, delivery, rounding application order and canonical field contracts are sufficiently explicit.
