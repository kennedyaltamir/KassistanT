# IA-04 — Order Engine Implementation Gates

Status: ACTIVE / BLOCKED

## Gate G0 — Source alignment

Required:

- Current `main` identified and audited.
- `Agent04-order-engine` derived from current `main`.
- Protected contracts read.
- No schema/domain/event infrastructure files modified by IA-04.

Current: PASS.

## Gate G1 — Canonical persistence

Required:

- Order, OrderItem, OrderItemModifier and OrderStatusHistory schemas are sufficient for the selected slice.
- Required Customer/Address/Product/Modifier/Promotion/Payment references are explicit.
- Store scoping and uniqueness constraints are available.
- Migration/persistence lifecycle is implemented by IA-01 before integration tests that require it.

Current: BLOCKED. Canonical business schema is not implemented; fields remain partial.

## Gate G2 — Domain semantics

Required:

- Order-relevant domain/value semantics are explicit.
- Shared primitives are consumable without duplicating domain authority.
- Invalid transitions and invariants have stable semantics.

Current: PARTIAL / BLOCKED for complete runtime.

## Gate G3 — Lifecycle

Required:

- Normative transition graph is explicit.
- Actor/state preconditions are explicit.
- Terminal behavior is explicit.
- Transition event policy is explicit.

Current: PARTIAL. State catalog exists; full graph and actor semantics do not.

## Gate G4 — Pricing

Required:

- Item and modifier calculation order explicit.
- Discount/promotion algorithm explicit.
- Delivery fee algorithm explicit.
- Rounding application explicit.
- Confirmed price snapshot semantics explicit.

Current: PARTIAL/BLOCKED.

## Gate G5 — Promotion

Required:

- Eligibility conditions.
- Period.
- Scope.
- Usage/limits where applicable.
- Stacking/exclusivity/priority behavior.
- Conflict resolution.
- Idempotent application behavior.

Current: BLOCKED.

## Gate G6 — Delivery and payment

Required:

- Delivery mode and mandatory fields.
- Delivery fee semantics.
- Order delivery lifecycle operations that are actually supported.
- Payment method semantics without inventing payment processing.
- Failure and retry rules for any payment boundary actually represented.

Current: BLOCKED/PARTIAL.

## Gate G7 — Error taxonomy

Required:

- Stable domain error codes/names.
- Trigger and meaning.
- Retryability.
- Concurrency/duplicate semantics.

Current: BLOCKED; canonical catalog missing.

## Gate G8 — Idempotency and concurrency

Required:

- Operation-specific idempotency key source and scope.
- Duplicate behavior.
- Replay/conflict behavior.
- Concurrency serialization/version semantics.
- Critical confirmation/cancellation race handling.

Current: PARTIAL/BLOCKED.

## Gate G9 — Event/durable-effect contract

Required:

- `order.created`, `order.confirmed`, `order.cancelled` payload contracts stable.
- `order.status_changed` resolved or proven irrelevant to selected slice.
- DomainOutbox ownership/scope resolved or proven irrelevant to selected slice.
- Audit integration contract available.

Current: BLOCKED by CONTRACT-001/002 for the complete flow.

## Gate G10 — Deterministic tests

Required:

- Command acceptance/rejection fixtures.
- Lifecycle transition tests.
- Money/pricing tests.
- Promotion tests.
- Idempotency/concurrency tests.
- Confirmation/cancellation tests.
- Persistence/event integration tests for the approved slice.

Current: PARTIAL. Core invariants are known; executable command/error contracts are incomplete.

## Earliest future implementation gate

The first implementation slice that can proceed independently is limited to deterministic Money arithmetic and tests around the existing primitive, subject to ownership/integration authorization. A complete Order Engine runtime remains blocked until G1-G10 are sufficiently satisfied for the intended slice.
