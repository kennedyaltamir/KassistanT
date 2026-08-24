# IA-03 — Progress

## Current phase

EventBus Local Decision Closure / First Runtime Authorization.

## Status

`READY_AFTER_HUMAN_APPROVAL / RUNTIME IMPLEMENTATION FROZEN`

## Current EventBus state

- Envelope boundary: CLOSED.
- Publish boundary: CLOSED — in-process/post-commit.
- Delivery: CLOSED — non-durable.
- Ordering: CLOSED — `NO_ORDERING_GUARANTEE`.
- Durable retry: CLOSED — outside EventBus; JobQueue owns that boundary.
- DomainOutbox coupling: CLOSED OUTSIDE SCOPE — `CONTRACT-001` remains external.

## Proposed local runtime policies

- Subscriber failures are isolated.
- `publish()` continues selected subscribers after individual failures.
- Failures are aggregated and surfaced after all selected handlers settle.
- `subscribe()` returns an opaque subscription identity.
- `unsubscribe()` is idempotent.
- Duplicate registrations are distinct subscriptions.
- Dispatch uses a publish-time subscriber snapshot.
- Cancellation is unsubscribe-only in V1.
- EventBus has no V1 timeout; timeout is deferred.
- `await publish()` means all selected handlers have settled; it never means durable or business completion.
- No public ordering guarantee is created by internal iteration order.

All items above are `PROPOSAL / LOCAL_RUNTIME_POLICY`, not approved decisions.

## Decision status

`HUMAN REVIEW REQUIRED`

No production runtime may be implemented until the operator approves the proposed observable behavior documented in `HUMAN-EVENTBUS-DECISIONS.md`.

## Other Event Infrastructure state

- InboundInbox: NOT_IMPLEMENTED; blocked on canonical persistence/schema.
- DomainOutbox: NOT_IMPLEMENTED; blocked by `CONTRACT-001`.
- JobQueue: NOT_IMPLEMENTED; blocked on canonical persistence/reliability policy.
- AuditLog: NOT_IMPLEMENTED; blocked on canonical persistence/policy details.

## Constraint

No product runtime implementation, schema, migration, protected contract, global documentation, shared configuration or other agent territory was modified.
