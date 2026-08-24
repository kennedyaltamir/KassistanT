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
| EventBus | READY_CANDIDATE | In-process/post-commit local dispatch is documented; runtime absent. Contract closure artifact exists. |
| InboundInbox | BLOCKED | Durable intake/ACK contract defined; canonical schema/persistence absent. |
| DomainOutbox | BLOCKED | Ownership/scope unresolved under `CONTRACT-001`. |
| JobQueue | BLOCKED | `Job` persistence absent and exact retry/lease policies incomplete. |
| AuditLog | BLOCKED | Audit contract exists; canonical persistence and sensitive-data policy are incomplete. |
| Idempotency / deduplication | PARTIAL | Principles and Inbox uniqueness concept exist; runtime mechanisms are absent. |
| Retry | PLANNED | Required by job/event contracts; exact policy remains incomplete. |
| Backoff | PARTIAL | WSS reconnect policy exists with five-minute ceiling; exact jitter is partial and job policy is not defined. |
| Replay | PLANNED | WSS resume/replay is contracted; local runtime is absent. |
| Reconciliation | PLANNED | Recovery/reconciliation is required but algorithm/state model is incomplete. |
| Dead-letter | PLANNED | Operational concept identified; policy/state runtime absent. |
| Causation | PARTIAL | Event/WSS contracts carry metadata; propagation runtime absent. |
| Correlation | PARTIAL | Event/WSS/error contracts carry metadata; propagation/runtime absent. |
| Observability | PARTIAL | Requirements exist; event-infrastructure telemetry runtime absent. |
| Failure recovery | PLANNED | Recovery is architectural requirement; implementation future. |
| Deterministic testing | PLANNED | EventBus test contract is now specified; executable tests await implementation-gate closure. |

## EventBus gate

### E0 — Contract authority
**PASS / GOVERNED.**

### E1 — Materialized envelope
**PASS WITH OPEN METADATA.**

The current `DomainEvent` fields are known. Broader envelope metadata is documented but not fully materialized in the protected TypeScript type. IA-03 does not expand it.

### E2 — Publish boundary
**PASS.**

EventBus is in-process and used for post-commit local consumers.

### E3 — Subscriber/error semantics
**PARTIAL / IMPLEMENTATION GATE.**

Failure propagation/isolation, scheduling, timeout/cancellation and handler completion semantics remain to be finalized.

### E4 — Ordering
**OPEN / NON-BLOCKING FOR SCOPE.**

No global or per-aggregate EventBus ordering guarantee is documented. The future implementation must not claim one by accident.

### E5 — Retry boundary
**PASS.**

EventBus does not own durable retry. JobQueue is the documented retry boundary when durable retry is required.

### E6 — Deterministic tests
**DEFINED / NOT IMPLEMENTED.**

The test matrix is complete for the bounded first slice; executable tests await runtime authorization.

## Future implementation sequence

1. **R0 — EventBus**: in-process dispatch abstraction and deterministic tests after E0-E6 are closed.
2. **R1 — InboundInbox**: durable intake, deduplication, processing state and ACK boundary after IA-01 schema/persistence is available.
3. **R2 — JobQueue**: recoverable async jobs with explicit attempts/locking/retry/backoff after policies close.
4. **R3 — AuditLog**: evidence-oriented durable audit persistence with sensitive-data controls.
5. **R4 — Reliability**: replay/recovery/reconciliation/dead-letter against finalized durable state.
6. **R5 — DomainOutbox**: only after `CONTRACT-001` resolution.
7. **R6 — Cross-agent integration**: Order, Conversation, Device, Gateway and Desktop consumers/producers.

This order is a territory execution sequence, not a global release schedule.

## Readiness artifacts

- `EVENT-INFRASTRUCTURE-READINESS.md`
- `EVENTBUS-MATRIX.md`
- `EVENTBUS-CONTRACT.md`
- `EVENTBUS-ERROR-MATRIX.md`
- `EVENTBUS-TEST-MATRIX.md`
- `EVENTBUS-IMPLEMENTATION-GATE.md`
- `INBOX-OUTBOX-MATRIX.md`
- `JOBQUEUE-RELIABILITY-MATRIX.md`
- `EVENT-INFRASTRUCTURE-DEPENDENCIES.md`
- `IMPLEMENTATION-GATES.md`

## Completion rule

IA-03 must not claim DONE from documentation alone. DONE requires repository evidence of executable implementation, relevant tests, contract consistency, CI/review evidence and authorized integration through `main` governance.
