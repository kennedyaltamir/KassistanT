# IA-05 — Learnings

## Audit-derived learnings

1. **FACT** The repository deliberately distinguishes documentation from implementation; contract presence is not runtime evidence.
2. **FACT** The conversation state model is intentionally decomposed into independent state machines. This prevents ownership, AI availability and message delivery from being conflated.
3. **FACT** `LLMProvider` is already a domain-facing abstraction, so the Ollama implementation belongs behind that boundary rather than spreading provider-specific API calls through conversation code.
4. **FACT** `AI-V1` remains partial. Its runtime and tests are absent, so future implementation starts from contract reconstruction and tests, not from an assumed finished API.
5. **FACT** Knowledge Base data is authoritative operational context; the LLM is a consumer/interpreter of that context, not its source of truth.
6. **FACT** Structured output and tool calling are capabilities, not permission to bypass deterministic Core validation.
7. **FACT** The baseline intentionally avoids fixing a default model. Model selection therefore remains a benchmark/external decision and must not be hard-coded as a normative architecture decision by IA-05.
8. **FACT** Conversation runtime depends on persistence, domain semantics and durable event delivery even though those areas belong to other agents.
9. **INFERENCE** Correct Conversation Engine sequencing must respect durable inbound persistence before acknowledging transport events, because WSS ACK semantics are defined around durable local persistence.
10. **INFERENCE** Human takeover must be represented as a first-class ownership/state boundary rather than a prompt instruction, because the domain explicitly models `ConversationOwnership` and `AIState` independently.
11. **INFERENCE** Prompt construction should remain deterministic with respect to approved context sources; arbitrary renderer state or provider responses must not become hidden business authority.
