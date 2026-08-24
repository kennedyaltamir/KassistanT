# IA-01 — Entity Physical Map

Phase 2 physical-name proposal. No name in this document is project-approved unless later adopted through governance.

| # | Entity | Proposed table | Scope | Readiness | Principal blocker |
|---:|---|---|---|---|---|
| 1 | Store | `store` | GLOBAL ROOT | BLOCKED | TABLE-NAMING + physical types |
| 2 | Device | `device` | STORE_SCOPED | BLOCKED | TABLE-NAMING + status/nullability |
| 3 | Settings | `settings` | UNKNOWN | BLOCKED | FIELD-GAPS |
| 4 | ProductCategory | `product_category` | UNKNOWN | BLOCKED | FIELD-GAPS |
| 5 | Product | `product` | STORE_SCOPED | BLOCKED | TABLE-NAMING + category FK detail |
| 6 | ProductModifier | `product_modifier` | STORE_SCOPED | BLOCKED | TABLE-NAMING |
| 7 | ProductImage | `product_image` | STORE_SCOPED VIA PRODUCT | BLOCKED | TABLE-NAMING + key detail |
| 8 | Promotion | `promotion` | STORE_SCOPED | BLOCKED | FIELD-GAPS |
| 9 | Customer | `customer` | STORE_SCOPED | BLOCKED | nullability/defaults |
| 10 | CustomerAddress | `customer_address` | UNKNOWN | BLOCKED | parent key + address components |
| 11 | Conversation | `conversation` | STORE_SCOPED | BLOCKED | physical state representation |
| 12 | Message | `message` | STORE_SCOPED | BLOCKED | physical state/reference types |
| 13 | Order | `order` | STORE_SCOPED | BLOCKED | SQL naming + FK detail |
| 14 | OrderItem | `order_item` | VIA ORDER | BLOCKED | parent key not named |
| 15 | OrderItemModifier | `order_item_modifier` | VIA ORDER ITEM | BLOCKED | parent keys not named |
| 16 | OrderStatusHistory | `order_status_history` | VIA ORDER | BLOCKED | parent key not named |
| 17 | PaymentMethod | `payment_method` | UNKNOWN | BLOCKED | field model absent |
| 18 | Notification | `notification` | UNKNOWN | BLOCKED | status/idempotency field model |
| 19 | Integration | `integration` | UNKNOWN | BLOCKED | field model absent |
| 20 | IntegrationCredential | `integration_credential` | UNKNOWN | BLOCKED | field model + secure reference |
| 21 | InboundInbox | `inbound_inbox` | PROVIDER-SCOPED; STORE LINK UNKNOWN | BLOCKED | processing field model |
| 22 | DomainOutbox | `domain_outbox` | UNKNOWN CORE/GATEWAY | BLOCKED | CONTRACT-001 |
| 23 | Job | `job` | UNKNOWN | BLOCKED | field model absent |
| 24 | AuditLog | `audit_log` | UNKNOWN | BLOCKED | actor/entity field model |
| 25 | Log | `log` | UNKNOWN | BLOCKED | metadata encoding/types |
| 26 | AIProfile | `ai_profile` | UNKNOWN | BLOCKED | field decomposition |
| 27 | AIExecution | `ai_execution` | UNKNOWN | BLOCKED | field decomposition |
| 28 | KnowledgeItem | `knowledge_item` | STORE_SCOPED | BLOCKED | identity/content field model |

## Naming rule

The proposal is a mechanical lower_snake_case transformation of the canonical entity name. The repository does not currently contain an explicit normative SQL naming convention. Therefore this document does not upgrade the proposal to FROZEN.
