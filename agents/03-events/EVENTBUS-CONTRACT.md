# IA-03 — EventBus Contract

## Status

`READINESS / NO RUNTIME IMPLEMENTATION`

This document defines the minimum implementation boundary supported by current repository evidence. It does not modify or supersede `packages/contracts/**` and does not resolve `CONTRACT-002`.

## Evidence hierarchy

1. `docs/backend/event-bus.md`
2. `docs/domain/events.md`
3. `packages/contracts/src/events.ts`
4. IA-03 readiness documentation

## Event model

An EventBus consumes an approved domain/application event. The currently materialized TypeScript contract requires:

- `event_id: string`
- `event_type: DomainEventType`
- `store_id: string`
- `aggregate_id: string`
- `occurred_at_utc: string`
- `payload: unknown`

The broader domain-event documentation also describes `event_version`, `aggregate_type`, `producer`, `correlation_id`, `causation_id`, `schema` and `payload`. Those fields are documented evidence but are not all present in the current TypeScript contract. IA-03 must not silently expand the global contract. Where correlation/causation/version metadata is supplied by the approved source contract, EventBus must preserve it; otherwise it remains absent/unknown.

## Event types

Current materialized order event types are:

- `order.created`
- `order.confirmed`
- `order.status_changed`
- `order.cancelled`

`order.status_changed` remains non-normative because `CONTRACT-002` is open. EventBus must not special-case or remove it locally.

## Publish semantics

`docs/backend/event-bus.md` establishes EventBus as **in-process communication**, not durable storage, with **post-commit local consumers**.

Therefore the implementation boundary is:

`transactional business operation -> commit -> local EventBus dispatch`

The repository does not establish that EventBus itself writes durable state, coordinates DomainOutbox, or participates in the business transaction.

## Subscribe semantics

The repository establishes the existence of local consumers but does not normatively define executable handler shape, sync/async scheduling, cancellation, registration lifecycle or concurrent-dispatch behavior.

These remain `UNKNOWN` until the implementation contract is finalized. No stronger behavior should be inferred from terminology alone.

## Ordering

`UNKNOWN` at EventBus scope. No global ordering, per-aggregate ordering, FIFO, or concurrent-handler guarantee is documented for the in-process EventBus.

The separate WSS contract defines transport sequence semantics; that is not an EventBus ordering guarantee.

## Delivery semantics

`UNSPECIFIED / NO DURABILITY GUARANTEE`.

The documented fact is only that EventBus is in-process and serves post-commit local consumers. It must not be classified as exactly-once, at-least-once or durable replay infrastructure.

## Error boundary

EventBus must not become a hidden business-rule or durable-recovery authority.

Current evidence does not define the exact handler error API. The future implementation must explicitly define:

- whether one subscriber failure affects other subscribers;
- whether publish reports handler failure directly;
- whether handler failure is isolated or aggregated;
- timeout/cancellation behavior.

Until that is finalized, these are `UNKNOWN`.

## Retry ownership

EventBus does **not** own durable retry semantics based on current evidence. `docs/backend/jobs.md` assigns retry/backoff/attempt state/locking/observability to JobQueue. EventBus must not silently absorb JobQueue responsibilities.

A local handler failure therefore must not imply automatic EventBus retry.

## Idempotency and deduplication

No EventBus-specific durable deduplication is documented. Duplicate-safety remains a responsibility of the relevant durable boundary and consumer behavior. EventBus must not claim exactly-once processing.

## Transaction interaction

The documented interaction is post-commit local dispatch. `DomainOutbox` transaction semantics are intentionally excluded because `CONTRACT-001` remains open.

## Observability

When available from the source event, correlation and causation identifiers must remain traceable. Dispatch failures should be observable. The repository does not yet define a normative EventBus telemetry schema or metrics set.

## Audit

No contract requires every in-process EventBus dispatch to create an AuditLog entry. Business/security audit remains the responsibility of the audit boundary and critical event policy. EventBus must not create an implicit audit contract.

## Implementation-safe minimum

The first runtime slice may safely be limited to:

1. local subscription registration;
2. local publication of an approved event object;
3. post-commit invocation boundary;
4. explicit non-durability;
5. no automatic retry;
6. no persistence;
7. no DomainOutbox coupling;
8. deterministic tests for finalized handler/error semantics.

This is a readiness boundary, not an implementation authorization.

## Readiness classification

`READY_WITH_OPEN_NONBLOCKING_ITEMS`

The scope and transaction relation are sufficiently bounded for implementation preparation, but executable subscribe/error/order semantics must be finalized before production code is considered ready.
