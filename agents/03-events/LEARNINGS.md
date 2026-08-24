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

## 2026-08-24 — EventBus V1 authorization and implementation

- **DECISION:** The operator approved EBUS-DEC-001 through EBUS-DEC-008 as local IA-03 runtime policies.
- **FACT:** EventBus V1 uses an opaque subscription identity and idempotent unsubscribe.
- **FACT:** Publication snapshots eligible subscriptions and invokes each selected subscription at most once per dispatch.
- **FACT:** Selected handlers execute sequentially; a handler failure does not suppress later selected handlers.
- **FACT:** EventBus V1 aggregates subscriber failures after all selected handlers settle and returns a local `DispatchResult`.
- **FACT:** V1 has no timeout, no `AbortSignal`, no persistence and no durable retry.
- **FACT:** V1 exposes `NO_ORDERING_GUARANTEE` and does not couple to DomainOutbox.
- **TEST EVIDENCE:** 10 deterministic tests passed with 0 failures, 0 cancellations and 0 skips in isolated runtime validation.
- **TOOLING LIMITATION:** The standard desktop test script was not modified because it is outside IA-03 scope; the EventBus test file was executed directly.

Unknown or partial policies outside this V1 slice remain explicitly marked.
