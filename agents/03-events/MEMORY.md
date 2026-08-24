# IA-03 — Memory

## Permanent facts

- **FACT:** IA-03 owns Event Infrastructure, including EventBus, InboundInbox, DomainOutbox, JobQueue and AuditLog, plus deduplication, retry/backoff, replay, reconciliation, dead-letter handling, causation and correlation.
- **FACT:** The future code territory is under `apps/desktop/electron/infrastructure/{events,inbox,outbox,jobs,audit}/**`.
- **FACT:** WSS ACK means durable local persistence of an inbound event in `InboundInbox`; it does not mean customer processing completed.
- **FACT:** `DomainOutbox` remains ambiguous under `CONTRACT-001`.
- **FACT:** JobQueue is the documented durable retry boundary.
- **FACT:** EventBus is in-process, post-commit and non-durable.
- **FACT:** EventBus has `NO_ORDERING_GUARANTEE` under current evidence.
- **FACT:** EventBus does not own durable retry, persistence, DomainOutbox or transaction coordination.
- **FACT:** `CONTRACT-001`, `CONTRACT-002` and `GOV-001` remain unresolved.

## 2026-08-24 — EventBus V1 authorization

- **DECISION:** Operator approved isolated subscriber failures with aggregate reporting after all selected handlers settle.
- **DECISION:** Subscriber A failure does not prevent B/C from executing.
- **DECISION:** `publish()` is asynchronous and awaits selected handlers sequentially over a publish-time snapshot.
- **DECISION:** Subscriptions have opaque identity and `unsubscribe()` is idempotent.
- **DECISION:** V1 cancellation is lifecycle/unsubscribe based; no `AbortSignal`.
- **DECISION:** V1 has no EventBus-owned timeout.
- **DECISION:** `await publish()` completes after all selected handlers settle and does not imply business completion or durability.
- **DECISION:** Snapshot semantics mean each distinct subscription is executed at most once per dispatch; duplicate registrations are distinct subscriptions.
- **DECISION:** EventBus V1 remains in-process, post-commit, non-durable, with no durable retry and no ordering guarantee.
- **IMPLEMENTATION:** V1 EventBus runtime exists only under `apps/desktop/electron/infrastructure/events/**`.
- **TEST RECORD:** The branch's prior validation record states 10/10 deterministic EventBus tests passed.

## 2026-08-24 — Post-implementation handoff

- **FACT:** Post-audit of `event-bus.ts` against EBUS-DEC-001..008 found no behavioral contradiction.
- **FACT:** EventBus handoff is now documented for IA-04 through IA-08 without introducing new events or downstream integrations.
- **FACT:** InboundInbox remains the next IA-03 runtime milestone and is blocked on IA-01 canonical persistence plus the IA-07 ACK boundary.
- **FACT:** Inbox V1 does not require the full KassisT schema; only the canonical subset necessary for durable intake, uniqueness, state and ACK eligibility is required.
- **VALIDATION LIMITATION:** The current environment does not have `tsx` installed. An attempted direct re-execution through `npx` could not complete, so no new 10/10 result is claimed for this session.

## Not permanent / do not treat as fact

Approved EventBus local policies are not global contracts. `CONTRACT-001`, `CONTRACT-002` and `GOV-001` remain open. EventBus provides no persistence, durable retry, timeout, AbortSignal, FIFO, global ordering or DomainOutbox semantics. Inbox schema names and DDL remain unapproved until IA-01 provides the canonical persistence contract.
