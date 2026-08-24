# IA-05 — Memory

## Permanent confirmed facts

- **FACT** KassisT is a Windows desktop local-first product for WhatsApp service and sales with a deterministic business core.
- **FACT** The approved baseline is `KassisT_Approved_Technical_Baseline_v1.0.1.md`, SHA `02830152099f58307912ce382c064a3c4075f505`.
- **FACT** The central rule is that the LLM interprets and the Core decides. fileciteturn3file0
- **FACT** The baseline defines independent ConversationLifecycle, ConversationOwnership, AIState, MessageLifecycle and OrderLifecycle state machines. fileciteturn48file0
- **FACT** Conversation lifecycle is `OPEN | CLOSED`; ownership is `AI | HUMAN`; AI state is `ACTIVE | PAUSED | UNAVAILABLE`; message lifecycle is `RECEIVED | QUEUED | PROCESSING | SENT | DELIVERED | READ | FAILED | REJECTED`. fileciteturn37file0
- **FACT** The baseline assigns the AI responsibilities of interpretation, intent identification, extraction, clarification, recommendations from known products, Knowledge Base answers, address collection, human escalation and context summarization. fileciteturn48file0
- **FACT** The AI must not invent prices/products, create real payments, change critical status arbitrarily, persist directly to the database, access private credentials or execute unauthorized system commands. fileciteturn49file0
- **FACT** Structured Knowledge Base context, deterministic tools, structured outputs and Core validation are part of the anti-hallucination architecture. fileciteturn49file0
- **FACT** Ollama is the initial local LLM direction behind the `LLMProvider` abstraction. fileciteturn42file0
- **FACT** `LLMProvider` currently exposes `chat`, `healthCheck`, `discoverModels` and `selectModel`. fileciteturn54file0
- **FACT** Contract registry marks `AI-V1` as `PARTIAL`, with runtime `NOT_IMPLEMENTED` and tests `MISSING`. fileciteturn56file0
- **FACT** The current production code does not contain the assigned conversation runtime or LLM provider runtime; repository reality describes Conversation and LLM as `NOT_STARTED`. fileciteturn55file0
- **FACT** The Electron runtime currently contains only the secure shell/database foundation; no `conversation/**` or `providers/llm/**` implementation exists in the observed tree. fileciteturn51file0
- **FACT** The LLM output is explicitly untrusted and Core validation is mandatory before business actions. fileciteturn42file0
- **FACT** The default model is deliberately not fixed by the baseline; model choice is a benchmark/external decision. fileciteturn42file0
- **FACT** No cloud fallback is the MVP default when the local LLM is unavailable; controlled response or human escalation is required. fileciteturn49file0
