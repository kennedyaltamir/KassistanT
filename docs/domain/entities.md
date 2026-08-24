# Domain Entities

Status: DEFINED / PARTIAL. Source: baseline §23.

Canonical entities: Store, Device, Settings, ProductCategory, Product, ProductModifier, ProductImage, Promotion, Customer, CustomerAddress, Conversation, Message, Order, OrderItem, OrderItemModifier, OrderStatusHistory, PaymentMethod, Notification, Integration, IntegrationCredential, InboundInbox, DomainOutbox, Job, AuditLog, Log, AIProfile, AIExecution, KnowledgeItem.

Normative rules: UUIDv7 identifiers where supported; UTC persistence; integer cents/BRL; store scoping. Defined uniqueness includes Customer(store_id, phone_normalized), Conversation(store_id, external_thread_id), inbound Message(store_id, external_message_id), InboundInbox(provider, external_event_id), DomainOutbox(idempotency_key) and Order(store_id, display_number).

Message uniqueness is explicitly the inbound-provider idempotency boundary from the approved Message Contract; it does not freeze a universal outbound identity rule.

DomainOutbox ownership is resolved by CONTRACT-001: Domain defines event intent; IA-03 owns durable Outbox mechanics and worker. Physical representation remains subject to IA-01 schema reconciliation.

Detailed field schemas for several entities remain PARTIAL and are not inferred from implementation.

Historical/non-authoritative physical artifacts, including Migration 0002, do not override these contract decisions.
