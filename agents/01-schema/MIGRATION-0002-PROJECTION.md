# IA-01 — Migration 0002 Projection

Status: **DOCUMENTARY PROJECTION / HISTORICAL REFERENCE**
`0002` file: **EXISTS PHYSICALLY BUT IS NON-AUTHORITATIVE**

## 1. Governance status

`GOV-DRIFT-0002` was resolved by Operator Option B. The physical file is retained as evidence only and is not the normative schema baseline.

This document remains a projection of the intended canonical schema. It must not be interpreted as evidence that the physical 0002 file was approved or that a replacement migration is authorized.

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

This order remains subject to approved relationship changes and future implementation-level DDL determinism.

## 3. Frozen contract surfaces

The projection carries these contract-level uniqueness surfaces:

- `Customer(store_id, phone_normalized)`
- `Conversation(store_id, external_thread_id)`
- inbound `Message(store_id, external_message_id)`
- `InboundInbox(provider, external_event_id)`
- `DomainOutbox(idempotency_key)`
- `Order(store_id, display_number)`
- `Device(store_id, id)`

## 4. CONTRACT-001 reconciliation

DomainOutbox ownership is resolved:

- Domain defines event intent.
- IA-03 owns durable Outbox mechanics and worker.
- Business state and event intent share the required atomic boundary where applicable.
- Provider invocation occurs only after durable intent.

This resolves the previous governance blocker but does not authorize DDL or worker implementation.

## 5. Determinism

The canonical migration remains non-executable as a whole because field-level nullability/defaults, parent keys, FK actions and physical encodings remain partially open. This is an implementation/schema readiness limitation, not a reopened governance decision.

## 6. Prohibited interpretation

The physical 0002 file is historical/non-authoritative. No execution, deletion, rename, replacement or new migration is authorized by this document.
