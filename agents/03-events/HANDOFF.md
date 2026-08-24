# IA-03 — Event Infrastructure Handoff

## Identity
Agent: IA-03. Responsibility: Event Infrastructure.

## EventBus decision state

The EventBus local decision closure is complete as a **proposal package**. Runtime remains frozen pending human approval.

`EVENTBUS_RUNTIME_READINESS = READY_AFTER_HUMAN_APPROVAL`

## Evidence-backed semantics

- EventBus is in-process communication.
- Local consumers are post-commit.
- EventBus is non-durable.
- EventBus does not own durable retry.
- EventBus has `NO_ORDERING_GUARANTEE`.
- DomainOutbox remains outside this boundary because `CONTRACT-001` is open.

## Proposed local V1 policy

- async `publish()` boundary;
- publish-time subscriber snapshot;
- distinct opaque subscription identities;
- idempotent `unsubscribe()`;
- duplicate registrations remain distinct;
- subscriber failures are isolated;
- failures are aggregated and reported after all selected handlers settle;
- cancellation is unsubscribe-only;
- no EventBus timeout in V1;
- `await publish()` means all selected handlers have settled;
- no public ordering guarantee.

These are `PROPOSAL / LOCAL_RUNTIME_POLICY`, not approved decisions.

## Global/cross-agent boundaries

- IA-02: event semantics/payload stability.
- IA-04: Order event producer/consumer compatibility.
- IA-05: Conversation/LLM consumer compatibility.
- IA-06: Device event consumer compatibility.
- IA-07: transport consumer compatibility.
- IA-08: UI/operational consumer compatibility.

`CONTRACT-001`, `CONTRACT-002` and `GOV-001` remain open and untouched.

## Approval gate

Human approval is required before production EventBus code is written. Approval should explicitly accept or reject the proposed observable runtime behavior in `HUMAN-EVENTBUS-DECISIONS.md`.

## Runtime slice after approval

Only:

`apps/desktop/electron/infrastructure/events/**`

and directly associated deterministic tests.

Explicit non-goals remain SQLite, Inbox, Outbox, JobQueue, AuditLog, WSS, durable retry, replay/reconciliation/dead-letter, business rules and protected contract changes.

## Evidence discipline

The proposal document is preparation, not implementation evidence. No EventBus runtime exists yet.
