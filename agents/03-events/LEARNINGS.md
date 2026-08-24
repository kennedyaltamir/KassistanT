# IA-03 — Learnings

## 2026-08-24 — Initial audit

- **FACT:** Contract documentation is not runtime evidence; the roadmap distinguishes planned, skeleton and implemented states.
- **FACT:** Event infrastructure is a dependency hub between domain/persistence and asynchronous/transport consumers.
- **FACT:** WSS ACK is tied to durable `InboundInbox` persistence; ACK does not mean business processing completed.
- **FACT:** `CONTRACT-001` blocks final DomainOutbox semantics.
- **FACT:** `CONTRACT-002` affects the normative event catalogue and therefore dispatch/tests.
- **FACT:** Event envelopes carry event identity, aggregate identity, timing, producer, correlation/causation metadata, schema and payload.
- **FACT:** Idempotency, retry, replay, reconciliation and audit are operational requirements.
- **FACT:** Current SQLite support cannot support a claim that Inbox/Outbox/Queue/Audit runtime already exists.

Unknown or partial policies must remain explicitly marked.
