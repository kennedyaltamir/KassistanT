# IA-03 — Roadmap

## Scope

Este roadmap é subordinado ao roadmap global do KassisT. Ele descreve somente o território de Event Infrastructure e não cria novas fases globais nem redefine contratos.

## State model

- **DONE** — evidência de implementação e validação suficiente existe no repository.
- **PARTIAL** — parte da fundação/contrato existe, mas o runtime completo não existe ou há lacunas contratuais.
- **BLOCKED** — uma decisão ou dependência não resolvida impede implementação segura.
- **NOT_STARTED** — não há runtime implementado nem avanço específico suficiente para classificação PARTIAL.
- **PLANNED** — definido/documentado para implementação futura, sem runtime.

## Current state

| Area | State | Evidence / boundary |
|---|---|---|
| EventBus | NOT_STARTED | Contract/documentation exists; in-process runtime is NOT_IMPLEMENTED. |
| InboundInbox | NOT_STARTED | Contract defines durable intake before processing and ACK after commit; runtime is NOT_IMPLEMENTED. |
| DomainOutbox | BLOCKED | Runtime absent; ownership/scope is unresolved under CONTRACT-001. |
| JobQueue | NOT_STARTED | Contract defines async jobs with idempotency, retry, backoff, attempts, locking and observability; runtime absent. |
| AuditLog | NOT_STARTED | Audit contract defines actor/action/entity/before-after/correlation/timestamp; runtime absent. |
| Idempotency / deduplication | PARTIAL | Idempotency principles and Inbox uniqueness contract exist; runtime mechanisms are absent. |
| Retry | PLANNED | Required by job/event contracts; exact policy remains incomplete. |
| Backoff | PARTIAL | WSS documentation defines jitter/backoff concepts, but exact algorithm is partial; local job policy is not fully specified. |
| Replay | PLANNED | WSS resume/replay is contracted; local event-infrastructure runtime is absent. |
| Reconciliation | PLANNED | Recovery/reconciliation is a documented requirement; no runtime exists. |
| Dead-letter | PLANNED | Operational concept identified; policy and runtime are not implemented. |
| Causation | PARTIAL | Event contracts carry causation metadata; propagation runtime is absent. |
| Correlation | PARTIAL | Event/WSS/error contracts carry correlation metadata; propagation/runtime is absent. |
| Observability | PARTIAL | Requirements and audit fields are documented; event-infrastructure telemetry runtime is absent. |
| Failure recovery | PLANNED | Recovery is part of the architecture, but implementation is future work. |
| Deterministic testing | PLANNED | Future implementation must be covered by deterministic tests; current area has no runtime test suite. |

## Dependency gates

### Gate E0 — Contract authority

**State:** PARTIAL / GOVERNED.

Required before implementation: use approved baseline and protected contracts as authority. Do not locally redefine global semantics.

### Gate E1 — Canonical persistence

**Dependency:** IA-01.

Canonical schema and transaction/persistence primitives must exist sufficiently for IA-03 runtime persistence. M5.1 currently provides only `_schema_metadata`, not the canonical business schema.

### Gate E2 — Domain semantics

**Dependency:** IA-02.

Event infrastructure consumes domain event definitions and must not invent business semantics.

### Gate E3 — CONTRACT-001

**State:** BLOCKED.

DomainOutbox ownership, scope and transaction semantics must be resolved before implementing behavior that encodes that decision.

### Gate E4 — CONTRACT-002

**State:** OPEN / IMPACTED.

The normative status of `order.status_changed` affects event dispatch, persistence, replay and tests. IA-03 must not choose the answer locally.

## Future implementation sequence

### E5 — EventBus

**State:** PLANNED.

Implement only after domain event contract consumption is stable. EventBus is in-process communication and is not durable storage.

### E6 — InboundInbox

**State:** PLANNED.

Implement durable intake, deduplication and ACK boundary. The externally visible invariant is: durable local Inbox persistence precedes ACK.

### E7 — DomainOutbox

**State:** BLOCKED until CONTRACT-001 is resolved.

No implementation should encode disputed ownership or transaction boundaries.

### E8 — JobQueue

**State:** PLANNED.

Implement recoverable asynchronous execution with explicit attempt state, idempotency, locking, retry/backoff and observability after required persistence/contract gates close.

### E9 — AuditLog

**State:** PLANNED.

Implement evidence-oriented audit persistence without becoming business-rule authority or leaking sensitive customer data.

### E10 — Reliability mechanisms

**State:** PLANNED.

Add replay, reconciliation, dead-letter and failure recovery only against finalized contracts and deterministic persistence semantics.

### E11 — Integration validation

**State:** PLANNED.

Validate interactions with IA-04 Order, IA-05 Conversation/LLM, IA-06 Device/Auth, IA-07 Gateway/WSS and IA-08 Desktop consumers.

### E12 — Deterministic test gate

**State:** PLANNED.

No implementation area is DONE until relevant invariants, idempotency, retry/recovery and cross-boundary behavior have executable deterministic tests and evidence on the actual PR HEAD.

## Completion rule

IA-03 must not claim DONE from documentation alone. DONE requires repository evidence of executable implementation, relevant tests, contract consistency, CI/review evidence and authorized integration through `main` governance.
