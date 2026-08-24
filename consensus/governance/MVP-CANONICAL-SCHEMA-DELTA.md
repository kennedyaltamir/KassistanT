# MVP Canonical Schema Delta — IA-01

Status: **DESIGN / PARTIALLY CLOSABLE**
Implementation point: `0e1897cae007530cbe8aed20b97e04a25340cc87`

## Purpose

Define the physical schema delta required after the Operator decisions without turning unresolved semantic candidates into authoritative business rules.

## Frozen surfaces

| Entity | Frozen physical contract surface | Remaining physical work | Status |
|---|---|---|---|
| Customer | `(store_id, phone_normalized)` uniqueness; Customer identity boundary | nullability/defaults; final PK representation | PARTIAL |
| Conversation | `Customer 1:N`; `id != external_thread_id`; `(store_id, external_thread_id)` uniqueness; `customer_id` relation | state encoding; nullability/defaults; FK actions | PARTIAL |
| Message | inbound `(store_id, external_message_id)` uniqueness; `conversation_id` relation | direction/type/lifecycle encoding; nullability/defaults; provider/error representation | PARTIAL |
| InboundInbox | `(provider, external_event_id)` uniqueness | complete persistence/reconciliation fields | BLOCKED |
| Product | existing Product persistence is evidence only | canonical logical/physical field reconciliation | BLOCKED |
| Order | existing Order persistence is evidence only; money = integer cents/BRL | canonical field mapping; state encoding; child keys; FK actions | BLOCKED |
| OrderItem | snapshot semantics exist conceptually | authoritative parent key and exact physical fields | BLOCKED |
| OrderItemModifier | snapshot semantics exist conceptually | authoritative parent key and exact physical fields | BLOCKED |
| Inventory | candidate supplied by current task only | normative semantic contract required | BLOCKED_BY_AUTHORITY |
| InventoryMovement | candidate supplied by current task only | normative semantic contract required | BLOCKED_BY_AUTHORITY |
| Sale | candidate supplied by current task only | normative semantic contract required | BLOCKED_BY_AUTHORITY |
| DomainOutbox | idempotency concept and ownership resolved by CONTRACT-001 | physical field inventory; status/retry encoding | PARTIAL |

## Existing physical conflict

Migration 0002 currently uses physical names such as `price_amount_cents`, `price_currency`, `total_amount_cents` and `total_currency`, while canonical logical documentation uses names such as `price_cents`, `currency`, `total_cents`.

Because 0002 is explicitly non-authoritative historical evidence, this is classified as **RECONCILIATION GAP**, not as a reason to silently rewrite history.

## Canonical invariants carried into schema

- Store scoping remains explicit where the contract establishes it.
- Money is represented as integer cents with BRL semantics.
- Transport identifiers are not canonical business identity by default.
- Inbound message idempotency is store-scoped.
- DomainOutbox durable delivery occurs only after durable intent.

## Not authorized by this artifact

This artifact does not authorize migration creation/execution, schema mutation, Inventory/Sale semantic promotion, merge or production release.
