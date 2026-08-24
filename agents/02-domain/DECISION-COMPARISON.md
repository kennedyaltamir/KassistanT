# IA-02 — Decision Comparison

## EXECUTIVE_SUMMARY

This document isolates only the four human decisions required to evaluate the proposed first Domain Runtime slice:

`Order` + `ConfirmOrder` + `DRAFT -> CONFIRMED` + `order.confirmed`.

No decision is approved by IA-02. All recommendations are proposals only.

The minimum human decision set is:

1. DREQ-001 — authorize the first aggregate boundary.
2. DREQ-002 — authorize the first normative transition.
3. DREQ-005 — authorize the minimum semantic error contract for `ConfirmOrder`.
4. DREQ-006 — authorize the actor/authorization boundary for the first command.

DREQ-003 (`order.status_changed`) and DREQ-004 (DomainOutbox) are deliberately excluded from the minimum gate because the proposed first slice can avoid both, provided the human authority explicitly accepts that slice boundary.

## DREQ-001 — Order as Aggregate Root

### OPTION_A

**Aggregate root:** `Order`.

**Children:** `OrderItem`, `OrderItemModifier`, `OrderStatusHistory` only if their ownership is explicitly accepted; `OrderStatusHistory` may alternatively remain an audit/persistence projection outside aggregate mutation.

**Invariants:** quantity positivity, deterministic monetary totals, confirmation milestone, price freeze after confirmation, terminal-state integrity.

**Persistence boundary:** aggregate state is conceptually one mutation boundary; physical persistence remains IA-01 territory.

**Event boundary:** domain emits aggregate events; IA-03 owns transport/delivery mechanics.

**Concurrency boundary:** concurrent mutations are serialized at the aggregate boundary; exact conflict policy remains part of the command contract.

**Advantages:** aligns with the strongest existing order-centered vocabulary and IA-04 boundary; smallest meaningful business slice.

**Risks:** child ownership and history semantics must be explicit before code.

**Affected agents:** IA-02, IA-04, IA-01, IA-03.

**Implementation consequence:** permits implementation of a narrow Order aggregate without implementing all 28 entities.

### OPTION_B

**Aggregate root:** smaller Order boundary containing only `Order` + `OrderItem`/`OrderItemModifier`, with status history treated as external audit/projection.

**Advantages:** smaller mutation surface.

**Risks:** may conflict with documented status-history ownership/persistence semantics if those later require aggregate consistency.

**Affected agents:** IA-02, IA-04, IA-01, IA-03.

**Implementation consequence:** requires an explicit rule that `OrderStatusHistory` is not aggregate-owned for the first slice.

### OPTION_C

**Aggregate root:** defer aggregate authorization and continue documentation only.

**Advantages:** no premature architecture decision.

**Risks:** blocks all aggregate runtime implementation.

**Affected agents:** IA-02, IA-04.

**Implementation consequence:** D2 remains frozen.

### RECOMMENDED_OPTION

`OPTION_A`, subject to explicit child list and explicit treatment of `OrderStatusHistory`.

### FIRST_SLICE_EFFECT

Enables the proposed Order slice after the remaining three decisions are closed.

### RISK

Incorrect child ownership can create transaction, concurrency and persistence coupling errors.

### REVERSIBILITY

Medium. Aggregate boundaries are expensive to change after runtime and persistence consumers exist.

### REQUIRED_APPROVAL

Human/global authority with IA-04 and IA-01 consultation.

---

## DREQ-002 — First Normative Transition

### CURRENT CONTRACT EVIDENCE

`DRAFT` and `CONFIRMED` are documented states; `CONFIRMED` is the operational sale milestone; invalid transitions must be rejected; `order.confirmed` is documented at the confirmation boundary.

### OPTION_A

Freeze `DRAFT -> CONFIRMED` as the first normative transition.

**Trigger:** valid `ConfirmOrder` command.

