# IA-04 — Order Engine Handoff

## Territory

IA-04 owns the deterministic Order Engine at `apps/desktop/electron/order/**`.

## Current readiness state

The Contract Readiness Audit is complete for the currently available evidence.

Overall Order Engine readiness: **BLOCKED**.

No production Order Engine runtime code was created or modified.

## What is sufficiently established

1. `CONFIRMED` is the operational sale milestone.
2. Order lifecycle states are catalogued: `DRAFT`, `CONFIRMED`, `IN_PRODUCTION`, `READY`, `OUT_FOR_DELIVERY`, `DELIVERED`, `CANCELLED`.
3. Invalid transitions must be rejected.
4. Quantity is a positive integer.
5. Money is integer cents in BRL and deterministic.
6. Confirmed orders freeze price state.
7. Terminal states do not reopen.
8. Confirmation requires final summary plus unequivocal confirmation.
9. `order.confirmed` is persisted with the Order transaction and durable effect.
10. The documented command set exists, but executable command schemas are partial.

## What remains incomplete

1. Complete lifecycle transition graph.
2. Actor/permission semantics.
3. Canonical domain error-code catalogue.
4. Canonical entity field completeness.
5. Full pricing execution order.
6. Promotion eligibility/stacking/priority/limits/conflict semantics.
7. Delivery-fee and delivery-state execution semantics.
8. Payment state/failure/retry semantics beyond registered payment method.
9. Operation-specific idempotency/replay/conflict semantics.
10. Concurrency serialization/version semantics.
11. `CONTRACT-001` DomainOutbox ownership/scope.
12. `CONTRACT-002` `order.status_changed` normative status.

## Current dependencies

- IA-01: canonical persistence schema.
- IA-02: domain semantics/primitives.
- IA-03: EventBus/Outbox/Queue/Audit interfaces.
- IA-05: Conversation/LLM command consumer.
- IA-06: actor/device identity at security boundary.
- IA-07: transport consumer; no business authority.
- IA-08: UI consumer; no pricing/state authority.

## Readiness artifacts

- `ORDER-ENGINE-READINESS.md`
- `ORDER-LIFECYCLE-MATRIX.md`
- `ORDER-PRICING-MATRIX.md`
- `ORDER-COMMAND-MATRIX.md`
- `ORDER-ERROR-MATRIX.md`
- `ORDER-DEPENDENCIES.md`
- `IMPLEMENTATION-GATES.md`

## Safe next slice

The only independently READY slice identified is deterministic Money arithmetic around the existing `packages/domain/src/money.ts` primitive. It must still be implemented/owned according to the later phase authorization; this readiness audit itself did not implement it.

All other runtime slices require additional contract closure or may only proceed as narrowly scoped slices that demonstrably avoid the unresolved contracts.

## Protected boundaries

`packages/contracts/**`, `packages/domain/**`, `apps/desktop/database/**`, `apps/desktop/electron/database/**`, `docs/**`, other agent directories, Gateway and root configuration remain protected.

## Continuation rule

Before implementation begins, reread this handoff, the readiness artifacts, current `main` contracts and the latest IA-01/02/03 handoffs. Re-audit if any upstream contract, schema or ownership boundary changes.
