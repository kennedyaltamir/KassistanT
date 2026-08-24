# IA-03 — EventBus Test Matrix

## Status

`READINESS / TESTS NOT IMPLEMENTED / RUNTIME GATE BLOCKED`

These are deterministic test requirements only. No test code is created in this phase.

| Test | Required assertion | Dependency | Status |
|---|---|---|---|
| Subscribe | Registered handler becomes eligible for matching event type | Handler contract | BLOCKED BY LIFECYCLE SEMANTICS |
| Unsubscribe | Removed registration no longer receives subsequent matching events | Subscription lifecycle | BLOCKED |
| Publish routing | Matching event type is routed to eligible subscribers | Event type contract | READY |
| Publish after commit | Local dispatch occurs only from documented post-commit boundary | Transaction integration | READY |
| Multiple subscribers | Finalized registration/execution/failure semantics are deterministic | Subscriber contract | BLOCKED |
| Subscriber failure | Finalized propagation behavior is deterministic | Error contract | BLOCKED |
| Subscriber isolation | Failure of one handler follows the finalized isolation rule | Error contract | BLOCKED |
| Dispatch completion | `publish()` completion has one explicit documented meaning | Completion contract | BLOCKED |
| Scheduling | Handler start/completion timing follows finalized scheduling semantics | Scheduling contract | BLOCKED |
| Cancellation | Finalized cancellation behavior is deterministic; no implicit support | Lifecycle contract | BLOCKED |
| Timeout | Finalized timeout behavior is deterministic; no implicit timeout | Lifecycle contract | BLOCKED |
| Ordering | EventBus asserts `NO_ORDERING_GUARANTEE`; no stronger ordering is inferred | Ordering contract | READY NEGATIVE TEST |
| Correlation propagation | Existing correlation identifier remains unchanged | Event envelope | READY |
| Causation propagation | Existing causation identifier remains unchanged | Event envelope | READY |
| Payload forwarding | Payload arrives unchanged according to approved event contract | Event contract | READY |
| Duplicate registration | Behavior is tested only after duplicate-registration semantics are explicit | Subscription contract | BLOCKED |
| Duplicate event | No behavior beyond finalized duplicate semantics is asserted | Idempotency contract | BLOCKED |
| Retry | EventBus performs no automatic durable retry | JobQueue boundary | READY NEGATIVE TEST |
| Persistence | EventBus performs no durable persistence | EventBus scope | READY NEGATIVE TEST |
| DomainOutbox coupling | EventBus is usable without DomainOutbox | CONTRACT-001 | READY NEGATIVE TEST |

## Minimum future suite

The first runtime slice requires deterministic coverage for publish, subscribe, unsubscribe, post-commit timing, routing, multi-subscriber behavior, handler failure/isolation, lifecycle semantics, correlation/causation preservation, and the explicit absence of durability, automatic retry, and DomainOutbox coupling.

Tests must not encode exactly-once, durable replay, global ordering, automatic retry, or DomainOutbox transaction semantics unless a later protected contract explicitly defines them.
