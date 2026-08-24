# IA-03 — Progress

## Current phase

EventBus V1 Authorization and Implementation.

## Status

`IMPLEMENTED_AND_TESTED / FIRST SLICE COMPLETE`

## Approved EventBus policies

- subscriber failures are isolated;
- `publish()` continues all subscriptions in the dispatch snapshot;
- failures are aggregated after all selected handlers settle;
- subscriptions use opaque identities;
- `unsubscribe()` is idempotent;
- duplicate registrations are distinct;
- dispatch snapshots registrations at publish start;
- V1 cancellation is unsubscribe-only;
- V1 has no EventBus timeout;
- `await publish()` completes after all selected handlers settle;
- EventBus has `NO_ORDERING_GUARANTEE`;
- EventBus is in-process, post-commit, non-durable and has no durable retry or DomainOutbox coupling.

## Implementation

Implemented:

- `apps/desktop/electron/infrastructure/events/event-bus.ts`
- `apps/desktop/electron/infrastructure/events/event-bus.test.ts`

The implementation is intentionally isolated and does not integrate downstream consumers.

## Validation

The deterministic EventBus validation executed against the reconstructed branch sources with Node's TypeScript stripping runtime support:

- 10 tests passed;
- 0 failures;
- 0 cancellations;
- 0 skipped.

The repository's standard desktop test runner was not changed because its script configuration is outside IA-03 scope; the EventBus test file was executed directly with `node --experimental-strip-types --test` in the validation environment.

## Non-goals preserved

Inbox, Outbox, JobQueue, AuditLog, WSS, Device Auth, replay, reconciliation, dead-letter handling, durable retry and SQLite persistence were not implemented.

## Global contracts preserved

`CONTRACT-001`, `CONTRACT-002` and `GOV-001` remain open and unchanged.
