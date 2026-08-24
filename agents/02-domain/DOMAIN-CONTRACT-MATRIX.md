# IA-02 — Domain Contract Matrix

## Reconciliation status

**D1 RECONCILED. No new contracts created.**

## Commands

The only explicitly documented Order commands are:

CreateDraftOrder, AddItem, RemoveItem, ChangeQuantity, SetDeliveryType, SetAddress, SetPaymentMethod, ApplyEligiblePromotion, RecalculateOrder, RequestCustomerConfirmation, ConfirmOrder, CancelOrder.

All are `DOCUMENTED/PARTIAL`. `ConfirmOrder` is `BLOCKED` because event/persistence semantics remain incomplete. No canonical domain commands were found for Product, Customer, Device, Integration or AIExecution.

| Command | Preconditions | Inputs/Outputs | Events | Errors | Idempotency/Auth | Status |
|---|---|---|---|---|---|---|
| CreateDraftOrder | customer/context implied | partial | `order.created` candidate | validation/duplicate partial | partial | PARTIAL |
| AddItem | draft, product/modifier available | partial | partial | unavailable/quantity | partial | PARTIAL |
| RemoveItem | draft, item exists | partial | partial | not-found/invalid operation | partial | PARTIAL |
| ChangeQuantity | item exists, positive quantity | partial | partial | invalid quantity | partial | PARTIAL |
| SetDeliveryType | order mutable | partial | partial | delivery-rule validation | partial | PARTIAL |
| SetAddress | delivery requires address | partial | partial | insufficient delivery data | partial | PARTIAL |
| SetPaymentMethod | supported method | partial | partial | invalid method | partial | PARTIAL |
| ApplyEligiblePromotion | promotion exists/eligible | partial | partial | promotion violation | partial | PARTIAL |
| RecalculateOrder | mutable order | partial | none frozen | pricing errors partial | deterministic; idempotency partial | PARTIAL |
| RequestCustomerConfirmation | sufficient order summary | partial | boundary unclear | validation partial | partial | PARTIAL |
| ConfirmOrder | valid draft + final summary + unequivocal confirmation | partial | `order.confirmed`; `order.status_changed` ambiguous | invalid transition/duplicate | partial | BLOCKED |
| CancelOrder | allowed state | partial | `order.cancelled` | invalid transition/duplicate | partial | PARTIAL |

## Queries

Documented deterministic reads: ProductSearch, ProductLookup, StoreInfo, DeliveryRules, PaymentMethods, CurrentOrder and CustomerContext.

Pagination, ordering, authorization and consistency semantics remain partial. No query is READY for implementation as a standalone normative contract.

## Value objects / primitives

Money = integer cents + BRL; UUIDv7 = UUIDv7 string; UTC timestamp = ISO-8601 UTC string. Quantity is a documented positive-integer rule. Phone, Address, IdempotencyKey, CorrelationId and CausationId remain partial domain semantics.

## Domain errors

Conceptual errors only: invalid order transition, unavailable product/modifier, insufficient delivery data, invalid quantity, promotion violation and duplicate operation. Canonical stable codes and mappings are missing.

## Events

Current TypeScript contract lists `order.created`, `order.confirmed`, `order.status_changed`, `order.cancelled`. The event documentation requires richer envelope metadata. `order.status_changed` remains `CONTRACT-002 / OPEN` and is not normalized here.

## Readiness conclusion

The matrix is sufficient for gap tracking, not runtime implementation. The first implementation slice remains BLOCKED until one complete command and its associated aggregate, transition, errors, event semantics and persistence boundary are frozen.
