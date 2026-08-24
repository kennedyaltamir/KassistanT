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

Queue limits, retention, exact jitter, some idempotency rules and authorization mappings remain incomplete. Values must not be invented.

## ERR-006 — Cross-agent contract drift
**Status:** OPERATIONAL RISK

IA-03 is consumed by Order, Conversation and transport areas. Shared contract changes require integration authority and cross-agent review.

## ERR-007 — Sensitive data in audit/logging
**Status:** SECURITY RISK

Customer data, conversations, orders and credentials must not be exposed through logs/audit without explicit policy. Secrets must never be committed.

## Recovery traps

- ACK before durable Inbox persistence breaks the contract.
- Retry without idempotency can create duplicate logical effects.
- Replay without causation/correlation breaks traceability.
- Dead-letter state is not a business outcome.
