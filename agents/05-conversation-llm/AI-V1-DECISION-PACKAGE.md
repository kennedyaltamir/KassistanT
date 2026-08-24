# IA-05 — AI-V1 Decision Package

Status: **PROPOSAL PACKAGE / HOLD / NOT_YET_NORMATIVE**

This package prepares decisions for the integration authority. It contains no new `DECISION`. `RecommendedOption` means recommendation only. Detailed approval fields for DR-001..DR-007 are in `AI-V1-APPROVAL-REQUEST.md`.

## Truth model

- `FACT`: directly evidenced by repository or approved source.
- `INFERENCE`: consequence derived from facts; not normative.
- `PROPOSAL`: recommended closure candidate awaiting explicit approval.
- `DECISION`: approved by an authoritative source. IA-05 has introduced none in this phase.

## Current state

`AI-V1` remains `PARTIAL / NOT_IMPLEMENTED / tests missing`. The current `LLMProvider` still uses `unknown` for chat input/output. No Conversation runtime, Ollama runtime, Tool Runtime or AIExecution runtime is implemented.

## Closure layers

### MINIMUM_IMPLEMENTATION_ENABLING_CONTRACT

**PROPOSAL / PENDING_APPROVAL**

1. Typed provider request/result/error envelope.
2. Logical AIExecution outcome semantics.
3. Logical tool authorization boundary independent from LLM interpretation.
4. Prompt identity/version/provenance references.
5. Conversation/message semantics consumed from IA-02/IA-01, without local state-machine duplication.
6. Logical timeout/cancellation/retryability/idempotency outcomes.
7. Deterministic contract-test fixtures.

### REQUIRED_FOR_PRODUCTION_RUNTIME

**PROPOSAL / BLOCKED**

- Approved shared executable contracts.
- IA-01 persistence representation and recovery semantics.
- IA-02 authoritative domain transitions/errors.
- IA-03 durable event/inbox/outbox/job/audit infrastructure.
- Approved authorization boundary for tools.
- External model-selection decision and environment evidence.
- Integrated negative tests proving model output cannot bypass Core authority.

### DEFERRED

**NON-BLOCKING / NOT_REQUIRED_FOR_FIRST_CONTRACT-TEST_SLICE**

- Streaming semantics, unless a normative product requirement requires them.
- Detailed token/usage telemetry, unless required by product/operations.
- Concrete tool confirmation policy until the global authorization policy exists.

### EXTERNAL_DECISION

- Concrete model selection and benchmark evidence.
- Runtime availability of the selected local provider/model.

## Gap classifications

Each gap has one primary classification: `LOCAL_CLOSABLE`, `CROSS_AGENT`, `GLOBAL_DECISION_REQUIRED`, `EXTERNAL_DECISION_REQUIRED`, `NON_BLOCKING`, `DEFERRED` or `BLOCKED`.

| Gap | Current State | Classification | Blocking | Authority |
|---|---|---|---|---|
| LLMProvider typing | PARTIAL | GLOBAL_DECISION_REQUIRED | BLOCKING | Integration + IA-02 |
| AIExecution logical contract | PARTIAL | CROSS_AGENT | BLOCKING | Integration + IA-01/02/03 |
| Tool authorization | BLOCKED | GLOBAL_DECISION_REQUIRED | BLOCKING | Integration/security |
| Prompt versioning | PARTIAL | CROSS_AGENT | BLOCKING for runtime | Integration + IA-01/05 |
| Model selection | OPEN | EXTERNAL_DECISION_REQUIRED | BLOCKING for provider runtime | External owner + integration |
| Conversation transitions | PARTIAL | CROSS_AGENT | BLOCKING | IA-02 + integration |
| Retry/timeout/cancellation | PARTIAL/UNKNOWN | CROSS_AGENT | BLOCKING for production | IA-03 + integration |
| Audit/observability | PARTIAL | NON_BLOCKING for first contract-test slice | NON_BLOCKING initially | IA-03/08 |
| GOV-001 | OPEN | NON_BLOCKING locally / RELEVANT before normative approval | NON_BLOCKING for docs | Integration authority |

## Safety boundary

The logical pipeline remains:

`LLM interpretation → candidate action → deterministic authorization → owning execution → result validation → persistence/audit`

The LLM is never an authorization authority. IA-05 does not grant permissions, choose roles, choose model defaults, define numeric retry/timeout policy, or define physical persistence.

## First slice

`AI-V1-FIRST-SLICE.md` proposes deterministic contract tests around the typed provider envelope **after explicit approval of the shared contract**. This remains a proposal and is not implemented.

## Global ambiguities

- `CONTRACT-001`: GLOBAL / OPEN.
- `CONTRACT-002`: GLOBAL / OPEN.
- `GOV-001`: NON-BLOCKING for proposal documentation, but RELEVANT before any proposal is promoted to normative behavior.
