# IA-02 — Domain Decision Package

## Purpose

Transform D1 readiness gaps into the minimum decision set required before Domain Runtime implementation.

## Current conclusion

- Canonical entities: 28.
- No aggregate root is normatively frozen.
- `Order` is the strongest aggregate candidate, but remains `INFERENCE`.
- Lifecycle documents are state catalogs, not complete normative transition matrices.
- Order commands exist as documented vocabulary, but executable contracts are partial.
- Domain errors are conceptually defined, but stable codes/mappings are not frozen.
- `CONTRACT-001` and `CONTRACT-002` remain open.
- No first runtime slice is currently `READY`.

## Decision minimization

| Gap | IA-02 | IA-01 | IA-03 | IA-04 | IA-05 | IA-06 | IA-07 | IA-08 | Global authority | Deferred? | Blocks first slice? | Classification |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Aggregate boundary | MAY PROPOSE | CONSULT | CONSULT | REQUIRED | CONSULT | NO | NO | NO | YES | NO | YES | CROSS_AGENT_DECISION |
| Order lifecycle transitions | MAY PROPOSE | NO | NO | REQUIRED | CONSULT | NO | NO | NO | YES | NO | YES | CROSS_AGENT_DECISION |
| `order.status_changed` semantics | NO | NO | REQUIRED | REQUIRED | CONSULT | NO | CONSULT | CONSULT | YES | MAYBE | YES for slices emitting it | GLOBAL_DECISION |
| DomainOutbox ownership | NO | CONSULT | REQUIRED | CONSULT | NO | NO | REQUIRED indirectly | NO | YES | MAYBE | NO for pure local slice; YES for outbox-integrated slice | GLOBAL_DECISION |
| Domain error semantic vocabulary | YES domain semantics | CONSULT boundary mapping | CONSULT mapping | REQUIRED for Order mapping | CONSULT | NO | CONSULT | NO | YES only if shared contract | NO | YES for command slice | CROSS_AGENT_DECISION |
| Command idempotency semantics | YES proposal | CONSULT persistence key | REQUIRED infrastructure | REQUIRED | CONSULT | NO | CONSULT | NO | YES if contract-global | NO | YES for externally retried command | CROSS_AGENT_DECISION |
| Authorization boundary | NO authority decision | NO | NO | REQUIRED | CONSULT | CONSULT | CONSULT | NO | YES | MAYBE | YES where actor semantics matter | GLOBAL_DECISION |
| Persistence boundary | YES domain abstraction only | REQUIRED schema | REQUIRED runtime | CONSULT | CONSULT | NO | NO | NO | YES where shared | MAYBE | YES for persisted slice | CROSS_AGENT_DECISION |
| Event envelope alignment | NO unilateral change | NO | REQUIRED | REQUIRED | CONSULT | NO | REQUIRED transport mapping | NO | YES for shared contract | NO | YES for emitted-event slice | CROSS_AGENT_DECISION |
| Query semantics | YES pure domain proposal | CONSULT schema | NO | CONSULT | CONSULT | NO | NO | CONSULT | MAYBE | YES | NO for pure command slice | LOCAL_DECISION |

## Minimum decisions actually required

Only four decision groups are necessary to unlock an initial Order-oriented runtime slice:

1. Explicit aggregate boundary for the first slice.
2. One normative transition for that slice, including preconditions and resulting state.
3. Complete contract for one command, including stable domain error semantics and idempotency behavior.
4. Stable event choice for the slice, or an explicit rule that the first slice emits no contested event.

`CONTRACT-001` should not be allowed to block a pure in-memory slice that does not persist or publish through DomainOutbox.

`CONTRACT-002` should block only slices that require `order.status_changed`; it does not have to block a slice that demonstrably avoids that event, provided global authority approves that avoidance.

## Local decisions IA-02 may make

IA-02 may define implementation-neutral domain proposals for:

- pure invariant enforcement;
- error meaning inside the domain boundary;
- value-object usage consistent with approved primitives;
- domain abstractions that do not alter shared contracts.

IA-02 may not unilaterally freeze cross-agent boundaries, event taxonomy, persistence ownership, authorization semantics or global state-machine behavior.

## First-slice gate

A slice is `READY` only when aggregate, command, transition, invariant, error, event and persistence semantics are all explicit enough to implement without a global architectural decision.

Current first-slice readiness: `BLOCKED`.
