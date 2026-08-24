# IA-03 — Memory

## Permanent facts

- **FACT:** IA-03 owns Event Infrastructure, including EventBus, InboundInbox, DomainOutbox, JobQueue and AuditLog, plus deduplication, retry/backoff, replay, reconciliation, dead-letter handling, causation and correlation.
- **FACT:** The future code territory is under `apps/desktop/electron/infrastructure/{events,inbox,outbox,jobs,audit}/**`.
- **FACT:** The repository currently documents these contracts but the roadmap audits EventBus, InboundInbox, DomainOutbox, JobQueue and AuditLog runtime as not implemented.
- **FACT:** WSS ACK means durable local persistence of an inbound event in `InboundInbox`; it does not mean customer processing completed.
- **FACT:** `InboundInbox` has a defined idempotency/uniqueness concept using `(provider, external_event_id)`; exact canonical schema mapping remains an IA-01/contract concern.
- **FACT:** `DomainOutbox` is explicitly documented as a persistence boundary for external effects, but its ownership/scope is ambiguous under `CONTRACT-001`.
- **FACT:** `JobQueue` is defined as the asynchronous job boundary but its runtime is not implemented.
- **FACT:** Audit requirements are documented, but the AuditLog runtime is not implemented.
- **FACT:** Correlation and causation identifiers are part of the event envelope.
- **FACT:** Canonical SQLite currently contains only `_schema_metadata`; business persistence is future work.
- **FACT:** `CONTRACT-001`, `CONTRACT-002` and `GOV-001` remain unresolved in the audited repository state.
- **FACT:** IA-03 cannot redefine protected contracts or global architecture locally.
- **FACT:** EventBus is documented as in-process communication, not durable storage, and post-commit local consumers are the documented use case.
- **FACT:** WSS sequence is monotonic per `(store_id, device_id)`; exact Inbox processing ordering beyond transport sequence is not fully specified.
- **FACT:** WSS reconnect uses jitter/backoff with a five-minute ceiling, but the exact jitter algorithm is partial; that transport policy must not be assumed to be JobQueue policy.
- **FACT:** Audit documentation identifies actor, action, entity, before/after reference, correlation and timestamp, plus critical audit-worthy events.
- **FACT:** Error handling requires correlation and retryability classification, but the full error catalogue is missing.
- **READINESS DECISION:** First candidate runtime slice is EventBus in-process dispatch, subject to event contract stability and deterministic testability.
- **READINESS DECISION:** InboundInbox, JobQueue and AuditLog require canonical persistence from IA-01 before production implementation.
- **READINESS DECISION:** DomainOutbox remains blocked by `CONTRACT-001`.

## Not permanent / do not treat as fact

Exact retention periods, queue limits, retry counts, jitter algorithm for jobs, lease durations, dead-letter state machine, reconciliation algorithm, endpoint replay/TTL rules, state-sync payloads and DomainOutbox ownership semantics are not fully specified and must not be invented.
