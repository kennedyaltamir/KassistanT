# IA-03 — EventBus Test Matrix

## Status

`PROPOSAL / TESTS NOT IMPLEMENTED / HUMAN APPROVAL REQUIRED`

These are deterministic test requirements for the proposed EventBus V1 contract. No runtime test code is created in this phase.

| Test | Required assertion | Dependency | Status |
|---|---|---|---|
| Subscribe | `subscribe()` creates a distinct active subscription and returns an opaque identity | Local runtime policy | PROPOSED |
| Unsubscribe | `unsubscribe()` deactivates the registration | Local runtime policy | PROPOSED |
| Duplicate unsubscribe | Repeated unsubscribe is a no-op | Local runtime policy | PROPOSED |
| Publish routing | Only active subscribers for the published event type are selected | Event type contract | PROPOSED |
| Post-commit timing | Publication is invoked from the documented post-commit boundary | Transaction integration | PROPOSED |
| Multiple subscribers | Each distinct registration in the publish snapshot is invoked at most once | Multiple-subscriber policy | PROPOSED |
| Duplicate registration | Registering the same handler twice creates two independent registrations | Subscription policy | PROPOSED |
| Subscriber isolation | Failure of subscriber A does not suppress B/C | Failure isolation policy | PROPOSED |
| Failure aggregation | `publish()` rejects after all selected handlers settle when one or more fail | Failure propagation policy | PROPOSED |
| Dispatch completion | Success means all selected handlers settled successfully | Completion policy | PROPOSED |
| Async handler | `void` and `Promise<void>` handlers are both supported within the proposed handler contract | Handler contract | PROPOSED |
| Cancellation | Unsubscribe affects future dispatches; started handlers are not forcibly cancelled | Cancellation policy | PROPOSED |
| Timeout | No EventBus timeout is applied in V1 | Timeout policy | PROPOSED NEGATIVE TEST |
| Ordering | No global/per-type/per-aggregate/FIFO ordering guarantee is asserted | Ordering policy | READY NEGATIVE TEST |
| Correlation propagation | Existing correlation identifier remains unchanged across dispatch | Event envelope | READY |
| Causation propagation | Existing causation identifier remains unchanged across dispatch | Event envelope | READY |
| Payload forwarding | Payload arrives unchanged according to approved event contract | Event contract | READY |
| Retry | EventBus performs no automatic durable retry | JobQueue boundary | READY NEGATIVE TEST |
| Persistence | EventBus performs no durable persistence | EventBus scope | READY NEGATIVE TEST |
| DomainOutbox coupling | EventBus is usable without DomainOutbox | CONTRACT-001 | READY NEGATIVE TEST |

## Test invariants

The future suite must prove the proposed local policy without promoting it to a global guarantee:

1. One subscriber failure does not suppress independent subscribers.
2. Failure is surfaced after all selected handlers settle.
3. Unsubscribe is idempotent.
4. Duplicate registration creates distinct subscription identities.
5. In-flight dispatch uses its captured snapshot.
6. No timeout is introduced by EventBus V1.
7. No durable persistence is performed.
8. No automatic durable retry is performed.
9. No DomainOutbox interaction is required.
10. No ordering guarantee is asserted.

## Not covered

The test suite must not encode:

- exactly-once delivery;
- at-least-once delivery;
- durable replay;
- global ordering;
- per-aggregate ordering;
- automatic retry;
- DomainOutbox transaction semantics;
- WSS transport sequence semantics.

## Authorization gate

No tests will be implemented until the proposed local runtime policy is approved by the operator.
