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

## 2026-08-24 — EventBus V1 authorization and implementation

- **DECISION:** The operator approved EBUS-DEC-001 through EBUS-DEC-008 as local IA-03 runtime policies.
- **FACT:** EventBus V1 uses an opaque subscription identity and idempotent unsubscribe.
- **FACT:** Publication snapshots eligible subscriptions and invokes each selected subscription at most once per dispatch.
- **FACT:** Selected handlers execute sequentially; a handler failure does not suppress later selected handlers.
- **FACT:** EventBus V1 aggregates subscriber failures after all selected handlers settle and returns a local `DispatchResult`.
- **FACT:** V1 has no timeout, no `AbortSignal`, no persistence and no durable retry.
- **FACT:** V1 exposes `NO_ORDERING_GUARANTEE` and does not couple to DomainOutbox.
- **TEST RECORD:** The branch's prior validation record states 10 deterministic tests passed with 0 failures, 0 cancellations and 0 skips.

## 2026-08-24 — Post-implementation audit / handoff

- **FACT:** `event-bus.ts` matches EBUS-DEC-001 through EBUS-DEC-008; no implementation contradiction was found by source inspection.
- **FACT:** EventBus handoff is now explicit for IA-04, IA-05, IA-06, IA-07 and IA-08; no new event types were invented.
- **FACT:** InboundInbox is the next IA-03 runtime milestone and requires canonical persistence evidence from IA-01 plus the transport ACK boundary from IA-07.
- **FACT:** Inbox V1 should consume only the canonical persistence subset required for durable intake, uniqueness, state and ACK eligibility; a full-business-schema dependency is unnecessary.
- **VALIDATION LIMITATION:** The current environment does not have `tsx` installed. The requested fresh re-execution could not be completed, so this phase does not claim a new test run. Remote commit status also returned no CI statuses and therefore is `NOT_VERIFIED`.

Unknown or partial policies outside this slice remain explicitly marked.
