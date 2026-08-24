# IA-02 — Decisions

## Approved decisions relevant to IA-02

### D-001 — LLM authority boundary
**Status:** DECISION / APPROVED by baseline.

LLM interpretation is not authoritative over price, money, persistence, authorization or critical state. Domain logic remains deterministic.

### D-002 — Money representation
**Status:** DECISION / APPROVED by documented domain rules.

Money is represented using integer cents and BRL semantics. Floating-point business totals are not authoritative.

### D-003 — Order confirmation milestone
**Status:** DECISION / APPROVED.

`CONFIRMED` is the operational sale milestone; confirmed orders freeze price state under the current invariants.

### D-004 — State integrity
**Status:** DECISION / APPROVED.

Invalid state transitions are rejected and terminal order states do not reopen under the current domain rules.

## Open decisions affecting IA-02

### D-005 — CONTRACT-001 / DomainOutbox
**Status:** OPEN / NOT APPROVED.

The architecture repeatedly treats DomainOutbox as a domain-transaction external-effect boundary, while another baseline section contains conflicting wording. IA-02 must not encode ownership or persistence behavior that depends on resolving this ambiguity.

### D-006 — CONTRACT-002 / `order.status_changed`
**Status:** OPEN / NOT APPROVED.

The baseline contains contradictory statements about this event and the current TypeScript event contract includes it. IA-02 must not normalize or remove the event based on local interpretation.

### D-007 — GOV-001 / document authority history
**Status:** OPEN / NOT APPROVED.

Version-authority/history policy remains unresolved and is outside IA-02's unilateral authority.

## Proposals

No new architectural or global contract proposals are approved in this configuration phase.
