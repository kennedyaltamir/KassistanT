# IA-03 — EventBus Implementation Gate

## Current state

`READY_WITH_OPEN_NONBLOCKING_ITEMS`

This gate authorizes implementation only after the open non-blocking semantics below are explicitly settled within IA-03's implementation contract or by approved global contracts. It is not runtime code and does not modify protected sources.

## Preconditions

### G0 — Branch
`Agent03-event-infrastructure` must be based on current `main` and contain no unrelated changes.

### G1 — Event contract
The implementation must consume approved event types without modifying `packages/contracts/**`. `CONTRACT-002` must remain respected; `order.status_changed` must not be locally normalized.

### G2 — Envelope
The runtime must accept the currently materialized `DomainEvent` minimum fields. Correlation/causation/version metadata may be preserved when supplied by the approved source contract; no silent contract expansion is allowed.

### G3 — Post-commit boundary
Dispatch must be invoked from the documented post-commit boundary. EventBus must not become transaction manager or DomainOutbox implementation.

### G4 — Handler contract
Before production implementation, define handler registration, invocation, completion shape, failure propagation, subscriber isolation, cancellation and cleanup. These are currently not fully normative.

### G5 — Ordering
Select and document one of: no ordering guarantee, explicitly scoped ordering, or another contract-backed guarantee. Do not infer ordering from data structures or implementation convenience.

### G6 — Retry boundary
EventBus must not own durable retry by default. JobQueue owns documented retry/backoff capabilities. Any deviation requires explicit contract evidence.

### G7 — Tests
Deterministic tests must exist for the finalized publish/subscribe/error semantics and negative guarantees: no persistence, no automatic retry, no implicit DomainOutbox coupling.

## Explicit non-goals

The first EventBus slice must not implement:

- SQLite persistence;
- Inbox/Outbox/JobQueue/AuditLog;
- replay/reconciliation/dead-letter;
- WSS transport;
- external delivery;
- business rules;
- exactly-once semantics by assumption.

## Blockers that remain outside the slice

`CONTRACT-001` remains open and continues to block DomainOutbox implementation.

`CONTRACT-002` remains open and continues to affect the normative order-event catalogue, but it does not require EventBus to mutate or remove the currently materialized event type.

`GOV-001` remains open and is not resolved here.

## Start condition

Production EventBus implementation may begin when G0-G7 are evidenced. Until then, the branch remains documentation/readiness only.