**Actor:** an application-approved actor supplied by the authorization boundary; actor semantics are finalized by DREQ-006.

**Preconditions:** Order is `DRAFT`; required confirmation data is present; final summary exists; confirmation is unequivocal; deterministic totals are valid.

**Invariants:** monetary determinism; valid mutable state; price freeze begins at confirmation; terminal-state rule applies after transition.

**Resulting state:** `CONFIRMED`.

**Event:** `order.confirmed`.

**Errors:** invalid transition; incomplete confirmation data; duplicate command where applicable; concurrency conflict if a stale version is supplied.

**Audit:** domain event/audit intent is observable; durable AuditLog remains infrastructure-dependent.

**Idempotency:** repeated confirmation must not create a second logical confirmation.

**Advantages:** directly matches existing documented sale milestone.

**Risks:** requires DREQ-005 and DREQ-006 completion.

### OPTION_B

Freeze a smaller non-confirmation transition.

**Advantages:** avoids confirmation semantics.

**Risks:** does not produce the proposed business milestone and creates a less useful first slice.

### OPTION_C

Defer Order runtime transition decisions.

**Advantages:** maximum safety.

**Risks:** no meaningful Order runtime can start.

### RECOMMENDED_OPTION

`OPTION_A`, provided DREQ-001, DREQ-005 and DREQ-006 are approved consistently.

### FIRST_SLICE_EFFECT

Defines exactly one transition and keeps all other Order transitions out of scope.

### REVERSIBILITY

Medium. Lifecycle semantics are cross-agent contracts once consumed.

### REQUIRED_APPROVAL

Human/global authority with IA-04 consultation.

---

## DREQ-005 — Minimum ConfirmOrder Error Semantics

### REQUIRED_FOR_FIRST_SLICE

Only these semantic categories are required:

1. **InvalidOrderState** — command targets an Order that is not in `DRAFT`.
2. **ConfirmationDataInvalid** — required final confirmation data/summary is absent or invalid.
3. **DuplicateConfirmation** — the same logical confirmation has already been accepted; exact idempotency mapping must be agreed.
4. **ConcurrencyConflict** — the command operates on stale aggregate state, if optimistic/concurrency checking is part of the approved command boundary.

`InvalidQuantity`, `UnavailableItem`, `PromotionViolation` and delivery-specific errors do not belong in the first `ConfirmOrder` slice unless the selected command contract explicitly recalculates or validates those concerns as part of confirmation.

### FUTURE_ERROR_CATALOG

Product availability, promotion, delivery, payment, customer, integration, infrastructure and provider errors remain future scope.

### GLOBAL_ERROR_POLICY

No global error codes, transport mappings or UI wording are frozen by IA-02 in this document.

### OPTION_A

Freeze semantic categories locally; keep stable global codes/mappings for later shared contract work.

**Advantages:** smallest coupling and sufficient for deterministic domain tests.

**Risks:** later mapping work required.

### OPTION_B

Freeze categories plus globally stable error codes now.

**Advantages:** earlier cross-layer consistency.

**Risks:** expands scope and requires broader authority.

### OPTION_C

Defer error semantics and block command runtime.

### RECOMMENDED_OPTION

`OPTION_A`.

### FIRST_SLICE_EFFECT

Allows domain-level error semantics without prematurely freezing the project's complete error taxonomy.

### REVERSIBILITY

High for local semantic names; lower for globally published codes.

### REQUIRED_APPROVAL

Human authority for the command contract; IA-04 consultation for application mapping.

---

## DREQ-006 — Actor / Authorization Boundary

### OPTION_A

**Who may execute `ConfirmOrder`:** an actor already authorized by the application/application-service boundary to confirm an order for the store.

**Identity arriving at domain:** a minimal approved actor context/value supplied by the caller; the domain does not authenticate credentials.

