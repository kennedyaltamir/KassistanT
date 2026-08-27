# KassisT — Implementation Baseline Policy v1.0

**Status:** CANONICAL / ACTIVE  
**Applies to:** all implementation agents and all implementation tasks  
**Current implementation ref:** `MVP2`

## 1. Baseline authority

`MVP2` is the default implementation baseline for the current MVP implementation wave.

`main` is **not** an implementation baseline unless a task explicitly declares `main` as its authoritative target.

## 2. Starting SHA requirement

Every implementation task MUST record, before changing files:

- repository;
- baseline ref;
- exact starting SHA;
- task branch;
- task ID;
- owner;
- parent/dependency branch when applicable.

The starting SHA is evidence, not a suggestion.

## 3. Branch rule

A new implementation branch MUST start from the current approved `MVP2` HEAD at task activation, unless the task packet explicitly declares an inherited dependency branch or SHA.

A task MUST NOT silently switch from `MVP2` to `main`, another branch, or another SHA.

If required dependency work exists on another branch, the task MUST explicitly record that dependency and consume it through an approved handoff strategy. The agent MUST NOT silently cherry-pick or rewrite unrelated work.

## 4. Parallel implementation

Parallel P0 tasks MAY start from the same approved `MVP2` SHA. They MUST remain isolated on task branches until verification/merge gates are satisfied.

A later task MUST NOT assume that another task's work is present merely because both tasks were started from the same baseline.

## 5. Baseline drift

If `MVP2` moves after a task has started, the agent MUST NOT automatically rebase or merge the new head.

The agent must first determine whether the new commit affects the task's dependencies or protected paths. If synchronization is necessary, it must be recorded as an explicit task event and verified before continuing.

## 6. Historical evidence

A previous starting SHA remains valid historical evidence for a task. It does not become the new project baseline.

Reports MUST distinguish:

- `BASELINE_SHA_AT_START`
- `CURRENT_MVP2_HEAD`
- `FINAL_TASK_SHA`

Never label an old task starting SHA as the current project HEAD.

## 7. Main branch rule

Agents MAY inspect `main` for comparison when useful, but inspection does not authorize implementation against it.

If authoritative task documents are missing from the selected ref, the agent MUST report `BASELINE_MISMATCH` rather than silently switching branches.

## 8. Cross-territory dependency rule

A task cannot resolve a dependency by editing another agent's protected territory unless the Permission Matrix explicitly authorizes it and the dependency task has been formally handed off.

A missing dependency becomes:

`BLOCKED / IMPLEMENTATION_DEPENDENCY_GAP`

not permission to invent an alternate implementation.

## 9. Evidence requirement

Every implementation delivery MUST report:

1. baseline ref;
2. starting SHA;
3. dependency SHAs/branches, if any;
4. changed paths;
5. final SHA;
6. tests and results;
7. build/typecheck/lint/security results where applicable;
8. unresolved conflicts or limitations.

## 10. Gate

`IMPLEMENTED` does not mean `TESTED`, `VERIFIED`, `READY_FOR_REVIEW`, `APPROVED`, or `RELEASED`.

Only the defined quality and human approval gates may advance those states.
