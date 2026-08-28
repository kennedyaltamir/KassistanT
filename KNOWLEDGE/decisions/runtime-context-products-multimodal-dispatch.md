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
7. The Assistant renderer had been sending UI-only aliases (`natural`, `concise`, `structured`) and primitive delivery/hour values while the Gateway contract was structured. The Gateway now normalizes those compatible renderer aliases into canonical values and preserves integer-cent delivery amounts.
8. The Electron renderer is sandboxed with `contextIsolation: true` and `nodeIntegration: false`. There was no existing product-image storage strategy. A local-only image picker was therefore added to the Electron main process; selected images are copied into the application user-data directory and the persisted Product stores the resulting opaque local `imageReference`.
9. The Conversations renderer was using legacy `jid`, `name`, and `lastMessage` shapes that did not match the persisted API response. The renderer now consumes `externalThreadId`, `customer.name`, `customer.phoneNormalized`, and `lastMessage.text` from the existing context API.
10. Auto-reply authorization must be rechecked against the persisted Conversation at execution time. The runtime now requires `ownership=AI`, `aiState=ACTIVE`, and `lifecycleState=OPEN`; the cooldown timestamp is recorded only after a successful WhatsApp send.
11. Real Windows validation reached Gateway `3210`, Persistence `3211`, Ollama `11434`, and WhatsApp `CONNECTED` simultaneously after the independent Gateway process was removed. The selected Ollama model was `qwen2.5:14b-instruct`.
12. Real Product CRUD validation succeeded through the Gateway HTTP API against the local SQLite persistence: create, get, update and delete all returned the expected persisted records. The validation product used integer-cent pricing and was removed at the end of the test.
13. Conversation validation showed a semantic identity conflict: the persisted Customer for `246973638648023@lid` was `Kennedy Altamir` with `identity_binding_status=LEGACY_JID_DERIVED`, while inbound messages in the same Conversation explicitly introduced `João` and later `Carlos`. Auto-reply history demonstrated that the LLM could repeat one of those names as if it were the confirmed Customer identity. This is evidence of the existing Identity/Binding gap affecting runtime semantics; it is not a reason to invent a new canonical Identity architecture inside this Change Unit.
14. Conversation analysis originally inspected both `INBOUND` and `OUTBOUND` messages. Real validation therefore produced false candidates such as assistant text classified as `name`, `city` or `order`. The analysis implementation was corrected to inspect only inbound evidence and to narrow explicit name/city extraction patterns.
15. LLM context originally included Customer `name` and `phoneNormalized` even when the binding status was not confirmed. This could turn a legacy JID-derived Customer value into trusted LLM context. The auto-reply context boundary was corrected so these Customer identity fields are included only for `identityBindingStatus=CONFIRMED`; the current user message remains a separate message input.

## Decisions

- Assistant configuration is structured and persisted as JSON by Gateway, with a compiled versioned system prompt. It is not represented solely by a free-form prompt.
- Renderer configuration aliases are tolerated only as an input-normalization boundary; canonical persisted values remain `concise_text`, `natural_text`, `bullet_points`, and `markdown`.
- Delivery price remains integer cents (`amountCents`) and is the only authorized numeric delivery fee representation supplied to the prompt.
- Product CRUD is exposed over HTTP through the existing SQLite persistence runtime. Prices remain integer cents; stock is integer quantity; availability is explicit; image is an opaque local product reference.
- Product image bytes are owned by the Desktop main process rather than the Renderer. The Renderer receives only the selected stored reference through the existing `contextBridge`.
- Conversation context is a read projection of existing Customer, Conversation, Message, Customer Address, active Order and available Product records.
- Conversation analysis emits structured candidates with `key`, `value`, `confidence`, `resolution_status`, `source_message_id` and observation time. Extraction is not confirmation. Analysis is limited to inbound customer evidence.
- Identity-specific Customer fields are considered trusted LLM context only when the runtime reports `identityBindingStatus=CONFIRMED`. Legacy-derived identity remains non-canonical and is not exposed as confirmed Customer identity to the LLM.
- Image interpretation uses a local Ollama multimodal-capable model. Audio transcription uses a locally installed Whisper-compatible command. Missing provider capabilities are reported as unavailable/failure instead of fabricated.
- CSV/manual dispatch inputs produce `PREVIEW` objects. Actual effect remains behind the existing human confirmation and BatchDispatch state machine.

## Security invariants

- Baileys and auth state remain in Gateway.
- LLM context excludes raw authentication state, credentials, private/signal keys and transport secrets.
- Customer-specific claims use the runtime-provided context.
- When Customer identity binding is not confirmed, name and `phoneNormalized` are omitted from the LLM's trusted Customer context rather than promoted from legacy JID-derived data.
- Product image selection does not grant the Renderer Node.js filesystem access; file selection and copying are performed by Electron main-process IPC.
- Dispatch import never directly sends messages.

## Validation boundary

Repository and local Windows validation now provide L2 evidence for the Change Unit: `pnpm test`, `pnpm qa:gates`, `pnpm lint`, `pnpm typecheck`, and `pnpm build` all passed on `33bace1…`. Real local runtime validation also confirmed Gateway health, Persistence health, Ollama reachability/model availability, WhatsApp `CONNECTED`, Assistant configuration/prompt resolution, and Product CRUD.

Functional Conversation validation produced the identity conflict and analysis false-positive findings recorded above. Auto-reply is currently disabled in the local runtime while those semantic defects are being reconciled. This runtime setting is local state, not a repository contract.

Real audio, real image, real dispatch, and full end-to-end auto-reply after the identity/context correction remain unvalidated.

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
- `17ded4a6ed3edb035394d3fc9266d16257bb65cb` — canonical Assistant renderer payload normalization
- `5afdc520537323ee75a3b690689c43b89ccd2323` — Assistant configuration normalization tests
- `98663c74e5c1526d38b470480d5e83e53c091479` — Assistant/Conversation/Dispatch renderer contract fixes
- `754918ea15d7359988f6e1892e8407e150456f5c` — local product image storage bridge
- `cf51c9e7240abfa9e74af849ebe2330cc4e94053` — product image picker context bridge
- `8fdbef8ba7d306dc9e4d4fbd9caef22d919b9cb8` — product photo selection and Conversation field binding
- `5a6b4fba801fa9683fd7d7cf6834b1bdb40207bd` — persisted Conversation AI authorization and post-send cooldown behavior
- `3222b1ece9783b507c03308053247380ae5b5392` — UI contract regression tests
- `c5a36f6fbb6cccc4d9626e4052f7493dbfeb42b4` — inbound-only conversation analysis and extraction correction
- `d860895936777ae8c87bdfc360d1178a3b297b82` — inbound analysis regression tests
- `894bf3a1269ce4fa1962219067927fea2a423d8d` — unverified Customer identity redaction in LLM context
- `b4b4c0a9a7c0f927c89dbb9f8017a6d12ee3024f` — LLM context identity redaction tests

## Status

BACKEND IMPLEMENTATION ADVANCED / REAL LOCAL RUNTIME VERIFIED FOR CORE SERVICES AND PRODUCT CRUD / CONVERSATION IDENTITY SEMANTICS AND ANALYSIS CORRECTED AT CODE LEVEL / FULL FUNCTIONAL AUTO-REPLY, AUDIO, IMAGE AND DISPATCH VALIDATION REMAINING.
