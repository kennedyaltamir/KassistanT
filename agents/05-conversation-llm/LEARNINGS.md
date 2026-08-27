# IA-05 — Learnings

## Audit-derived learnings

1. **FACT** Documentation is not implementation evidence.
2. **FACT** Conversation lifecycle, ownership, AI state and Message lifecycle are intentionally independent.
3. **FACT** `LLMProvider` is a boundary but its current executable typing is insufficient for production runtime.
4. **FACT** `AI-V1` is partial; implementation must start from contract closure and tests.
5. **FACT** Knowledge Base context is operational truth consumed by the LLM, not authored by it.
6. **FACT** Structured output and tool calling do not grant business authority.
7. **FACT** No concrete model may be promoted to a normative default by IA-05.
8. **FACT** Production Conversation depends on persistence, domain and durable event infrastructure owned by other agents.
9. **INFERENCE** Durable inbound persistence must precede transport acknowledgement because WSS ACK represents durable `InboundInbox` persistence.
10. **INFERENCE** Human takeover must remain a state/ownership boundary rather than a prompt instruction.
11. **INFERENCE** Prompt construction should reference explicit, versioned, auditable context sources rather than hidden renderer state.
12. **INFERENCE** AIExecution should carry enough immutable references to reconstruct the execution configuration, but exact physical persistence remains an IA-01 concern.
13. **FACT** Shared executable provider typing is a global/cross-agent contract concern, not a local implementation detail.
14. **FACT** Tool authorization requires an independent deterministic security boundary; model-generated tool calls are untrusted proposals.
15. **PROPOSAL** The safest first runtime slice is deterministic contract tests around a typed provider request/result/error envelope after shared contract approval.
16. **PROPOSAL** Streaming and detailed usage/token reporting can remain deferred unless a product/external requirement makes them mandatory for V1.
