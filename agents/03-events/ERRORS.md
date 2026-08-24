# IA-03 — Errors / Risks / Traps

## ERR-001 — CONTRACT-001: DomainOutbox ambiguity
**Status:** OPEN / BLOCKING

The baseline/documentation describes DomainOutbox in conflicting ways. Do not finalize ownership, behavior, schema semantics or transaction boundaries until resolved.

## ERR-002 — CONTRACT-002: `order.status_changed` ambiguity
**Status:** OPEN

The normative event catalogue is internally inconsistent. IA-03 must not assume the event is definitively required or forbidden.

## ERR-003 — Runtime absence
**Status:** NOT_IMPLEMENTED

EventBus, InboundInbox, DomainOutbox, JobQueue and AuditLog runtime are not implemented in the audited repository state.

## ERR-004 — Documentation is not implementation evidence
**Status:** OPERATIONAL RISK

Contracts and validation notes exist, but completion claims require executable implementation and tests.

## ERR-005 — Partial operational policies
**Status:** PARTIAL

Queue limits, retention, exact job jitter, lease durations, maximum attempts, dead-letter transitions and some idempotency rules remain incomplete. Values must not be invented.

## ERR-006 — Cross-agent contract drift
**Status:** OPERATIONAL RISK

IA-03 is consumed by Order, Conversation and transport areas. Shared contract changes require integration authority and cross-agent review.

## ERR-007 — Sensitive data in audit/logging
**Status:** SECURITY RISK

Customer data, conversations, orders and credentials must not be exposed through logs/audit without explicit policy. Secrets must never be committed.

## ERR-008 — EventBus guarantee inflation
**Status:** READINESS RISK

EventBus is documented as in-process/post-commit local communication. The repository does not establish exactly-once, global ordering, durable replay or automatic retry. Tests and implementation must not imply these guarantees without a protected contract.

## ERR-009 — Persistence model duplication
**Status:** READINESS RISK

IA-03 must not create temporary Inbox/Outbox/Job/Audit schema merely to unblock implementation while IA-01 owns canonical persistence.

## ERR-010 — Reliability policy invention
**Status:** READINESS RISK

Retry count, job backoff, leases, timeout values, retention and dead-letter transitions are not fully normative.

## ERR-011 — Event contract field mismatch
**Status:** OPEN / NON-BLOCKING FOR READINESS

`docs/domain/events.md` describes a richer envelope than `packages/contracts/src/events.ts` currently materializes. IA-03 must preserve supplied metadata but must not silently expand the protected contract.

## ERR-012 — Subscriber semantics incomplete
**Status:** OPEN / IMPLEMENTATION GATE

The repository does not yet define deterministic EventBus subscriber failure isolation, scheduling, timeout/cancellation or ordering semantics. These must be closed before production runtime implementation.

## Recovery traps

- ACK before durable Inbox persistence breaks the contract.
- Retry without idempotency can create duplicate logical effects.
- Replay without causation/correlation breaks traceability.
- Dead-letter state is not a business outcome.
- Treating WSS reconnect backoff as JobQueue retry policy crosses a transport boundary without authorization.
