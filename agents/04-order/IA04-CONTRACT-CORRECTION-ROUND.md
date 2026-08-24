# IA-04 — Contract Correction Round

Status: **BLOCKED / READY_FOR_IA01_AUDIT**

## Audit point

- Repository: `kennedyaltamir/KassistanT`
- Operational branch audited: `MVP2`
- Current `MVP2` HEAD: `0bea2a0ca7c52729cfd58bebc8cd568373222230`
- IA-04 documentation branch: `architecture/mvp-contract-closure`
- Integration target: `main`
- Main HEAD: `86387b02ed55ef3af3b24f1591b3e0b0ff436a30`

## Round objective

Formalize the schema governance blocker `GOV-DRIFT-0002`, record the unrelated probe artifact finding, and make every affected downstream domain explicit about the exact schema decision required before further closure.

No functional implementation, migration modification or business-policy invention is performed in this round.

---

# Contract Package 1 — Canonical Schema Governance

## Requirement

The MVP2 schema must have one explicit normative authority and a deterministic physical realization. Physical migration presence must not be treated as approval.

## Current state

Migration `0002_c1_product_order.sql` physically exists and advances `_schema_metadata.schema_version` to `0002`. The current schema readiness evidence still classifies `0002` as prohibited/pending decision. The repository therefore has physical state without corresponding normative authorization.

## Contract boundary

Global project governance decides the normative status of migration `0002`. IA-01 owns physical SQLite realization after semantic and normative decisions are explicit. Domain agents own semantic meaning for their entities.

## Invariants

1. Physical migration existence never implies normative approval.
2. A prohibited migration cannot be consumed as the canonical schema by downstream implementation.
3. Approved semantics must exist before IA-01 freezes corresponding physical schema.
4. The normative baseline and physical state must be reconcilable and auditable.

## Persistence dependency

Migration `0002` and the existing schema-readiness package are the immediate persistence evidence. No new migration may be created in this round.

## Blocking decision

`GOV-DRIFT-0002`: select the normative status of the existing migration: approve existing, deprecate/reject existing, or replace with a separately authorized migration.

## Authority

Global project governance / Operator for normative status; IA-01 for physical realization after approval.

## Evidence

- `agents/01-schema/GOV-DRIFT-0002-DECISION-PACKAGE.md`
- `agents/01-schema/MIGRATION-0002-READINESS.md`
- `agents/01-schema/SCHEMA-AUTHORITY-MATRIX.md`
- `apps/desktop/database/migrations/0002_c1_product_order.sql`

## Unblock condition

Explicit governance decision, official record, semantic/physical reconciliation, and deterministic schema review.

## Downstream impact

Blocks all domains whose persistence semantics would rely on the authority or contents of `0002`.

## Required next artifact

An authoritative governance decision record resolving `GOV-DRIFT-0002`, followed by an IA-01 schema reconciliation artifact.

---

# Contract Package 2 — Customer Identity

## Requirement

Customer identity must be persistent, deterministic and distinct from transport identity.

## Current state

`Customer` remains cross-agent/schema dependent. The current schema evidence does not establish a complete canonical Customer field inventory, uniqueness scope or final transport-to-customer resolution key.

## Contract boundary

Transport identity is an external identity input. Identity resolution belongs to the domain/application boundary. Customer persistence is canonical domain state.

## Invariants

1. Transport identity must not be elevated to Customer identity by assumption.
2. Duplicate logical Customer creation must be prevented under the approved identity key.
3. Customer identity must survive restart and persistence reload.
4. Unknown identity must have an explicit contracted outcome.

## Persistence dependency

Requires an approved `customer` table field inventory, unique identity key, store scope, nullability/defaults and FK relationships.

## Blocking decision

The schema decision must explicitly freeze the canonical Customer identity fields and uniqueness scope. `GOV-DRIFT-0002` must be resolved before using a migration baseline as authority.

## Authority

IA-02 / relevant semantic owner for Customer meaning; IA-01 for physical realization; transport identity owners only provide external identifiers.

## Evidence

