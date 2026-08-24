# IA-01 — HANDOFF

## Identity

- Agent: **IA-01 — Schema / Canonical SQLite**
- Territory: Canonical SQLite Schema / Persistence Schema Foundation
- Active branch: `Agent01-schema-canonical-sqlite`
- Integration authority: `main`

## Phase 2.5 result

Schema Decision Package is **COMPLETE / REVIEW REQUIRED**.

## Decision artifacts

- `SCHEMA-DECISION-MATRIX.md`
- `SCHEMA-AUTHORITY-MATRIX.md`
- `TABLE-READINESS-MATRIX.md`
- `CANONICAL-SCHEMA-SPEC.md`
- `MIGRATION-0002-READINESS.md`
- `MIGRATION-0002-PROJECTION.md`

## Verified state

1. 28 canonical entities remain in scope.
2. 3 tables can become ready after local IA-01 physical decisions.
3. 14 require semantic decisions from other agents.
4. DomainOutbox requires global resolution of CONTRACT-001 where physical ownership is affected.
5. 10 tables remain directly blocked by incomplete field/relationship contracts.
6. CONTRACT-002 is currently non-blocking for physical schema.
7. GOV-001 is deferred unless it changes a schema-critical interpretation.
8. M5.1 and `0001_bootstrap.sql` remain unchanged.
9. No `0002` migration exists.
10. No contracts or protected documentation were modified.

## Required human/agent decisions

- Approve/reject IA-01 local physical proposals.
- Provide semantic field/nullability/default decisions through IA-02 and relevant domain agents.
- Provide OrderItem/OrderItemModifier/OrderStatusHistory parent-key decisions through IA-04/IA-02.
- Provide infrastructure field semantics through IA-03.
- Provide Conversation/AI and KnowledgeItem semantics through IA-05/IA-02.
- Provide Device/security persistence semantics through IA-06.
- Resolve CONTRACT-001 globally for affected DomainOutbox physical scope.

## Migration gate

Do not create `0002` until the decision package is approved and the included tables pass deterministic-generation review: a second engineer must be able to produce identical DDL without asking for missing field names, types, nullability, defaults, FK actions, state encoding or ownership semantics.
