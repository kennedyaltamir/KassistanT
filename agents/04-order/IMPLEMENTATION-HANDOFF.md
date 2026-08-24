# IA-04 — Orders + Products Implementation Handoff

## Baseline

- `MVP2` = `636f08a5d377879d80766cf017684f8a6f955376`
- Working branch = `feature/orders-products`

## Implemented slice

- persisted Product listing and creation through Electron IPC;
- deterministic BRL integer-cent validation;
- persisted Order listing;
- draft Order creation from persisted Product snapshots;
- canonical `Order.createDraft` construction;
- canonical `confirmOrder` domain command for confirmation;
- duplicate confirmation rejection;
- transactional Order persistence and update boundary;
- renderer loading/empty/error states;
- renderer no longer owns canonical Product/Order fixture data;
- official Desktop test runner includes the commerce service test.

## Deliberate non-scope

Product update/deactivation is not invented because the current schema/domain contract provides no approved mutation semantics.

Lifecycle commands after `CONFIRMED` are not invented because the current baseline catalogs those states but does not provide complete executable command contracts for them.

`OrderStatusHistory` and `DomainOutbox` are not added because their physical ownership/contract is outside this agent's currently resolved boundary.

## Verification

Repository diff against `MVP2` was reviewed using GitHub compare. Direct runtime execution is not available in the current model environment. CI must remain the authoritative executable verification for the branch.

## Runtime caveat

The current desktop bootstrap is CommonJS while canonical domain/database sources are TypeScript. The bridge uses the existing `tsx/cjs` runtime loader. The package currently declares `tsx` as a development dependency; installer/package policy for shipping this runtime dependency is outside the current Orders + Products contract and remains an explicit deployment limitation.
