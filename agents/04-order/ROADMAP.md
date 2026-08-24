# IA-04 — Order Engine Roadmap

This roadmap is limited to IA-04 territory. It is not a replacement for `docs/ROADMAP.md` and does not change global sequencing.

## Phase 0 — Territory configuration

- [x] Audit repository state and authoritative sources.
- [x] Define IA-04 identity.
- [x] Define scope and exclusions.
- [x] Define ownership.
- [x] Initialize memory, learnings, decisions, errors, progress and handoff records.

## Phase 1 — Contract readiness

- [x] Consume current canonical schema contract evidence from IA-01 sources.
- [x] Consume current domain contracts/primitives from IA-02 sources.
- [x] Consume current Event Infrastructure contracts from IA-03 sources.
- [x] Audit `CONTRACT-001` and preserve as unresolved blocker.
- [x] Audit `CONTRACT-002` and preserve as unresolved blocker.
- [x] Audit complete order error-code semantics.
- [x] Audit actor/authorization semantics affecting order commands.
- [x] Audit lifecycle transition completeness.
- [x] Audit pricing/promotion/delivery/payment semantics.
- [x] Audit idempotency and concurrency requirements.
- [x] Classify independent implementation slices.

## Phase 2 — Safe independent slices

- [x] Audit canonical Money source.
- [x] Confirm `REUSE_EXISTING_CANONICAL_MONEY` boundary.
- [x] Add Order Engine consumption tests without duplicating Money.
- [ ] Execute and verify the Money consumer test in a valid project runtime.

## Phase 3 — Order Engine design readiness

- [ ] Define executable command boundary from approved complete contracts.
- [ ] Define aggregate/state-transition boundary without duplicating domain authority.
- [ ] Define deterministic pricing and promotion evaluation boundary.
- [ ] Define delivery/payment/confirmation/cancellation semantics from approved contracts.
- [ ] Define idempotency and concurrency behavior.
- [ ] Define transaction integration with persistence and durable effects.
- [ ] Define event and audit integration points.

Current result: BLOCKED by incomplete contracts; no runtime Order Engine design is frozen as implementation authority.

## Phase 4 — Implementation

- [ ] Implement only within `apps/desktop/electron/order/**`.
- [ ] Add deterministic unit tests for command behavior and lifecycle transitions.
- [ ] Add money/quantity/promotion/confirmation/cancellation tests as contracts require.
- [ ] Add idempotency/concurrency tests.
- [ ] Add integration tests against approved persistence/event interfaces.

## Phase 5 — Validation and handoff

- [ ] Typecheck/lint/test the authorized scope.
- [ ] Verify no ownership violations.
- [ ] Verify no hidden contract assumptions.
- [ ] Update errors/learnings/progress.
- [ ] Prepare handoff and PR for human review.

## Readiness documents

- `ORDER-ENGINE-READINESS.md`
- `ORDER-LIFECYCLE-MATRIX.md`
- `ORDER-PRICING-MATRIX.md`
- `ORDER-COMMAND-MATRIX.md`
- `ORDER-ERROR-MATRIX.md`
- `ORDER-DEPENDENCIES.md`
- `IMPLEMENTATION-GATES.md`

All unchecked implementation items are future work and are not evidence of current implementation.
