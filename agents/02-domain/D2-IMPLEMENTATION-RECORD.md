# IA-02 — D2 Implementation Record

## Status

`IMPLEMENTATION_AUTHORIZATION = TRUE`

`D2_IMPLEMENTATION_SCOPE = FROZEN`

## Human decisions used

- `DREQ-001 = APPROVED`: `Order` is the aggregate root; `OrderItem` and `OrderItemModifier` are V1 aggregate-owned children; `OrderStatusHistory` is deferred and outside the V1 aggregate boundary.
- `DREQ-002 = APPROVED`: only `DRAFT -> CONFIRMED` via `ConfirmOrder`, producing `order.confirmed`.
- `DREQ-005 = APPROVED`: `INVALID_ORDER_STATE`, `CONFIRMATION_DATA_INVALID`, `DUPLICATE_CONFIRMATION`, `CONCURRENCY_CONFLICT`.
- `DREQ-006 = APPROVED`: authentication remains outside the aggregate; authorization remains at the application/application-service boundary; the domain accepts a minimal approved actor context without credentials; the concrete ActorContext shape is not frozen.

## Implemented scope

- `Order` aggregate.
- `OrderItem` and `OrderItemModifier` representations required by D2.
- `ConfirmOrder` domain operation.
- `DRAFT -> CONFIRMED` transition only.
- `order.confirmed` domain event creation.
- D2 domain error semantics.
- Generic actor-context boundary without a transport DTO.
- D2 unit tests.

## Explicit exclusions

- Persistence and SQLite integration.
- Migrations and schema changes.
- DomainOutbox, Inbox, EventBus and JobQueue.
- Durable AuditLog.
- Gateway, WSS and device authentication.
- Pricing, promotions, delivery and payment engines.
- Full Order lifecycle.
- Global authorization matrix.
- Global error catalogue.
- Full idempotency protocol.
- Concrete concurrency mechanism.
- `OrderStatusHistory` as aggregate-owned state.
- `order.status_changed`.

## Validation status

`DIRECT_TEST = NOT_EXECUTED`

`TYPECHECK = NOT_EXECUTED`

`LINT = NOT_EXECUTED`

`CI = PENDING`

The execution environment could not resolve `github.com`, so a local checkout and direct command execution were unavailable. No local test result is claimed.

## Scope evidence

The implementation is limited to:

- `packages/domain/**`
- `agents/02-domain/**`

No `packages/contracts/**`, `apps/**`, `gateway/**`, migration or `main` changes are part of the D2 implementation.

## Deferred items

`CONTRACT-001`, `CONTRACT-002` and `GOV-001` remain unresolved and are not encoded by this slice.

## Merge gate

Implementation completion does not imply merge readiness. Merge remains dependent on PR review, direct/official test evidence where available, CI and human approval.
