# IA-01 — Migration 0002 Projection

Status: **DOCUMENTARY PROJECTION ONLY**  
`0002` file: **NOT CREATED**

## Purpose

Project the deterministic shape of the future canonical migration without implementing it.

## Proposed dependency order

1. `store`
2. `device`
3. `settings`
4. `product_category`
5. `product`
6. `product_modifier`
7. `product_image`
8. `promotion`
9. `customer`
10. `customer_address`
11. `conversation`
12. `message`
13. `payment_method`
14. `integration`
15. `integration_credential`
16. `knowledge_item`
17. `order`
18. `order_item`
19. `order_item_modifier`
20. `order_status_history`
21. `inbound_inbox`
22. `job`
23. `audit_log`
24. `log`
25. `ai_profile`
26. `ai_execution`
27. `notification`
28. `domain_outbox`

This order is a proposal derived from explicit parent/child relationships. It must be revisited if the approved physical relationships change.

## Projection phases

### Phase A — Base/root tables

Create Store and any independently defined global/root structures whose field contracts are complete.

### Phase B — Store-scoped catalog/customer structures

Create Device, Settings, ProductCategory, Product, ProductModifier, ProductImage, Promotion, Customer, CustomerAddress and KnowledgeItem only after field contracts are complete.

### Phase C — Conversation/message structures

Create Conversation and Message after physical state/reference representations are frozen.

### Phase D — Order structures

Create PaymentMethod, Order, OrderItem, OrderItemModifier and OrderStatusHistory only after parent key names, snapshot identity and physical lifecycle representation are frozen.

### Phase E — Reliability/integration structures

Create InboundInbox, Job, AuditLog, Log and Notification once their complete physical field contracts exist.

### Phase F — AI structures

Create AIProfile and AIExecution after their exact persistence decomposition is frozen.

### Phase G — Outbox

Create DomainOutbox only after CONTRACT-001 is resolved wherever its physical ownership changes schema.

## Index projection

The future migration must contain the seven contract-required unique indexes/constraints:

- Customer `(store_id, phone_normalized)`
- Conversation `(store_id, external_thread_id)`
- Message `(store_id, external_message_id)`
- InboundInbox `(provider, external_event_id)`
- DomainOutbox `(idempotency_key)`
- Order `(store_id, display_number)`
- Device `(store_id, id)`

No additional performance indexes are included in this projection.

## Transaction projection

The future migration must execute through the existing M5.1 migration runner and preserve its deterministic ordering, checksum recording, idempotent application and transaction boundary. No change to those mechanisms is projected.

## Foreign-key projection

The future migration must create FKs only from the frozen relationship matrix. Any relation whose source/target field or delete/update behavior remains UNKNOWN must be excluded or remain blocked rather than inferred during implementation.

## Rollback/recovery projection

No ad hoc rollback SQL is assumed. Schema upgrade/recovery behavior must follow the existing migration/backup contracts. Destructive or irreversible behavior requires explicit approved migration semantics before implementation.

## Determinism test

The projection is considered complete only when the specification contains enough information for another engineer to generate identical SQL without choosing:

- table names;
- missing parent keys;
- nullability;
- defaults;
- enum encoding;
- FK actions;
- credential storage semantics;
- missing field types.

The current specification fails that deterministic-generation test; therefore `0002` remains prohibited.
