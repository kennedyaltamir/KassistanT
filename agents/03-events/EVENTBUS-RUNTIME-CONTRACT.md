# IA-03 — EventBus Runtime Contract

## Status

`PROPOSAL / HUMAN APPROVAL REQUIRED`

This document defines the smallest proposed local runtime contract for EventBus V1. It does not modify `packages/contracts/**`, does not resolve `CONTRACT-001`, and does not resolve `CONTRACT-002`.

## EventEnvelope

The currently materialized TypeScript event contract remains the protected input boundary:

- `event_id: string`
- `event_type: DomainEventType`
- `store_id: string`
- `aggregate_id: string`
- `occurred_at_utc: string`
- `payload: unknown`

Correlation/causation metadata is preserved when supplied by an approved source contract. IA-03 does not expand the global envelope.

## Publish

**Proposal:** `publish(event)` is asynchronous and may be invoked only from the documented post-commit application boundary.

`business transaction -> commit -> EventBus publish/dispatch`

EventBus does not participate in the transaction, persist the event, or implement DomainOutbox.

## Subscribe

**Proposal:**

```ts
subscribe(eventType: DomainEventType, handler: EventHandler): Subscription;
```

`Subscription` is an opaque local registration identity.

`EventHandler` accepts the approved event object and may return `void | Promise<void>`.

## Unsubscribe

**Proposal:**

```ts
unsubscribe(subscription: Subscription): void;
```

Unsubscribe is idempotent. Repeating unsubscribe is a no-op. The registration is removed from the active subscription set.

An already-started handler is not forcibly cancelled by unsubscribe.

## Scheduling

**Proposal:** async publication boundary with sequential handler invocation over a publish-time subscriber snapshot.

This avoids synchronous stack coupling while preserving deterministic local behavior. No durable queue or external scheduler is introduced.

This is a local implementation policy, not an ordering guarantee.

## Subscriber failure propagation

**Proposal:** subscriber failures are isolated from other selected subscribers. `publish()` waits for all selected handlers to settle, collects failures, and rejects with an aggregate failure when one or more handlers failed.

No durable retry is performed by EventBus.

## Subscriber failure isolation

**Proposal:** failure of subscriber A must not prevent independent selected subscribers B/C from executing.

A handler is invoked at most once per dispatch snapshot.

## Cancellation

**Proposal:** V1 uses unsubscribe-only cancellation. No `AbortSignal` or second cancellation protocol is introduced.

Unsubscribe prevents future dispatches. It does not interrupt a handler that has already started.

## Timeout

**Proposal:** no EventBus timeout in V1; timeout policy is explicitly deferred.

The absence of a timeout is intentional. No numeric timeout is introduced. Long-running durable work remains outside EventBus and may be governed by JobQueue/application boundaries.

## Ordering

`NO_ORDERING_GUARANTEE`.

No global, per-type, per-aggregate, registration-order, or FIFO guarantee is exposed by this contract.

The proposed implementation may iterate a local snapshot deterministically, but that iteration detail must not become an externally relied-upon ordering guarantee.

## Multiple subscribers

**Proposal:** at publish start, capture an active subscriber snapshot for the event type. Each distinct registration is invoked at most once for that dispatch.

Registering the same handler more than once creates distinct subscriptions; each registration has its own token and receives one invocation in the same dispatch snapshot.

Unsubscribe affects future dispatches. An in-flight dispatch operates on its captured snapshot.

## Duplicate subscription behavior

**Proposal:** duplicate registrations are allowed and are distinct subscription identities.

No global deduplication of handler registrations is performed.

## Dispatch completion

**Proposal:** `await publish(event)` means all selected handlers have settled. It does not mean persistence, external delivery, business processing completion, or durable success.

When all handlers succeed, the publish promise resolves.

When one or more handlers fail, the publish promise rejects after all selected handlers have settled, using an aggregate failure representation.

## Delivery

`NON-DURABLE`.

No exactly-once, at-least-once, durable replay, or durable delivery guarantee is claimed.

## Retry boundary

EventBus does not own durable retry. JobQueue is the documented durable retry boundary when asynchronous work requires persistence, attempts, locking and backoff.

A subscriber failure never causes an implicit durable retry.

## Observability

The runtime should expose dispatch failure information through the local observability mechanism available to the Desktop Core. Correlation/causation identifiers must be preserved when supplied.

No new protected telemetry schema is created by this proposal.

## Audit

EventBus does not create an AuditLog entry for every dispatch. Business/security audit remains the responsibility of the audit boundary and applicable event policy.

## Decision classification

All behavioral choices in this document are `PROPOSAL / LOCAL_RUNTIME_POLICY` pending human approval.

They do not modify global contracts and do not resolve `CONTRACT-001`, `CONTRACT-002` or `GOV-001`.

## Proposed V1 API

```ts
interface EventBus {
  subscribe(eventType: DomainEventType, handler: EventHandler): Subscription;
  unsubscribe(subscription: Subscription): void;
  publish(event: DomainEvent): Promise<DispatchResult>;
}
```

The exact exported type names remain implementation details until the runtime slice is approved.

## Runtime readiness

`READY_AFTER_HUMAN_APPROVAL`

The proposed local semantics close the previously undefined lifecycle/error questions without requiring a new global architectural decision. Runtime implementation remains frozen until human approval of this proposed observable behavior.
