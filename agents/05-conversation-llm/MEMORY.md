# IA-05 — Memory

## Permanent confirmed facts

- **FACT** KassisT is a Windows desktop local-first product with a deterministic business Core.
- **FACT** The approved baseline is `KassisT_Approved_Technical_Baseline_v1.0.1.md`, SHA `02830152099f58307912ce382c064a3c4075f505`.
- **FACT** The central rule is `LLM interprets; Core decides`.
- **FACT** Conversation lifecycle is `OPEN | CLOSED`; ownership is `AI | HUMAN`; AI state is `ACTIVE | PAUSED | UNAVAILABLE`; Message lifecycle is `RECEIVED | QUEUED | PROCESSING | SENT | DELIVERED | READ | FAILED | REJECTED`.
- **FACT** `LLMProvider` currently exposes `chat`, `healthCheck`, `discoverModels` and `selectModel` with incomplete typing.
- **FACT** `AI-V1` is PARTIAL; runtime is NOT_IMPLEMENTED and tests are MISSING.
- **FACT** No production Conversation or LLM runtime exists in the assigned territory.
- **FACT** Ollama is the initial provider direction; concrete model selection remains an external/benchmark decision.
- **FACT** LLM output is untrusted and Core validation is required before business effects.

## Cross-agent facts

- **FACT** IA-01 owns physical persistence representation for `Conversation`, `Message`, `AIProfile`, `AIExecution` and `KnowledgeItem`.
- **FACT** IA-02 owns domain runtime and the shared executable `LLMProvider` foundation.
- **FACT** IA-03 owns durable event, Inbox, Outbox, Job and Audit infrastructure.
- **FACT** IA-04 owns Order Engine and is a tool-domain consumer rather than an IA-05 runtime owner.
- **FACT** Cross-agent audit identified no structural ownership conflict in the current evidence set.

## Proposal state

- **PROPOSAL** DR-001..DR-007 are pending explicit integration approval; none is a decision.
- **PROPOSAL** First implementation slice is deterministic contract tests around the approved typed provider envelope, only after the shared contract is approved.
- **DEFERRED** Streaming and detailed usage/token telemetry are not required for the first contract-test slice unless a product/external requirement makes them necessary.

## Governance state

- **FACT** `CONTRACT-001` and `CONTRACT-002` remain global/open.
- **FACT** `GOV-001` is non-blocking for documentation-only proposal work, but relevant before any proposal is promoted to normative project behavior.

## Operating rule

Documentation in this directory is proposal/readiness evidence, not runtime implementation evidence. `PROPOSAL` never implies `DECISION`.
