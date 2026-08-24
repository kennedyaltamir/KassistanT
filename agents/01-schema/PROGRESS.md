# IA-01 — PROGRESS

## Current phase

**Controlled Parallel Execution / Canonical Schema Consolidation**

## Phase status

- Phase 1: `DONE WITH BLOCKERS`.
- Phase 2: `COMPLETE AS SPECIFICATION / BLOCKED FOR DDL`.
- Decision package: `COMPLETE / REVIEW REQUIRED`.
- Parallel consolidation: `ACTIVE / SCHEMA-GATE PENDING`.

## Latest verified evidence

The approved IA-02 D2 decisions were incorporated only where they have a physical consequence.

- DREQ-001 confirms `Order` as aggregate root and `OrderItem` / `OrderItemModifier` as aggregate-owned children.
- DREQ-001 does not freeze parent key names, FK actions, ordering, uniqueness or physical representation.
- DREQ-001 explicitly leaves `OrderStatusHistory` persistence/ownership unresolved.
- DREQ-002 confirms `DRAFT -> CONFIRMED` through `ConfirmOrder` and `order.confirmed`.
- DREQ-002 does not authorize persisted `order.status_changed` structures.
- DREQ-005 and DREQ-006 are semantic decisions and explicitly do not authorize new persistence representations.
- IA-03, IA-05, IA-06 and IA-07 still expose physical persistence dependencies without complete schema field closure.

## Current readiness

Under the strict deterministic-state model:

- `DETERMINISTIC`: 0.
- `DETERMINISTIC_AFTER_HUMAN_APPROVAL`: 0.
- `DETERMINISTIC_AFTER_CROSS_AGENT_RESPONSE`: 0.
- `BLOCKED`: 28.
- `UNKNOWN`: 0.

Previous planning buckets remain useful but must not be confused with readiness:

- 3 candidate tables primarily waiting on local physical approval.
- 14 candidate tables with material cross-agent semantic dependencies.
- 1 candidate table with localized global dependency (`DomainOutbox`).
- 10 tables with direct field/relationship gaps.

## Human decisions

SD-001..SD-005 remain `PROPOSAL / PENDING OPERATOR APPROVAL`.

## Migration

`0002 = NOT_AUTHORIZED`.

No migration was created. `0001_bootstrap.sql` and M5.1 remain unchanged.

## Next gate

Collect explicit operator approval and actual owner responses; validate them against evidence; resolve conflicts; then reclassify tables. Only after all physical properties are closed may the deterministic-generation gate pass.
