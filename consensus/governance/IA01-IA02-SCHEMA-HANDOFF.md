# IA-01 → IA-02 Schema Handoff

Status: **SCHEMA_IMPLEMENTATION_READY = FALSE**
Implementation point: `0e1897cae007530cbe8aed20b97e04a25340cc87`

## Current physical contract surface

### Ready at contract level

- Customer identity uniqueness: `(store_id, phone_normalized)`.
- Conversation identity/cardinality: Customer 1:N; internal id distinct from external thread id; `(store_id, external_thread_id)` unique.
- Inbound Message idempotency: `(store_id, external_message_id)` unique.
- Money semantics: integer cents / BRL.
- DomainOutbox ownership and transaction semantics: resolved by CONTRACT-001.
- Migration 0002: preserved historical evidence, non-authoritative.

### Not yet schema-ready

- Final Customer nullability/defaults.
- Conversation SQL state/ownership/AI-state encoding and nullability/defaults.
- Message physical direction/type/lifecycle/provider-state/correlation representation.
- Full InboundInbox field contract.
- Canonical Product/Order DDL mapping versus historical 0002 physical names.
- Order customer/conversation relationship fields and child-key closure.
- FK delete/update actions.
- Inventory/InventoryMovement semantic contract.
- Sale semantic contract and uniqueness.
- Complete DomainOutbox physical field contract.

## IA-02 implementation rule

IA-02 may implement only against a frozen semantic + physical contract. A missing field, relationship, enum, default, retry state or uniqueness rule must not be invented in implementation code.

## Migration rule

Do not execute or alter 0002. Do not create an executable replacement migration from this handoff. A future migration is permitted only after the remaining physical blockers are closed.

## Readiness

`SCHEMA_IMPLEMENTATION_READY = FALSE`.

This is a schema authority blocker, not a runtime blocker caused by implementation failure.

## Next owner

IA-02 can proceed only with the already-authorized semantic slices whose persistence contract is complete; the complete Core Commerce persistence surface remains blocked until the listed schema authority gaps are closed.