- `agents/01-schema/SCHEMA-AUTHORITY-MATRIX.md`
- `agents/01-schema/MIGRATION-0002-READINESS.md`
- `agents/02-domain/HANDOFF.md`
- `agents/02-domain/DOMAIN-CONTRACT-MATRIX.md`

## Unblock condition

Canonical Customer contract plus deterministic physical field/constraint inventory approved and reconciled with schema governance.

## Downstream impact

Conversation, Order, Campaign and Sale/customer-context consumers depend on Customer identity stability.

## Required next artifact

Customer persistence decision package owned by the semantic authority and reconciled by IA-01.

---

# Contract Package 3 — Conversation

## Requirement

Conversation must have an independent persistent identity, explicit Customer relation and explicit transport relation/lifecycle.

## Current state

Conversation persistence is not fully deterministic. The contract matrix does not close transport identity cardinality, complete field inventory or lifecycle ownership sufficiently for implementation.

## Contract boundary

Conversation is domain state. Transport identity is an external identity relation. Customer relation is a domain association and must not be derived from database constraints alone.

## Invariants

1. Conversation identity is distinct from transport identifiers.
2. Conversation-to-Customer relation is explicit.
3. Transport-to-Conversation cardinality is explicit before persistence is frozen.
4. Conversation lifecycle and AI ownership semantics are explicit before runtime implementation.

## Persistence dependency

Requires canonical `conversation` fields, transport relation, Customer FK/ownership, lifecycle state representation and required unique constraints.

## Blocking decision

Freeze the schema-relevant cardinality and key structure for transport identity ↔ Conversation and Conversation ↔ Customer. Migration governance must first define which physical baseline is authoritative.

## Authority

IA-02 + IA-05 for semantics; IA-01 for physical realization.

## Evidence

- `agents/01-schema/SCHEMA-AUTHORITY-MATRIX.md`
- `agents/01-schema/MIGRATION-0002-READINESS.md`
- `agents/02-domain/DOMAIN-CONTRACT-MATRIX.md`

## Unblock condition

Approved lifecycle/cardinality contract plus deterministic physical field/FK/uniqueness model.

## Downstream impact

Message, AI execution, handoff, Campaign attribution and inbound processing depend on Conversation identity.

## Required next artifact

Conversation persistence decision package with cardinality and lifecycle closure.

---

# Contract Package 4 — Inventory

## Requirement

Inventory must be persistent authority for current stock and deterministic movement history, with safe concurrent mutation and replay protection.

## Current state

The current `0002` migration creates `product` but does not establish a canonical inventory quantity/movement model. The schema readiness matrix also leaves Product semantics cross-agent and does not establish a deterministic Inventory persistence contract.

## Contract boundary

Product catalog state and Inventory state are related but not interchangeable. Stock mutation must be owned by a persistence boundary capable of serializing the invariant.

## Invariants

1. Persisted stock is authoritative.
2. A successful stock mutation cannot be applied twice for one logical idempotent operation.
3. Concurrent consumers cannot both consume the same last available quantity.
4. Inventory movement remains auditable and attributable.

## Persistence dependency

Requires explicit Product/Inventory/InventoryMovement fields, quantity semantics, movement type, operation identity, reference fields, store scope, uniqueness and concurrency strategy.

## Blocking decision

Decide whether the approved MVP schema includes Inventory as a first-class persisted model and freeze its exact fields and mutation identity before implementation.

## Authority

IA-02/domain semantics with IA-04 for Order↔Inventory boundary; IA-01 for physical realization.

## Evidence

- `agents/01-schema/MIGRATION-0002-READINESS.md`
- `agents/04-order/ORDER-ENGINE-READINESS.md`
- physical `0002` migration containing Product only

## Unblock condition

Inventory semantic contract plus deterministic schema/mutation boundary and concurrency/idempotency specification.

## Downstream impact

Order confirmation, sales persistence, retry/recovery and customer-facing availability depend on this contract.

## Required next artifact

Inventory Contract Package with physical schema requirements and concurrency/idempotency matrix.

---

# Contract Package 5 — Order ↔ Inventory

