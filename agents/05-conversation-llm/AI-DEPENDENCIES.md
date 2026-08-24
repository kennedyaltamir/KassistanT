# IA-05 — AI Dependencies

Status: **CROSS_AGENT / BLOCKED FOR PRODUCTION RUNTIME**.

| Agent | Contract consumed | Contract produced / boundary | Minimum dependency | Classification | Blocking | Decision required | Integration order |
|---|---|---|---|---|---|---|---|
| IA-01 | Conversation, Message, AIProfile, AIExecution, KnowledgeItem persistence | Runtime persistence requests/records | Logical entities and durable mappings sufficient for runtime | CROSS_AGENT | BLOCKING | AIExecution/profile/message persistence alignment | 1 |
| IA-02 | state machines, invariants, errors, deterministic commands | Validated candidate actions/results | Executable domain semantics | CROSS_AGENT | BLOCKING | Conversation transition + error semantics | 2 |
| IA-03 | Inbox/EventBus/Outbox/Job/Audit | Processing/audit events | Durable recovery and traceability | CROSS_AGENT | BLOCKING for production | `CONTRACT-001` + event semantics | 3 |
| IA-04 | order context/commands for authorized tools | Candidate order actions | Typed order command boundary | CROSS_AGENT | NON-BLOCKING for non-tool first slice | DR-003 before tool runtime | 4 |
| IA-06 | device/session identity and security context | Device-scoped execution context where applicable | Authoritative authenticated identity | CROSS_AGENT | PARTIAL | Authorization boundary decision | 5 |
| IA-07 | WSS/Gateway delivery | Transport boundary | Stable message/event envelope | CROSS_AGENT | NON-BLOCKING for local contract tests | Transport integration later | 6 |
| IA-08 | UI projection and human controls | User-visible state/action requests | Projection contract without renderer privilege | CROSS_AGENT | NON-BLOCKING for provider contract tests | takeover/pause projection alignment | 7 |

## Global dependencies

- `CONTRACT-001` — DomainOutbox ownership/scope.
- `CONTRACT-002` — `order.status_changed` semantics.
- `GOV-001` — baseline/document authority history.

These are `GLOBAL_DECISION_REQUIRED`; IA-05 does not encode assumptions.

## External dependency

Ollama is the approved initial local provider direction. Concrete model selection and benchmark evidence are external decisions. A model is not selected by IA-05.
