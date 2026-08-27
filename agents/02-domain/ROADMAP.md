# IA-02 — Domain Runtime Roadmap

## D0 — Territory configuration
**DONE**

## D1 — Contract lock and domain readiness
**DONE / BLOCKED FOR D2 IMPLEMENTATION**

Completed audit artifacts:
- `DOMAIN-READINESS.md`
- `STATE-TRANSITION-MATRIX.md`
- `DOMAIN-CONTRACT-MATRIX.md`
- `READINESS-GAPS.md`

Current blockers:
- `CONTRACT-001` DomainOutbox ownership/scope.
- `CONTRACT-002` `order.status_changed` normative status.
- Aggregate boundaries and lifecycle transition matrices are still incomplete.
- Canonical command/query/error semantics remain partial.

## D2 — Domain model foundation
**NOT_STARTED**

Gate requires an approved first slice with explicit aggregate boundary, transitions, command contract, domain errors and stable events.

## D3 — Business rules
**NOT_STARTED**

## D4 — Domain test suite
**NOT_STARTED**

## D5 — Integration handoff
**NOT_STARTED**

The roadmap does not authorize implementation before the D2 gate is satisfied.
