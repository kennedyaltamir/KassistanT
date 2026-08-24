# IA-03 — EventBus Test Matrix

## Status

`IMPLEMENTED / TESTED`

Deterministic runtime tests for EventBus V1 were implemented and executed.

| Test | Required assertion | Status |
|---|---|---|
| Subscribe | Creates distinct active subscription with opaque identity | PASS |
| Unsubscribe | Removes registration from future dispatch | PASS |
| Duplicate unsubscribe | Repeated unsubscribe is a no-op | PASS |
| Publish routing | Only active subscribers for the matching event type are selected | PASS |
| Post-commit boundary | EventBus API contains no transaction/persistence mechanism; integration remains caller-owned | COVERED BY CONTRACT |
| Multiple subscribers | Each snapshot registration is invoked at most once | PASS |
| Duplicate registration | Same handler can be registered twice as distinct subscriptions | PASS |
| Subscriber isolation | Failure of A does not suppress B | PASS |
| Failure aggregation | Result reports partial/complete failure after all handlers settle | PASS |
| Dispatch completion | Promise resolves only after selected handlers settle | PASS |
| Async handler | Promise-returning handler completes before dispatch completion | PASS |
| Cancellation | Unsubscribe affects future dispatches only | PASS |
| Timeout | No EventBus timeout is present in V1 | PASS / NEGATIVE |
| Ordering | No public ordering guarantee is asserted | PASS / NEGATIVE |
| Payload forwarding | Event object reaches handler unchanged | PASS |
| Retry | No automatic durable retry exists | PASS / NEGATIVE |
| Persistence | EventBus performs no durable persistence | PASS / NEGATIVE |
| DomainOutbox coupling | EventBus operates without Outbox/SQLite | PASS / NEGATIVE |

## Validation result

Isolated runtime execution:

- 10 tests passed;
- 0 failed;
- 0 cancelled;
- 0 skipped.

The repository's desktop test runner was not modified because its script configuration is outside IA-03 scope. The associated EventBus test file was executed directly with Node's test runner and TypeScript stripping support.

## Not covered by contract

The suite does not claim exactly-once, at-least-once, durable replay, global ordering, per-aggregate ordering, automatic durable retry or DomainOutbox transaction semantics.
