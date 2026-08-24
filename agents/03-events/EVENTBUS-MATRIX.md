# IA-03 — EventBus Matrix

Status: READINESS / NO RUNTIME IMPLEMENTATION

## Evidence

`docs/backend/event-bus.md` defines EventBus as in-process communication, not durable storage, with post-commit local consumers. Runtime is not implemented.

`packages/contracts/src/events.ts` currently materializes `event_id`, `event_type`, `store_id`, `aggregate_id`, `occurred_at_utc` and `payload`. `docs/domain/events.md` describes a richer envelope including version, aggregate type, producer, correlation and causation metadata. IA-03 does not alter that global contract.

## Core matrix

| Attribute | Readiness finding |
|---|---|
| Responsibility | In-process dispatch of approved domain/application events to local consumers. |
| Input | Approved domain event object. Current materialized minimum is `event_id`, `event_type`, `store_id`, `aggregate_id`, `occurred_at_utc`, `payload`. |
| Output | Invocation of local subscribers; no durable external delivery is assigned to EventBus. |
| Persistence | None owned by EventBus. |
| Transaction boundary | Local consumer dispatch occurs after commit according to current documentation. |
| Idempotency | Not an EventBus-owned durable guarantee. |
| Retry | Not EventBus-owned; JobQueue provides the documented durable retry boundary when applicable. |
| Backoff | UNKNOWN for EventBus. |
| Ordering | UNKNOWN. No global or per-aggregate guarantee is documented. |
| Deduplication | Not an EventBus storage responsibility; no durable deduplication guarantee. |
| Failure mode | Subscriber failure semantics require final implementation-contract closure. |
| Recovery | No durable EventBus recovery guarantee. |
| Audit | No implicit AuditLog record for every local dispatch. |
| Observability | Dispatch failures and available correlation/causation metadata should be observable; exact telemetry schema remains non-normative. |
| Evidence strength | STRONG for scope/post-commit; PARTIAL for executable handler/error semantics. |
| Implementation state | NOT_STARTED |
| Readiness | READY_WITH_OPEN_NONBLOCKING_ITEMS |

## Current event catalogue analysis

| Event type | Source | Aggregate | Trigger | Payload | Event identity/timing | Correlation/causation | Status |
|---|---|---|---|---|---|---|---|
| `order.created` | Domain event contract | `Order` | Order creation lifecycle | Current TypeScript contract leaves payload shape generic | `event_id` + `occurred_at_utc` | Documented envelope supports metadata; current TS contract does not expose it | DEFINED |
| `order.confirmed` | Domain event contract | `Order` | Order confirmation milestone | Generic in current TS contract | `event_id` + `occurred_at_utc` | Same envelope limitation | DEFINED |
| `order.status_changed` | Domain event contract | `Order` | Order lifecycle status change | Generic in current TS contract | `event_id` + `occurred_at_utc` | Same envelope limitation | AMBIGUOUS / `CONTRACT-002` |
| `order.cancelled` | Domain event contract | `Order` | Order cancellation | Generic in current TS contract | `event_id` + `occurred_at_utc` | Same envelope limitation | DEFINED |

The matrix above intentionally does not invent payload schemas, producer names, event versions, audit rules or persistence requirements for individual events where the protected contracts do not define them.

## Event envelope readiness

| Field | Required? | Type | Evidence | Status |
|---|---|---|---|---|
| `event_id` | Yes | `string` | `packages/contracts/src/events.ts` | DEFINED |
| `event_type` | Yes | `DomainEventType` | `packages/contracts/src/events.ts` | DEFINED |
| `store_id` | Yes | `string` | `packages/contracts/src/events.ts` | DEFINED |
| `aggregate_id` | Yes | `string` | `packages/contracts/src/events.ts` | DEFINED |
| `occurred_at_utc` | Yes | ISO UTC string contract | `packages/contracts/src/events.ts` | DEFINED |
| `payload` | Yes | `unknown` | `packages/contracts/src/events.ts` | DEFINED / SHAPE OPEN |
| `event_version` | Documented, not materialized in current TS type | `UNKNOWN` | `docs/domain/events.md` | PARTIAL |
| `aggregate_type` | Documented, not materialized in current TS type | `UNKNOWN` | `docs/domain/events.md` | PARTIAL |
| `producer` | Documented, not materialized in current TS type | `UNKNOWN` | `docs/domain/events.md` | PARTIAL |
| `correlation_id` | Documented when applicable; absent from current TS type | `string` when supplied | `docs/domain/events.md`, WSS contract | PARTIAL |
| `causation_id` | Documented when applicable; absent from current TS type | `string` when supplied | `docs/domain/events.md`, WSS contract | PARTIAL |

## Publish / subscribe semantics

### Publish

- In-process communication.
- Post-commit local-consumer boundary.
- Not durable storage.
- No automatic EventBus retry guarantee.
- No DomainOutbox coupling is implied.

### Subscribe

Conceptual lifecycle only:

`subscribe(eventType, handler) -> registration`

`unsubscribe(registration)`

The exact handler return type, synchronous/asynchronous execution, cancellation, timeout, subscriber isolation and cleanup rules remain `UNKNOWN` until the implementation contract is finalized.

## Delivery / ordering

Delivery is `UNSPECIFIED` beyond the documented in-process/post-commit scope. The repository does not establish `at-most-once`, `at-least-once`, `exactly-once` or global-order semantics for EventBus.

WSS sequence ordering is a transport concern and must not be promoted into an EventBus guarantee.

## Retry boundary

EventBus does not own durable retry. `docs/backend/jobs.md` assigns retry/backoff/attempt state/locking/observability to JobQueue. A subscriber failure must not automatically create a JobQueue job unless an explicit caller/consumer contract does so.

## Test readiness

Future deterministic tests must cover only finalized semantics:

- subscribe/unsubscribe;
- event-type routing;
- post-commit timing;
- subscriber invocation semantics;
- subscriber failure propagation/isolation;
- correlation and causation preservation when present;
- no implicit persistence;
- no implicit retry;
- no DomainOutbox coupling.

Tests must not imply exactly-once delivery, durable replay or global ordering absent an approved contract.
