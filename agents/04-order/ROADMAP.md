# IA-04 — Order Engine Roadmap

This roadmap is limited to IA-04 territory. It is not a replacement for `docs/ROADMAP.md` and does not change global sequencing.

## Phase 0 — Territory configuration

- [x] Audit repository state and authoritative sources.
- [x] Define IA-04 identity.
- [x] Define scope and exclusions.
- [x] Define ownership.
- [x] Initialize memory, learnings, decisions, errors, progress and handoff records.

## Phase 1 — Contract readiness

- [ ] Consume final canonical schema contract from IA-01.
- [ ] Consume final domain contracts/primitives from IA-02.
- [ ] Consume finalized Event Infrastructure interface from IA-03.
- [ ] Resolve or receive authoritative resolution of `CONTRACT-001`.
- [ ] Resolve or receive authoritative resolution of `CONTRACT-002`.
- [ ] Obtain complete order error-code semantics.
- [ ] Obtain complete actor/authorization rules affecting order commands.

## Phase 2 — Order Engine design

- [ ] Define executable command boundary from approved contracts.
- [ ] Define aggregate/state-transition boundary without duplicating domain authority.
- [ ] Define deterministic pricing and promotion evaluation boundary.
- [ ] Define delivery/payment/confirmation/cancellation semantics from approved contracts.
- [ ] Define idempotency and concurrency behavior.
- [ ] Define transaction integration with persistence and durable effects.
- [ ] Define event and audit integration points.

## Phase 3 — Implementation

- [ ] Implement only within `apps/desktop/electron/order/**`.
- [ ] Add deterministic unit tests for command behavior and lifecycle transitions.
- [ ] Add money/quantity/promotion/confirmation/cancellation tests as contracts require.
- [ ] Add idempotency/concurrency tests.
- [ ] Add integration tests against approved persistence/event interfaces.

## Phase 4 — Validation and handoff

- [ ] Typecheck/lint/test the authorized scope.
- [ ] Verify no ownership violations.
- [ ] Verify no hidden contract assumptions.
- [ ] Update errors/learnings/progress.
- [ ] Prepare handoff and PR for human review.

All unchecked implementation items are future work and are not evidence of current implementation.
