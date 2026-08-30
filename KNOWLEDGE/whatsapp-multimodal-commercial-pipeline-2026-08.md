# KassisT — WhatsApp multimodal/commercial pipeline knowledge

## Snapshot
Target branch: `MVP2-implementandoQRCODE`
Initial remote SHA: `b1e814220427177405d0610b74917b03daf9fb51`
Implementation commits in this round: see branch history; final SHA must be recorded after stabilization.

## Original image failure
The repository's previous image path downloaded a WhatsApp image into memory and called Ollama `/api/chat` using `KASSIST_LLM_VISION_MODEL || KASSIST_LLM_MODEL` without first inspecting the model's advertised capabilities. Media lived only in a temporary directory used by the multimodal helper and was deleted after processing. The message was also persisted only after the media enrichment step. Consequently, a text-only model could receive an image request, while a media failure could delay durable persistence and there was no dedicated media/extraction evidence to reprocess later.

Ollama's current API exposes model capabilities through `/api/show`; `vision` is an explicit advertised capability. Its `/api/chat` endpoint accepts `images` and supports structured `format` schemas. These facts are used as runtime requirements, not inferred from model names.

## Current pipeline
`Baileys messages.upsert`
→ `snapshotMessage`
→ durable `message` row through legacy persistence endpoint
→ `message_processing(MEDIA_DOWNLOAD=PROCESSING)`
→ WhatsApp media download
→ `media_asset` persisted with MIME/size/SHA-256/storage reference
→ capability probe (`/api/show`) for image models
→ vision/transcription processing
→ `multimodal_extraction` persisted
→ extended conversation context from SQLite
→ candidate customer facts with provenance
→ deterministic XML system/context envelope
→ structured LLM decision
→ response validation and safe outbound text
→ existing WhatsApp outbound persistence.

## Persistence additions
`0006_multimodal_provenance.sql` and the persistence extension service add:
- `media_asset`
- `multimodal_extraction`
- `customer_fact`
- `customer_source_link`
- `message_processing`

All tables use foreign keys to the canonical `message`, `customer`, `conversation`, and `store` records. Media is content-addressed by SHA-256 in the storage layer.

## Capability registry semantics
The gateway derives a capability record from the actual Ollama `/api/show` response:
`provider`, `model`, `available`, `status`, `text`, `vision`, `audio`, `embeddings`, `capabilities`, `lastCheckedAt`, `error`.

A vision request is rejected as `VISION_UNSUPPORTED` when `vision` is not advertised. A missing model is represented as `MODEL_UNAVAILABLE`. The gateway never sends an image to a textual model merely because it is selected as the default.

## Audio
The raw audio is persisted before transcription. Whisper remains an external local runtime and can return `COMPLETED`, `UNAVAILABLE`, `FAILED`, or `TIMEOUT`. The transcription result is tied to the original message through `media_asset` and `multimodal_extraction`.

## Customer memory and provenance
Text extraction uses the existing deterministic conversation-analysis module. Extracted values are stored as `CANDIDATE` facts, never as confirmed identity. A conflicting value against an existing confirmed fact is stored as `CONFLICTED`. Generic `customer_source_link` provides `source_type + source_id + customer_id` without coupling the model to WhatsApp.

## XML context and prompt injection boundary
The LLM context is assembled from persisted runtime state. The outer system message is XML. Business rules and runtime state are marked trusted; customer messages and other customer-originated content are marked untrusted DATA. XML escaping prevents payloads from closing system tags. Customer input is never treated as an instruction source.

## Structured LLM decision
The gateway requests a deterministic JSON schema with:
`intent`, `response_text`, `customer_updates`, `cart_updates`, `product_requests`, `delivery_request`, `order_action`, `payment_action`, `human_handoff_required`, `confidence`.

The runtime validates these fields. This round deliberately does not execute order/payment side effects from these fields because no compatible gateway-to-domain tool contract was found in the audited branch.

## Commerce boundary
The canonical database already contains `product`, `customer`, `conversation`, `customer_address`, `payment_method`, `order`, and `order_item`, including stock quantity in migration 0005. However, the audited branch does not expose a complete domain application service/tool contract that authorizes the LLM to perform cart/order/payment effects. The technical baseline also specifies payment as a registered method in MVP rather than an external payment processor.

Therefore this round implements the safe decision boundary and preserves real product/stock/order data for context, but does not claim end-to-end autonomous payment processing. This is a contract limitation, not a model limitation.

## Recovery
Media and extraction records survive multimodal failures. A future worker can re-read `media_asset.storage_reference` and re-run the appropriate processing stage after a compatible model/runtime becomes available.

## Observability
The gateway emits identifiable operational events for message persistence, media download, audio transcription, image analysis, LLM request completion/failure, and requested order/payment/handoff decisions, carrying correlation/message identifiers.

## Known risks
1. The desktop currently runs the legacy persistence HTTP service plus a localhost-only persistence extension on port 3212. Consolidation is preferable before wider production exposure.
2. The legacy customer creation path may still copy WhatsApp `push_name` into the canonical customer `name`; the LLM context sanitizes that field unless identity is confirmed, but the persistence-side semantics should be hardened in a later contract-safe migration.
3. Local CI validates syntax/type/tests/build, but this environment does not have a local checkout with pnpm dependencies, so the exact PowerShell commands could not be executed from this session.
4. A real multimodal E2E with an installed compatible Ollama vision model and Whisper runtime remains an environment-validation requirement; repository tests use deterministic mocks for provider behavior.
