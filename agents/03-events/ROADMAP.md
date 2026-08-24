# IA-03 — Roadmap

## Scope

Este roadmap é subordinado ao roadmap global do KassisT. Ele descreve somente o território de Event Infrastructure e não cria novas fases globais nem redefine contratos.

## State model

- **DONE** — evidência de implementação e validação suficiente existe no repository.
- **PARTIAL** — parte da fundação/contrato existe, mas o runtime completo não existe ou há lacunas contratuais.
- **BLOCKED** — uma decisão ou dependência não resolvida impede implementação segura.
- **NOT_STARTED** — não há runtime implementado nem avanço específico suficiente para classificação PARTIAL.
- **PLANNED** — definido/documentado para implementação futura, sem runtime.
- **READY_CANDIDATE** — um slice pode ser preparado, mas ainda depende de gates objetivos antes do código de produção.

## Current state

| Area | State | Evidence / boundary |
|---|---|---|
| EventBus | BLOCKED | In-process/post-commit semantics are established, but subscriber lifecycle/error/scheduling semantics remain undefined. |
| InboundInbox | BLOCKED | Durable intake/ACK contract defined; canonical schema/persistence absent. |
| DomainOutbox | BLOCKED | Ownership/scope unresolved under `CONTRACT-001`. |
| JobQueue | BLOCKED | `Job` persistence absent and exact retry/lease policies incomplete. |
| AuditLog | BLOCKED | Audit contract exists; canonical persistence and sensitive-data policy are incomplete. |
| Idempotency / deduplication | PARTIAL | Principles and Inbox uniqueness concept exist; runtime mechanisms absent. |
| Retry | PLANNED | Required by job/event contracts; exact policy remains incomplete. |
| Backoff | PARTIAL | WSS reconnect policy exists with five-minute ceiling; exact jitter is partial and job policy is not defined. |
| Replay | PLANNED | WSS resume/replay is contracted; local runtime is absent. |
| Reconciliation | PLANNED | Recovery/reconciliation is required but algorithm/state model is incomplete. |
| Dead-letter | PLANNED | Operational concept identified; policy/state runtime absent. |
| Causation | PARTIAL | Event/WSS contracts carry metadata; propagation runtime absent. |
| Correlation | PARTIAL | Event/WSS/error contracts carry metadata; propagation/runtime is absent. |
| Observability | PARTIAL | Requirements exist; event-infrastructure telemetry runtime absent. |
| Failure recovery | PLANNED | Recovery is architectural requirement; implementation future. |
| Deterministic testing | PLANNED | Runtime tests remain gated by finalized EventBus lifecycle/error semantics. |

## EventBus gate state

### Closed

- protected envelope boundary;
- post-commit publish boundary;
- non-durable scope;
- no durable EventBus retry;
- no DomainOutbox coupling;
- `NO_ORDERING_GUARANTEE`.

### Open / blocking

- subscriber failure propagation;
- subscriber isolation;
- scheduling;
- cancellation;
- timeout;
- unsubscribe lifecycle;
- duplicate registration and multiple-subscriber execution semantics;
- dispatch completion semantics.

## Dependency gates

### Gate E0 — Contract authority
**State:** PASS / GOVERNED.

### Gate E1 — Canonical persistence
**Dependency:** IA-01.  
**State:** BLOCKED for Inbox/Outbox/Job/Audit.

### Gate E2 — Domain semantics
**Dependency:** IA-02.  
**State:** PARTIAL.

Domain event contracts exist, but `DOMAIN-EVENT-V1` remains ambiguous and `CONTRACT-002` affects the order event catalogue.

### Gate E3 — CONTRACT-001
**State:** BLOCKED.

DomainOutbox ownership, scope and transaction semantics must be resolved before runtime implementation.

### Gate E4 — CONTRACT-002
**State:** OPEN / IMPACTED.

The normative status of `order.status_changed` affects event dispatch and tests.

### Gate E5 — EventBus lifecycle/error policy
**State:** BLOCKED.

Scheduling, failure propagation, isolation, cancellation, timeout and dispatch completion are not defined by protected sources.

## Future implementation sequence

1. **R0 — EventBus**: in-process dispatch and deterministic tests after E5 closes; no durable semantics.
2. **R1 — InboundInbox**: durable intake, deduplication, processing state and ACK boundary after IA-01 schema/persistence is available.
3. **R2 — JobQueue**: recoverable async jobs with explicit attempts/locking/retry/backoff after policies close.
4. **R3 — AuditLog**: evidence-oriented durable audit persistence with sensitive-data controls.
5. **R4 — Reliability**: replay/recovery/reconciliation/dead-letter against finalized durable state.
6. **R5 — DomainOutbox**: only after `CONTRACT-001` resolution.
7. **R6 — Cross-agent integration**: Order, Conversation, Device, Gateway and Desktop consumers/producers.

This order is a territory execution sequence, not a global release schedule.
