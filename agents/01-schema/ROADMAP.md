# IA-01 — ROADMAP

## Scope
Canonical SQLite Schema and Persistence Schema Foundation only.

## Phase 0 — Territory configuration
`DONE`

## Phase 1 — Contract-to-schema audit
`DONE WITH BLOCKERS`

Primary artifact: `CANONICAL_SCHEMA_AUDIT.md`.

## Phase 2 — Canonical schema specification
`COMPLETE AS SPECIFICATION / BLOCKED FOR DDL`

Completed:

- physical mapping for 28 entities;
- 23 relationship classifications;
- constraint/index specifications;
- lifecycle/status semantic inventory;
- scope and mutability analysis;
- documentary `0002` projection.

## Phase 2.5 — Schema Decision Package
`COMPLETE / REVIEW REQUIRED`

Artifacts:

- `SCHEMA-DECISION-MATRIX.md`
- `SCHEMA-AUTHORITY-MATRIX.md`
- `TABLE-READINESS-MATRIX.md`
- updated `CANONICAL-SCHEMA-SPEC.md`
- updated `MIGRATION-0002-READINESS.md`
- updated `MIGRATION-0002-PROJECTION.md`

Result:

- 3 tables require only local physical decisions;
- 14 require cross-agent semantic decisions;
- 1 requires global decision (`DomainOutbox` / CONTRACT-001);
- 10 remain directly blocked by missing field/relationship semantics;
- `CONTRACT-002` is currently non-blocking for physical schema;
- `GOV-001` is deferred unless an actual source conflict affects schema interpretation.

## Phase 3 — Canonical migration implementation
`BLOCKED / NOT_STARTED`

Preconditions:

- local physical proposals approved;
- cross-agent semantic gaps closed;
- DomainOutbox physical scope resolved where required;
- every included table is deterministic;
- deterministic-generation review passes.

## Phase 4 — Schema validation
`NOT_STARTED`

## Phase 5 — Cross-agent integration audit
`NOT_STARTED`

## Phase 6 — Handoff and PR readiness
`NOT_STARTED`

## Guardrail

No migration may be created because plausible SQL exists. `0002` requires authoritative deterministic physical specification.
