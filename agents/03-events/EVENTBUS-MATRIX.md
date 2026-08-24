# IA-03 — EventBus Matrix

Status: `RUNTIME GATE / BLOCKED`

## Evidence

`docs/backend/event-bus.md` defines EventBus as in-process communication, not durable storage, with post-commit local consumers. Runtime is not implemented.

`packages/contracts/src/events.ts` currently materializes `event_id`, `event_type`, `store_id`, `aggregate_id`, `occurred_at_utc` and `payload`. `docs/domain/events.md` describes a richer envelope. IA-03 does not alter that global contract.

## Core matrix

| Attribute | Readiness finding | Gate |
|---|---|---|
| Responsibility | In-process dispatch of approved domain/application events to local consumers. | CLOSED |
| Input | Approved event object using current protected minimum envelope. | CLOSED |
| Output | Invocation of local subscribers; no durable external delivery. | PARTIAL |
| Persistence | None owned by EventBus. | CLOSED |
| Transaction boundary | Local consumer dispatch occurs after commit according to current documentation. | CLOSED |
| Idempotency | No EventBus-owned durable guarantee. | CLOSED NEGATIVE |
| Retry | Not EventBus-owned; JobQueue owns durable retry when applicable. | CLOSED |
| Backoff | No EventBus backoff policy defined. | CLOSED NEGATIVE |
| Ordering | `NO_ORDERING_GUARANTEE`; no stronger ordering documented. | CLOSED |
| Deduplication | No EventBus storage responsibility or guarantee. | CLOSED NEGATIVE |
| Failure mode | Subscriber failure propagation/isolation still undefined. | BLOCKED |
| Recovery | No durable EventBus recovery guarantee. | CLOSED NEGATIVE |
| Audit | No implicit AuditLog record per dispatch. | CLOSED NEGATIVE |
| Observability | Failure visibility and correlation/causation preservation required; telemetry schema non-normative. | PARTIAL |
| Subscriber scheduling | Synchronous/asynchronous execution model undefined. | BLOCKED |
| Cancellation | Undefined. | BLOCKED |
| Timeout | Undefined. | BLOCKED |
| Dispatch completion | Undefined. | BLOCKED |
| Subscription lifecycle | Registration/unsubscribe/duplicate registration semantics incomplete. | BLOCKED |

## Current event catalogue analysis

| Event type | Source | Aggregate | Trigger | Payload | Event identity/timing | Correlation/causation | Status |
|---|---|---|---|---|---|---|---|
| `order.created` | Domain event contract | `Order` | Order creation lifecycle | Generic in current TS contract | `event_id` + `occurred_at_utc` | Documented envelope supports metadata; current TS contract does not expose it | DEFINED |
| `order.confirmed` | Domain event contract | `Order` | Order confirmation milestone | Generic in current TS contract | `event_id` + `occurred_at_utc` | Same envelope limitation | DEFINED |
| `order.status_changed` | Domain event contract | `Order` | Order lifecycle status change | Generic in current TS contract | `event_id` + `occurred_at_utc` | Same envelope limitation | AMBIGUOUS / `CONTRACT-002` |
| `order.cancelled` | Domain event contract | `Order` | Order cancellation | Generic in current TS contract | `event_id` + `occurred_at_utc` | Same envelope limitation | DEFINED |

No payload schemas, producer names, event versions, audit rules or persistence requirements are invented for individual events.

## Event envelope readiness

| Field | Required? | Type | Evidence | Status |
|---|---|---|---|---|
| `event_id` | Yes | `string` | `packages/contracts/src/events.ts` | DEFINED |
| `event_type` | Yes | `DomainEventType` | `packages/contracts/src/events.ts` | DEFINED |
| `store_id` | Yes | `string` | `packages/contracts/src/events.ts` | DEFINED |
| `aggregate_id` | Yes | `string` | `packages/contracts/src/events.ts` | DEFINED |
| `occurred_at_utc` | Yes | string | `packages/contracts/src/events.ts` | DEFINED |
| `payload` | Yes | `unknown` | `packages/contracts/src/events.ts` | DEFINED / SHAPE OPEN |
| `event_version` | Documented, not materialized | UNKNOWN | `docs/domain/events.md` | PARTIAL |
| `aggregate_type` | Documented, not materialized | UNKNOWN | `docs/domain/events.md` | PARTIAL |
| `producer` | Documented, not materialized | UNKNOWN | `docs/domain/events.md` | PARTIAL |
| `correlation_id` | Preserve when supplied | `string` when supplied | `docs/domain/events.md` | PARTIAL |
| `causation_id` | Preserve when supplied | `string` when supplied | `docs/domain/events.md` | PARTIAL |

## Publish / subscribe semantics

### Publish

- In-process communication.
- Post-commit local-consumer boundary.
- Not durable storage.
- No automatic EventBus retry guarantee.
- No DomainOutbox coupling.

### Subscribe

Conceptual lifecycle:

`subscribe(eventType, handler) -> registration`

`unsubscribe(registration)`

The exact handler return type, scheduling, cancellation, timeout, isolation, cleanup, duplicate registration and completion semantics remain undefined.

## Delivery / ordering

`NO_ORDERING_GUARANTEE` is explicit at EventBus scope.

Delivery has no durable guarantee and is not classified as exactly-once, at-least-once or durable replay.

WSS sequence ordering is transport-scoped and must not become EventBus ordering semantics.

## Retry boundary

EventBus does not own durable retry. `docs/backend/jobs.md` assigns retry/backoff/attempt state/locking/observability to JobQueue. A subscriber failure must not automatically create durable retry behavior.

## Test readiness

Future deterministic tests must cover the finalized behavior for:

- subscribe/unsubscribe;
- event-type routing;
- post-commit timing;
- subscriber scheduling;
- multiple subscriber execution;
- subscriber failure propagation/isolation;
- cancellation/timeout when defined;
- dispatch completion;
- correlation/causation preservation;
- no persistence;
- no automatic retry;
- no DomainOutbox coupling.

Tests must not imply exactly-once delivery, durable replay or stronger ordering absent an approved contract.
