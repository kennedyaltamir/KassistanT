# IA-03 — Learnings

## 2026-08-24 — Initial audit

- **FACT:** Contract documentation is not runtime evidence; the roadmap distinguishes planned, skeleton and implemented states.
- **FACT:** Event infrastructure is a dependency hub between domain/persistence and asynchronous/transport consumers.
- **FACT:** WSS ACK is tied to durable `InboundInbox` persistence; ACK does not mean business processing completed.
- **FACT:** `CONTRACT-001` blocks final DomainOutbox semantics.
- **FACT:** `CONTRACT-002` affects the normative event catalogue and therefore dispatch/tests.
- **FACT:** Event envelopes carry event identity, aggregate identity, timing, producer, correlation/causation metadata, schema and payload in the documented model; the current TypeScript contract exposes a reduced subset and must not be silently expanded.
- **FACT:** Idempotency, retry, replay, reconciliation and audit are operational requirements.
- **FACT:** Current SQLite support cannot support a claim that Inbox/Outbox/Queue/Audit runtime already exists.

## 2026-08-24 — Readiness audit

- **FACT:** EventBus is explicitly in-process and not durable storage. Its documented consumers are post-commit local consumers such as notifications, sounds, badges and dashboard updates.
- **FACT:** No documented guarantee establishes exactly-once delivery, global ordering or durable EventBus replay. These must remain unspecified until a contract says otherwise.
- **FACT:** InboundInbox readiness is blocked primarily by the absence of canonical business schema/persistence from IA-01; the ACK invariant itself is already clear.
- **FACT:** `DomainOutbox` remains blocked because the repository uses the concept in conflicting ownership/scope contexts.
- **FACT:** JobQueue requires idempotency, retry, backoff, attempt state, locking and observability, but exact retry counts, lease durations and algorithms are not fully normative.
- **FACT:** AuditLog documentation defines actor/action/entity/before-after reference/correlation/timestamp and critical event classes, but runtime persistence is absent.
- **READINESS DECISION:** The first candidate implementation slice is EventBus in-process dispatch, conditional on stable event contracts and deterministic tests.
- **READINESS DECISION:** Production Inbox, JobQueue and AuditLog work should follow canonical persistence availability rather than create temporary persistence models inside IA-03.
- **READINESS DECISION:** Reliability mechanisms should be implemented around finalized durable state, not as free-floating utilities that imply undeclared semantics.

## 2026-08-24 — EventBus runtime gate

- **FACT:** EventBus ordering can be explicitly classified as `NO_ORDERING_GUARANTEE` without changing any protected contract.
- **FACT:** Durable retry is outside EventBus; the documented JobQueue contract owns retry/backoff/attempt/locking/observability capabilities.
- **FACT:** The post-commit EventBus boundary is explicit: business transaction commits before local dispatch.
- **FACT:** Protected sources do not define scheduling, subscriber failure propagation, subscriber isolation, cancellation, timeout, unsubscribe lifecycle, multiple-subscriber execution semantics or dispatch-completion semantics.
- **READINESS RESULT:** The EventBus runtime remains `BLOCKED`; these undefined semantics cannot be invented locally and converted into implementation guarantees.

Unknown or partial policies must remain explicitly marked.
