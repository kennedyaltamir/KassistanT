# IA-01 — HANDOFF

## Identity

- Agent: **IA-01 — Schema / Canonical SQLite**
- Territory: Canonical SQLite Schema / Persistence Schema Foundation
- Active branch: `Agent01-schema-canonical-sqlite`
- Integration authority: `main`

## Current result

Cross-Agent Response Consolidation is **WAITING FOR ACTUAL OWNER / OPERATOR RESPONSES**.

## Verified state

1. 28 canonical entities remain in scope.
2. 3 tables require only local IA-01 physical approvals.
3. 14 require semantic decisions from other agents.
4. `DomainOutbox` remains the localized global blocker under `CONTRACT-001`.
5. 10 tables remain directly blocked by incomplete field/relationship contracts.
6. `CONTRACT-002` is currently non-blocking for physical schema.
7. `GOV-001` remains deferred unless a real source conflict changes schema interpretation.
8. No owner response was supplied in the current execution input.
9. No decision was promoted to APPROVED.
10. No table was promoted to READY.
11. No migration `0002` exists.
12. M5.1 and `0001_bootstrap.sql` remain unchanged.

## Response validation rule

A response is accepted only when it contains enough evidence to resolve the exact requested decision and does not conflict with another authoritative response. Assertive language such as READY/APPROVED/COMPLETE is not evidence by itself.

## Required next responses

- IA-02: domain nullability/defaults, lifecycle/state semantics, store scoping.
- IA-03: Inbox, Outbox, Job, Audit, correlation/idempotency semantics.
- IA-04: OrderItem, OrderItemModifier, OrderStatusHistory and Order persistence semantics.
- IA-05: Conversation/Message, AIProfile/AIExecution, KnowledgeItem semantics.
- IA-06: Device/Store identity and lifecycle persistence.
- IA-07: Gateway/Desktop persistence boundary relevant to `CONTRACT-001`.
- Operator/project authority: approve/reject SD-001..SD-005 and resolve `CONTRACT-001` where schema is affected.

## Migration gate

Do not create `0002` until actual responses are validated, conflicts are resolved, all schema-critical physical decisions are frozen, and deterministic-generation review confirms that another engineer can produce identical DDL without interpretation.
