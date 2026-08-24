# Main Truth Reconciliation — Auditor 2

## Main reference

`main` reference used by this audit: merge commit `173c81c37b6ec8b33b35e5a4dc06aeaba28c4e9b`, which merged PR #8 and added only the two consensus governance documents. The merge itself was previously post-merge audited as correct.

## Drift 1 — Global roadmap HEAD

SOURCE: `docs/ROADMAP.md`
CURRENT_MAIN_STATE: main contains PR #8 governance commit `173c81c...`
DOCUMENTED_STATE: roadmap header references `cb9f278a22925f58ef26188e444a86d826cbe8e4` as main HEAD.
TRUTH: document is STALE on HEAD reference.
REQUIRED_RECONCILIATION: update roadmap HEAD/reference after separate authorization; do not infer product completion from the roadmap.
BLOCKING: NO by itself; it affects auditability and current-state reporting.
EVIDENCE_CONFIDENCE: VERIFIED.

## Drift 2 — EventBus V1

SOURCE A: `consensus/CONSENSUS-EXECUTION-PLAN.md` says EventBus V1 is CLOSED_FOR_CURRENT_SCOPE / IMPLEMENTED / TESTED.
SOURCE B: `agents/03-events/PROGRESS.md` says EventBus NOT_IMPLEMENTED; `agents/03-events/ROADMAP.md` says EventBus NOT_STARTED; current main lookup of `apps/desktop/electron/infrastructure/events/` returned Not Found.
TRUTH: CONFLICTED. Current main executable evidence does not support treating EventBus V1 as merged implementation.
REQUIRED_RECONCILIATION: independently determine the historical branch/commit claimed to implement EventBus and whether it ever merged to main. Until evidence is reconciled, main truth for downstream completion should treat EventBus as NOT_VERIFIED/NOT_IN_MAIN, not as completed.
BLOCKING: YES for slices that require EventBus runtime; NO for independent pure work.
EVIDENCE_CONFIDENCE: VERIFIED conflict.

## Drift 3 — IA-02 human decisions vs versioned agent decisions

SOURCE A: consensus plan records DREQ-001/002/005/006 as candidate human decisions.
SOURCE B: `agents/02-domain/DECISIONS.md` still lists only older D-001..D-004 approved decisions and keeps CONTRACT-001/002/GOV-001 open.
TRUTH: DREQ approval is not fully materialized in the current versioned IA-02 decision record. Human chat approval and repository record are inconsistent.
REQUIRED_RECONCILIATION: materialize approved DREQs in the authoritative agent record before treating the runtime slice as versioned decision evidence.
BLOCKING: YES for implementation governance; the operator's human decision remains distinct from documentation materialization.
EVIDENCE_CONFIDENCE: VERIFIED.

## Drift 4 — IA-06 DR-02A

SOURCE A: operator process says primitive approved, four sub-decisions pending.
SOURCE B: `agents/06-device-auth/DECISIONS.md` contains baseline-approved Ed25519 decisions but no versioned approval for DR-02A.1..02A.4.
TRUTH: current verifier contract remains incomplete and blocked.
REQUIRED_RECONCILIATION: materialize four normative crypto sub-decisions before verifier implementation.
BLOCKING: YES for IA-06 verifier.
EVIDENCE_CONFIDENCE: VERIFIED.

## Drift 5 — IA-08 branch progress vs main

SOURCE A: IA-08 branch reported `ffaf5897...` with AppShell/presentation tests and implementation.
SOURCE B: current main `apps/desktop/src` contains only `index.html` and a 79-byte `main.tsx`; `app-shell.ts` is not present on main.
TRUTH: IA-08 progress is BRANCH_PROGRESS, not product completion.
REQUIRED_RECONCILIATION: merge and verify the authorized foundation before classifying it as IN_MAIN/IMPLEMENTED.
BLOCKING: YES for functional desktop C1.
EVIDENCE_CONFIDENCE: VERIFIED.

## Drift 6 — IA-04 Money

SOURCE A: IA-04 branch reported Money test created.
SOURCE B: current shared runner only lists `foundation.test.ts` and `database.test.ts`; Money test is absent from official TypeScript test discovery.
TRUTH: direct/branch progress is not official-suite verification and is not main product completion.
REQUIRED_RECONCILIATION: owner of shared harness must register the test if it is required for the slice.
BLOCKING: NO global; can block affected merge readiness.
EVIDENCE_CONFIDENCE: VERIFIED.
