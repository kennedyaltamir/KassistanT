# IA-04 — Order Engine Handoff

## Territory

IA-04 owns the deterministic Order Engine at `apps/desktop/electron/order/**`.

## Current readiness state

The Contract Readiness Audit is complete for the currently available evidence.

Overall Order Engine readiness: **BLOCKED**.

The first safe implementation slice is the existing canonical Money primitive. IA-04 did not duplicate or relocate that primitive.

## Canonical Money consumption

**Source:** `packages/domain/src/money.ts`

**Public export:** `packages/domain/src/index.ts` through package `@kassist/domain`.

**Import boundary used by IA-04 test:** `../../../../packages/domain/src/index.ts`

**Representation:**

```ts
interface Money {
  amount_cents: number;
  currency: "BRL";
}
```

**Public operations currently available:** `createMoney`, `addMoney`, `subtractMoney`, `assertMoneyAmount`, `CURRENCY_BRL`.

**Invariants:** monetary amounts are safe integers in cents; currency is BRL for the current primitive; arithmetic requires matching currencies; results remain deterministic integer values.

**Restrictions:** IA-04 must not invent rounding, floating-point money, multiplication, comparison, formatting, persistence semantics or a second Money primitive unless an approved contract later adds them.

IA-04 added `apps/desktop/electron/order/money-contract.test.ts` to verify consumption of the canonical primitive and supported boundaries. No production adapter was needed because the canonical package already exposes the required arithmetic.

## Money Slice Final Handoff

**MONEY_SLICE_STATUS:** `READY_FOR_TEST_HARNESS_INTEGRATION`

**Test file:** `apps/desktop/electron/order/money-contract.test.ts`

**Direct test:** `NOT_VERIFIED` — no executable checkout/runtime was available in this session.

**Official Desktop suite:** `NOT_INCLUDED`.

**Official entrypoint:** `pnpm test` → `pnpm -r test` → `@kassist/desktop` → `scripts/test-desktop.mjs`.

### Shared test harness handoff

**FILE:** `scripts/test-desktop.mjs`

**CURRENT_OWNER:** shared test harness / integration authority. IA-04 does not own this shared file.

**CURRENT_PROBLEM:** `money-contract.test.ts` is not present in the `tsTests` list of `scripts/test-desktop.mjs`.

**PROPOSED_MINIMAL_CHANGE:** add exactly:

```text
apps/desktop/electron/order/money-contract.test.ts
```

to the `tsTests` list.

**EXPECTED_EFFECT:** the Money consumer test becomes part of the official Desktop test path.

**CI_IMPACT:** no new workflow entry is required for this fix because the existing CI workflow already executes `pnpm test`; once the shared harness includes the test, it will flow through the existing CI test command.

**AUTHORIZATION:** IA-04 is not authorized to modify `scripts/test-desktop.mjs` or `.github/workflows/**`.

**REQUIRED_NEXT_OWNER_ACTION:** the authorized owner/integration authority should review and apply the minimal harness change, then execute the direct test and official Desktop suite and verify CI independently.

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

## Test state

The Money consumer test exists, but direct execution remains `NOT_VERIFIED` because the current environment does not provide a verified project checkout/runtime. Official Desktop suite inclusion is currently `FALSE` until the shared harness is changed by its authorized owner. Remote GitHub CI status remains `NOT_VERIFIED`.

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

## Protected boundaries

`packages/contracts/**`, `packages/domain/**`, `apps/desktop/database/**`, `apps/desktop/electron/database/**`, `docs/**`, other agent directories, Gateway and root configuration remain protected.

## Continuation rule

Before implementation begins, reread this handoff, the readiness artifacts, current `main` contracts and the latest IA-01/02/03 handoffs. Re-audit if any upstream contract, schema or ownership boundary changes.

## Final state

- **MONEY_SLICE:** `READY_FOR_TEST_HARNESS_INTEGRATION`
- **FULL_ORDER_ENGINE:** `BLOCKED`
- **NEXT_PRODUCTION_SLICE:** `NONE_CONFIRMED`
- **NEXT_SAFE_TECHNICAL_ACTION:** `OWNER_REVIEW_OF_SHARED_TEST_HARNESS`
