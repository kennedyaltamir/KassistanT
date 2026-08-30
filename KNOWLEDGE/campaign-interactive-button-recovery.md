# KassisT — Selective Recovery: Campaign Interactive Buttons

**Status:** IMPLEMENTED / VALIDATION_PENDING
**Base:** `532451506cce77eeac0d420a60d226fd2b738df0`
**Branch:** `MVP2-implementandoQRCODE`
**Historical reference requested:** `6393ac7aa92eef7981d914874004d0468aee6c94`
**Recovery branch requested:** `recovery/pre-reset-6393ac7`

## Recovery reason

The current `campaign-dispatch-ui.js` did not expose the interactive-button editor contracts even though the current CampaignDispatchRuntime already accepts and executes `button_variants`.

The requested recovery was therefore limited to the UI state, controls, handlers, payload field and regression coverage.

## Evidence available in the current repository

The current CampaignDispatchRuntime already provides:

- `button_variants` input normalization;
- `canonicalInteractiveButtons`;
- maximum of three quick-reply buttons per configuration;
- fingerprint inclusion of `buttonVariants`;
- persisted per-recipient `buttonVariantId`;
- `INTERACTIVE` effect selection;
- `sendInteractive` transport invocation.

This recovery did not add a new endpoint or transport.

## Historical comparison limitations

The requested recovery branch `recovery/pre-reset-6393ac7` is not currently exposed by the GitHub branch API used in this session, and commit `6393ac7aa92eef7981d914874004d0468aee6c94` is not resolvable in the repository.

The requested `.bak` file was also not exposed by the GitHub contents API at the canonical base. Therefore no unverified historical block was copied.

The recovery decisions below are based on the explicit task facts plus behavior already supported by the current CampaignDispatchRuntime.

## Recovered contracts

### State

- `interactiveEnabled`
- `buttonVariants`

### UI

- `campaign-interactive-enabled`
- `buttonVariants()`
- `data-button-text`
- `data-button-id`
- `data-add-button`
- `data-remove-button`
- `data-remove-button-variant`
- `campaign-add-button-variant`

### Behavior

- Enable/disable interactive messages.
- Add/remove button variants.
- Add/remove buttons.
- Maximum of three buttons per configuration.
- Preserve button IDs and text in state.
- Mutating interactive configuration invalidates both PREVIEW and DRAFT.
- Empty button variant configuration is retained while disabled and sent only when enabled.

### Payload

The existing campaign preview request now includes:

`button_variants: state.interactiveEnabled ? state.buttonVariants : []`

The request continues through the existing:

`UI → /api/whatsapp/dispatch/campaign/preview → DRAFT → CONFIRM → QUEUE`

pipeline.

## Deliberately not recovered

- Entire `.bak` file.
- Historical bind/event-delegation implementation.
- Any replacement of current campaign binding.
- `index.html`.
- Dashboard implementation.
- LLM settings.
- WhatsApp lifecycle tests.
- Native image picker implementation.
- Filesystem handling.
- New Gateway endpoint.
- Direct WhatsApp transport from the UI.

## Image picker preservation

The current campaign UI still uses:

`window.kassist?.selectCampaignImage`

and preserves:

- `imageReference`;
- filename;
- MIME type;
- size;
- metadata source `electron-native-picker`.

No filesystem implementation from a historical UI was reintroduced.

## Regression coverage

### Gateway campaign runtime

Added coverage for:

- interactive button normalization;
- persisted variant identity;
- DRAFT state;
- CONFIRM gate;
- QUEUE execution;
- `INTERACTIVE` effect selection;
- actual invocation of `sendInteractive`;
- preservation of button IDs and texts;
- rejection of more than three buttons.

### Desktop UI contract

Added coverage for:

- interactive state;
- editor controls;
- add/remove handlers;
- payload field;
- preview/draft invalidation;
- image picker preservation;
- CSV/manual preview preservation;
- existing confirm/queue pipeline preservation.

## Validation status

The changed files are committed to the development branch.

Dynamic execution of Node/pnpm test suites, lint, typecheck and build is still **NOT VALIDATED** in this environment because the repository checkout cannot be fetched due GitHub DNS/network unavailability.

No Dashboard file or `index.html` file was modified by this recovery.
