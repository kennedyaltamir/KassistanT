# GOV-DRIFT-0002 — Decision Package

Status: **RESOLVED**
Authority: `OPERATOR_PROJECT_GOVERNANCE`
Effective from: `2026-08-24T19:52:00-03:00`
Decision record: `consensus/governance/OPERATOR-DECISIONS-2026-08-24.xml`

## Decision

**OPTION B — DEPRECATE_OR_REJECT_EXISTING_MIGRATION_AS_NON_AUTHORITATIVE**.

The physical file `apps/desktop/database/migrations/0002_c1_product_order.sql` remains preserved as repository evidence, but it is not a normative migration baseline.

## Rationale

The file exists physically, but it does not correspond to the canonical 0002 projection and was previously blocked by governance documentation. Physical presence cannot promote it to normative authority. Treating it as non-authoritative prevents a partial schema implementation from becoming the canonical baseline by accident.

## Impact

### Schema

The existing 0002 file remains physically untouched by this decision. It must not be executed, renamed, deleted or replaced as part of this decision. IA-01 must produce the post-decision reconciliation and a separate authorized physical-change step when applicable.

### Contracts

Schema authority remains subordinate to the frozen contracts and the forthcoming IA-01 reconciliation.

### Implementation

No implementation is retroactively authorized by the existence of 0002 or by this decision.

### Audit

The physical artifact remains auditable historical evidence. Its non-authoritative classification must be preserved in provenance.

## Explicit Non-Scope

No migration execution; no migration deletion; no migration replacement; no schema mutation; no merge; no production release.

## Evidence

- `apps/desktop/database/migrations/0002_c1_product_order.sql` exists in `MVP2`.
- `agents/01-schema/MIGRATION-0002-PROJECTION.md` states that 0002 is not created.
- `agents/01-schema/HUMAN-SCHEMA-REVIEW.md` states that 0002 is not authorized.
- `consensus/governance/MVP2-RECONCILIATION.md` classified the discrepancy as governance drift.
- Current `MVP2` HEAD was verified as `e2d8807a6e797b0fb35e6a4658f8c4aabec7535a` before this decision cycle's final recording.

## Consequence

`GOV-DRIFT-0002 = RESOLVED`.
IA-01 must now reconcile documentation and schema authority without altering the normative decision.
