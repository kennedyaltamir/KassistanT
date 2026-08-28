# KassisT — Knowledge: Assistant and Conversation Automation Implementation Boundary

## Context

A Change Unit is being executed on `MVP2-implementandoQRCODE` to evolve the real atendimento flow: structured assistant settings, persisted products, conversation context, conversation analysis, local LLM execution, multimodal adapters and controlled dispatch.

## Discovery

The repository already contains real operational building blocks:

- local Ollama provider in `gateway/src/llm.mjs`;
- WhatsApp Gateway ownership and durable message persistence;
- SQLite entities for `store`, `customer`, `conversation`, `message`, `product`, orders and inbox/outbox;
- a confirmation-gated batch dispatch runtime;
- `AIExecutionService` and LLM provider contracts.

## Decision

The new implementation reuses these authorities. It does not create a second message store or move WhatsApp transport to Renderer.

The proposed `Identity/Customer/Conversation/Memory/Context` document remains marked proposed. The current Change Unit implements only a bounded context projection over the existing schema and retains the known JID-derived identity gap explicitly.

## Security invariant

The LLM receives only sanitized semantic context. Baileys auth state, credentials, signal/private keys, authentication tokens, raw WhatsApp events, database credentials and other transport secrets remain outside the LLM context.

## Extraction invariant

Conversation analysis produces candidates with provenance and confidence. A candidate does not automatically become a confirmed Customer fact and cannot silently overwrite a confirmed value.

## Validation boundary

Static inspection, automated tests and local runtime validation are separate evidence classes. A configured adapter is not treated as a real integration PASS until its real local provider is executed successfully.

## Related files

- `REGRAS/README.md`
- `REGRAS/behaviour.md`
- `REGRAS/conversation-identity-memory-llm-context.md`
- `gateway/src/llm.mjs`
- `gateway/src/auto-reply.mjs`
- `gateway/src/http.mjs`
- `gateway/src/whatsapp.mjs`
- `apps/desktop/electron/database/runtime.cjs`
- `apps/desktop/electron/conversation/ai-execution.ts`

## Status

IMPLEMENTATION IN PROGRESS. No functional PASS is claimed until local validation provides evidence.
