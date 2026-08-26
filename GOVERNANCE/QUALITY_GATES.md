# KassisT — Quality Gates and Release Evidence v1.0

**Status:** CANONICAL / ACTIVE  
**Authority:** Human approval required for `APPROVED` and `RELEASED`

## 1. Required progression

`IMPLEMENTED → TESTED → VERIFIED → READY_FOR_REVIEW → APPROVED → RELEASED`

These states are not interchangeable.

## 2. Minimum evidence gate

For a change to reach `READY_FOR_REVIEW`, the applicable checks must be evidenced in order:

`lint → typecheck → unit tests → integration tests → build → security checks → CI green → evidence package`

A check may be marked `NOT_APPLICABLE` only when the task record states why and the responsible reviewer accepts that rationale.

## 3. Definitions

### IMPLEMENTED
Code or artifact changes exist in the declared scope.

### TESTED
Relevant automated or manual tests were executed and results were recorded.

### VERIFIED
Results were independently reviewed against acceptance criteria and contracts.

### READY_FOR_REVIEW
The implementation and evidence package are complete enough for formal review.

### APPROVED
A human reviewer with the appropriate authority accepted the change.

### RELEASED
The approved change was promoted through the authorized release process.

## 4. Human-only transitions

No agent may unilaterally set a change to `APPROVED` or `RELEASED`.

Agents may prepare evidence and recommend a state transition.

## 5. QAOPS responsibility

`AG-QAOPS-01` is the operational owner of release evidence, quality gates, security verification coordination, and release readiness reporting. Technical agents remain responsible for tests and evidence within their own code territories.

## 6. Evidence package

Each release candidate or major integration task must identify:

- repository and branch;
- exact commit SHA;
- task ID;
- changed territory;
- tests executed and results;
- build result;
- typecheck/lint result where applicable;
- security checks and exceptions;
- known risks;
- unresolved blockers;
- rollback/recovery notes where relevant;
- reviewer/approval record.

## 7. No-evidence rule

Statements such as "ready", "complete", "production-ready" or "safe to release" are not authoritative without the evidence package and the required human approval.

## 8. Release gate

A release may be considered only after:

1. acceptance criteria are satisfied;
2. required automated checks are green;
3. security checks are complete or formally excepted;
4. known risks are documented;
5. rollback/recovery expectations are documented where applicable;
6. evidence is attached to the review record;
7. an authorized human approves release.

## 9. Change control

Quality gates may be tightened but must not be silently weakened. Any change to this policy requires an explicit governance decision in `ROADMAP/07_DECISION_LOG.md`.
