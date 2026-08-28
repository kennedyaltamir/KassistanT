# KassisT — Implementation Knowledge: Runtime Context, Product Catalog, Multimodal and Dispatch Inputs

## Context

Change Unit executed on `MVP2-implementandoQRCODE`, based on `MVP2 @ 2aa27a93a8fe1f62ae64c3a5aec98809ae01a423`.

## Discoveries

1. `Product` already existed in `apps/desktop/database/migrations/0003_first_sale_core.sql` with `price_cents` as integer and `available` as an integer boolean. No second Product table was needed.
2. `Customer`, `Conversation`, `Message`, `customer_address`, `order`, `inbound_inbox` and `domain_outbox` already existed in the same schema.
3. `Message` is unique on `(store_id, external_message_id)` and remains the canonical persisted message source.
4. The existing Gateway auto-reply previously used only the in-memory message ring as context. It now retrieves a sanitized persisted context through the SQLite persistence service before calling Ollama.
5. The current identity implementation still derives Customer resolution from `message.jid`/`phone_normalized`. This remains explicitly marked `LEGACY_JID_DERIVED` and is not promoted to the proposed canonical Identity/Binding contract.
6. The desktop runtime requires an explicit `apps/desktop/database/migrations` path when starting SQLite migrations. The default relative path in the runtime was corrected at the Desktop entry point.

## Decisions

- Assistant configuration is structured and persisted as JSON by Gateway, with a compiled versioned system prompt. It is not represented solely by a free-form prompt.
- Product CRUD is exposed over HTTP through the existing SQLite persistence runtime. Prices remain integer cents; stock is integer quantity; availability is explicit; image is an opaque product reference.
- Conversation context is a read projection of existing Customer, Conversation, Message, Customer Address, active Order and available Product records.
- Conversation analysis emits structured candidates with `key`, `value`, `confidence`, `resolution_status`, `source_message_id` and observation time. Extraction is not confirmation.
- Image interpretation uses a local Ollama multimodal-capable model. Audio transcription uses a locally installed Whisper-compatible command. Missing provider capabilities are reported as unavailable/failure instead of fabricated.
- CSV/manual dispatch inputs produce `PREVIEW` objects. Actual effect remains behind the existing human confirmation and BatchDispatch state machine.

## Security invariants

- Baileys and auth state remain in Gateway.
- LLM context excludes raw authentication state, credentials, private/signal keys and transport secrets.
- Customer-specific claims use the runtime-provided context.
- Dispatch import never directly sends messages.

## Validation boundary

The repository-side changes above have not been treated as local functional PASS. Local execution of `pnpm test`, `pnpm qa:gates`, `pnpm lint`, `pnpm typecheck`, `pnpm build`, real Ollama, real WhatsApp, real audio and real image processing still requires the user's Windows environment.

## Related commits

- `e3264416b2e018fa847ab1486f0ad5b5a761a50c` — change-unit boundary
- `b4feebfd268c5bbc97b0c5eabeca7588269d921b` — structured assistant configuration and product fields
- `15bce9301907b8ae30528f3d591c12fb19b77972` — persistence product/context APIs
- `ec5203946f56df1faa4af796d3ce82450a8926dd` — persisted context in auto-reply
- `e5950fb406704c4a1add8ba91679392128822cdb` — migrations path correction
- `23b72dffcb7da72347d19566c0d2d81fdb25f50c` — conversation analysis HTTP endpoint
- `18b70574198a55c9d011573e6f1d9d41ea2e91cd` — Gateway multimodal processing and analysis module
- `446b06f04d302a41bd8dc1b665ba2c91b38832de` — CSV/manual dispatch preview endpoints
- `20027eb8f4155fa38cb91929eae18692aeb08bac` — dispatch input validation tests

## Status

BACKEND IMPLEMENTATION ADVANCED / UI AND REAL LOCAL FUNCTIONAL VALIDATION REMAINING.
