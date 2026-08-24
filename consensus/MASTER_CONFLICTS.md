# KassisT — Master Conflicts and Reconciliation

These conflicts were found while reconciling Auditor 1 and Auditor 2. They are preserved rather than resolved by inference.

## F-01 — EventBus V1 state

- SOURCE: `consensus/CONSENSUS-EXECUTION-PLAN.md` vs IA-03 progress/roadmap and main tree.
- OLD/CONFLICTING_REFERENCE: consensus plan states EventBus V1 `IMPLEMENTED/TESTED`.
- AUTHORITATIVE_MAIN_VIEW: the current main-facing IA-03 progress/roadmap states EventBus `NOT_IMPLEMENTED/NOT_STARTED`, and no corroborating in-main event-bus runtime evidence was established during reconciliation.
- STATUS: `CONFLICTED`.
- IMPACT: downstream work must not assume EventBus V1 is integrated until a merged runtime and verification evidence are established.
- REQUIRED_CORRECTION: evidence-based reconciliation against a specific main commit/merged PR.

## F-02 — IA-02 DREQ materialization

- SOURCE: PR #9 merge commit vs `agents/02-domain/DECISIONS.md`.
- HUMAN/IMPLEMENTATION EVIDENCE: DREQ-001/002/005/006 are recorded in the D2 implementation commit as approved decisions used by the implementation.
- DOCUMENTED_STATE: the current decision registry still presents older open global-contract records and does not fully materialize the D2 approval state.
- STATUS: `DOCUMENTATION_DRIFT / REQUIRES_RECONCILIATION`.
- IMPACT: future agents can read stale decision state.
- REQUIRED_CORRECTION: update the authoritative IA-02 decision record without changing the already-approved substance.

## F-03 — IA-08 branch vs main

- SOURCE: IA-08 branch execution report vs `main` at reference SHA.
- BRANCH_STATE: Frontend Foundation/AppShell implementation exists on branch.
- MAIN_STATE: renderer tree at the reference main SHA is still the earlier foundation-only state.
- STATUS: `BRANCH_PROGRESS`, not integrated completion.
- IMPACT: IA-08 cannot be counted as completed product functionality until merged and verified.
- REQUIRED_CORRECTION: normal PR/test/CI/review/merge process.

## F-04 — Roadmap reference SHA

- SOURCE: global roadmap.
- OLD_REFERENCE: `cb9f278a...`.
- AUTHORITATIVE_REFERENCE: `86387b02ed55ef3af3b24f1591b3e0b0ff436a30` for this master consolidation.
- STATUS: `STALE`.
- IMPACT: snapshot metadata is unreliable as current product-state evidence.
- REQUIRED_CORRECTION: documentation-only reconciliation through normal governance.

## F-05 — Counts between auditors

- SOURCE: Auditor 1 vs Auditor 2 matrices.
- STATUS: `NORMALIZATION_REQUIRED`, not factual conflict.
- REASON: Auditor 1 uses coarser work items; Auditor 2 uses finer-grained rows such as each DR-02A subdecision.
- RULE: master counts are based only on the deduplicated master matrix and must not be computed by addition of audit counts.

## No-resolution rule

No item above is resolved by voting. The master preserves the conflict until repository evidence or an explicit human decision resolves it.
