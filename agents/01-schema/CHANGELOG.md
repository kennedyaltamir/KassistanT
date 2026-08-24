# IA-01 — CHANGELOG

## [0.3.0] — 2026-08-24

### Added

- Phase 2 canonical physical schema specification.
- `CANONICAL-SCHEMA-SPEC.md`.
- `ENTITY-PHYSICAL-MAP.md`.
- `RELATIONSHIP-SPEC.md`.
- `CONSTRAINT-SPEC.md`.
- `INDEX-SPEC.md`.
- `MIGRATION-0002-READINESS.md`.
- `MIGRATION-0002-PROJECTION.md`.

### Findings

- All 28 canonical entities have explicit physical-name proposals.
- Seven unique constraints remain the only contract-required physical indexes.
- Twenty-three relationships were classified without inventing missing parent keys.
- Lifecycle/status semantics are known but SQL encoding remains open.
- Nullability, defaults, FK actions and several physical types remain insufficiently specified.
- DomainOutbox remains blocked where its physical semantics depend on CONTRACT-001.

### Preserved

- No migration `0002` created.
- No modification to `0001_bootstrap.sql`.
- No modification to M5.1 runtime.
- No modification to contracts or global documentation.
- No modification outside `agents/01-schema/**`.

### Outcome

Phase 2 is **COMPLETE AS SPECIFICATION / BLOCKED FOR DDL**. The next valid step is human/authority review of schema-critical blockers, not migration implementation.
