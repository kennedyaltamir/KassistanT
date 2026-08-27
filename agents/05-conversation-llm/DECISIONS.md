# IA-05 — Decisions

## Approved decisions

| Source | Decision |
|---|---|
| ADR-003 | Ollama is the initial local LLM layer. |
| ADR-004 | Business rules remain separated from the LLM. |
| Baseline §9 | Conversation, ownership, AI and message state machines are independent. |
| Baseline §10 | LLM interprets; Core decides; critical business authority stays deterministic. |
| Baseline §11 | Structured Knowledge Base is operational truth. |
| Baseline §12 | `LLMProvider` isolates provider-specific behavior. |
| Baseline §12 | No automatic cloud fallback is the MVP default. |
| ADR-020 | Architectural changes require ADR + versioning. |

## Contract-closure conclusions

- `AI-V1` is PARTIAL and cannot yet support production runtime implementation.
- The existing `LLMProvider` is a partial interface, not a complete executable contract.
- AIExecution requires cross-agent logical closure with IA-01/IA-03.
- Tool authorization is a separate deterministic security boundary.
- Prompt/version semantics require reproducibility/provenance and cross-agent alignment.
- Conversation transition semantics must come from IA-02, not be inferred by IA-05.
- Model selection remains OPEN/EXTERNAL; no concrete model is a normative default.

## Decision requests — proposals only

See `AI-V1-GLOBAL-DECISIONS.md` for:

- DR-001 typed LLMProvider contract;
- DR-002 AIExecution logical result/outcome model;
- DR-003 tool authorization boundary;
- DR-004 prompt identity/versioning;
- DR-005 model selection authority;
- DR-006 conversation ownership/handoff semantics;
- DR-007 retry/cancellation/timeout semantics;
- DR-008 global contract ambiguities.

`Recommended Option` in that document is **PROPOSAL**, never `DECISION`.

## Global decisions IA-05 must not make

`CONTRACT-001`, `CONTRACT-002`, `GOV-001` and any shared contract change outside `agents/05-conversation-llm/**`.
