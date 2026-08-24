# IA-03 — EventBus Handoff

## Status

`IMPLEMENTED / HANDOFF READY`

This document is the consumer-facing integration contract for the implemented EventBus V1. It does not modify protected contracts and does not authorize Inbox/Outbox/JobQueue/AuditLog work.

## Public API

```ts
subscribe(eventType, handler): Subscription
unsubscribe(subscription): void
publish(event): Promise<DispatchResult>
```

`EventHandler` accepts the approved `DomainEvent` and may return `void | Promise<void>`.

`Subscription` is an opaque local registration identity.

`DispatchResult` contains:

- `status`: `success | partial_failure | complete_failure`
- `eventId`
- `invokedSubscriptions`
- `failures[]`

A subscriber failure is returned in the result; EventBus does not throw it back as a business exception and does not retry it durably.

## EventEnvelope

The implemented input is the current protected `DomainEvent` shape:

- `event_id`
- `event_type`
- `store_id`
- `aggregate_id`
- `occurred_at_utc`
- `payload`

No fields were added locally.

## Subscription lifecycle

`subscribe()` creates a distinct registration.

Registering the same handler more than once creates distinct subscriptions.

`unsubscribe()` is idempotent.

Unsubscribe removes the registration from future dispatches.

An already-captured in-flight dispatch continues using its publish-time snapshot. Unsubscribe does not forcibly cancel an already-running handler.

## Publish semantics

EventBus is in-process and intended for the documented post-commit boundary.

For each `publish(event)`:

1. matching active subscriptions are captured in a snapshot;
2. handlers are invoked sequentially;
3. each selected subscription is invoked at most once;
4. one handler failure does not suppress subsequent selected handlers;
5. the publish promise completes after all selected handlers settle;
6. the result reports `success`, `partial_failure` or `complete_failure`.

Completion does not mean durable persistence, external delivery or business processing completion.

## Failure behavior

Subscriber failures are isolated and collected.

`partial_failure` means at least one selected handler succeeded and at least one failed.

`complete_failure` means all selected handlers failed.

Failures are logged locally through the EventBus failure-reporting path.

EventBus does not create durable retries.

## Cancellation

V1 cancellation is lifecycle-based only: `unsubscribe()` affects future dispatches.

No `AbortSignal` is supported.

## Timeout

No EventBus timeout exists in V1.

## Ordering

`NO_ORDERING_GUARANTEE`.

Consumers must not rely on global, per-type, per-aggregate, FIFO or registration-order guarantees.

The current implementation uses a local snapshot iteration order only to produce deterministic behavior; that is not a public ordering contract.

## Persistence boundary

EventBus owns no persistence and does not depend on SQLite.

## Retry boundary

EventBus owns no durable retry. Durable asynchronous retry belongs to the JobQueue boundary when applicable.

## Transaction boundary

```text
business transaction
    ↓
commit
    ↓
local EventBus dispatch
```

EventBus is not the transaction manager and does not own DomainOutbox semantics.

## Explicit exclusions

EventBus has no authority over:

- business rules;
- persistence;
- DomainOutbox;
- InboundInbox;
- JobQueue;
- AuditLog;
- WSS transport;
- Device Authentication;
- durable replay/reconciliation/dead-letter handling.

## Consumer guidance

### IA-04 — Order

Expected usage: publish/consume approved Order events.

Likely existing event types: `order.created`, `order.confirmed`, `order.status_changed`, `order.cancelled`.

Dependency status: compatible with the current EventBus boundary.

Forbidden assumptions: no ordering, durability, retry or guaranteed business completion.

`order.status_changed` remains subject to `CONTRACT-002`; EventBus does not normalize it.

### IA-05 — Conversation / LLM

Expected usage: consume approved local conversation/application events and publish approved events where its contracts require.

Likely event types: only event types already defined by protected contracts; no new types are introduced here.

Dependency status: future integration.

Forbidden assumptions: no durable delivery, no automatic retry, no ordering guarantee.

### IA-06 — Device Auth

Expected usage: consume approved device/security lifecycle events.

Dependency status: future integration.

Forbidden assumptions: EventBus is not the authorization boundary and does not persist security evidence.

### IA-07 — Gateway / WSS

Expected usage: consume approved local events before/after transport handling where the Gateway contract requires.

Dependency status: future integration.

Forbidden assumptions: WSS ACK/replay/sequence semantics do not become EventBus semantics.

### IA-08 — Desktop UI

Expected usage: consume local notification, badge, dashboard or operational events.

Dependency status: future integration.

Forbidden assumptions: UI observation is not a business completion signal; EventBus remains non-durable.

## Evidence boundary

The implementation is limited to `apps/desktop/electron/infrastructure/events/**` plus directly associated tests. The rest of Event Infrastructure remains unimplemented.
