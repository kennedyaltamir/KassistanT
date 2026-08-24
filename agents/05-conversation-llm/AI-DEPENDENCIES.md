# IA-05 — AI Dependencies

Status: **CROSS_AGENT / BLOCKED_FOR_PRODUCTION_RUNTIME / DOCUMENTATION_ONLY**

| Agent | Contract consumed | Boundary produced | Minimum dependency | Classification | Blocking | Decision required | Integration order |
|---|---|---|---|---|---|---|---|
| IA-01 | Conversation, Message, AIProfile, AIExecution, KnowledgeItem persistence | Logical persistence requirements | Approved logical contract + canonical physical representation | CROSS_AGENT | BLOCKING for runtime | DR-002 and persistence alignment | 1 |
| IA-02 | State machines, invariants, errors, deterministic commands | Validated candidate actions/results | Authoritative domain semantics | CROSS_AGENT | BLOCKING for Conversation runtime | DR-001, DR-006 and error semantics | 2 |
| IA-03 | Inbox/EventBus/Outbox/Job/Audit | Processing/audit evidence | Durable recovery and traceability | CROSS_AGENT | BLOCKING for production integration | DR-002/007; CONTRACT-001 as applicable | 3 |
| IA-04 | Order commands/context only when an authorized tool targets orders | Candidate order action proposal | Approved order-command boundary | CROSS_AGENT | NON_BLOCKING for first provider contract-test slice | DR-003 before tool runtime | 4 |
| IA-06 | Device/session identity where authorization requires it | Security context | Authoritative identity/session semantics | CROSS_AGENT | NON_BLOCKING for first provider contract-test slice | DR-003 where applicable | 5 |
| IA-07 | WSS/Gateway delivery semantics | Transport boundary | Stable transport/event envelope | CROSS_AGENT | NON_BLOCKING for first provider contract-test slice | Integration later | 6 |
| IA-08 | Projection and human controls | User-visible actions/projections | Domain-owned state semantics + non-privileged UI boundary | CROSS_AGENT | NON_BLOCKING for first provider contract-test slice | DR-006 later | 7 |

## Cross-agent validation result

**FACT:** No ownership conflict was identified in the current IA-01/02/03/04 audits. IA-05 remains a consumer of their approved contracts and does not absorb their runtime ownership.

## Global items

- `CONTRACT-001`: **GLOBAL / OPEN / BLOCKING only where durable event semantics are required**.
- `CONTRACT-002`: **GLOBAL / OPEN / relevant to order-event consumers**.
- `GOV-001`: **NON_BLOCKING for documentation-only proposal work; RELEVANT before any proposal becomes normative**.

GOV-001 must not be used to freeze proposal documentation that does not assert normative authority.

## External dependency

Ollama is the approved initial local provider direction. Concrete model selection and benchmark evidence remain **EXTERNAL_DECISION_REQUIRED**. IA-05 does not choose a concrete model.