**Domain responsibility:** validate that the command is structurally and semantically valid and that supplied actor context is present when the contract requires it; do not perform credential validation or transport authentication.

**Gateway responsibility:** transport/device authentication and external boundary checks where applicable; no business authorization decision for Order semantics.

**Desktop/Core responsibility:** establish application authorization context and invoke the domain command only after authorization policy passes.

**Aggregate responsibility:** business invariants and state transition only; no identity provider, token, key or transport concerns.

**Advantages:** preserves separation between domain rules and security/application boundaries.

**Risks:** requires an explicit application authorization contract.

### OPTION_B

Embed authorization decisions inside the aggregate.

**Advantages:** strong local enforcement.

**Risks:** couples business model to authorization policy and identity infrastructure; inconsistent with the stated domain boundary.

### OPTION_C

Defer actor semantics and allow only internal/test callers for the first slice.

**Advantages:** minimal contract.

**Risks:** prevents production-grade command authorization and would make the first slice non-production-ready.

### RECOMMENDED_OPTION

`OPTION_A`.

### FIRST_SLICE_EFFECT

Defines the minimum actor boundary without introducing a product-wide permissions matrix.

### REVERSIBILITY

Medium. Boundary is changeable, but consumers will depend on the invocation contract.

### REQUIRED_APPROVAL

Human/global authority with IA-04 and consultation from IA-06/IA-07.

---

## CONSISTENCY_CHECK

**Result:** `CONSISTENT_PENDING_APPROVAL`

The four recommendations are mutually compatible:

- DREQ-001 authorizes `Order` as the narrow aggregate boundary.
- DREQ-002 applies only `DRAFT -> CONFIRMED` to that aggregate.
- DREQ-005 supplies only the errors required by that command/transition.
- DREQ-006 keeps authorization outside the aggregate while supplying approved actor context.

No recommendation requires `order.status_changed` or DomainOutbox for the first slice.

### CONSISTENCY_CONFLICT

No internal contradiction was found among the four recommended options.

A conflict would exist if DREQ-001 selected a boundary that excluded the state/invariants required by DREQ-002, or if DREQ-006 placed authorization inside the aggregate contrary to the proposed boundary. Neither occurs in the recommended set.

## FIRST-SLICE REVALIDATION

### Proposed slice

- Aggregate: `Order`
- Command: `ConfirmOrder`
- Transition: `DRAFT -> CONFIRMED`
- Event: `order.confirmed`
- Persistence: none
- Outbox: none
- EventBus: none required

### Current support

| Element | Current status |
|---|---|
| Aggregate `Order` | REQUIRES DREQ-001 |
| `ConfirmOrder` | PARTIALLY documented; REQUIRES command contract completion |
| `DRAFT -> CONFIRMED` | REQUIRES DREQ-002 |
| `order.confirmed` | DOCUMENTED; semantic details still need confirmation at slice level |
| Persistence | Can be excluded from first slice |
| DomainOutbox | Can be excluded from first slice |
| EventBus | Can be excluded from first slice |
| Error semantics | REQUIRES DREQ-005 |
| Actor boundary | REQUIRES DREQ-006 |

### Gate

`FIRST_SLICE_STATUS = READY_AFTER_HUMAN_DECISIONS`

This status does **not** authorize implementation. After human decisions, IA-02 must perform a fresh readiness audit and only then request explicit implementation authorization.

## POST-DECISION GATE

```text
HUMAN_DECISION_RECEIVED
        ↓
RECORD_DECISION
        ↓
REVALIDATE_FIRST_SLICE
        ↓
IMPLEMENTATION_AUTHORIZATION
        ↓
D2 IMPLEMENTATION
```

No automatic transition to implementation is permitted.

## EXACT_INPUT_REQUIRED_FROM_OPERATOR

```text
DREQ-001: A / B / C
DREQ-002: A / B / C
DREQ-005: A / B / C
DREQ-006: A / B / C
```

No answers are presumed.
