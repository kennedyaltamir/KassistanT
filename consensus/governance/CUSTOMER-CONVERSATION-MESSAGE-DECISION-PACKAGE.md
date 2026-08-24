# Customer / Conversation / Message — Decision Package

Status: **FORMALLY_FROZEN**
Authority: `OPERATOR_PROJECT_GOVERNANCE`
Effective from: `2026-08-24T19:52:00-03:00`
Decision record: `consensus/governance/OPERATOR-DECISIONS-2026-08-24.xml`

## Customer Identity

**Decision:** Approve `(store_id, phone_normalized)` as the canonical Customer identity key.

**Invariant:** same `store_id` + same normalized phone = same canonical Customer.

**Policy:** WhatsApp transport identity -> normalized phone -> identity resolution -> canonical Customer.

**Non-scope:** cross-channel identity stitching; automatic customer merging; identity graph; provider-specific identity as canonical business identity.

## Conversation

**Decision:** Approve `Customer 1 -> N Conversation`.

**Identity rule:** `Conversation.id` is distinct from `external_thread_id`.

**Uniqueness:** `UNIQUE(store_id, external_thread_id)`.

**Non-scope:** cross-channel conversation merge; automatic conversation stitching; multi-channel identity graph.

## Message

**Decision:** Approve inbound-provider message idempotency scoped by store.

**Uniqueness:** `UNIQUE(store_id, external_message_id)` applies to inbound provider messages.

Outbound message identity is intentionally not frozen by this decision and requires a separate explicit contract before implementation depends on it.

## Cross-entity invariants

1. Transport identifiers are not canonical business identities by default.
2. Store scoping is explicit.
3. Implementation cannot alter these invariants by inference.
4. Cross-channel identity stitching is not authorized.
5. The inbound Message uniqueness rule is an idempotency boundary, not a universal outbound identity rule.

## Impact

These decisions affect Customer, Conversation and Message persistence contracts, Inbox/InboundInbox idempotency, and downstream domain/runtime consumers.

## Evidence

`docs/domain/entities.md`; `agents/02-domain/CANONICAL-ENTITY-INVENTORY.md`; `consensus/governance/OPERATOR-DECISIONS-2026-08-24.xml`.

## Release Consequence

Customer Identity, Conversation Contract and Message Contract are formally frozen for the stated scope. IA-01 post-decision reconciliation is complete for these contracts; remaining implementation-level schema gaps do not reopen the normative decisions.
