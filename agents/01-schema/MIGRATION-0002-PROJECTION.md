# IA-01 — Migration 0002 Projection

Status: **DOCUMENTARY PROJECTION ONLY**
`0002` file: **NOT CREATED**

## 1. Gate

This projection does not authorize implementation. The future migration may be emitted only after the schema decision package is approved and all included tables are deterministic.

## 2. Dependency order

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

This order remains subject to approved relationship changes. `domain_outbox` is deliberately last because CONTRACT-001 can affect its physical scope.

## 3. Decision prerequisites by group

### Locally closable after operator confirmation

`store`, `product_image`, `log` and other tables whose semantic fields are already complete can use the approved IA-01 physical convention once confirmed.

### Cross-agent closure required

Device/catalog/customer/conversation/message/order/infrastructure/AI tables require semantic-owner decisions before DDL.

### Global closure required

`domain_outbox` requires CONTRACT-001 resolution wherever the physical ownership model changes the schema.

## 4. Required indexes/constraints

The projection includes only the seven contract-required uniqueness constraints:

- `Customer(store_id, phone_normalized)`
- `Conversation(store_id, external_thread_id)`
- `Message(store_id, external_message_id)`
- `InboundInbox(provider, external_event_id)`
- `DomainOutbox(idempotency_key)`
- `Order(store_id, display_number)`
- `Device(store_id, id)`

No performance-only index is assumed.

## 5. FK projection

Create only frozen FKs with frozen source/target field names. Parent-key gaps on `OrderItem`, `OrderItemModifier`, and `OrderStatusHistory` remain explicit blockers. No `ON DELETE` or `ON UPDATE` action is projected until approved.

## 6. Status/state projection

Persist semantic state values only after the semantic owner confirms the physical encoding. No invented SQL enum lookup tables or CHECK constraints are part of this projection.

## 7. Transaction/runtime projection

The migration must use the existing M5.1 migration runner and preserve deterministic discovery, checksum integrity, idempotent application and transaction boundaries. No runtime modification is projected.

## 8. Current determinism result

A second engineer cannot yet generate identical DDL from the current package without asking for unresolved field definitions, parent keys, nullability/defaults, FK actions and physical status encoding. Therefore the projection is intentionally non-executable and `0002` remains prohibited.
