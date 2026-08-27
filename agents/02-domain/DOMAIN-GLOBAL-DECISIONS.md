# IA-02 — Global Decision Requests

These are requests for authority decisions. They are not decisions and do not authorize implementation.

## DREQ-001 — First aggregate boundary

**TITLE:** Define the aggregate boundary for the first Domain Runtime slice.

**PROBLEM:** `Order` is the strongest candidate, but no normative aggregate root and child ownership are explicitly frozen.

**CURRENT_EVIDENCE:** Order-centered commands, lifecycle states, total invariants, confirmation milestone and price-freeze rules.

**WHY_REQUIRED:** Aggregate ownership determines mutation boundary, invariants and transaction semantics.

**OPTIONS:**
1. Authorize `Order` as aggregate root with explicitly listed children.
2. Authorize a smaller aggregate boundary.
3. Defer aggregate runtime and continue documentation only.

**RECOMMENDED_OPTION:** Option 1, subject to human review and explicit child list. `PROPOSAL`, not `DECISION`.

**RISKS:** Wrong boundary causes persistence, concurrency and event coupling errors.

**AFFECTED_AGENTS:** IA-02, IA-04, IA-01, IA-03.

**AFFECTED_CONTRACTS:** Domain model, persistence boundary, event boundary.

**BLOCKING_SCOPE:** First aggregate-based runtime slice.

## DREQ-002 — First normative Order transition

**TITLE:** Freeze one transition for the first slice.

**PROBLEM:** Order states are catalogued, but a complete normative transition matrix is absent.

**CURRENT_EVIDENCE:** `DRAFT` and `CONFIRMED` are defined; `CONFIRMED` is the operational sale milestone.

**WHY_REQUIRED:** Runtime must reject invalid transitions deterministically.

**OPTIONS:**
1. Freeze `DRAFT -> CONFIRMED` as the first implemented transition, with complete preconditions and errors.
2. Freeze a smaller non-confirmation transition.
3. Defer runtime.

**RECOMMENDED_OPTION:** Option 1 only if the confirmation contract is completed. `PROPOSAL`.

**RISKS:** Confirmation currently intersects incomplete event/idempotency/actor semantics.

**AFFECTED_AGENTS:** IA-02, IA-04, IA-03.

**AFFECTED_CONTRACTS:** Order lifecycle and events.

**BLOCKING_SCOPE:** Any first Order transition.

## DREQ-003 — `order.status_changed`

**TITLE:** Decide the normative status of `order.status_changed`.

**PROBLEM:** Current TypeScript contracts contain the event while normative material remains contradictory.

**CURRENT_EVIDENCE:** `packages/contracts/src/events.ts` lists it; domain event documentation records the contradiction.

**WHY_REQUIRED:** Prevents divergent event behavior across Domain, Order Engine and Event Infrastructure.

**OPTIONS:**
1. Make it normative.
2. Remove it from normative contract.
3. Keep it transitional/optional under explicit versioned compatibility rules.

**RECOMMENDED_OPTION:** No local recommendation beyond resolving the contradiction through project authority.

**RISKS:** Event duplication or missing consumers.

**AFFECTED_AGENTS:** IA-02, IA-03, IA-04, IA-07, IA-08 as consumers.

**AFFECTED_CONTRACTS:** Domain event contract.

**BLOCKING_SCOPE:** Only slices that emit or depend on this event.

## DREQ-004 — DomainOutbox ownership

**TITLE:** Decide DomainOutbox ownership and transaction semantics.

**PROBLEM:** DomainOutbox sits at the domain/external-effect boundary and is contradictory in normative material.

**CURRENT_EVIDENCE:** IA-03 owns Outbox infrastructure subject to CONTRACT-001; IA-01 owns its persistence representation; baseline uses it in Gateway flow.

**WHY_REQUIRED:** Determines persistence and delivery integration.

**OPTIONS:**
1. Domain owns event intent; IA-03 owns durable Outbox mechanics.
2. IA-03 owns complete Outbox semantics.
3. Other formally approved boundary.

**RECOMMENDED_OPTION:** Preserve separation: domain produces domain events; IA-03 owns durable delivery mechanics, subject to formal approval. `PROPOSAL`.

**RISKS:** Transactional publication mismatch.

**AFFECTED_AGENTS:** IA-01, IA-02, IA-03, IA-07.

**AFFECTED_CONTRACTS:** DomainOutbox contract.

**BLOCKING_SCOPE:** Outbox-integrated slices; not inherently blocking for pure in-memory validation.

## DREQ-005 — Domain error contract

**TITLE:** Freeze semantic error categories for first command.

**PROBLEM:** Error conditions are documented, but canonical stable codes and boundary mappings are not complete.

**CURRENT_EVIDENCE:** Invalid transition, invalid quantity, unavailable product/modifier, insufficient delivery data, promotion violation and duplicate operation.

**WHY_REQUIRED:** Tests and application/integration mappings need deterministic semantics.

**OPTIONS:**
1. Freeze semantic error categories locally and defer codes to a shared contract.
2. Freeze both categories and codes now.
3. Defer command runtime.

**RECOMMENDED_OPTION:** Option 1 is the least coupled approach. `PROPOSAL`.

**RISKS:** Later mapping churn if global error schema diverges.

**AFFECTED_AGENTS:** IA-02, IA-04, IA-03, IA-05.

**AFFECTED_CONTRACTS:** Command/error boundary.

**BLOCKING_SCOPE:** First command implementation.

## DREQ-006 — Actor/authorization semantics for Order commands

**TITLE:** Define who may invoke the first Order command and whether authorization is domain state or application policy.

**PROBLEM:** Complete actor/permission rules are not normatively frozen.

**CURRENT_EVIDENCE:** Domain documentation requires deterministic authorization boundaries but does not provide a complete actor model.

**WHY_REQUIRED:** Prevents embedding authorization assumptions in domain behavior.

**OPTIONS:**
1. Keep authorization outside pure aggregate and pass only approved actor context.
2. Make authorization part of aggregate invariants.
3. Defer actor-sensitive command runtime.

**RECOMMENDED_OPTION:** Option 1. `PROPOSAL`.

**RISKS:** Incorrect authority boundary can become a security defect.

**AFFECTED_AGENTS:** IA-02, IA-04, IA-06, IA-07.

**AFFECTED_CONTRACTS:** Authorization boundary.

**BLOCKING_SCOPE:** Actor-sensitive first slice.
