# IA-03 — Roadmap

## Scope

Este roadmap é subordinado ao roadmap global do KassisT. Ele descreve somente o território de Event Infrastructure e não cria novas fases globais nem redefine contratos.

## State model

- **DONE** — evidência de implementação e validação suficiente existe no repository.
- **PARTIAL** — parte da fundação/contrato existe, mas o runtime completo não existe ou há lacunas contratuais.
- **BLOCKED** — uma decisão ou dependência não resolvida impede implementação segura.
- **NOT_STARTED** — não há runtime implementado nem avanço específico suficiente para classificação NOT_STARTED.
- **PLANNED** — definido/documentado para implementação futura, sem runtime.
- **READY_CANDIDATE** — slice preparado, mas requer gate objetivo antes do código.
- **READY_AFTER_HUMAN_APPROVAL** — local runtime policy is specified and awaits explicit human approval.

## Current state

| Area | State | Evidence / boundary |
|---|---|---|
| EventBus | READY_AFTER_HUMAN_APPROVAL | Local runtime policy proposed; no code implemented. |
| InboundInbox | BLOCKED | Durable intake/ACK contract defined; canonical schema/persistence absent. |
| DomainOutbox | BLOCKED | Ownership/scope unresolved under `CONTRACT-001`. |
| JobQueue | BLOCKED | `Job` persistence absent and exact retry/lease policies incomplete. |
| AuditLog | BLOCKED | Audit contract exists; canonical persistence and sensitive-data policy are incomplete. |
| Idempotency / deduplication | PARTIAL | Principles exist; runtime mechanisms absent. |
| Retry | PLANNED | Required by job/event contracts; exact policy remains incomplete. |
| Backoff | PARTIAL | WSS reconnect policy exists; JobQueue policy remains incomplete. |
| Replay | PLANNED | WSS resume/replay contracted; local runtime absent. |
| Reconciliation | PLANNED | Required, but algorithm/state model incomplete. |
| Dead-letter | PLANNED | Concept identified; policy/runtime absent. |
| Causation | PARTIAL | Contract metadata exists; runtime propagation absent. |
| Correlation | PARTIAL | Contract metadata exists; runtime propagation absent. |
| Observability | PARTIAL | Requirements exist; runtime telemetry absent. |
| Failure recovery | PLANNED | Architectural requirement; future implementation. |
| Deterministic testing | READY_AFTER_HUMAN_APPROVAL | Test matrix finalized as a proposal for V1; test code remains absent. |

## EventBus decision closure

### Evidence-backed closed semantics

- protected envelope boundary;
- in-process publication;
- post-commit dispatch boundary;
- non-durable delivery;
- no EventBus-owned durable retry;
- `NO_ORDERING_GUARANTEE`;
- no DomainOutbox transaction ownership.

### Proposed local policies awaiting approval

- async `publish()` API;
- sequential invocation over a publish-time subscriber snapshot;
- subscriber failure isolation;
- aggregate failure reporting after all selected handlers settle;
- opaque subscription identity;
- idempotent unsubscribe;
- duplicate registrations as distinct subscriptions;
- unsubscribe-only cancellation;
- no V1 timeout;
- completion means all selected handlers have settled.

## Cross-agent dependencies

### IA-02
Domain event semantics and payload stability are the immediate compatibility dependency.

### IA-04
Order event producers/consumers must accept the approved local EventBus lifecycle without relying on undocumented ordering.

### IA-05 / IA-06 / IA-07 / IA-08
Future consumers/producers must not rely on unsupported ordering, durability or retry semantics.

## Global contracts remain unchanged

`CONTRACT-001`, `CONTRACT-002` and `GOV-001` remain open. This roadmap does not resolve them.

## Future implementation sequence

1. **R0 — EventBus**: implement only after human approval of the local decision package; add deterministic tests.
2. **R1 — InboundInbox**: after IA-01 canonical persistence/schema is available.
3. **R2 — JobQueue**: after Job persistence and reliability policy are finalized.
4. **R3 — AuditLog**: after canonical persistence and sensitive-data controls are finalized.
5. **R4 — Reliability**: replay/recovery/reconciliation/dead-letter against finalized durable state.
6. **R5 — DomainOutbox**: only after `CONTRACT-001` resolution.
7. **R6 — Cross-agent integration**: Order, Conversation, Device, Gateway and Desktop consumers/producers.

## Completion rule

Documentation or proposals never constitute runtime completion. DONE requires executable implementation, deterministic tests, contract consistency, CI/review evidence and authorized integration through `main` governance.
