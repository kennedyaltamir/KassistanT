# IA-03 — Roadmap

## Scope

Este roadmap é subordinado ao roadmap global do KassisT. Ele descreve somente o território de Event Infrastructure e não cria novas fases globais nem redefine contratos.

## Current state

| Area | State | Evidence / boundary |
|---|---|---|
| EventBus | IMPLEMENTED / TESTED | V1 in-process/post-commit runtime implemented with deterministic tests. |
| InboundInbox | BLOCKED | Durable intake/ACK contract defined; canonical schema/persistence absent. |
| DomainOutbox | BLOCKED | Ownership/scope unresolved under `CONTRACT-001`. |
| JobQueue | BLOCKED | `Job` persistence absent and exact retry/lease policies incomplete. |
| AuditLog | BLOCKED | Audit contract exists; canonical persistence and sensitive-data policy are incomplete. |
| Idempotency / deduplication | PARTIAL | Principles exist; durable runtime remains future work. |
| Retry | PLANNED | Durable retry remains a JobQueue concern. |
| Backoff | PARTIAL | WSS reconnect policy exists; JobQueue policy remains incomplete. |
| Replay | PLANNED | WSS resume/replay contracted; local runtime absent. |
| Reconciliation | PLANNED | Required, but algorithm/state model incomplete. |
| Dead-letter | PLANNED | Concept identified; policy/runtime absent. |
| Causation | PARTIAL | Contract metadata exists; EventBus preserves supplied event object metadata without expanding the contract. |
| Correlation | PARTIAL | Contract metadata exists; EventBus preserves supplied event object metadata without expanding the contract. |
| Observability | PARTIAL | Local subscriber failure reporting exists; broader telemetry schema remains undefined. |
| Failure recovery | PLANNED | Durable recovery is future work outside the EventBus slice. |
| Deterministic testing | IMPLEMENTED / TESTED | 10 EventBus tests passed in isolated runtime validation. |

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

### Implementation boundary

Only `apps/desktop/electron/infrastructure/events/**` was implemented. Downstream agent integration remains deferred.

## Global contracts remain unchanged

`CONTRACT-001`, `CONTRACT-002` and `GOV-001` remain open. This roadmap does not resolve them.

## Future implementation sequence

1. **R0 — EventBus**: DONE / TESTED.
2. **R1 — InboundInbox**: after IA-01 canonical persistence/schema is available.
3. **R2 — JobQueue**: after Job persistence and reliability policy are finalized.
4. **R3 — AuditLog**: after canonical persistence and sensitive-data controls are finalized.
5. **R4 — Reliability**: replay/recovery/reconciliation/dead-letter against finalized durable state.
6. **R5 — DomainOutbox**: only after `CONTRACT-001` resolution.
7. **R6 — Cross-agent integration**: Order, Conversation, Device, Gateway and Desktop consumers/producers.

## Completion rule

EventBus DONE is limited to executable code and deterministic tests for this slice. It does not imply readiness of the remaining Event Infrastructure components.
