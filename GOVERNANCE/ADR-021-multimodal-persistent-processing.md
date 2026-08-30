# ADR-021 — Persistência multimodal e capability gating

## Status
Accepted for the current development branch, pending reconciliation with the approved baseline.

## Context
The existing WhatsApp gateway performed media analysis before durable message persistence and used a generic Ollama `/api/chat` call for images without proving that the selected model advertised vision capability. The approved technical baseline lists end-to-end multimodal handling as Post-MVP, while the current implementation task explicitly requires durable image/audio processing.

## Decision
1. Persist every inbound WhatsApp message before any media download or AI processing.
2. Persist downloaded media separately with MIME type, byte size, SHA-256, storage reference and download status.
3. Persist multimodal extraction separately with modality, status, provider, model, confidence, provenance and error information.
4. Discover Ollama model capabilities through `/api/show` before vision processing; a model without `vision` is never sent an image.
5. Build the LLM context from persisted state and encode the runtime system prompt/context as XML with explicit trust boundaries. Customer-originated data remains DATA and cannot redefine instructions.
6. Persist conversationally extracted customer facts as candidates unless the runtime has evidence that they were explicitly confirmed.
7. Keep generic source links so future forms, landing pages, campaigns, CRM imports and human interactions can attach to the same customer without WhatsApp-specific schema assumptions.
8. Keep structured LLM decisions separate from commercial effects. This branch does not fabricate a payment processor, freight policy, or order tool contract when the repository does not provide one.

## Consequences
Positive: media survives processing failures, reprocessing is possible, vision capability mismatches become explicit, context is auditable, and customer facts retain provenance.

Trade-off: the current desktop runtime exposes a small localhost persistence-extension service on port 3212 alongside the legacy persistence service. This is an implementation bridge, not a final topology preference; consolidation into the canonical persistence service requires a compatible refactor of `runtime.cjs`.

## Rejected alternatives
- Sending every image directly to the selected model: rejected because model capability cannot be inferred safely.
- Persisting only the generated text: rejected because raw media and provenance are operational evidence.
- Letting the LLM calculate or assert price, stock, freight, payment or order completion: rejected by business invariants.
- Treating push-name or unverified LLM output as confirmed customer identity: rejected.

## Validation contract
The implementation must be considered valid only when the branch CI validates lint, typecheck, tests and build, and a real runtime test with a configured Ollama vision model confirms the complete message/media/extraction/context chain.
