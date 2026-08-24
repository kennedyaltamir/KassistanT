# IA-01 — CHANGELOG

## [0.4.0] — 2026-08-24

### Added

- `SCHEMA-DECISION-MATRIX.md`.
- `SCHEMA-AUTHORITY-MATRIX.md`.
- `TABLE-READINESS-MATRIX.md`.

### Updated

- `CANONICAL-SCHEMA-SPEC.md` with explicit decision authority and blocker scope.
- `MIGRATION-0002-READINESS.md` with per-table readiness reclassification.
- `MIGRATION-0002-PROJECTION.md` with decision-dependent dependency order.
- IA-01 memory, learnings, decisions, errors, progress, roadmap and handoff.

### Decision package outcome

- 3 tables are candidates for local IA-01 physical closure.
- 14 require cross-agent semantic decisions.
- 1 (`DomainOutbox`) requires global decision closure where physical ownership is affected.
- 10 remain blocked by missing field/relationship semantics.
- `CONTRACT-002` is currently non-blocking for physical schema.

### Preserved

- No migration `0002` created.
- No modification to `0001_bootstrap.sql`.
- No modification to M5.1 runtime.
- No modification to `packages/domain/**` or `packages/contracts/**`.
- No modification to global documentation.
- No modification outside `agents/01-schema/**`.
