# IA-01 — ROADMAP

## Scope

Este roadmap cobre exclusivamente o território de IA-01: Canonical SQLite Schema e Persistence Schema Foundation.

## Phase 0 — Territory configuration

**Status:** DONE

## Phase 1 — Contract-to-schema audit

**Status:** DONE WITH BLOCKERS

Primary artifact: `CANONICAL_SCHEMA_AUDIT.md`.

## Phase 2 — Canonical schema specification

**Status:** COMPLETE AS SPECIFICATION / BLOCKED FOR DDL

Completed:

- physical table mapping for all 28 entities;
- semantic field consolidation;
- scope classification;
- relationship specification for 23 relationships;
- constraint specification;
- index specification;
- lifecycle/status semantic storage rules;
- mutability/immutability classification;
- implementation order proposal;
- blocker/readiness matrix;
- documentary projection of future `0002`.

Artifacts:

- `CANONICAL-SCHEMA-SPEC.md`
- `ENTITY-PHYSICAL-MAP.md`
- `RELATIONSHIP-SPEC.md`
- `CONSTRAINT-SPEC.md`
- `INDEX-SPEC.md`
- `MIGRATION-0002-READINESS.md`
- `MIGRATION-0002-PROJECTION.md`

Phase 2 conclusion:

The repository now has a complete evidence/proposal map of the physical schema, but `0002` is still blocked because the specification is not yet fully authoritative for all physical details.

## Phase 3 — Canonical migration implementation

**Status:** BLOCKED / NOT_STARTED

Preconditions:

- physical table naming approved;
- seven underspecified entity models closed;
- child parent-key names closed;
- UUID/timestamp physical types closed;
- nullability/defaults closed;
- FK actions closed;
- SQL state representation closed;
- DomainOutbox physical semantics resolved where required;
- specification passes deterministic-generation review.

## Phase 4 — Schema validation

**Status:** NOT_STARTED

## Phase 5 — Cross-agent integration audit

**Status:** NOT_STARTED

## Phase 6 — Handoff and PR readiness

**Status:** NOT_STARTED

## Guardrail

No migration may be created merely because a plausible DDL exists. `0002` requires an authoritative, mechanically deterministic physical specification.
