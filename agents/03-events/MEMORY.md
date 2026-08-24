# IA-03 — Memory

## Permanent facts

- **FACT:** IA-03 owns Event Infrastructure, including EventBus, InboundInbox, DomainOutbox, JobQueue and AuditLog, plus deduplication, retry/backoff, replay, reconciliation, dead-letter handling, causation and correlation.
- **FACT:** The future code territory is under `apps/desktop/electron/infrastructure/{events,inbox,outbox,jobs,audit}/**`.
- **FACT:** WSS ACK means durable local persistence of the inbound event in `InboundInbox`; it does not mean customer processing completed.
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
- **IMPLEMENTATION:** V1 EventBus runtime was implemented only under `apps/desktop/electron/infrastructure/events/**`.
- **TEST:** Deterministic EventBus tests were added and executed in the isolated runtime validation environment: 10/10 passed.

## Not permanent / do not treat as fact

These approved local policies are not global contracts. `CONTRACT-001`, `CONTRACT-002` and `GOV-001` remain open. EventBus provides no persistence, durable retry, timeout, AbortSignal, FIFO, global ordering or DomainOutbox semantics.
