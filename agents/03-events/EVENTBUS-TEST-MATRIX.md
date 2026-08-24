# IA-03 — EventBus Test Matrix

## Status

`READINESS / TESTS NOT IMPLEMENTED`

These are deterministic test requirements only. No test code is created in this phase.

| Test | Required assertion | Dependency | Status |
|---|---|---|---|
| Subscribe | A registered handler becomes eligible for matching event type | Handler contract | READY TO SPECIFY |
| Unsubscribe | Removed registration no longer receives subsequent matching events | Subscription lifecycle | READY TO SPECIFY |
| Publish routing | Only subscribers for the published type are selected | Event type contract | READY TO SPECIFY |
| Publish after commit | Local dispatch occurs only after the documented commit boundary | Transaction integration | READY TO SPECIFY |
| Multiple subscribers | Defined dispatch order/isolation is verified once finalized | Subscribe semantics | BLOCKED BY OPEN SEMANTICS |
| Subscriber failure | Finalized propagation/isolation behavior is deterministic | Error contract | BLOCKED BY OPEN SEMANTICS |
| Correlation propagation | Existing correlation identifier is unchanged across dispatch | Event envelope | READY |
| Causation propagation | Existing causation identifier is unchanged across dispatch | Event envelope | READY |
| Duplicate event | No claim beyond finalized duplicate behavior; test only if a contract specifies it | Idempotency contract | BLOCKED |
| Ordering | No global/per-aggregate guarantee is asserted unless a contract later defines one | Ordering contract | BLOCKED |
| Retry | EventBus does not perform automatic retry unless a later contract explicitly assigns it | JobQueue boundary | READY NEGATIVE TEST |
| Persistence | EventBus performs no durable persistence | EventBus scope | READY NEGATIVE TEST |
| DomainOutbox coupling | EventBus can be exercised without DomainOutbox | CONTRACT-001 | READY NEGATIVE TEST |
| Handler cancellation/timeout | Exact semantics verified only after contract closure | Handler lifecycle | BLOCKED |

## Minimum future test suite

The first runtime slice should have deterministic coverage for publish, subscribe, unsubscribe, post-commit timing, event routing, correlation/causation preservation, explicit failure behavior and the absence of implicit persistence/retry.

Tests must not encode:

- exactly-once delivery;
- durable replay;
- global ordering;
- automatic retry;
- DomainOutbox transaction semantics;

unless those behaviors are later approved by protected contracts.
