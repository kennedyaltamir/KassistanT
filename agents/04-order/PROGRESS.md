# IA-04 — Order Engine Progress

## Current phase

**First Safe Implementation Slice — Money / Deterministic Arithmetic**

## Status

`MONEY SLICE READY_FOR_TEST_HARNESS_INTEGRATION / FULL ENGINE BLOCKED`

## Repository state

- Branch: `Agent04-order-engine`
- Main HEAD at slice start: `c9b79ae5ef90f4161261a93647d21d36773dd8e3`
- Branch HEAD before this final handoff: `f4f13c71a2eaa5de58ccd5bf5a59711c1cf10a79`.
- Main has not been modified by this slice.

## Money source audit

- Canonical source: `packages/domain/src/money.ts`.
- Public export: `packages/domain/src/index.ts` via `@kassist/domain` package surface.
- Representation: `{ amount_cents: number; currency: "BRL" }`.
- Validation: amount must be a JavaScript safe integer.
- Arithmetic: deterministic integer addition/subtraction with currency equality validation.
- No rounding, multiplication, comparison or formatting API is invented by IA-04.

## Implementation

`REUSE_EXISTING_CANONICAL_MONEY`.

No duplicate Money primitive and no production adapter were created. IA-04 added `apps/desktop/electron/order/money-contract.test.ts` to verify Order Engine consumption of the canonical primitive and its supported arithmetic/validation boundaries.

## Verification state

- Direct test: `NOT_VERIFIED` — no executable project checkout/runtime was available in this session.
- Official Desktop suite: `NOT_INCLUDED` — `scripts/test-desktop.mjs` does not currently list the Money consumer test.
- Shared harness change: required but not authorized to IA-04.
- Remote CI: `NOT_VERIFIED`.

## Shared test harness handoff

Required file: `scripts/test-desktop.mjs`.

Required minimal change: add `apps/desktop/electron/order/money-contract.test.ts` to `tsTests`.

Expected effect: the Money consumer test becomes part of the official Desktop test path and consequently the existing `pnpm test` CI path.

IA-04 must not modify the shared harness or `.github/workflows/**`.

## Full Order Engine state

`BLOCKED`.

Remaining blockers include lifecycle transition completeness, pricing/promotion semantics, error taxonomy, actor/permissions, entity fields, idempotency/concurrency, delivery/payment semantics, CONTRACT-001 and CONTRACT-002.

## Next safe milestone

`OWNER_REVIEW_OF_SHARED_TEST_HARNESS`.

No new production slice has been selected.
