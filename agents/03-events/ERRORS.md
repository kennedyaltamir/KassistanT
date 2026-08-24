# IA-03 — Errors / Risks / Traps

## ERR-001 — CONTRACT-001: DomainOutbox ambiguity
**Status:** OPEN / BLOCKING

Do not finalize DomainOutbox ownership, behavior, schema semantics or transaction boundaries until resolved.

## ERR-002 — CONTRACT-002: `order.status_changed` ambiguity
**Status:** OPEN

IA-03 must not assume the event is definitively required or forbidden.

## ERR-003 — Runtime absence
**Status:** NOT_IMPLEMENTED

EventBus, InboundInbox, DomainOutbox, JobQueue and AuditLog runtime are not implemented.

## ERR-004 — Documentation is not implementation evidence
**Status:** OPERATIONAL RISK

Completion requires executable implementation and tests.

## ERR-005 — Partial operational policies
**Status:** PARTIAL

Queue limits, retention, exact job jitter, lease durations, maximum attempts and dead-letter transitions remain incomplete.

## ERR-006 — Cross-agent contract drift
**Status:** OPERATIONAL RISK

IA-03 consumers include Order, Conversation and transport areas. Shared contract changes require integration authority and cross-agent review.

## ERR-007 — Sensitive data in audit/logging
**Status:** SECURITY RISK

Sensitive customer/business data must not be exposed without explicit policy. Secrets must never be committed.

## ERR-008 — EventBus guarantee inflation
**Status:** READINESS RISK

EventBus is in-process/post-commit. Do not imply exactly-once, durable replay, global ordering or durable retry.

## ERR-009 — Persistence model duplication
**Status:** READINESS RISK

Do not create temporary Inbox/Outbox/Job/Audit schema outside IA-01 canonical persistence.

## ERR-010 — Reliability policy invention
**Status:** READINESS RISK

Do not invent retry counts, job backoff, leases, timeout values, retention or dead-letter transitions.

## ERR-011 — EventBus runtime gate incomplete
**Status:** BLOCKING FOR RUNTIME

Protected sources do not define the local subscriber lifecycle/error semantics.

## ERR-012 — Ordering boundary closed negatively
**Status:** CLOSED / NEGATIVE GUARANTEE

EventBus has `NO_ORDERING_GUARANTEE`.

## ERR-013 — Local policy approval pending
**Status:** BLOCKING FOR IMPLEMENTATION / NON-BLOCKING FOR ARCHITECTURAL PREPARATION

A complete proposal now exists for subscriber failure propagation, isolation, scheduling, cancellation, timeout, unsubscribe lifecycle, multiple-subscriber behavior and dispatch completion. These are local observable runtime policies but have not yet been approved by the operator.

## ERR-014 — Premature implementation compatibility risk
**Status:** OPEN / READINESS RISK

Implementing before approval would convert proposed handler lifecycle/error behavior into de facto product behavior and could force consumers to depend on semantics that were never intentionally accepted.

## Recovery traps

- ACK before durable Inbox persistence breaks the contract.
- Retry without idempotency can create duplicate logical effects.
- Replay without causation/correlation breaks traceability.
- Treating WSS reconnect backoff as JobQueue retry policy crosses a transport boundary.
- Treating the proposed EventBus lifecycle policy as approved before human review creates an unauthorized contract.
