# IA-07 — First Sale UX Handoff

## Status

`UX_IMPLEMENTATION = COMPLETE_PENDING_CI`

## Territory

IA-07 owns the renderer presentation layer for the first-sale flow. The implementation is limited to `apps/desktop/src/first-sale/**`, `apps/desktop/src/index.html`, and UX boundary tests.

## Implemented flow

`Conversation -> Product -> Order Review -> Address -> Payment -> Confirmation -> Result`

The renderer implements navigation, explicit empty/blocked states, status/loading presentation, error/result presentation, and duplicate-confirmation prevention. It does not manufacture commercial data.

## Authority boundaries preserved

- Pricing remains Core-owned.
- Availability remains Core-owned and binary.
- The renderer does not calculate commercial totals.
- No schema changes.
- No `main.cjs` changes.
- No `preload.cjs` changes.
- No IPC architecture changes.
- No backend implementation.
- No mock commercial data is treated as product evidence.

## Evidence

Branch: `agent07-first-sale-ux`

Base: `main`

The branch contains a dedicated `tests/first-sale-ux.test.mjs` suite covering boundary enforcement, commercial-authority separation, duplicate-submit prevention, and complete flow coverage.

## Pending verification

CI must provide the executable evidence for `lint`, `typecheck`, `test` and `build` before the UX state can be promoted to `UX_VERIFIED`.

`PRODUCT_VERIFIED` requires integration with the real application/Core contracts and cannot be claimed by this isolated UX slice.
