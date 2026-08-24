# IA-03 — Memory

## Permanent facts

- **FACT:** IA-03 owns Event Infrastructure, including EventBus, InboundInbox, DomainOutbox, JobQueue and AuditLog, plus deduplication, retry/backoff, replay, reconciliation, dead-letter handling, causation and correlation.
- **FACT:** The future code territory is under `apps/desktop/electron/infrastructure/{events,inbox,outbox,jobs,audit}/**`.
- **FACT:** The repository currently documents these contracts but the roadmap audits EventBus, InboundInbox, DomainOutbox, JobQueue and AuditLog runtime as not implemented.
- **FACT:** WSS ACK means durable local persistence of an inbound event in `InboundInbox`; it does not mean customer processing completed.
- **FACT:** `DomainOutbox` remains ambiguous under `CONTRACT-001`.
- **FACT:** JobQueue is the documented durable retry boundary.
- **FACT:** EventBus is in-process, post-commit and non-durable.
- **FACT:** EventBus has `NO_ORDERING_GUARANTEE` under current evidence.
- **FACT:** EventBus does not own durable retry, persistence, DomainOutbox or transaction coordination.
- **FACT:** `CONTRACT-001`, `CONTRACT-002` and `GOV-001` remain unresolved.

## 2026-08-24 — Local EventBus decision package

- **PROPOSAL / LOCAL_RUNTIME_POLICY:** `publish()` is asynchronous and dispatches selected subscribers after the post-commit boundary.
- **PROPOSAL / LOCAL_RUNTIME_POLICY:** Subscribers are isolated; one failure does not suppress other selected subscribers.
- **PROPOSAL / LOCAL_RUNTIME_POLICY:** Subscriber failures are aggregated and surfaced after all selected handlers settle.
- **PROPOSAL / LOCAL_RUNTIME_POLICY:** `subscribe()` returns an opaque subscription identity and duplicate registrations are distinct registrations.
- **PROPOSAL / LOCAL_RUNTIME_POLICY:** `unsubscribe()` is idempotent and prevents future dispatches; it does not forcibly cancel an already-running handler.
- **PROPOSAL / LOCAL_RUNTIME_POLICY:** V1 uses unsubscribe-only cancellation and does not introduce `AbortSignal`.
- **PROPOSAL / DEFERRED:** V1 has no EventBus timeout; timeout policy remains outside the local V1 contract.
- **PROPOSAL / LOCAL_RUNTIME_POLICY:** `await publish(event)` completes only after all selected handlers settle; failure is reported after dispatch.
- **PROPOSAL / LOCAL_RUNTIME_POLICY:** Multiple-subscriber dispatch uses a publish-time snapshot; each distinct subscription is invoked at most once for that dispatch.
- **READINESS RESULT:** EventBus is `READY_AFTER_HUMAN_APPROVAL`; no runtime code should be written until the operator approves the proposed observable behavior.

## Not permanent / do not treat as fact

The proposals above are not approved project decisions. They must not be described as existing runtime behavior until accepted and implemented. No timeout value, ordering guarantee, durable retry, persistence semantics or protected contract change is implied.
