# Governance Reconciliation — MVP2 Baseline

Date: 2026-08-24
Verified branch: `MVP2`
Implementation point verified before documentation reconciliation: `330308ad10f7f27e19c706963d3fad32f9d4464f`
Post-verification documentation correction commit: `7e4b87194f614bf4557ea0e75e8e1a8653422b0d`

## Repository point

At the implementation point, `MVP2` was 450 commits ahead and 0 behind `main`, with merge-base equal to `main` (`86387b02ed55ef3af3b24f1591b3e0b0ff436a30`). The later documentation correction commit does not alter the implementation point.

## Artifact classification

| Artifact | Classification | Basis | Decision state |
|---|---|---|---|
| `docs/domain/entities.md` | Normative candidate / derived baseline | Explicitly calls itself DEFINED / PARTIAL and records uniqueness rules | PARTIALLY NORMATIVE; reconciliation required |
| `agents/01-schema/DECISIONS.md` | Normative governance record | Explicitly distinguishes approved constraints from proposals/pending decisions | ACTIVE GOVERNANCE |
| `agents/01-schema/HUMAN-SCHEMA-REVIEW.md` | Decision package | SD-001..SD-005 are proposals and Operator Pending | PENDING |
| `agents/01-schema/MIGRATION-0002-PROJECTION.md` | Derived / documentary projection | Explicitly states projection-only and that 0002 is not created | CONTRADICTED BY FACTUAL TREE |
| `apps/desktop/database/migrations/0002_c1_product_order.sql` | Physical implementation artifact / historical-or-unapproved until authority decides | Factual presence in MVP2 | PENDING CLASSIFICATION; BLOCKER |
| `agents/02-domain/DOMAIN-GLOBAL-DECISIONS.md` | Decision package | Global requests are explicitly requests, not decisions | PENDING |
| `agents/02-domain/HUMAN-DOMAIN-DECISIONS.md` | Decision package | Explicitly says current package does not authorize implementation | PENDING |
| `consensus/AUDITOR-RESPONSIBILITY-MODEL.md` | Normative governance | Explicitly marked APPROVED FOR OPERATING GOVERNANCE | ACTIVE |
| `consensus/MVP_READINESS.md` | Derived/readiness assessment | Readiness artifact, not a replacement for human decisions | DERIVED |
| `consensus/MVP_TRANSITION.md` | Derived transition plan | Operational transition documentation | DERIVED; must not override pending governance |

## Contradictions / drift

### DRIFT-001 — Migration 0002 state
`MIGRATION-0002-PROJECTION.md` says the migration file is not created and `HUMAN-SCHEMA-REVIEW.md` says 0002 is not authorized. The factual MVP2 tree contains `apps/desktop/database/migrations/0002_c1_product_order.sql`.

Classification: **GOVERNANCE DRIFT / BLOCKER**.

Required authority: Operator decision through `GOV-DRIFT-0002` package.

### DRIFT-002 — Entity uniqueness wording vs contract freeze state
`docs/domain/entities.md` labels Customer/Conversation/Message uniqueness as defined, while current governance packages preserve broader identity/cardinality/representation questions as pending.

Classification: **NORMATIVE-LANGUAGE DRIFT**.

Required action: do not treat the terse entity summary as overriding detailed decision packages. Reconcile wording only after Operator closure.

### DRIFT-003 — DomainOutbox ownership
`agents/01-schema/DECISIONS.md` and `agents/02-domain/DOMAIN-GLOBAL-DECISIONS.md` both keep CONTRACT-001 pending. Any artifact implying definitive ownership is therefore non-authoritative until global closure.

Classification: **GLOBAL CONTRACT PENDING**.

## Current governance state

- `MVP_SCOPE_DECISION`: `PENDING_APPROVAL`
- `GOV-DRIFT-0002`: `BLOCKER_PENDING_OPERATOR_DECISION`
- `Customer Identity`: `OPEN_DECISION_PENDING_FORMALIZATION`
- `Conversation Contract`: `OPEN_DECISION_PENDING_FORMALIZATION`
- `Message Contract`: `OPEN_UNTIL_FORMALLY_FROZEN`
- `CONTRACT-001`: `BLOCKER_PENDING_GLOBAL_DECISION`
- `READY_FOR_IA02`: `false`

No normative option was selected by IA-01.

## Schema reconciliation status

**COMPLETE FOR CURRENT EVIDENCE; NORMATIVE CLOSURE BLOCKED.**

The reconciliation confirms that physical schema state and documentary state cannot currently be treated as one authoritative state. No migration was created, altered, executed or deleted during this cycle. The existing 0002 file remains an unresolved governance artifact until the Operator decides GOV-DRIFT-0002.

## Historical artifacts

Agent handoffs, reports, progress files and older readiness statements remain historical/derived unless they explicitly carry current normative authority and are not contradicted by later governance records.

## Supersession rule

No artifact is marked obsolete solely because it is older. Supersession requires explicit authority or a newer normative artifact that states the replacement relationship.
