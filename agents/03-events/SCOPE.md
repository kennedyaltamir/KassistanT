# IA-03 — Scope

## FACT — In scope

IA-03 owns the event-infrastructure runtime boundaries that sit between domain state changes and asynchronous/durable operational processing:

- EventBus dispatch infrastructure.
- InboundInbox durable intake and deduplication.
- DomainOutbox infrastructure, subject to `CONTRACT-001`.
- JobQueue and asynchronous job lifecycle infrastructure.
- AuditLog infrastructure and evidence persistence.
- Retry, exponential/backoff policies when contractually defined.
- Replay and recovery mechanisms.
- Reconciliation mechanisms.
- Dead-letter handling.
- Correlation and causation propagation.

## FACT — Out of scope

The following are not IA-03 territory:

- Canonical SQLite entity/schema design: IA-01.
- Domain entities, commands, queries, invariants and business rules: IA-02.
- Order pricing, promotion and order lifecycle logic: IA-04.
- Conversation lifecycle, LLM and Ollama runtime: IA-05.
- Device enrollment/authentication and key management: IA-06.
- Gateway HTTP/WSS transport runtime: IA-07.
- Desktop UI and renderer: IA-08.

## Boundary rules

IA-03 may consume contracts owned by other agents but must not redefine them. Infrastructure may enforce technical invariants such as durability, idempotency and retry safety, but it must not decide business outcomes.

## Shared/protected areas

No modification is authorized in `packages/contracts/**`, `docs/protocols/**`, `docs/domain/**`, `docs/backend/**`, the baseline, `docs/ROADMAP.md`, workflows, root package configuration or another agent's territory during this configuration phase.

## Classification

- **FACT:** repository currently documents the infrastructure contracts but has no implemented runtime for EventBus, InboundInbox, DomainOutbox, JobQueue or AuditLog.
- **BLOCKED:** DomainOutbox behavior is affected by `CONTRACT-001`.
- **PARTIAL:** event/WSS mapping, authorization, idempotency details and some retry/retention policies remain incomplete in the contracts.
- **NOT_IMPLEMENTED:** the future runtime described by this scope.
