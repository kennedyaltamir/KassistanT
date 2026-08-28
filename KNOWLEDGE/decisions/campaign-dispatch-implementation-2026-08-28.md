# Campaign Dispatch — Implementation Decision — 2026-08-28

## Context

The existing dispatch pipeline already provides CSV/manual recipient preview, human confirmation, BatchDispatchRuntime state management, retry, timeout, restart recovery, cancellation and deterministic recipient identity. The existing batch transport was text-only.

The Campaign Dispatch Change Unit evolves that pipeline rather than replacing the BatchDispatchRuntime.

## Decision

Introduce `CampaignDispatchRuntime` as an orchestration layer responsible for:

- campaign validation and canonicalization;
- campaign objective;
- message variants;
- image variants and persisted asset references;
- explicit caption policy;
- persisted pacing/scheduling;
- campaign fingerprint;
- immutable campaign snapshot associated with the Batch;
- per-recipient effect selection persisted before external execution.

`BatchDispatchRuntime` remains the execution core for batch state, retry, timeout, recovery, cancellation and recipient outcome persistence.

The campaign layer uses the same WhatsApp transport boundary and does not create a second sending engine.

## Transport

The Gateway now exposes `sendImage(to, imageReference, caption)` in addition to the existing `sendText()`.

Image references are accepted only under an authorized `KASSIST_MEDIA_ROOT`, and the Gateway validates file existence, non-empty file content and supported image format before invoking Baileys. The Renderer never handles filesystem paths directly.

## Selection and scheduling

Message/image selection is deterministic from the batch id and recipient identity and is persisted in the campaign journal. This makes retry/restart selection stable and auditable.

Campaign pacing is represented in milliseconds as `minimumMs` and `maximumMs`. A per-recipient `scheduledDelayMs` and `scheduledAt` are persisted. The selected delay is deterministic pseudo-random over a stable hash seed so a restart does not silently invent a different schedule.

The campaign pacing policy is distinct from the existing BatchDispatchRuntime retry backoff (30s, 60s, 120s, 240s) and does not replace it.

## API

Existing dispatch batch routes remain intact.

New Campaign Dispatch routes expose:

- `POST /api/whatsapp/dispatch/campaign/preview`
- `POST /api/whatsapp/dispatch/campaigns`
- `GET /api/whatsapp/dispatch/campaigns`
- `GET /api/whatsapp/dispatch/campaigns/:id`
- `POST /api/whatsapp/dispatch/campaigns/:id` with `confirm`, `queue` and `cancel` actions.

## Desktop

A dedicated `campaign-dispatch-ui.js` provides the Campaign Dispatch surface with recipient input, objective, message variants, controlled image picker, caption policy, pacing, preview and explicit confirmation/queue actions.

The Electron preload exposes only the controlled `selectCampaignImage` capability. Electron copies selected assets into the application-owned campaign image directory and launches the Gateway with the matching `KASSIST_MEDIA_ROOT`.

The campaign UI is bootstrapped before the existing feature UI so its `broadcasts` navigation contract takes precedence without a DOM watcher or a second page router.

## Invariants

- `MVP2` is not modified.
- Human confirmation remains a hard gate before queueing.
- Confirmed campaign content is represented by a fingerprinted snapshot.
- Retry reuses the same selected message/image/caption policy.
- Campaign pacing is not a retry backoff substitute.
- No campaign field changes runtime authorization.
- Renderer does not execute Baileys, access auth state or arbitrary filesystem APIs.
- Image payloads are references, not base64 data in batch JSON.
- Existing BatchDispatchRuntime state semantics remain the execution authority.

## Evidence

Implementation commits on `MVP2-implementandoQRCODE`:

- `0fe5d76c911d3cd3b66d964a239e6e8de34a7e6a` — campaign orchestration layer.
- `6baf454ab0d47c2fa255b283927c0ee9c40754c1` — controlled WhatsApp image transport.
- `117b408736c7401e2027ab33b02964d6cc731951` — Campaign Dispatch HTTP API.
- `00e37de2abf8368fea9524e8bc5ef28863c9ba52` — campaign runtime tests.
- `aed56ffc50bc3add3f32f448433615562190a820` — Campaign Dispatch desktop UI.
- `332f376ac6fa374a8f46bba18fccac2865ac5b21` — controlled campaign image picker preload.
- `df8d6dc668c808fe650b91dffe91f18c6e3b4085` — Electron wiring, UI bootstrap and media root.
- `be7e2b81801ad5eb0f2c08fa53983a2b52008bcf` — UI contract tests.

## Limitations / Open items

- The current environment does not expose a local checkout/worktree, so local `git status` and local test execution cannot be claimed here.
- Provider-specific delivery confirmation/idempotency remains governed by the existing provider-dependency contract; Campaign Dispatch does not manufacture delivery semantics.
- A controlled two-recipient real WhatsApp functional test still requires explicit authorized test recipients and a live connected Gateway. No external dispatch is performed automatically by this Change Unit.
- The campaign journal currently uses filesystem-backed JSON persistence alongside the existing Batch journal. This is intentional for the first implementation slice and should be revisited only through an explicit persistence decision if a shared canonical storage contract is later established.
