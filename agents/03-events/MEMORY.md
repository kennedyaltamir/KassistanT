# IA-03 — Memory

## Permanent facts

- **FACT:** IA-03 owns Event Infrastructure, including EventBus, InboundInbox, DomainOutbox, JobQueue and AuditLog, plus deduplication, retry/backoff, replay, reconciliation, dead-letter handling, causation and correlation.
- **FACT:** The future code territory is under `apps/desktop/electron/infrastructure/{events,inbox,outbox,jobs,audit}/**`.
- **FACT:** EventBus, InboundInbox, DomainOutbox, JobQueue and AuditLog runtime are not implemented.
- **FACT:** WSS ACK means durable local persistence of an inbound event in `InboundInbox`; it does not mean customer processing completed.
- **FACT:** `DomainOutbox` is a persistence boundary for external effects, but its ownership/scope is ambiguous under `CONTRACT-001`.
- **FACT:** `JobQueue` is the asynchronous job boundary; exact reliability policies remain incomplete.
- **FACT:** Audit requirements are documented; AuditLog runtime is absent.
- **FACT:** Correlation and causation identifiers are part of the documented event envelope, while the current TypeScript `DomainEvent` exposes a reduced field set.
- **FACT:** `CONTRACT-001`, `CONTRACT-002` and `GOV-001` remain unresolved.
- **FACT:** EventBus is documented as in-process communication, not durable storage, with post-commit local consumers.
- **FACT:** No documented EventBus guarantee establishes exactly-once delivery, global ordering, durable replay or automatic retry.
- **READINESS DECISION:** First candidate runtime slice is EventBus in-process post-commit dispatch, conditional on stable event semantics and finalized handler/error semantics.
- **READINESS DECISION:** EventBus must not silently expand `packages/contracts/**`.
- **READINESS DECISION:** EventBus must not absorb durable retry, persistence, DomainOutbox or JobQueue responsibilities.

## Not permanent / do not treat as fact

Exact EventBus subscriber scheduling, failure aggregation/isolation, cancellation, timeout, ordering, retry, telemetry schema and duplicate semantics remain open until explicitly defined. Exact retry counts, lease durations, retention, dead-letter transitions, reconciliation algorithm and DomainOutbox semantics remain unspecified.
