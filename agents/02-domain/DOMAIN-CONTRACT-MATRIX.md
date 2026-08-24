# IA-02 — Domain Contract Matrix

## Command matrix

Only the following commands are explicitly documented. No commands for Product, Customer, Device, Integration or AIExecution were found as canonical executable domain commands.

| Command | Target | Preconditions | Inputs/Outputs | Events | Errors | Idempotency/Auth | Status |
|---|---|---|---|---|---|---|---|
| CreateDraftOrder | Order | target customer/context available is implied | order creation data; result schema partial | `order.created` candidate | duplicate/validation semantics partial | duplicate handling partial; actor dependency partial | DOCUMENTED/PARTIAL |
| AddItem | Order | draft order; product/modifier availability | product + quantity + modifiers | event semantics partial | unavailable product/modifier; invalid quantity | dedupe required; exact key missing | DOCUMENTED/PARTIAL |
| RemoveItem | Order | draft order; item exists | item identifier | event semantics partial | not-found/invalid operation semantics partial | partial | DOCUMENTED/PARTIAL |
| ChangeQuantity | Order | item exists; positive quantity | item + quantity | event semantics partial | invalid quantity | partial | DOCUMENTED/PARTIAL |
| SetDeliveryType | Order | order mutable | delivery type | event semantics partial | invalid delivery rule semantics partial | partial | DOCUMENTED/PARTIAL |
| SetAddress | Order | delivery requires address | address | event semantics partial | insufficient delivery data | partial | DOCUMENTED/PARTIAL |
| SetPaymentMethod | Order | supported method | payment method | event semantics partial | invalid/unsupported method | partial | DOCUMENTED/PARTIAL |
| ApplyEligiblePromotion | Order | promotion exists and is eligible | promotion/context | event semantics partial | promotion violation | partial | DOCUMENTED/PARTIAL |
| RecalculateOrder | Order | mutable order state | current order context | no canonical event frozen | pricing errors partial | deterministic; idempotency not formalized | DOCUMENTED/PARTIAL |
| RequestCustomerConfirmation | Order | order complete enough for summary | order summary | possible confirmation event boundary | validation errors partial | partial | DOCUMENTED/PARTIAL |
| ConfirmOrder | Order | valid draft; final summary; unequivocal confirmation | confirmation data | `order.confirmed` documented; `order.status_changed` ambiguous | invalid transition; duplicate operation | idempotency required, exact semantics partial | DOCUMENTED/PARTIAL / BLOCKED |
| CancelOrder | Order | allowed current state | cancellation reason/actor semantics partial | `order.cancelled` documented | invalid transition; duplicate operation | partial | DOCUMENTED/PARTIAL |

No normative command contracts were found for `Conversation`, `Message`, `Product`, `Customer`, `Device`, `Integration` or `AIExecution`; product actions do not substitute for domain command contracts.

## Query matrix

| Query | Target | Filters | Ordering/Pagination | Projection | Consistency/Auth | Status |
|---|---|---|---|---|---|---|
| ProductSearch | Product | search/filter criteria | not specified | product search result | auth/consistency partial | DOCUMENTED/PARTIAL |
| ProductLookup | Product | product identifier | not applicable | product details | auth partial | DOCUMENTED/PARTIAL |
| StoreInfo | Store | store context | not applicable | store information | auth partial | DOCUMENTED/PARTIAL |
| DeliveryRules | Store/Delivery configuration | store/context | not applicable | delivery rules | consistency/auth partial | DOCUMENTED/PARTIAL |
| PaymentMethods | Store | store/context | not applicable | methods | consistency/auth partial | DOCUMENTED/PARTIAL |
| CurrentOrder | Order | conversation/customer context | not specified | current order | consistency semantics missing | DOCUMENTED/PARTIAL |
| CustomerContext | Customer | customer/conversation context | not specified | customer context | auth/consistency partial | DOCUMENTED/PARTIAL |

Pagination, ordering, authorization and consistency are explicitly incomplete in `docs/domain/queries.md`.

## Value object / primitive matrix

| Type | Representation | Runtime evidence | Status |
|---|---|---|---|
| Money | integer cents + BRL | `money.ts` | IMPLEMENTED FOUNDATION |
| UUIDv7 | UUIDv7 string | `uuidv7.ts` | IMPLEMENTED FOUNDATION |
| UTC timestamp | ISO-8601 UTC string | `time.ts` | IMPLEMENTED FOUNDATION |
| Quantity | positive integer | domain invariant | DOCUMENTED |
| Phone | normalized/E.164 direction | domain/backend docs | PARTIAL |
| Address | structured delivery address | domain docs | PARTIAL |
| Idempotency key | string, uniqueness where defined | backend/contracts | PARTIAL |
| Correlation ID | event/request identifier | event envelope | PARTIAL |
| Causation ID | event causation identifier | event envelope | PARTIAL |

## Domain error matrix

Canonical codes are missing. The documented error semantics are:

- invalid order transition;
- unavailable product/modifier;
- insufficient delivery data;
- invalid quantity;
- promotion violation;
- duplicate operation.

Retryability, stable codes and cross-boundary mappings remain incomplete.

## Event matrix

`packages/contracts/src/events.ts` currently lists:

- `order.created`
- `order.confirmed`
- `order.status_changed`
- `order.cancelled`

The event envelope contains `event_id`, `event_type`, `store_id`, `aggregate_id`, `occurred_at_utc` and payload. Domain documentation additionally requires version, producer, correlation, causation and schema metadata. The normative reconciliation is incomplete.

`order.status_changed` is explicitly `CONTRACT-002 / OPEN` and must not be normalized locally.