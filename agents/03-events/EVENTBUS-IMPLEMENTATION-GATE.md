# IA-03 — EventBus Implementation Gate

## Current state

`BLOCKED`

This gate does not authorize runtime code. It records the exact remaining semantics required before the first EventBus production slice.

## Closed gates

### G0 — Branch
`Agent03-event-infrastructure` remains based on current `main`; no unrelated territory is permitted.

### G1 — Event contract boundary
Consume approved event objects without modifying `packages/contracts/**`. `CONTRACT-002` remains open and must not be normalized locally.

### G2 — Envelope
The currently materialized minimum envelope is accepted as the protected boundary. Correlation/causation/version metadata may be preserved only when supplied by an approved source contract.

### G3 — Post-commit boundary
EventBus dispatch is post-commit local communication. It is not the transaction manager and does not implement DomainOutbox.

### G5 — Ordering
`NO_ORDERING_GUARANTEE` is the only supported EventBus ordering statement under current evidence. No global, per-type, per-aggregate or FIFO guarantee may be implied.

### G6 — Retry boundary
EventBus does not own durable retry. JobQueue owns documented retry/backoff capabilities. Subscriber failure must not imply automatic EventBus retry.

## Open blocking gates

### G4 — Subscriber lifecycle and handler contract
Still missing normative definitions for:

- executable handler shape;
- synchronous vs asynchronous scheduling;
- subscriber failure propagation;
- subscriber isolation;
- cancellation;
- timeout;
- unsubscribe lifecycle;
- duplicate registration behavior;
- dispatch completion semantics.

**Status:** `BLOCKED`.

### G7 — Deterministic tests
The test matrix is specified but several tests remain blocked by the open lifecycle/error semantics. Runtime tests must not be implemented against invented behavior.

**Status:** `BLOCKED`.

## External blockers

`CONTRACT-001` remains open and blocks DomainOutbox implementation.

`CONTRACT-002` remains open and affects the normative order-event catalogue.

`GOV-001` remains open and is not resolved here.

These are not locally resolvable by IA-03.

## Implementation consequence

The first runtime candidate remains:

`IN-PROCESS EVENTBUS`

but runtime implementation must not begin until G4 and G7 are explicitly closed without inventing behavior.
