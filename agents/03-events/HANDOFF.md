# IA-03 — Event Infrastructure Handoff

## Identity
Agent: IA-03. Responsibility: Event Infrastructure.

## Readiness state
Event Infrastructure readiness audit and EventBus contract closure are complete. No product runtime was implemented.

## Ownership
Future ownership includes:

- `apps/desktop/electron/infrastructure/events/**`
- `apps/desktop/electron/infrastructure/inbox/**`
- `apps/desktop/electron/infrastructure/outbox/**`
- `apps/desktop/electron/infrastructure/jobs/**`
- `apps/desktop/electron/infrastructure/audit/**`
- directly associated tests.

Shared contracts, canonical schema and global documentation remain governed dependencies.

## EventBus closure

- Scope: in-process dispatch only.
- Timing: documented post-commit local-consumer boundary.
- Persistence: none owned by EventBus.
- Durable retry: not owned by EventBus.
- DomainOutbox coupling: none implied.
- Delivery guarantee: no exactly-once, at-least-once or global-order claim.
- Event envelope: consumes current approved `DomainEvent`; broader documented metadata is preserved only when supplied.
- Open implementation-contract items: subscriber failure propagation/isolation, scheduling, timeout/cancellation and ordering semantics.

## Other findings

- InboundInbox: durable-before-ACK semantics are clear; canonical persistence is missing.
- DomainOutbox: blocked by `CONTRACT-001`.
- JobQueue: capability requirements are clear, but schema and exact retry/lease/backoff policies are incomplete.
- AuditLog: fields/critical event classes are documented; durable runtime is absent.
- Causation/correlation: contract metadata exists; runtime propagation is absent.
- Replay/reconciliation/dead-letter: requirements exist, but state/recovery runtime is absent.

## Dependencies

- IA-01: canonical persistence/schema and transaction primitives.
- IA-02: domain event semantics and domain errors.
- IA-04: Order event producers/consumers.
- IA-05: Conversation/LLM asynchronous work.
- IA-06: device lifecycle/security audit events.
- IA-07: WSS EVENT/ACK/RESUME transport semantics.
- IA-08: operational event consumers.

## Open contracts

- `CONTRACT-001` — DomainOutbox ownership/semantics: BLOCKING for Outbox implementation.
- `CONTRACT-002` — `order.status_changed`: OPEN and impacts normative event dispatch/tests.
- `GOV-001` — documentation/version authority: OPEN; IA-03 makes no new authority assumption.

## Readiness artifacts

- `EVENT-INFRASTRUCTURE-READINESS.md`
- `EVENTBUS-MATRIX.md`
- `EVENTBUS-CONTRACT.md`
- `EVENTBUS-ERROR-MATRIX.md`
- `EVENTBUS-TEST-MATRIX.md`
- `EVENTBUS-IMPLEMENTATION-GATE.md`
- `INBOX-OUTBOX-MATRIX.md`
- `JOBQUEUE-RELIABILITY-MATRIX.md`
- `EVENT-INFRASTRUCTURE-DEPENDENCIES.md`
- `IMPLEMENTATION-GATES.md`

## Information that must not be lost

Never treat documentation as proof of runtime. Preserve the distinction between SQLite foundation and canonical event persistence. Preserve the open status of `CONTRACT-001`, `CONTRACT-002` and `GOV-001`. Do not invent retry, retention, ordering, lease, dead-letter or transaction semantics.

## Next gate

Await IA-02 event-semantic stabilization and closure of the remaining EventBus implementation-contract items. Then implement the bounded EventBus slice with deterministic tests, without touching Inbox/Outbox/JobQueue/AuditLog.
