# IA-02 — Decisions

## Approved decisions relevant to IA-02

### D-001 — LLM authority boundary
**Status:** DECISION / APPROVED. LLM output is not authoritative for price, money, persistence, authorization or critical state.

### D-002 — Money representation
**Status:** DECISION / APPROVED. Money uses integer cents and BRL semantics.

### D-003 — Order confirmation milestone
**Status:** DECISION / APPROVED. `CONFIRMED` is the operational sale milestone and confirmed orders freeze price state.

### D-004 — State integrity
**Status:** DECISION / APPROVED. Invalid transitions are rejected and terminal order states do not reopen.

## Open decisions

### D-005 — CONTRACT-001 / DomainOutbox
**Status:** OPEN / NOT APPROVED. Ownership/scope remains ambiguous.

### D-006 — CONTRACT-002 / `order.status_changed`
**Status:** OPEN / NOT APPROVED. Current TypeScript contract includes it; normative status remains unresolved.

### D-007 — GOV-001 / document authority history
**Status:** OPEN / NOT APPROVED.

## D1 proposals — NOT DECISIONS

### P-001 — Order as first aggregate candidate
`Order` is the strongest first-slice candidate, but aggregate ownership is not yet normatively defined.

### P-002 — First increment after lock
A pure Order slice using existing primitives, one complete command and only stable events is the smallest safe implementation target.

No proposal above authorizes implementation or changes global contracts.
