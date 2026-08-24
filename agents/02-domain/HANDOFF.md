# IA-02 — Handoff

## Territory
`packages/domain/**`

## D1 reconciliation result
Domain readiness audit and reconciliation are complete. Runtime implementation remains frozen.

## Canonical inventory closure
- Canonical entity count: **28**.
- The previous D1 count of 29 was a reporting/counting error.
- No 29th entity is evidenced by baseline §23, `docs/domain/entities.md`, contracts or runtime.
- `CANONICAL-ENTITY-INVENTORY.md` is the authoritative IA-02 reconciliation artifact.

## Readiness artifacts
- `DOMAIN-READINESS.md`
- `STATE-TRANSITION-MATRIX.md`
- `DOMAIN-CONTRACT-MATRIX.md`
- `READINESS-GAPS.md`
- `CANONICAL-ENTITY-INVENTORY.md`
- `D1-RECONCILIATION.md`
- `FIRST-DOMAIN-SLICE-READINESS.md`

## Critical findings
- No aggregate root is normatively frozen.
- `Order` is only a candidate root / STRONG_INFERENCE.
- Order, Conversation and Message lifecycle artifacts remain STATE_CATALOG_ONLY.
- Order commands remain PARTIAL; `ConfirmOrder` is BLOCKED by unresolved semantics.
- Domain errors remain conceptual without a final stable code catalog.
- `CONTRACT-001` and `CONTRACT-002` remain blockers for affected implementation; `GOV-001` remains an open governance decision.
- Requested `agents/01-schema/CANONICAL_SCHEMA_AUDIT.md` is absent at the audited ref; this is recorded only as a documentation gap.

## Consumers/dependencies
- IA-01: canonical schema/persistence alignment.
- IA-03: durable event/outbox/inbox infrastructure.
- IA-04: Order Engine orchestration boundary.
- IA-05: Conversation/LLM runtime.
- IA-06: device identity/authentication boundaries.
- IA-07: Gateway/WSS transport boundaries.
- IA-08: UI consumption of domain state and commands.

## D2 gate
The next implementation phase may start only after the selected slice has an explicit aggregate boundary, complete command, normative transition, invariant set, domain errors, event semantics, persistence boundary and deterministic tests. Current first-slice status is **BLOCKED**.
