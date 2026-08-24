# IA-03 — Errors / Risks / Traps

## ERR-001 — CONTRACT-001: DomainOutbox ambiguity
**Status:** OPEN / BLOCKING

Do not finalize DomainOutbox ownership, behavior, schema semantics or transaction boundaries until resolved.

## ERR-002 — CONTRACT-002: `order.status_changed` ambiguity
**Status:** OPEN

IA-03 must not assume the event is definitively required or forbidden.

## ERR-003 — Runtime absence
**Status:** CLOSED FOR EVENTBUS V1 / OPEN FOR REMAINING INFRASTRUCTURE

EventBus V1 is implemented. InboundInbox, DomainOutbox, JobQueue and AuditLog runtime remain unimplemented.

## ERR-004 — Documentation is not implementation evidence
**Status:** OPERATIONAL RULE

Completion claims require executable implementation and tests.

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
**Status:** CLOSED / V1 BOUNDARY

EventBus V1 is in-process/post-commit, non-durable, has no durable retry and exposes `NO_ORDERING_GUARANTEE`.

## ERR-009 — Persistence model duplication
**Status:** OPEN / INVARIANT

Do not create temporary Inbox/Outbox/Job/Audit schema outside IA-01 canonical persistence.

## ERR-010 — Reliability policy invention
**Status:** OPEN / INVARIANT

Do not invent retry counts, job backoff, leases, timeout values, retention or dead-letter transitions.

## ERR-011 — EventBus runtime gate incomplete
**Status:** CLOSED FOR V1

The operator approved the local subscriber lifecycle/error policies and the V1 runtime was implemented accordingly.

## ERR-012 — Ordering boundary closed negatively
**Status:** CLOSED / NEGATIVE GUARANTEE

EventBus has `NO_ORDERING_GUARANTEE`.

## ERR-013 — Local policy approval pending
**Status:** CLOSED

EBUS-DEC-001 through EBUS-DEC-008 were explicitly approved and recorded as IA-03 local decisions.

## ERR-014 — Premature implementation compatibility risk
**Status:** CLOSED FOR EVENTBUS V1

Implementation began only after explicit policy approval.

## ERR-015 — Test runner scope
**Status:** OBSERVABILITY / TOOLING LIMITATION

The standard desktop test runner does not enumerate the EventBus test automatically. Its configuration is outside IA-03 scope.

## ERR-016 — Fresh validation unavailable in current environment
**Status:** NOT_VERIFIED

The requested fresh EventBus test re-execution could not be completed because the current environment does not have `tsx` installed. An `npx` attempt could not complete without network/package availability. No new test result is claimed for this session.

## ERR-017 — Remote CI status unavailable
**Status:** NOT_VERIFIED

The remote status lookup for the current branch head returned zero statuses. This is not evidence of CI success.

## Recovery traps

- ACK before durable Inbox persistence breaks the contract.
- Retry without idempotency can create duplicate logical effects.
- Replay without causation/correlation breaks traceability.
- Treating WSS reconnect backoff as JobQueue retry policy crosses a transport boundary.
- Treating EventBus execution order as a public ordering guarantee is forbidden.
