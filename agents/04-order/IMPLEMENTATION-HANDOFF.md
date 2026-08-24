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

## Correction cycle

- corrected `commerce-service.ts` domain import resolution to the repository's existing TypeScript NodeNext convention;
- reconciled baseline `EventBus` test callback return types without changing behavior;
- corrected the baseline Money consumer test from `.ts` import specifier to `.js` NodeNext specifier;
- made the commerce recovery test variable explicitly typed as `ProductView`;
- reconciled implementation documentation with actual CI evidence.

## Deliberate non-scope

Product update/deactivation is not invented because the current schema/domain contract provides no approved mutation semantics.

Lifecycle commands after `CONFIRMED` are not invented because the current baseline catalogs those states but does not provide complete executable command contracts for them.

`OrderStatusHistory` and `DomainOutbox` are not added because their physical ownership/contract is outside this agent's currently resolved boundary.

## Verification

Repository diff against `MVP2` was reviewed using GitHub compare. The correction CI run was `32764834577` and executed the repository-defined commands from `.github/workflows/ci.yml`.

- `pnpm lint`: PASS.
- `pnpm typecheck`: repository-wide FAIL in `gateway`.
- `apps/desktop typecheck`: PASS before the gateway workspace failure.
- Gateway errors are in files outside the IA-04 diff; IA-04 did not modify Gateway files.
- Because the workflow stops at repository-wide Typecheck, official CI `pnpm test` and `pnpm build` did not execute in this run.

Security/Supply Chain for the same correction head:

- Supply Chain run `32764834545`: Dependency Audit PASS, SBOM PASS, Secret Scan PASS.
- Security run `32764834519` had not yet produced a completed job result at the time of this handoff.

Direct local runtime execution is unavailable in the current model environment, so local command execution is not claimed.

## Runtime caveat

The current desktop bootstrap is CommonJS while canonical domain/database sources are TypeScript. The bridge uses the existing `tsx/cjs` runtime loader. The package currently declares `tsx` as a development dependency; the current build script verifies required skeleton files but does not establish a packaged Windows artifact. Packaged-release compatibility of `tsx/cjs` therefore remains `PENDING` at the installer/release level.

## PR state

PR #15 remains OPEN, base `MVP2`, head `feature/orders-products`, and is not merged. It is not ready for final review while the repository-wide typecheck remains blocked and official Tests/Build have not executed.
