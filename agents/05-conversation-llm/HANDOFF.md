# IA-05 — Handoff

## Territory

IA-05 owns:

- `apps/desktop/electron/conversation/**`
- `apps/desktop/electron/providers/llm/**`

## Current evidence snapshot

- KassisT baseline is approved at v1.0.1.
- Conversation lifecycle/state model is documented but runtime is not implemented.
- LLM provider contract is partial.
- `packages/domain/src/llm-provider.ts` currently exposes only `chat`, `healthCheck`, `discoverModels` and `selectModel`.
- Ollama is the initial local provider direction.
- No production LLM adapter or Conversation Engine exists in the observed runtime tree.
- `AI-V1` is `PARTIAL / NOT_IMPLEMENTED / tests missing`.

## Dependencies

- IA-01: canonical persistence schema for Conversation, Message, AIProfile and AIExecution.
- IA-02: authoritative domain types, commands/queries, invariants, state semantics and errors.
- IA-03: durable event, Inbox, Outbox, Job and Audit boundaries.
- IA-04: deterministic order commands/semantics consumed by conversation tooling.
- IA-06: authenticated device/session context where required.
- IA-07: Gateway/WSS delivery semantics.
- IA-08: Renderer/UI projections for takeover/pause/resume without provider privilege.

## Critical invariants

1. Model output is untrusted.
2. Model output cannot directly persist business state.
3. Tool invocation cannot bypass Core authorization/validation.
4. Human takeover is a state transition, not a prompt-only convention.
5. Conversation, ownership, AI and message state machines remain distinct.
6. Provider-specific behavior remains behind `LLMProvider`.
7. Local LLM unavailability must be explicit; the system must not pretend AI is operational.
8. Unresolved global contracts are escalated rather than encoded locally.

## External dependencies

- Windows host with local Ollama installation.
- Availability of a selected local model/capability.
- Future benchmark decision for normative model selection.

No external configuration was executed during this phase.

## Continuation rule

A future IA-05 instance should re-read the protected sources and this directory before changing ownership, contracts or runtime behavior. Normative project decisions remain in approved global sources.