## Requirement

Order confirmation and mandatory inventory mutation must have one deterministic business boundary without duplicate stock/sale effects.

## Current state

Current Order semantic decisions now establish `Order` as aggregate root, `OrderItem` and `OrderItemModifier` as aggregate-owned, and `DRAFT -> CONFIRMED` via `ConfirmOrder`, emitting `order.confirmed`. These decisions do not freeze physical parent keys, FK actions, complete schema or Inventory mutation semantics.

## Contract boundary

Order owns order invariants. Inventory owns stock invariants. The application/transaction boundary coordinates both. Exact atomicity across them is not yet approved.

## Invariants

1. A commercially confirmed operation cannot imply a successful stock mutation that did not occur when stock is mandatory.
2. Retry cannot duplicate inventory or sale effects.
3. Concurrency cannot oversell the same stock.
4. Failure recovery is deterministic and observable.

## Persistence dependency

Requires approved Order/OrderItem/OrderItemModifier physical parent keys and FKs, plus an approved Inventory persistence model and transaction boundary.

## Blocking decision

Freeze the cross-domain transaction boundary: whether confirmation and stock mutation are atomic, reservation-based, or coordinated through a durable workflow, and which persisted records constitute the commit point.

## Authority

IA-04 + IA-02 for Order semantics; Inventory semantic authority for stock; IA-01 for physical realization; IA-03 when durable external effects are involved.

## Evidence

- `agents/01-schema/SCHEMA-DECISION-MATRIX.md`
- `agents/04-order/ORDER-ENGINE-READINESS.md`
- `agents/04-order/HANDOFF.md`
- `agents/01-schema/MIGRATION-0002-READINESS.md`

## Unblock condition

Approved cross-domain transaction/recovery contract plus deterministic physical schema.

## Downstream impact

Sale persistence, Outbox/delivery, recovery and customer confirmation depend on it.

## Required next artifact

Order↔Inventory transaction-boundary decision package.

---

# Contract Package 6 — Inbox / Outbox

## Requirement

Inbound events and outbound effects must be durable, idempotent, recoverable and externally reconciliable.

## Current state

IA-03 has established the durable ACK boundary concept for `InboundInbox`. Exact canonical fields, processing-state catalogue and DomainOutbox ownership remain incomplete. `CONTRACT-001` remains a global decision.

## Contract boundary

Inbox is durable intake before business processing. Outbox is durable external-effect intent. Provider acknowledgement is not equivalent to local persistence state.

## Invariants

1. No ACK before required durable intake commit.
2. Duplicate inbound delivery cannot duplicate business processing.
3. Local outbox identity is distinct from provider idempotency.
4. Uncertain external effects require deterministic reconciliation semantics.
5. Exactly-once is never claimed without provider capability supporting it.

## Persistence dependency

Requires canonical `inbound_inbox`, `job`, `audit_log` and, subject to `CONTRACT-001`, `domain_outbox` fields, state model, uniqueness keys and claim/recovery fields.

## Blocking decision

For Inbox: freeze the exact canonical deduplication key and recovery state schema. For Outbox: resolve global ownership/scope/transaction semantics before physical schema is frozen.

## Authority

IA-03 for Inbox/outbox reliability semantics; global project governance for DomainOutbox ownership; IA-01 for physical schema.

## Evidence

- `agents/03-events/INBOX-OUTBOX-MATRIX.md`
- `agents/01-schema/SCHEMA-AUTHORITY-MATRIX.md`
- `agents/01-schema/MIGRATION-0002-READINESS.md`

## Unblock condition

IA-03 contract closure for Inbox plus global `CONTRACT-001` decision for DomainOutbox, followed by deterministic schema reconciliation.

## Downstream impact

Recovery, Gateway integration, external effects, audit and business-event delivery depend on these boundaries.

## Required next artifact

IA-03 Inbox/Outbox schema decision package and global DomainOutbox decision record.

---

# Contract Package 7 — Recovery

## Requirement

Restart, crash and interrupted-workflow behavior must converge deterministically without duplicate business or external effects.

