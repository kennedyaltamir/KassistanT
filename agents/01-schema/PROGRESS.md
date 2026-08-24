# IA-01 — PROGRESS

## Current phase

**Schema Decision Package / Physical Blocker Closure**

## Phase 1

`DONE WITH BLOCKERS` — 28 entities, field/relationship/constraint/index/blocker audit completed.

## Phase 2

`COMPLETE AS SPECIFICATION / BLOCKED FOR DDL`.

## Decision package

- `SCHEMA-DECISION-MATRIX.md` — decision authority and blocker impact.
- `SCHEMA-AUTHORITY-MATRIX.md` — semantic authority vs physical ownership.
- `TABLE-READINESS-MATRIX.md` — per-table readiness reclassification.
- Updated physical schema, constraint/index, relationship and migration projection artifacts.

## Reclassified readiness

- READY_AFTER_LOCAL_DECISION: 3.
- READY_AFTER_CROSS_AGENT_DECISION: 14.
- READY_AFTER_GLOBAL_DECISION: 1.
- READY_AFTER_EXTERNAL_DECISION: 0.
- BLOCKED: 10.
- READY_FOR_MIGRATION: 0.

## Contract impact

- CONTRACT-001: localized global blocker for DomainOutbox physical design.
- CONTRACT-002: currently non-blocking for physical schema.
- GOV-001: deferred unless an actual normative conflict changes schema interpretation.

## Implementation status

`IMPLEMENTATION_STARTED = FALSE`.

No migration was created. `0001_bootstrap.sql`, M5.1 runtime, contracts and global documentation remain unchanged.

## Next gate

Human/project authority review of local physical proposals and cross-agent semantic decisions. After approval, re-run the readiness matrix and only then consider generating `0002`.
