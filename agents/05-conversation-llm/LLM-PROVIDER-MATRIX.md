# IA-05 — LLM Provider Matrix

Status: **PARTIAL / GLOBAL_DECISION_REQUIRED**.

## Current executable contract — FACT / EXPLICIT

`packages/domain/src/llm-provider.ts` currently exposes exactly:

- `chat(input: unknown): Promise<unknown>`
- `healthCheck(): Promise<{ available: boolean }>`
- `discoverModels(): Promise<readonly string[]>`
- `selectModel(model: string): Promise<void>`

IA-05 did not modify this contract.

## Closure matrix

| Operation / Dimension | Input | Output | Async | Streaming | Cancellation | Timeout | Errors | Usage | Model Identity | Capability Metadata | Status | Classification |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `chat` | `unknown` | `unknown` | YES | UNKNOWN | UNKNOWN | PARTIAL | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | BLOCKED | GLOBAL_DECISION_REQUIRED |
| `healthCheck` | none | `{ available: boolean }` | YES | N/A | UNKNOWN | UNKNOWN | UNKNOWN | N/A | UNKNOWN | UNKNOWN | PARTIAL | CROSS_AGENT |
| `discoverModels` | none | `string[]` | YES | N/A | UNKNOWN | UNKNOWN | UNKNOWN | N/A | PARTIAL | PARTIAL | PARTIAL | CROSS_AGENT |
| `selectModel` | `string` | `void` | YES | N/A | UNKNOWN | UNKNOWN | UNKNOWN | N/A | PARTIAL | UNKNOWN | OPEN | EXTERNAL_DECISION_REQUIRED |
| Structured output | not typed | not typed | YES | UNKNOWN | UNKNOWN | PARTIAL | UNKNOWN | UNKNOWN | REQUIRED logically | REQUIRED logically | PARTIAL | GLOBAL_DECISION_REQUIRED |
| Tool calls | not typed | not typed | YES | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | REQUIRED logically | REQUIRED logically | PARTIAL | GLOBAL_DECISION_REQUIRED |

## Minimal contract for first runtime slice

The minimum proposed shared contract is a typed request/result/error envelope sufficient to express:

- conversation/message input reference;
- model/provider identity;
- requested output mode;
- optional structured-output schema reference;
- optional tool proposals as untrusted data;
- successful text or structured result;
- provider/model unavailable;
- provider failure;
- timeout;
- cancellation;
- capability mismatch;
- correlation/causation references where required by the execution boundary.

This is a **PROPOSAL**, not a DECISION. Exact physical TypeScript names remain subject to approval.

## Deferred / non-blocking dimensions

### Streaming
`UNKNOWN / DEFERRED`. No normative executable streaming contract was found. It should not block the first deterministic contract-test slice unless product requirements make streaming mandatory.

### Usage/tokens
`UNKNOWN / DEFERRED`. Token/usage accounting should not be invented as a normative field until product or operational requirements establish it.

## Model selection rule

Ollama is the approved initial provider direction. No concrete model is selected here. The model-selection authority must be resolved externally, and the runtime must record the selected model identity rather than hard-code one as architecture.
