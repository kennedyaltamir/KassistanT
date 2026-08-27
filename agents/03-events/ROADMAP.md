# IA-03 — Roadmap

## Scope

Este roadmap é subordinado ao roadmap global do KassisT. Ele descreve somente o território de Event Infrastructure e não cria novas fases globais nem redefine contratos.

## Current state

| Area | State | Evidence / boundary |
|---|---|---|
| EventBus | IMPLEMENTED / HANDOFF COMPLETE | V1 runtime implemented; post-audit matched EBUS-DEC-001..008; downstream integration deferred. |
| InboundInbox | BLOCKED | Durable intake/ACK contract defined; canonical schema/persistence from IA-01 absent. |
| DomainOutbox | BLOCKED | Ownership/scope unresolved under `CONTRACT-001`. |
| JobQueue | BLOCKED | `Job` persistence absent and exact retry/lease policies incomplete. |
| AuditLog | BLOCKED | Audit contract exists; canonical persistence and sensitive-data policy are incomplete. |
| Idempotency / deduplication | PARTIAL | EventBus does not own durable deduplication; Inbox uniqueness remains future work. |
| Retry | PLANNED | Durable retry remains a JobQueue concern. |
| Backoff | PARTIAL | WSS reconnect policy exists; JobQueue policy remains incomplete. |
| Replay | PLANNED | WSS resume/replay contracted; local runtime absent. |
| Reconciliation | PLANNED | Required, but algorithm/state model incomplete. |
| Dead-letter | PLANNED | Concept identified; policy/runtime absent. |
| Causation | PARTIAL | EventBus preserves supplied event object metadata without expanding the protected envelope. |
| Correlation | PARTIAL | EventBus preserves supplied event object metadata without expanding the protected envelope. |
| Observability | PARTIAL | EventBus failure reporting exists; broader telemetry schema remains undefined. |
| Failure recovery | PLANNED | Durable recovery is future work outside the EventBus slice. |
| Deterministic testing | IMPLEMENTED / PRIOR VALIDATION | Prior branch record states 10 tests passed; fresh re-execution in the current environment is not verified. |

## EventBus V1 closure

### Approved local policies

- asynchronous `publish()`;
- publish-time subscriber snapshot;
- sequential handler execution;
- subscriber failure isolation;
- aggregate failure reporting after all selected handlers settle;
- opaque subscription identity;
- idempotent unsubscribe;
- duplicate registrations are distinct subscriptions;
- unsubscribe-only cancellation;
- no V1 EventBus timeout;
- completion means all selected handlers have settled;
- `NO_ORDERING_GUARANTEE`;
- no persistence;
- no durable retry;
- no DomainOutbox coupling.

### Post-implementation audit

All EBUS-DEC-001 through EBUS-DEC-008 matched the implemented code by source inspection. No EventBus implementation divergence was identified.

## InboundInbox gate

`INBOX-IMPLEMENTATION-GATE.md` defines the minimum IA-01 and IA-07 evidence required before Inbox runtime implementation.

`INBOX_V1 = NOT_READY`.

Required next inputs include canonical persistence fields/keys/uniqueness, transaction ownership, persistence failure semantics, and the explicit transport ACK integration boundary.

## Global contracts remain unchanged

`CONTRACT-001`, `CONTRACT-002` and `GOV-001` remain open. This roadmap does not resolve them.

## Future implementation sequence

1. **R0 — EventBus**: DONE / HANDOFF COMPLETE.
2. **R1 — InboundInbox**: after IA-01 canonical persistence/schema and IA-07 ACK boundary are ready.
3. **R2 — JobQueue**: after Job persistence and reliability policy are finalized.
4. **R3 — AuditLog**: after canonical persistence and sensitive-data controls are finalized.
5. **R4 — Reliability**: replay/recovery/reconciliation/dead-letter against finalized durable state.
6. **R5 — DomainOutbox**: only after `CONTRACT-001` resolution.
7. **R6 — Cross-agent integration**: Order, Conversation, Device, Gateway and Desktop consumers/producers.

## Completion rule

EventBus DONE is limited to executable code, test evidence and the post-implementation handoff for this slice. It does not imply readiness of the remaining Event Infrastructure components.
