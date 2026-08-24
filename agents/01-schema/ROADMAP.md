# IA-01 — ROADMAP

## Scope

Este roadmap cobre exclusivamente o território de IA-01: Canonical SQLite Schema e Persistence Schema Foundation.

## Phase 0 — Territory configuration

**Status:** DONE

## Phase 1 — Contract-to-schema audit

**Status:** DONE WITH BLOCKERS

Completed:

- canonical entity inventory verified at 28 entities;
- field-level evidence matrix created;
- FK/relationship matrix created;
- PK/FK/UNIQUE/CHECK/NOT NULL/DEFAULT audit recorded;
- normative index matrix recorded;
- blocker matrix recorded;
- implementation readiness recorded;
- M5.1 compatibility preserved.

Primary artifact:

`agents/01-schema/CANONICAL_SCHEMA_AUDIT.md`

Phase 1 result:

The repository now has an auditable schema specification baseline, but the evidence is insufficient for deterministic `0002` DDL. Several fields and relationship keys remain partial/unknown.

## Phase 2 — Canonical schema specification

**Status:** BLOCKED / PRE-IMPLEMENTATION

Required closure:

- field-level definitions for underspecified entities;
- explicit parent keys for child entities where currently unnamed;
- physical SQL table naming convention;
- nullability/default decisions where currently unknown;
- exact FK behavior where schema-critical;
- DomainOutbox physical semantics where CONTRACT-001 affects persistence;
- any schema impact from CONTRACT-002, if the final event decision requires it;
- source authority clarification where GOV-001 affects normative interpretation.

## Phase 3 — Canonical migration implementation

**Status:** NOT_STARTED

Preconditions:

- Phase 2 complete and authoritative;
- `0002` derivable deterministically from the matrix;
- no unresolved schema-critical blocker encoded by assumption;
- migration strategy remains compatible with M5.1.

## Phase 4 — Schema validation

**Status:** NOT_STARTED

Expected evidence:

- schema existence tests;
- PK/FK/UNIQUE/CHECK enforcement tests;
- money and currency representation tests;
- store-scoping tests where normative;
- migration ordering/checksum compatibility tests;
- M5.1 regression evidence.

## Phase 5 — Cross-agent integration audit

**Status:** NOT_STARTED

Consumers:

- IA-02 Domain Runtime;
- IA-03 Event Infrastructure;
- IA-04 Order Engine;
- IA-05 Conversation + LLM;
- IA-06 Device Authentication;
- IA-07 Gateway + WSS where contracts cross the boundary;
- IA-08 Desktop UI through application contracts.

## Phase 6 — Handoff and PR readiness

**Status:** NOT_STARTED

Required evidence:

- schema implementation summary;
- migration identifiers/checksums;
- tests and results;
- compatibility notes;
- known limitations/blockers;
- human-review readiness.
