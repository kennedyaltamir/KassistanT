# IA-01 — HANDOFF

## Identity

- Agent: **IA-01 — Schema / Canonical SQLite**
- Territory: Canonical SQLite Schema / Persistence Schema Foundation
- Active branch: `Agent01-schema-canonical-sqlite`
- Integration authority: `main`

## Current result

Parallel Schema Continuation is **PARTIALLY RESOLVED / WAITING FOR PHYSICAL CLOSURE**.

## Verified state

1. 28 canonical entities remain in scope.
2. No table is currently `DETERMINISTIC`.
3. 3 tables (`store`, `product_image`, `log`) become deterministic after the five IA-01 local physical proposals are approved.
4. 14 tables require cross-agent semantic closure in addition to the local physical conventions.
5. `domain_outbox` requires global resolution of `CONTRACT-001` where physical ownership/scope is affected.
6. 10 tables remain directly blocked by incomplete field/relationship semantics.
7. DREQ-001 confirms Order aggregate ownership but does not freeze physical parent keys.
8. DREQ-002 confirms `DRAFT -> CONFIRMED` but does not authorize `order.status_changed` persistence.
9. DREQ-005 and DREQ-006 produce no schema persistence authorization.
10. IA-03 confirms durable Inbox ACK means local `InboundInbox` persistence, but its complete field inventory is still missing.
11. IA-05, IA-06 and IA-07 retain open schema dependencies.
12. `CONTRACT-002` remains non-blocking for physical schema.
13. `GOV-001` remains conditional/deferred.
14. No migration `0002` exists.
15. M5.1 and `0001_bootstrap.sql` remain unchanged.
16. No protected contracts or other agent territories were modified.

## Local decisions

`SD-001..SD-005` remain `PROPOSAL / PENDING OPERATOR APPROVAL`.

## Priority cross-agent closure

- IA-04: exact parent keys/FKs/actions for OrderItem and OrderItemModifier; explicit persistence decision for OrderStatusHistory.
- IA-03: physical field inventory for InboundInbox/Job/Audit and infrastructure idempotency/correlation fields.
- IA-05: Conversation/Message/AIProfile/AIExecution/KnowledgeItem persistence inventory.
- IA-06: Device and secure IntegrationCredential persistence fields.
- Global authority: DomainOutbox ownership/scope/transaction semantics under CONTRACT-001.

## Migration gate

`0002` remains prohibited until all included tables are deterministic, local approvals are explicit, cross-agent dependencies are resolved, physical types/nullability/defaults/FK actions/state representation are frozen, and a deterministic-generation review passes.
