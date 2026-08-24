# IA-01 — ROADMAP

## Scope

Este roadmap cobre exclusivamente o território de IA-01: Canonical SQLite Schema e Persistence Schema Foundation.

Ele não substitui `docs/ROADMAP.md`, não altera a sequência global do projeto e não autoriza implementação de trabalho pertencente a outros agentes.

## Phase 0 — Territory configuration

**Status:** DONE

- Establish IA-01 identity and mission.
- Define scope and non-scope.
- Define ownership.
- Initialize memory, learnings, decisions, errors, progress and handoff records.
- Freeze product implementation during configuration.

## Phase 1 — Contract-to-schema audit

**Status:** READY / PRE-IMPLEMENTATION

Objectives:

- map canonical entities against protected documentation;
- classify field definitions as authoritative, partial or unknown;
- identify required keys, foreign keys and uniqueness constraints supported by contract;
- identify cross-agent dependencies;
- preserve unresolved contract ambiguities without encoding them prematurely.

## Phase 2 — Canonical schema specification

**Status:** BLOCKED UNTIL REQUIRED CONTRACT DETAILS ARE CLOSED

Expected result:

- canonical table inventory;
- column definitions supported by authoritative sources;
- primary/foreign keys;
- required uniqueness;
- indexes;
- nullability and checks where normative;
- migration compatibility rules;
- schema-specific test matrix.

The phase must not invent missing business semantics.

## Phase 3 — Canonical migration implementation

**Status:** NOT_STARTED

Expected ownership:

`apps/desktop/database/migrations/**`

Preconditions:

- required schema field decisions are authoritative;
- migration strategy remains compatible with M5.1;
- `CONTRACT-001` is resolved wherever the schema would otherwise encode ownership semantics;
- affected shared contracts are stable.

## Phase 4 — Schema validation

**Status:** NOT_STARTED

Expected evidence:

- migration ordering/determinism tests;
- schema existence tests;
- constraint enforcement tests;
- foreign-key integrity tests;
- unique-key tests;
- money representation tests;
- store-scoping tests;
- migration upgrade compatibility tests;
- no regression of M5.1 foundations.

## Phase 5 — Cross-agent integration audit

**Status:** NOT_STARTED

Review consumers and dependencies with:

- IA-02 Domain Runtime;
- IA-03 Event Infrastructure;
- IA-04 Order Engine;
- IA-05 Conversation + LLM;
- IA-06 Device Authentication;
- IA-07 Gateway + WSS where contracts cross the Desktop/Gateway boundary;
- IA-08 Desktop UI through application-level contracts.

The integration audit must verify that schema decisions do not leak business authority into persistence.

## Phase 6 — Handoff and PR readiness

**Status:** NOT_STARTED

Required evidence:

- schema implementation summary;
- migration identifiers/checksums;
- tests and results;
- known limitations;
- unresolved dependencies, if any;
- compatibility notes for downstream agents;
- human-review readiness.

## Global dependency note

The global roadmap currently identifies P5 Canonical SQLite Schema as the next technical implementation gate after the existing documentation and M5.1 foundations. IA-01's roadmap is subordinate to that global authority.
