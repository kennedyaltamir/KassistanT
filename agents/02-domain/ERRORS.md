# IA-02 — Errors and Risks

## E-001 — `CONTRACT-001` DomainOutbox ambiguity

**Class:** CONTRACT_CONFLICT
**Status:** OPEN

The baseline contains conflicting statements about DomainOutbox. Implementing a specific ownership or persistence behavior before formal resolution could lock an incorrect contract into the domain/runtime boundary.

## E-002 — `CONTRACT-002` event ambiguity

**Class:** CONTRACT_CONFLICT
**Status:** OPEN

`order.status_changed` is contradictory in the normative material while the current TypeScript contracts contain it. Domain code must not silently choose one interpretation.

## E-003 — Domain documentation/runtime gap

**Class:** IMPLEMENTATION_GAP
**Status:** OPEN / EXPECTED

The domain docs are substantially specified, but runtime implementation is not. This is a planned gap, not evidence of failure.

## E-004 — Cross-agent boundary risk

**Class:** OWNERSHIP_RISK
**Status:** OPEN

Domain behavior can be confused with order orchestration, persistence, event transport and conversation orchestration. IA-02 must keep pure business rules under `packages/domain/**` and stop at application/infrastructure boundaries.

## E-005 — Schema coupling risk

**Class:** ARCHITECTURAL_RISK
**Status:** OPEN

Canonical SQLite schema is not implemented. Domain code must not invent table layouts, migration behavior or persistence details to compensate for that absence.

## E-006 — External-provider contamination risk

**Class:** DESIGN_RISK
**Status:** OPEN

The domain package must remain independent from Ollama, Meta, Google, Gateway and Electron implementations.