## Current state

Recovery state semantics depend on unresolved Inbox/Outbox/Job lifecycle and persistence fields. Existing checklists identify required states conceptually but do not authorize a final physical model.

## Contract boundary

Recovery owns restart/reclaim/reconciliation semantics. It does not create new business authority and does not substitute for Inbox/Outbox contracts.

## Invariants

1. Stale work cannot remain permanently claimed without an explicit terminal/recovery outcome.
2. Restart must not create duplicate business effects.
3. An external effect whose provider outcome is uncertain must be distinguishable from a locally failed operation.
4. Recovery transitions must be persisted when the workflow is durable.

## Persistence dependency

Requires finalized Job/Inbox/Outbox state fields, claim timestamps/ownership, attempt/retry information and terminal/recovery state representation.

## Blocking decision

Freeze the durable recovery state machine and ownership/claim fields after Inbox/Outbox semantics are closed.

## Authority

IA-03 for durable infrastructure semantics; relevant domain owner for business recovery; IA-01 for physical realization.

## Evidence

- `agents/03-events/INBOX-OUTBOX-MATRIX.md`
- `agents/03-events/JOBQUEUE-RELIABILITY-MATRIX.md`
- `agents/01-schema/MIGRATION-0002-READINESS.md`

## Unblock condition

Final durable workflow state machine and deterministic physical claim/recovery schema.

## Downstream impact

All durable workflows, particularly Order, inbound processing and outbound delivery.

## Required next artifact

Recovery Contract Package with durable state transition and reclaim matrix.

---

# Contract Package 8 — Multimodal Persistence

## Requirement

Original message, media reference, transcription and derived interpretation must remain traceable without confusing source content with derived interpretation.

## Current state

The canonical entities and persistence fields required for multimodal artifacts are not fully frozen. Current migration `0002` does not establish the complete multimodal model.

## Contract boundary

Original message is source-of-record. Media, transcription and derived interpretation are linked artifacts with independent processing state and failure semantics.

## Invariants

1. Derived interpretation never replaces the original message.
2. Artifact relations remain traceable to the Conversation/message context.
3. Processing failure does not destroy the source artifact.
4. Retention rules are applied consistently once defined.

## Persistence dependency

Requires approved Message/media/transcription/derived-artifact fields, storage references, processing states, failure state and retention classification.

## Blocking decision

Freeze the canonical multimodal field inventory and retention semantics before schema generation.

## Authority

IA-05 + IA-02 for message/AI semantic meaning; IA-01 for physical realization; provider/storage owners for external media references.

## Evidence

- `agents/01-schema/MIGRATION-0002-READINESS.md`
- `agents/01-schema/SCHEMA-AUTHORITY-MATRIX.md`
- current domain entity inventory in `agents/02-domain/CANONICAL-ENTITY-INVENTORY.md`

## Unblock condition

Approved multimodal persistence model plus deterministic storage/reference schema and retention policy.

## Downstream impact

Conversation, AI execution, audit, recovery and privacy/retention controls depend on it.

## Required next artifact

Multimodal persistence decision package owned by IA-05/IA-02 and reconciled by IA-01.

---

# Global dependency rule

`GOV-DRIFT-0002` is a schema-governance prerequisite, but its resolution does not automatically close every downstream domain. Each domain must separately satisfy its semantic contract and physical determinism conditions.

# No READY_FOR_IA03

No package in this correction round is promoted to `READY_FOR_IA03`.

# Required IA-01 audit inputs

1. `agents/01-schema/GOV-DRIFT-0002-DECISION-PACKAGE.md`
2. `agents/01-schema/PROBE-ARTIFACT-FINDING.md`
3. This document: `agents/04-order/IA04-CONTRACT-CORRECTION-ROUND.md`
4. Updated `agents/04-order/HANDOFF.md`

## Round conclusion

The contract correction round has converted the original blocker statements into explicit requirement/boundary/invariant/persistence/authority/evidence/unblock packages. The unresolved decisions remain intentionally unresolved and are ready for independent IA-01 audit and normative authority review.
