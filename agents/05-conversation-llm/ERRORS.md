# IA-05 — Errors and Risks

## E05-001 — Conversation runtime absent
Status: NOT_IMPLEMENTED. No executable `apps/desktop/electron/conversation/**` runtime was observed.

## E05-002 — LLM runtime absent
Status: NOT_IMPLEMENTED. No executable `apps/desktop/electron/providers/llm/**` adapter was observed.

## E05-003 — AI-V1 incomplete
Status: PARTIAL. The registry marks AI-V1 PARTIAL / NOT_IMPLEMENTED / tests missing.

## E05-004 — Shared LLMProvider typing incomplete
Status: BLOCKED / GLOBAL_DECISION_REQUIRED. The existing executable interface uses `unknown` request/result types and lives outside IA-05 documentation ownership.

## E05-005 — AIExecution contract incomplete
Status: BLOCKED / CROSS_AGENT. Logical execution semantics require IA-01 persistence and IA-03 audit/event alignment.

## E05-006 — Tool authorization incomplete
Status: BLOCKED / GLOBAL_DECISION_REQUIRED. Optional tool calling is documented, but authorization, scope, confirmation and execution envelopes are not fully specified.

## E05-007 — Prompt/version contract incomplete
Status: BLOCKED / CROSS_AGENT. Reproducible prompt identity/version/provenance is not yet aligned with execution persistence.

## E05-008 — Model selection unresolved
Status: OPEN / EXTERNAL_DECISION_REQUIRED. The baseline intentionally does not define a concrete default model.

## E05-009 — Conversation transition semantics incomplete
Status: BLOCKED / CROSS_AGENT. IA-05 must consume executable IA-02 transition rules rather than inventing them.

## E05-010 — Persistence dependency
Status: BLOCKED / CROSS_AGENT. Conversation/Message/AIProfile/AIExecution/KnowledgeItem persistence depends on IA-01.

## E05-011 — Domain/event dependency
Status: BLOCKED / CROSS_AGENT. Domain semantics depend on IA-02 and durable event infrastructure on IA-03.

## E05-012 — Global contract ambiguities
Status: BLOCKED / GLOBAL_DECISION_REQUIRED. `CONTRACT-001`, `CONTRACT-002` and `GOV-001` remain governance matters.

## E05-013 — Reliability semantics incomplete
Status: BLOCKED / CROSS_AGENT. Retry/idempotency, timeout and cancellation outcomes require a stable AIExecution and event boundary.

## Security risks

- Treat model output and tool arguments as untrusted.
- Never expose secrets to prompts, Renderer or model output.
- Never let provider output bypass Core authorization or validation.
- Apply data minimization to AI logs, prompts, tool results and telemetry.
- Provider unavailability must be explicit; the system must not claim successful AI operation without evidence.
