# Campaign Dispatch Lifecycle Fix — 2026-08-28

## Status

VALIDATED_PENDING_COMMIT

## Bug

Campaign Dispatch test execution exposed asynchronous filesystem activity after HTTP tests completed. The reported failure was:

`EPERM: operation not permitted, rename campaigns.json.tmp -> campaigns.json`

After correcting CampaignDispatchRuntime initialization, the remaining failure was traced independently to `batches.json`, not `campaigns.json`.

## Root Cause

`createHttpServer()` eagerly instantiated both dispatch runtimes through default parameter expressions:

- `createBatchDispatchRuntime()`
- `createCampaignDispatchRuntime()`

This happened even when the server was only being used by unrelated endpoints such as `/health`, `/ready`, or unknown-route tests.

The BatchDispatchRuntime performs restart recovery during initialization, and its recovery path can persist the batch journal. Because the HTTP test suite used the process-global APPDATA dispatch path, that eager initialization could create asynchronous writes competing with other test activity.

The CampaignDispatchRuntime had a separate confirmed lifecycle defect in which `#load()` itself called `#save()`. That defect was already corrected in commit `415f7304421f86028c902c4f754c2d947c8f2b90` and remains corrected.

## Evidence

Windows execution before the final HTTP lifecycle fix:

- Gateway suite: 126 tests
- 125 passed
- 1 failed
- failure type: generated asynchronous activity after test completion
- affected filesystem object: `%APPDATA%\KassisT\dispatch\batches.json`
- operation: `batches.json.tmp` -> `batches.json`

An explicit filesystem tracer confirmed the writer path reached `batches.json`.

After lazy runtime initialization:

- isolated HTTP test: 6 passed, 0 failed
- isolated Campaign Dispatch test: 8 passed, 0 failed
- Gateway unit suite: 125 passed, 0 failed
- Gateway full suite: 125 passed, 0 failed
- no generated asynchronous activity was observed after HTTP tests
- no residual EPERM was observed

## Correction

`createHttpServer()` no longer creates Batch or Campaign dispatch runtimes eagerly.

Instead:

- `getDispatchRuntime()` creates the Batch runtime only when a Batch Dispatch route requires it.
- `getCampaignRuntime()` creates the Campaign runtime only when a Campaign Dispatch route requires it.

Explicit dependency injection remains supported.

No changes were made to BatchDispatchRuntime lifecycle/recovery semantics.

## Preserved Behavior

The correction preserves:

- CampaignDispatchRuntime `#load()` read-only behavior
- explicit persistence after mutations
- BatchDispatchRuntime as execution core
- retry/backoff policy
- cancellation
- recovery
- confirmation gate
- snapshot semantics
- fingerprint semantics
- recipient selection
- pacing semantics
- multimodal behavior
- HTTP Campaign Dispatch routes
- HTTP health/readiness behavior

## Tests

Validated locally on Windows:

- `node --test gateway/test/http.test.mjs` — PASS
- `node --test gateway/test/campaign-dispatch.test.mjs` — PASS
- `pnpm --filter @kassist/gateway test:unit` — PASS
- `pnpm --filter @kassist/gateway test` — PASS
- `pnpm test` — PASS
- `pnpm qa:gates` — PASS
- `pnpm lint` — PASS
- `pnpm typecheck` — PASS
- `pnpm build` — PASS
- `git diff --check` — PASS after EOF normalization

## Files Changed

- `gateway/src/http.mjs`
- `gateway/test/http.test.mjs`
- `KNOWLEDGE/decisions/campaign-dispatch-lifecycle-fix-2026-08-28.md`

## Validation State

IMPLEMENTATION_HEAD_BEFORE:
`415f7304421f86028c902c4f754c2d947c8f2b90`

VALIDATED_COMMIT:
To be assigned after commit of the validated code/test tree.

KNOWLEDGE_COMMIT:
To be assigned.

FINAL_HEAD:
To be assigned.

## Residual Risks

No residual Campaign Dispatch lifecycle failure was observed in the validated Windows test execution.

The BatchDispatchRuntime recovery/persistence behavior remains intentionally unchanged; the fix removes only its unnecessary eager construction from unrelated HTTP server initialization.

## Governance

Protected branch `MVP2` was not modified.

Protected baseline:
`2aa27a93a8fe1f62ae64c3a5aec98809ae01a423`

Working branch:
`MVP2-implementandoQRCODE`
