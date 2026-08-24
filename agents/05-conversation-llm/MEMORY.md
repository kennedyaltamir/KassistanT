# IA-05 — Memory

## Permanent confirmed facts

- **FACT** KassisT is a Windows desktop local-first product with a deterministic business Core.
- **FACT** The approved baseline is `KassisT_Approved_Technical_Baseline_v1.0.1.md`, SHA `02830152099f58307912ce382c064a3c4075f505`.
- **FACT** The central rule is `LLM interprets; Core decides`.
- **FACT** Conversation lifecycle is `OPEN | CLOSED`.
- **FACT** Conversation ownership is `AI | HUMAN`.
- **FACT** AI state is `ACTIVE | PAUSED | UNAVAILABLE`.
- **FACT** Message lifecycle is `RECEIVED | QUEUED | PROCESSING | SENT | DELIVERED | READ | FAILED | REJECTED`.
- **FACT** `LLMProvider` currently exposes `chat`, `healthCheck`, `discoverModels` and `selectModel` with incomplete typing.
- **FACT** `AI-V1` is PARTIAL; runtime is NOT_IMPLEMENTED and tests are MISSING.
- **FACT** No production Conversation or LLM runtime exists in the assigned territory.
- **FACT** Ollama is the initial provider direction, while concrete model selection remains a benchmark/external decision.
- **FACT** LLM output is untrusted and Core validation is required before business effects.
- **FACT** The baseline does not authorize cloud fallback as the default MVP behavior.

## Contract-closure facts

- **FACT** Shared `LLMProvider` typing cannot be closed by IA-05 alone because the executable interface lives in `packages/domain/**`.
- **FACT** AIExecution logical semantics depend on IA-01 persistence and IA-03 audit/event boundaries.
- **FACT** Tool authorization is a deterministic security boundary separate from LLM interpretation.
- **FACT** Prompt reproducibility requires identity/version/provenance semantics and may require cross-agent persistence references.
- **FACT** Conversation transition semantics remain an IA-02 dependency; IA-05 must not invent transitions.
- **FACT** Retry counts, backoff, timeout numeric values, confirmation policy and concrete model selection remain unspecified and must not be invented.
- **FACT** `CONTRACT-001`, `CONTRACT-002` and `GOV-001` remain global governance items unless the integration authority changes them.

## Proposal state

- **PROPOSAL** First implementation slice: deterministic contract tests around a typed LLM request/result/error envelope, only after approval of the shared contract it tests.
- **PROPOSAL** Streaming and usage/token reporting are deferred unless product/external requirements make them mandatory for the first slice.

## Operating rule

Documentation in this directory is readiness/decision evidence, not runtime implementation evidence.
