# IA-05 — AI-V1 Readiness

Status: **HOLD / BLOCKED_BY_CONTRACT_GAPS**  
Decision package: `AI-V1-DECISION-PACKAGE.md`  
Audit basis: `main` / `c9b79ae5ef90f4161261a93647d21d36773dd8e3` and approved baseline v1.0.1.

## Executive conclusion

`AI-V1` is not implementation-ready. The repository provides the architecture, state vocabulary and a minimal `LLMProvider`, but production implementation still lacks sufficiently typed shared contracts for provider execution, AIExecution, authorization, prompt reproducibility, persistence and reliability.

The closure work in IA-05 is proposal preparation only. No global contract is changed and no runtime is implemented.

## Decision classifications

Each gap is classified exactly once in the decision package as `LOCAL_CLOSABLE`, `CROSS_AGENT`, `GLOBAL_DECISION_REQUIRED`, `EXTERNAL_DECISION_REQUIRED`, `NON_BLOCKING`, `DEFERRED` or `BLOCKED`.

## Readiness matrix

| Area | Status | Closure classification | Blocking |
|---|---|---|---|
| Conversation lifecycle | PARTIAL | CROSS_AGENT | BLOCKING |
| Conversation ownership | EXPLICIT states / PARTIAL transitions | CROSS_AGENT | BLOCKING |
| AI state | EXPLICIT states / PARTIAL transitions | CROSS_AGENT | BLOCKING |
| Message lifecycle | EXPLICIT states / PARTIAL schema | CROSS_AGENT | BLOCKING |
| AIProfile | PARTIAL | CROSS_AGENT | BLOCKING |
| AIExecution | PARTIAL | CROSS_AGENT | BLOCKING |
| LLMProvider | PARTIAL | GLOBAL_DECISION_REQUIRED | BLOCKING |
| Structured output | PARTIAL | GLOBAL_DECISION_REQUIRED | BLOCKING |
| Error model | PARTIAL | CROSS_AGENT | BLOCKING |
| Cancellation | UNKNOWN | CROSS_AGENT | BLOCKING |
| Timeout | PARTIAL | CROSS_AGENT | BLOCKING |
| Retry/idempotency | UNKNOWN | CROSS_AGENT | BLOCKING |
| Tool execution | PARTIAL | CROSS_AGENT | BLOCKING |
| Tool authorization | BLOCKED | GLOBAL_DECISION_REQUIRED | BLOCKING |
| Prompt versioning | PARTIAL | CROSS_AGENT | BLOCKING |
| Model selection | OPEN / EXTERNAL | EXTERNAL_DECISION_REQUIRED | BLOCKING |
| Context assembly | PARTIAL | CROSS_AGENT | BLOCKING |
| Human takeover | PARTIAL | CROSS_AGENT | BLOCKING |
| Persistence | BLOCKED | CROSS_AGENT | BLOCKING |
| Events | PARTIAL / BLOCKED | GLOBAL_DECISION_REQUIRED where global ambiguity applies | BLOCKING |
| Audit | PARTIAL | CROSS_AGENT | NON_BLOCKING for first contract-test slice |
| Observability | PARTIAL | CROSS_AGENT | NON_BLOCKING for first contract-test slice |
| Security | PARTIAL | GLOBAL_DECISION_REQUIRED | BLOCKING for tools |
| Testing | BLOCKED for production runtime | CROSS_AGENT | BLOCKING |

## Confirmed non-negotiable invariants

1. LLM output is untrusted input.
2. Core validation remains authoritative for business effects.
3. Model output cannot directly persist business state.
4. Tool interpretation and tool authorization are separate concerns.
5. Conversation lifecycle, ownership, AI state and Message lifecycle remain independent.
6. Provider-specific behavior stays behind `LLMProvider`.
7. Concrete model selection is not a normative IA-05 decision.
8. `CONTRACT-001`, `CONTRACT-002` and `GOV-001` are not resolved locally.

## Required closure

- Typed provider request/result/error contract.
- AIExecution logical status/result/persistence semantics.
- Tool authorization/execution envelope.
- Prompt identity/version/provenance.
- Conversation transition semantics from IA-02.
- Persistence contracts from IA-01.
- Durable event semantics from IA-03.
- Deterministic contract tests.

See `AI-V1-DECISION-PACKAGE.md`, `AI-V1-GLOBAL-DECISIONS.md` and `AI-V1-FIRST-SLICE.md` for the formal proposal set.

## Implementation freeze

No Conversation Engine, Ollama adapter, Tool Runner, prompt engine, AIExecution runtime, migration, schema change or shared contract modification is authorized by this package.
