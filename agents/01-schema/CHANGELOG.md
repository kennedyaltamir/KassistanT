# IA-01 — CHANGELOG

## [0.2.0] — 2026-08-24

### Added

- Phase 1 Contract-to-Schema Audit completed.
- Added `CANONICAL_SCHEMA_AUDIT.md` with 28-entity canonical schema matrix.
- Added relationship, constraint, index, blocker and implementation-readiness matrices.
- Recorded explicit and partial field-level evidence without inventing schema details.
- Recorded seven normative unique constraints from baseline §23.1.
- Recorded schema-critical field gaps and unresolved contract dependencies.

### Preserved

- No change to `0001_bootstrap.sql`.
- No change to M5.1 SQLite runtime.
- No change to `packages/domain/**` or `packages/contracts/**`.
- No change to global documentation.
- No migration `0002` created.

### Outcome

Phase 1 is **COMPLETE WITH BLOCKERS**. The audit artifact is sufficient to define the known/unknown boundary but not sufficient to authorize deterministic canonical migration DDL yet.
