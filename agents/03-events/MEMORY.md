# IA-03 — Memory

## Permanent facts

- **FACT:** IA-03 owns Event Infrastructure, including EventBus, InboundInbox, DomainOutbox, JobQueue and AuditLog, plus deduplication, retry/backoff, replay, reconciliation, dead-letter handling, causation and correlation.
- **FACT:** The future code territory is under `apps/desktop/electron/infrastructure/{events,inbox,outbox,jobs,audit}/**`.
- **FACT:** The repository currently documents these contracts but the roadmap audits EventBus, InboundInbox, DomainOutbox, JobQueue and AuditLog runtime as not implemented.
- **FACT:** WSS ACK means durable local persistence of an inbound event in `InboundInbox`; it does not mean customer processing completed.
- **FACT:** `InboundInbox` has a defined idempotency/uniqueness concept using `(provider, external_event_id)`.
- **FACT:** `DomainOutbox` is explicitly documented as a persistence boundary for external effects, but its ownership/scope is ambiguous under `CONTRACT-001`.
- **FACT:** `JobQueue` is defined as the asynchronous job boundary but its runtime is not implemented.
- **FACT:** Audit requirements are documented, but the AuditLog runtime is not implemented.
- **FACT:** Correlation and causation identifiers are part of the event envelope.
- **FACT:** Canonical SQLite currently contains only `_schema_metadata`; business persistence is future work.
- **FACT:** `CONTRACT-001`, `CONTRACT-002` and `GOV-001` remain unresolved in the audited repository state.
- **FACT:** IA-03 cannot redefine protected contracts or global architecture locally.

## Not permanent / do not treat as fact

Exact retention periods, queue limits, retry counts, jitter algorithm, dead-letter policy details, state-sync payloads and DomainOutbox ownership semantics are not all fully specified and must not be invented.
