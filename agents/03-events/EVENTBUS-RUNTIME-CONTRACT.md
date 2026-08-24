# IA-03 — EventBus Runtime Contract

## Status

`READINESS / NO RUNTIME IMPLEMENTATION`

This document is a territory-level readiness contract. It does not modify or supersede `packages/contracts/**`, does not resolve `CONTRACT-001`, and does not resolve `CONTRACT-002`.

## Evidence hierarchy

1. `docs/backend/event-bus.md`
2. `docs/domain/events.md`
3. `packages/contracts/src/events.ts`
4. WSS contract only where explicitly transport-scoped
5. IA-03 readiness artifacts

## EventEnvelope

The currently materialized TypeScript event contract requires:

- `event_id: string`
- `event_type: DomainEventType`
- `store_id: string`
- `aggregate_id: string`
- `occurred_at_utc: string`
- `payload: unknown`

The domain documentation additionally describes `event_version`, `aggregate_type`, `producer`, `correlation_id`, `causation_id`, `schema` and `payload`. These additional fields are documented evidence but are not all present in the current TypeScript contract. Runtime code must not silently expand the protected contract.

Where correlation or causation data exists in the approved event source, the EventBus must preserve it. Absence must not be synthesized.

## Publish

**Specification:** EventBus provides in-process local publication of an approved event after the business transaction commits.

**Evidence:** `docs/backend/event-bus.md` explicitly defines EventBus as in-process communication and post-commit local consumers.

**Status:** `EXPLICIT`.

**Implementation consequence:** the first slice must not persist events, participate in the business transaction, or couple publication to DomainOutbox.

## Subscribe

**Specification:** Local consumers may register against approved event types.

**Evidence:** backend documentation identifies local consumers such as notifications, sounds, badges and dashboard updates.

**Status:** `PARTIAL`.

**Implementation consequence:** the concrete handler signature, scheduling model and lifecycle must not be invented from this document alone.

## Unsubscribe

**Specification:** A subscription lifecycle exists conceptually, but the repository does not define a normative executable unsubscribe contract.

**Evidence:** No protected source currently defines subscription identity, duplicate registration semantics, duplicate unsubscribe behavior or cleanup guarantees.

**Status:** `UNKNOWN`.

**Implementation consequence:** runtime implementation remains gated on an explicit local contract or approved implementation decision.

## Scheduling

**Specification:** Publication is post-commit, but the repository does not define whether subscriber handlers run synchronously, asynchronously, through microtasks, or through a queue.

**Evidence:** `docs/backend/event-bus.md` defines only in-process/post-commit behavior.

**Status:** `UNKNOWN`.

**Implementation consequence:** no scheduling model may be claimed as normative yet.

## Subscriber failure propagation

**Specification:** The repository does not define whether a handler failure is returned to the publisher, collected, logged only, or represented through another result contract.

**Status:** `UNKNOWN`.

**Implementation consequence:** production runtime is blocked until the failure boundary is explicitly defined.

## Subscriber isolation

**Specification:** The repository does not define whether failure of subscriber A allows subscriber B/C to execute, whether dispatch is fail-fast, or whether errors are aggregated.

**Status:** `UNKNOWN`.

**Implementation consequence:** multiple-subscriber failure behavior is an implementation gate.

## Cancellation

**Specification:** No protected EventBus source defines publisher cancellation, subscriber cancellation, `AbortSignal`, or cancellation cleanup semantics.

**Status:** `UNKNOWN`.

**Implementation consequence:** the runtime must not invent cancellation behavior and must not claim cancellation support until defined.

## Timeout

**Specification:** No protected EventBus source defines handler or dispatch timeouts, timeout ownership, timeout errors, or post-timeout behavior.

**Status:** `UNKNOWN`.

**Implementation consequence:** no timeout value or implicit timeout mechanism may be introduced as contract behavior.

## Ordering

**Specification:** EventBus has no documented ordering guarantee.

**Status:** `EXPLICIT / NO_ORDERING_GUARANTEE`.

**Implementation consequence:** implementation and tests must not promise global, per-event-type, per-aggregate, registration-order, or FIFO ordering unless a later protected contract adds one.

The WSS `sequence` field is transport-scoped and must not be reused as EventBus ordering semantics.

## Multiple subscribers

**Specification:** Multiple local consumers exist, but registration order, execution order, parallelism/sequentiality and duplicate registration behavior are undefined.

**Status:** `PARTIAL / GATED`.

**Implementation consequence:** routing to multiple subscribers is in scope conceptually; execution/failure semantics remain gated.

## Delivery

**Specification:** EventBus is in-process and non-durable.

**Status:** `EXPLICIT / NO_DURABILITY_GUARANTEE`.

It is not classified as exactly-once, at-least-once, durable replay, or durable delivery infrastructure.

## Retry boundary

**Specification:** EventBus does not own durable retry. Job contracts assign retry/backoff/attempt state/locking/observability to JobQueue.

**Status:** `EXPLICIT`.

**Implementation consequence:** subscriber failure must not trigger implicit EventBus retry.

## Transaction boundary

**Specification:**

`business transaction -> commit -> local EventBus dispatch`

**Status:** `EXPLICIT`.

DomainOutbox transaction semantics are deliberately excluded because `CONTRACT-001` remains open.

## Dispatch completion

**Specification:** The repository does not define whether `publish()` completion means acceptance, handler start, handler invocation, all-handler completion, or merely scheduling.

**Status:** `UNKNOWN`.

**Implementation consequence:** the public completion contract is a blocking gate.

## Observability

**Specification:** Event correlation and causation must remain traceable when present. Dispatch failures should be observable.

**Status:** `PARTIAL`.

No normative EventBus metric schema or logging payload has been established.

## Audit

**Specification:** EventBus does not implicitly audit every in-process dispatch. Audit remains the responsibility of the audit boundary and applicable business/security event policy.

**Status:** `EXPLICIT`.

## Runtime readiness classification

`BLOCKED`

The following gates are explicitly closed:

- Event envelope scope is bounded by the existing contract.
- Publish is post-commit/in-process.
- EventBus is non-durable.
- EventBus does not own retry.
- No ordering guarantee is claimed.
- DomainOutbox remains outside the EventBus transaction decision.

The following remain genuine runtime blockers because the repository does not define them:

- unsubscribe lifecycle;
- scheduling semantics;
- subscriber failure propagation;
- subscriber isolation;
- cancellation;
- timeout;
- multiple-subscriber execution semantics;
- dispatch completion semantics.

## First runtime slice

`PROPOSED_FIRST_RUNTIME_SLICE = IN-PROCESS EVENTBUS`

It is **not yet implementation-authorized**. Authorization requires the remaining local gates to become explicit without modifying protected contracts or inventing behavior.
