# IA-03 — EventBus Matrix

Status: READINESS / NO RUNTIME IMPLEMENTATION

## Evidence

`docs/backend/event-bus.md` defines EventBus as in-process communication, not durable storage, with post-commit local consumers. Runtime is not implemented.

## Matrix

| Attribute | Readiness finding |
|---|---|
| Responsibility | In-process dispatch of domain/application events to local consumers. |
| Input | Domain event object from an approved event contract. Exact executable interface is not yet defined. |
| Output | Delivery to subscribed local consumers; no durable external delivery is assigned to EventBus. |
| Persistence | None owned by EventBus. Durable state belongs to persistence/Inbox/Outbox/Job boundaries. |
| Transaction boundary | Consumer delivery occurs after commit according to current documentation. Exact transaction hook is implementation detail still to be specified. |
| Idempotency | Not normatively assigned to EventBus; consumers and durable boundaries must remain safe against duplicate logical effects. |
| Retry | Not normatively assigned to EventBus. Retry belongs to the appropriate durable job/event mechanism when required. |
| Backoff | UNKNOWN for EventBus itself. No exact algorithm is specified. |
| Ordering | UNKNOWN. No total-order or per-aggregate guarantee is documented. Do not invent one. |
| Deduplication | UNKNOWN / not an EventBus storage responsibility. |
| Failure mode | Consumer failure behavior is not normatively specified. Must not silently imply all-or-nothing delivery. |
| Recovery | EventBus itself has no durable recovery guarantee. Recovery must use durable infrastructure. |
| Audit | No dedicated EventBus audit contract identified. Audit remains an evidence concern for business/security events, not every in-process dispatch by default. |
| Observability | Publish/dispatch failures, correlation and causation should be observable where those identifiers exist; exact telemetry schema is not yet normative. |
| Consumers | Notifications, sounds, badges, dashboard updates; future local consumers. |
| Producers | Domain/application code using approved event types. |
| Dependencies | IA-02 event semantics; shared event contract; IA-03 technical dispatch boundary. |
| Evidence | `docs/backend/event-bus.md`, `docs/domain/events.md`, `packages/contracts/src/events.ts`. |
| Evidence strength | STRONG for scope; PARTIAL for executable semantics. |
| Implementation state | NOT_STARTED |
| Blocker | IA-02 event contract should be stable enough for implementation; `CONTRACT-002` affects normative order-event catalogue. |
| Readiness | CANDIDATE — can be prepared without persistence, but implementation must wait for contract stability. |

## Conceptual interface

The minimum conceptual API is:

- `publish(event)` — make an approved event available to local subscribers;
- `subscribe(eventType, handler)` — register a local consumer;
- `unsubscribe(subscription)` — remove a registration.

These names are conceptual only. They are not a protected API decision.

## Delivery semantics

The only documented guarantee is that EventBus is **in-process** and is used for **post-commit local consumers**. The repository does not establish a stronger delivery guarantee, ordering model, durable replay capability, or consumer retry contract.

## Test readiness

Tests should prove only the guarantees that become explicitly defined:

- subscriber registration/removal;
- event type routing;
- publication after the caller's commit boundary;
- deterministic handler invocation semantics;
- error propagation according to the finalized interface;
- correlation/causation preservation where present.

Do not create tests that imply durability, exactly-once delivery, global ordering or automatic retry unless a protected contract later defines them.
