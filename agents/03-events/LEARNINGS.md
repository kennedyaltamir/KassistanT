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
- **FACT:** No documented guarantee establishes exactly-once delivery, global ordering or durable EventBus replay. These remain negative/non-guarantees.
- **FACT:** InboundInbox readiness is blocked primarily by the absence of canonical business schema/persistence from IA-01.
- **FACT:** `DomainOutbox` remains blocked because the repository uses the concept in conflicting ownership/scope contexts.
- **FACT:** JobQueue requires idempotency, retry, backoff, attempt state, locking and observability, but exact retry counts, lease durations and algorithms are not fully normative.
- **FACT:** AuditLog documentation defines actor/action/entity/before-after reference/correlation/timestamp and critical event classes, but runtime persistence is absent.

## 2026-08-24 — EventBus local decision closure

- **FACT:** Ordering can remain `NO_ORDERING_GUARANTEE` without a global architectural decision.
- **FACT:** Durable retry remains outside EventBus; JobQueue is the documented durable retry boundary.
- **FACT:** The post-commit boundary is already explicit and does not require a new global decision.
- **PROPOSAL:** The remaining lifecycle/error semantics can be expressed as local IA-03 runtime policy without changing protected contracts.
- **PROPOSAL:** Use an asynchronous `publish()` boundary, isolated subscribers, aggregate failure reporting after all selected handlers settle, opaque subscription identity, idempotent unsubscribe, unsubscribe-only cancellation, no V1 timeout, and publish-time subscriber snapshots.
- **READINESS RESULT:** The first runtime slice is `READY_AFTER_HUMAN_APPROVAL`; implementation remains frozen until the operator accepts the proposed observable behavior.

Unknown or partial policies must remain explicitly marked. Proposals are not project decisions.
