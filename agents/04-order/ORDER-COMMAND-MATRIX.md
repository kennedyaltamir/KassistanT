# IA-04 — Order Command Matrix

Status: AUDIT / DEFINED-PARTIAL

| Command | Target | Actor | Preconditions | Input | Validation | State transition | Side effects | Domain event | Error | Idempotency | Audit | Status |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `CreateDraftOrder` | Order | ACTOR_UNSPECIFIED | Customer/store context sufficient | Order/customer context | Required fields + store scope | Creates DRAFT | Persist order context | `order.created` is catalogued | Canonical codes missing | Duplicate semantics not complete | Creation audit not fully explicit | PARTIAL |
| `AddItem` | OrderItem | ACTOR_UNSPECIFIED | Order editable; product exists/available | product, quantity | Positive quantity; product/modifier rules | Remains DRAFT | Recalculate draft | No dedicated item event documented | Missing | Duplicate operation semantics incomplete | Not explicitly defined | PARTIAL |
| `RemoveItem` | OrderItem | ACTOR_UNSPECIFIED | Order editable; item exists | item reference | Item must exist | Remains DRAFT | Recalculate draft | No dedicated item event documented | Missing | Duplicate semantics incomplete | Not explicitly defined | PARTIAL |
| `ChangeQuantity` | OrderItem | ACTOR_UNSPECIFIED | Order editable; item exists | item, quantity | Positive integer | Remains DRAFT | Recalculate draft | No dedicated item event documented | Missing | Duplicate semantics incomplete | Not explicitly defined | PARTIAL |
| `SetDeliveryType` | Order delivery state | ACTOR_UNSPECIFIED | Order editable | delivery type | Allowed delivery type contract incomplete | Remains DRAFT | May affect delivery requirements | No dedicated event documented | Missing | Duplicate semantics incomplete | Not explicitly defined | PARTIAL |
| `SetAddress` | CustomerAddress / Order | ACTOR_UNSPECIFIED | Delivery mode requiring address | address fields/reference | Required delivery fields | Remains DRAFT | Associate address | No dedicated event documented | Insufficient delivery data exists conceptually | Duplicate semantics incomplete | Not explicitly defined | PARTIAL |
| `SetPaymentMethod` | PaymentMethod / Order | ACTOR_UNSPECIFIED | Order editable | payment method | Allowed method contract incomplete | Remains DRAFT | Associate method | No dedicated payment event documented | Missing | Duplicate semantics incomplete | Payment audit not fully defined | PARTIAL |
| `ApplyEligiblePromotion` | Promotion / Order | ACTOR_UNSPECIFIED | Order editable; promotion applicable | promotion reference | Eligibility rules incomplete | Remains DRAFT | Recalculate discount/total | No dedicated promotion event documented | Promotion violations must reject | Idempotency/conflict semantics incomplete | Promotion audit not fully defined | BLOCKED |
| `RecalculateOrder` | Order | ACTOR_UNSPECIFIED / system | Order is DRAFT | Current order state | Pricing inputs available | Remains DRAFT | Recompute monetary fields | No dedicated recalculation event | Missing | Safe to repeat conceptually; exact key not defined | Not explicitly defined | PARTIAL |
| `RequestCustomerConfirmation` | Order | AI/Core boundary | Order complete enough for summary | Current order | Delivery/payment/quantity requirements | Remains DRAFT | Produces confirmation summary | No dedicated event documented | Missing | Repeated request should not create new sale; exact semantics absent | Not explicitly defined | PARTIAL |
| `ConfirmOrder` | Order | ACTOR_UNSPECIFIED | Final summary + unequivocal confirmation; current order valid | Confirmation context/idempotency context | All order invariants + latest pricing + availability | DRAFT → CONFIRMED | Atomic persistence + durable effect | `order.confirmed` | Canonical errors missing | REQUIRED; exact key/scope not complete | Confirmation is critical; exact AuditLog schema usage partial | BLOCKED_FOR_FULL_RUNTIME |
| `CancelOrder` | Order | ACTOR_UNSPECIFIED | Order cancellable under final policy | reason/context | Lifecycle + actor permission rules | Current state → CANCELLED where permitted | Cancellation effects per contract | `order.cancelled` | Invalid transition / permission codes missing | REQUIRED | Cancellation explicitly critical | PARTIAL |

## Commands that must not be invented

The requested audit considered `StartProduction`, `MarkReady`, `Dispatch`, `Deliver`, payment authorization/refund/reconciliation and other operational commands. No complete normative command contract was found for these names in the current command specification. They remain **UNKNOWN / NOT_AUTHORIZED_TO_INVENT**.

The lifecycle contains later states, but state cataloguing is not sufficient evidence for adding new command APIs.

## Command contract gap

`docs/domain/commands.md` explicitly states that every command requires INPUT, PRECONDITIONS, BUSINESS RULES, OUTPUT, ERRORS, EVENTS and IDEMPOTENCY, while fully typed executable schemas remain PARTIAL. This is a primary implementation-readiness gap.
