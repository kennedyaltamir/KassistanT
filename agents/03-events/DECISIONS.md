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

None. This file intentionally records project decisions and unresolved decisions only; no new architecture is proposed during configuration.
