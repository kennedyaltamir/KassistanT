# IA-03 — Decisions

## Approved / established

### D03-001 — Territory
**Status:** DECISION / PROJECT-ASSIGNED

IA-03 owns event infrastructure under `apps/desktop/electron/infrastructure/**` in the events, inbox, outbox, jobs and audit subtrees.

### D03-002 — Governance
**Status:** DECISION / PROJECT-WIDE

`main` is the integration authority. Protected contracts and the approved baseline cannot be redefined locally.

### D03-003 — Durable Inbox ACK boundary
**Status:** DECISION / CONTRACTED

WSS ACK represents durable local persistence of the inbound event in `InboundInbox`; it does not represent completed business processing.

### D03-004 — Readiness sequence
**Status:** DECISION / IA-03 READINESS BASELINE

EventBus → InboundInbox → JobQueue/AuditLog → reliability/recovery integrations → DomainOutbox after `CONTRACT-001` resolution. This is an IA-03 execution sequence, not a new global architecture decision.

### D03-005 — EventBus readiness boundary
**Status:** DECISION / IA-03 READINESS BASELINE

The first candidate is an in-process, post-commit EventBus without persistence, durable retry or DomainOutbox coupling. This is a readiness boundary, not a new global contract.

### D03-006 — EventBus guarantee non-inflation
**Status:** DECISION / IA-03 READINESS BASELINE

IA-03 will not claim global ordering, exactly-once delivery, durable replay or automatic retry for EventBus without explicit protected evidence.

### D03-007 — Event envelope non-expansion
**Status:** DECISION / IA-03 READINESS BASELINE

The runtime must consume the current approved `DomainEvent` shape without silently expanding `packages/contracts/**`. Broader documented envelope metadata may be preserved when actually supplied, but is not locally promoted into a new global contract.

## Open / not approved

### CONTRACT-001 — DomainOutbox ownership and scope
**Status:** OPEN / BLOCKING

The repository contains conflicting descriptions of DomainOutbox. IA-03 must not finalize ownership, schema semantics or transaction boundaries until the project resolves the ambiguity.

### CONTRACT-002 — `order.status_changed`
**Status:** OPEN

The baseline contains contradictory statements while the current contract includes the event. IA-03 must not choose a normative event catalogue locally.

### GOV-001 — Documentation/version authority
**Status:** OPEN

The repository records a version-authority inconsistency. IA-03 must not infer a new normative source.

## Proposals

None. The EventBus closure documents a bounded implementation candidate and does not modify a protected global contract.
