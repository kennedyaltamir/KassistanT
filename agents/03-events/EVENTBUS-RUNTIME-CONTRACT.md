# IA-03 — EventBus Runtime Contract

## Status

`IMPLEMENTED / V1 / LOCAL RUNTIME`

The operator explicitly approved EBUS-DEC-001 through EBUS-DEC-008. This document records the implemented IA-03 local runtime boundary and does not modify `packages/contracts/**`, resolve `CONTRACT-001`, or resolve `CONTRACT-002`.

## EventEnvelope

The protected input boundary remains:

- `event_id: string`
- `event_type: DomainEventType`
- `store_id: string`
- `aggregate_id: string`
- `occurred_at_utc: string`
- `payload: unknown`

No fields were added to the global contract.

## Publish / Subscribe / Unsubscribe

```ts
subscribe(eventType: DomainEventType, handler: EventHandler): Subscription;
unsubscribe(subscription: Subscription): void;
publish(event: DomainEvent): Promise<DispatchResult>;
```

`Subscription` has an opaque local identity. Duplicate registrations are distinct.

`unsubscribe()` is idempotent and affects future dispatches. It does not interrupt an already-running handler.

## Scheduling

`publish()` is asynchronous. At publish start, eligible subscriptions are snapshotted. Handlers in that snapshot execute sequentially. No durable queue or external scheduler is introduced.

Sequential execution is an implementation policy and does not create a public ordering guarantee.

## Subscriber failure propagation and isolation

Each selected subscriber is isolated from failures in other selected subscribers. A handler failure is caught and recorded; subsequent selected handlers still execute.

After all selected handlers settle, `publish()` resolves with a `DispatchResult` whose status is:

- `success` when no handler fails;
- `partial_failure` when some but not all selected handlers fail;
- `complete_failure` when all selected handlers fail and at least one handler was selected.

Failures are retained locally in the result and emitted through `console.error` with event/subscription context. No global error taxonomy was introduced.

## Cancellation

V1 has no `AbortSignal`. Cancellation is lifecycle based through `unsubscribe()`, which prevents future dispatches.

## Timeout

No EventBus-owned timeout exists in V1. Timeout policy is deferred outside this slice.

## Ordering

`NO_ORDERING_GUARANTEE`.

No global, per-type, per-aggregate, registration-order or FIFO guarantee is exposed.

## Dispatch completion

`await publish(event)` completes after every selected handler has either resolved or rejected and the aggregate `DispatchResult` has been formed.

Completion does not mean persistence, external delivery, durable success or business processing completion.

## Delivery / persistence / retry

EventBus is in-process and non-durable. It does not persist events, implement durable retry, replay, reconciliation, dead-letter processing or DomainOutbox behavior.

JobQueue remains the durable retry boundary for work that requires persisted attempts, locking and backoff.

## Transaction boundary

The EventBus is invoked after the relevant business transaction commits. It does not participate in transaction management and does not own DomainOutbox semantics.

## Testing

The directly associated deterministic suite covers subscriptions, idempotent unsubscription, duplicate registrations, snapshot behavior, routing, failures, failure isolation, aggregate reporting, completion and event forwarding.

Validation result in the isolated execution environment: **10 passed, 0 failed, 0 cancelled, 0 skipped**.

## Explicit non-goals

Inbox, Outbox, JobQueue, AuditLog, WSS, Device Auth, replay, reconciliation, dead-letter handling, SQLite persistence, durable retry and downstream consumer integration are outside EventBus V1.
