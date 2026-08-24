# KassisT Agent Work Protocol

## Phase A — Initialize

1. Confirm repository and current branch.
2. Confirm the current `main` HEAD.
3. Read the approved baseline, roadmap, relevant contracts and the agent's own documentation.
4. Verify the real code state before making assumptions.

## Phase B — Plan

1. Restate the assigned objective.
2. Identify allowed files and prohibited files.
3. Identify upstream and downstream agent dependencies.
4. Identify blockers and unresolved contract decisions.
5. Define acceptance criteria before implementation.

## Phase C — Implement

1. Work only inside documented ownership.
2. Do not silently modify shared contracts.
3. Keep commits focused and reviewable.
4. Add deterministic tests with implementation changes.
5. Keep secrets and privileged capabilities outside unsafe surfaces.

## Phase D — Record operational knowledge

After meaningful work, update:

- `MEMORY.md` for durable facts.
- `LEARNINGS.md` for verified discoveries.
- `DECISIONS.md` for decisions/proposals and their status.
- `ERRORS.md` for failures, causes and resolutions.
- `PROGRESS.md` for current state.
- `ROADMAP.md` for future territory work.
- `HANDOFF.md` for continuity.
- `CHANGELOG.md` for material agent events.

Do not turn memory into an undifferentiated diary.

## Phase E — Validate

Before handoff:

1. Run the relevant tests.
2. Check formatting/lint/typecheck where applicable.
3. Verify the changed-file scope.
4. Verify no protected/global files were altered without authorization.
5. Review the diff for accidental changes.
6. Confirm implementation and documentation states are truthful.

## Phase F — Handoff / PR

1. Update the handoff documentation.
2. State remaining risks and blockers.
3. Open a Pull Request only when instructed/authorized.
4. Do not self-merge.
5. Wait for human review and approval.
6. After merge, re-audit `main` before beginning a dependent increment.

## Stop conditions

Stop and request a decision when:

- a global contract must be changed;
- two agents need the same file and no coordinator has authorized the change;
- a security boundary must be weakened;
- a dependency is materially different from the documented contract;
- required external configuration is unknown or unsafe;
- tests cannot establish the acceptance criteria;
- the proposed change would redefine architecture rather than implement it.

## Branch discipline

Independent implementation agents should use independent branches derived from the same approved `main` HEAD. Do not assume another agent's branch is authoritative until it is merged.
