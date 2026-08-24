# IA-01 — HANDOFF

## Identity

- Agent: **IA-01 — Schema / Canonical SQLite**
- Territory: Canonical SQLite Schema / Persistence Schema Foundation
- Active branch: `Agent01-schema-canonical-sqlite`
- Integration authority: `main`

## Branch reconciliation

The branch now includes current `main` at `86387b02ed55ef3af3b24f1591b3e0b0ff436a30` as a merge parent. The reconciliation merge commit is `456e6661647bba47a3e2dbeb9bc170a276cb61e7` and preserved the IA-01 documentation history without destructive rewrite.

Comparison against current `main` shows only `agents/01-schema/**` differences.

## Current result

Post-D2 Schema Consolidation is **PHYSICALLY BLOCKED / DETERMINISTIC GATE PENDING**.

## Verified state

1. 28 canonical entities remain in scope.
2. No table is currently `DETERMINISTIC`.
3. No table is currently `DETERMINISTIC_AFTER_HUMAN_APPROVAL` under the strict gate.
4. No table is currently `DETERMINISTIC_AFTER_CROSS_AGENT_RESPONSE` under the strict gate.
5. All 28 tables remain blocked because each still depends on one or more unresolved physical conditions.
6. DREQ-001 confirms Order aggregate ownership but does not freeze physical parent keys.
7. DREQ-002 confirms `DRAFT -> CONFIRMED` but does not authorize `order.status_changed` persistence.
8. DREQ-005 and DREQ-006 produce no schema persistence authorization.
9. IA-03 confirms durable Inbox ACK means local `InboundInbox` persistence, but its complete field inventory is still missing.
10. IA-05, IA-06 and IA-07 retain open schema dependencies.
11. `CONTRACT-002` remains non-blocking for physical schema.
12. `GOV-001` remains conditional/deferred.
13. No migration `0002` exists.
14. M5.1 and `0001_bootstrap.sql` remain unchanged.
15. No protected contracts or other agent territories were modified.

## Local decisions

`SD-001..SD-005` remain `PROPOSAL / PENDING OPERATOR APPROVAL`.

## Priority cross-agent closure

- IA-04: exact parent keys/FKs/actions for OrderItem and OrderItemModifier; explicit persistence decision for OrderStatusHistory.
- IA-03: physical field inventory for InboundInbox/Job/Audit and infrastructure idempotency/correlation fields.
- IA-05: Conversation/Message/AIProfile/AIExecution/KnowledgeItem persistence inventory.
- IA-06: Device and secure IntegrationCredential persistence fields.
- Global authority: DomainOutbox ownership/scope/transaction semantics under CONTRACT-001.

## Migration gate

`0002` remains prohibited until included tables are deterministic, local approvals are explicit, cross-agent dependencies are resolved, physical types/nullability/defaults/FK actions/state representation are frozen, and a deterministic-generation review passes.
