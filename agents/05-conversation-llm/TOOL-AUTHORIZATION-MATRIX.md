# IA-05 — Tool Authorization Matrix

Status: **BLOCKED / GLOBAL_DECISION_REQUIRED**.

Tool calling is an AI capability, not authorization to perform business effects.

## Minimal logical boundary

`LLM interpretation → deterministic authorization → owning subsystem execution → result validation → audit`

| Dimension | V1 status | Closure requirement | Classification |
|---|---|---|---|
| `tool_id` | REQUIRED | Stable tool identity/version | GLOBAL_DECISION_REQUIRED |
| caller | REQUIRED logically | Identify the runtime requesting execution | GLOBAL_DECISION_REQUIRED |
| conversation scope | REQUIRED logically | Enforce conversation/store isolation | CROSS_AGENT |
| actor identity | REQUIRED logically | Use authoritative actor/session identity where applicable | CROSS_AGENT |
| capability | REQUIRED logically | Explicit capability declaration | GLOBAL_DECISION_REQUIRED |
| authorization decision | REQUIRED | Deterministic allow/deny result independent from LLM | GLOBAL_DECISION_REQUIRED |
| arguments | REQUIRED | Treat as untrusted input | LOCAL_CLOSABLE as validation rule; normative envelope still global |
| argument schema | REQUIRED | Typed validation before execution | GLOBAL_DECISION_REQUIRED |
| confirmation | UNKNOWN | Only define after global/product policy establishes which operations require it | DEFERRED |
| device/session scope | PARTIAL | Consume IA-06 identity when required | CROSS_AGENT |
| timeout | UNKNOWN | Owning subsystem must define execution limit | DEFERRED until owner contract |
| retry | UNKNOWN | Never retry without idempotency semantics | DEFERRED until owner contract |
| audit | REQUIRED logically | Attribute proposal, authorization and result | CROSS_AGENT |
| result validation | REQUIRED | Tool output is untrusted input to Core | CROSS_AGENT |
| failure | REQUIRED logically | Typed auth vs execution failure | GLOBAL_DECISION_REQUIRED |

## Authorization rule

The model may propose a tool call. It must never be able to make an authorization decision.

IA-05 may validate shape and provenance of a proposal, but it cannot authorize payment, pricing, stock, order lifecycle, device operations or other critical business effects.

No role, permission value, timeout, confirmation requirement, sandbox policy or endpoint is invented here.
