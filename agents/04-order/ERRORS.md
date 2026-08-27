# IA-04 — Errors / Risks

## E-001 — CONTRACT-002 ambiguity

- Severity: HIGH
- Status: OPEN
- Problem: `order.status_changed` is contradictory between the baseline and current TypeScript contract.
- Impact: event emission, tests, EventBus integration and downstream consumers.
- Rule: do not resolve silently.

## E-002 — CONTRACT-001 ambiguity

- Severity: HIGH
- Status: OPEN
- Problem: DomainOutbox ownership/scope across local Core and Gateway is not fully specified.
- Impact: confirmation transaction, durability, external effects, retry/recovery and integration boundaries.
- Rule: do not invent ownership semantics.

## E-003 — Canonical domain error catalogue incomplete

- Severity: HIGH
- Status: OPEN
- Problem: deterministic rejection requirements exist, but canonical error codes are missing.
- Impact: stable runtime errors and tests.
- Rule: mark unknown codes as unresolved rather than inventing global contract values.

## E-004 — Actor permissions partial

- Severity: MEDIUM/HIGH
- Status: OPEN
- Problem: documented order state transitions do not fully define actor permissions.
- Impact: command authorization and cancellation/transition behavior.
- Rule: do not invent authorization policy.

## E-005 — Canonical entity fields partial

- Severity: HIGH
- Status: OPEN
- Problem: several canonical entity field schemas remain partial.
- Impact: Order Engine persistence/application integration.
- Owner dependency: IA-01 / IA-02 as applicable.

## E-006 — Implementation absent

- Severity: INFORMATIONAL
- Status: CONFIRMED
- Problem: the repository contract registry records Order State as not implemented and M5.1 explicitly excluded the Order Engine.
- Impact: readiness documentation must not claim runtime completion.

## E-007 — Lifecycle adjacency incomplete

- Severity: HIGH
- Status: OPEN
- Problem: lifecycle states are catalogued and invalid transitions are rejected, but the complete normative transition graph and actor/precondition matrix are absent.
- Impact: state-machine implementation and deterministic tests.
- Rule: do not invent transitions.

## E-008 — Pricing algorithm incomplete

- Severity: HIGH
- Status: OPEN
- Problem: monetary fields/invariants exist, but complete promotion, delivery-fee and calculation-order semantics are not executable contracts.
- Impact: authoritative total calculation.
- Rule: do not invent pricing rules.

## E-009 — Promotion semantics incomplete

- Severity: HIGH
- Status: OPEN
- Problem: promotion type/scope/period are documented, but stacking, priority, exclusivity, limits and conflict resolution are not fully defined.
- Impact: deterministic discount calculation and idempotent application.
- Rule: keep UNKNOWN/PROPOSAL explicit.

## E-010 — Idempotency/concurrency contract incomplete

- Severity: HIGH
- Status: OPEN
- Problem: duplicate processing is required, but operation-specific idempotency keys, scopes, replay/conflict policy and serialization/version behavior are incomplete.
- Impact: duplicate confirmation, quantity races, cancellation races and retries.
- Rule: specify before runtime implementation.

## E-011 — Delivery/payment executable semantics incomplete

- Severity: MEDIUM/HIGH
- Status: OPEN
- Problem: delivery and payment concepts exist, but complete command/state/error semantics are not fixed.
- Impact: confirmation preconditions and downstream lifecycle behavior.
- Rule: do not invent payment gateway behavior or delivery integration.

## E-012 — Money slice direct test not verifiable in current environment

- Severity: INFORMATIONAL
- Status: OPEN / NOT_VERIFIED
- Problem: the canonical Money consumer test exists, but this session has no verified project checkout/runtime for executing the repository test command.
- Impact: direct test PASS/FAIL cannot be truthfully claimed.
- Rule: keep direct test status NOT_VERIFIED until actually executed.

## E-013 — Official Desktop suite does not include Money consumer test

- Severity: MEDIUM
- Status: OPEN / HANDOFF
- Problem: `scripts/test-desktop.mjs` does not list `apps/desktop/electron/order/money-contract.test.ts` in `tsTests`.
- Impact: the Money test is not executed by the official Desktop test path and therefore is not covered by the existing `pnpm test` CI path.
- Required owner: shared test harness / integration authority.
- Required minimal change: add the Money test path to the `tsTests` list.
- IA-04 authorization: FALSE.
- Rule: IA-04 must not modify the shared harness.

## E-014 — Money slice frozen pending external harness integration

- Severity: MEDIUM
- Status: HANDOFF / FROZEN
- Problem: all IA-04-owned work for the Money slice is complete, but official-suite inclusion and execution remain outside IA-04 ownership.
- Impact: the slice cannot be marked merge-ready or GREEN from IA-04 evidence alone.
- Required owner: shared test harness / integration authority.
- Required action: review and apply the minimal harness registration, then execute direct test, official suite and CI verification.
- IA-04 action: STOP until external verification changes the state.
