# IA-05 — AI Execution Contract

Status: **PROPOSAL / NOT YET NORMATIVE**.

This document defines the logical closure target. It does not define physical database columns or approve shared contracts.

## Logical execution pipeline

`Input → Context Assembly → Prompt Construction → Provider Selection → Model Selection → LLM Execution → Result Validation → Tool Authorization → Tool Execution → Persistence → Event/Audit → User-visible projection`

| Stage | Owner | Input | Output | Error domain | Retry | Timeout | Cancellation | Persistence | Audit/Observability | Status |
|---|---|---|---|---|---|---|---|---|---|---|
| Input | IA-05/Conversation | validated message reference | execution request | validation/context | no | bounded by caller | before provider call | conversation state | correlation | CROSS_AGENT |
| Context Assembly | IA-05 + source owners | authoritative sources | ordered context references | context unavailable/invalid | depends on source | bounded | cancellable | reference/config only | provenance | CROSS_AGENT |
| Prompt Construction | IA-05 | approved prompt + context refs | prompt configuration reference | prompt invalid | no | bounded | cancellable | version reference | provenance | CROSS_AGENT |
| Provider Selection | configuration | profile/provider policy | provider identity | unavailable/invalid | no | bounded | cancellable | logical identity | config trace | CROSS_AGENT |
| Model Selection | policy/external decision | provider capabilities + profile | model identity | unavailable/mismatch | no automatic policy invented | bounded | cancellable | selected identity | config trace | EXTERNAL_DECISION_REQUIRED |
| LLM Execution | LLMProvider | typed request | typed result/error | provider/model/timeout/cancel | policy pending | required | required | AIExecution outcome | latency/status | GLOBAL_DECISION_REQUIRED |
| Result Validation | IA-05 | provider result | validated result or rejection | structured validation | no | bounded | cancellable | result outcome | validation evidence | CROSS_AGENT |
| Tool Authorization | Core/security boundary | untrusted tool proposal + context | allow/deny decision | authorization error | no | policy pending | policy pending | audit outcome | security audit | GLOBAL_DECISION_REQUIRED |
| Tool Execution | owning subsystem | authorized request | tool result | execution error | owner-specific | owner-specific | owner-specific | owner-specific | owner audit | CROSS_AGENT |
| Persistence | IA-01 | approved execution outcome | durable record | persistence failure | infrastructure policy | DB policy | DB policy | required | audit reference | CROSS_AGENT |
| Event/Audit | IA-03 | durable state/effect | event/audit evidence | event persistence failure | IA-03 policy | IA-03 policy | IA-03 policy | required | required | CROSS_AGENT |
| User-visible projection | IA-08 + transport | validated result/state | projection | projection failure | UI policy | UI policy | UI policy | not authoritative | traceable | NON_BLOCKING |

## AIExecution logical contract

| Item | V1 classification | Rationale |
|---|---|---|
| execution request | REQUIRED | Needed to identify what was asked of provider |
| context reference | REQUIRED | Reproducibility without duplicating arbitrary context into every boundary |
| provider identity | REQUIRED | Evidence of execution boundary |
| model identity | REQUIRED | Evidence of concrete model actually used |
| prompt version/reference | REQUIRED | Reproducibility/audit |
| execution status | REQUIRED | Deterministic lifecycle outcome |
| validated result | REQUIRED | Prevent raw provider output from becoming authority |
| error | REQUIRED for failed execution | Stable failure classification |
| usage | DEFERRED | Not required for first deterministic slice |
| started/completed timestamps | REQUIRED logically | Operational evidence |
| cancellation outcome | REQUIRED | Distinguish cancellation from provider failure |
| timeout outcome | REQUIRED | Distinguish timeout from generic failure |
| retry/attempt metadata | REQUIRED logically, exact policy deferred | Recovery/idempotency evidence |
| correlation/causation | REQUIRED | Cross-boundary traceability |
| audit reference | REQUIRED logically | Evidence chain |
| persistence outcome | REQUIRED for production | Cannot claim durable execution without it |

No item above authorizes a physical schema field name. IA-01 owns physical persistence.
