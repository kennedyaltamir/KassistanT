# IA-03 — Event Infrastructure Handoff

## Identity
Agent: IA-03. Responsibility: Event Infrastructure.

## Runtime gate state
The EventBus runtime gate was audited and remains `BLOCKED`. No product runtime was implemented.

## Closed EventBus semantics

- EventBus is in-process communication.
- Local consumers are post-commit.
- EventBus is non-durable.
- EventBus does not own durable retry.
- EventBus has `NO_ORDERING_GUARANTEE`.
- DomainOutbox transaction semantics remain outside this boundary because `CONTRACT-001` is open.

## Blocking EventBus semantics

The repository does not define:

- subscriber scheduling;
- subscriber failure propagation;
- subscriber isolation;
- cancellation;
- timeout;
- unsubscribe lifecycle;
- duplicate registration and multiple-subscriber execution semantics;
- dispatch completion semantics.

These are recorded as runtime gates rather than local assumptions.

## Other Event Infrastructure state

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
- `EVENTBUS-RUNTIME-CONTRACT.md`
- `EVENTBUS-ERROR-MATRIX.md`
- `EVENTBUS-TEST-MATRIX.md`
- `EVENTBUS-IMPLEMENTATION-GATE.md`
- `INBOX-OUTBOX-MATRIX.md`
- `JOBQUEUE-RELIABILITY-MATRIX.md`
- `EVENT-INFRASTRUCTURE-DEPENDENCIES.md`
- `IMPLEMENTATION-GATES.md`

## Next gate

Close the remaining EventBus lifecycle/error semantics without modifying protected contracts. After those gates close, the next concrete candidate is the in-process EventBus runtime slice with deterministic tests.

Never treat documentation as proof of runtime. Preserve the open status of `CONTRACT-001`, `CONTRACT-002` and `GOV-001`. Do not invent retry, retention, ordering, lease, cancellation, timeout, scheduling or dispatch-completion semantics.
