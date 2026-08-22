# Domain Entities

Status: DEFINED / PARTIAL. Source: baseline §23.

Canonical entities: Store, Device, Settings, ProductCategory, Product, ProductModifier, ProductImage, Promotion, Customer, CustomerAddress, Conversation, Message, Order, OrderItem, OrderItemModifier, OrderStatusHistory, PaymentMethod, Notification, Integration, IntegrationCredential, InboundInbox, DomainOutbox, Job, AuditLog, Log, AIProfile, AIExecution, KnowledgeItem.

Normative rules: UUIDv7 identifiers where supported; UTC persistence; integer cents/BRL; store scoping. Defined uniqueness includes Customer(store_id, phone_normalized), Conversation(store_id, external_thread_id), Message(store_id, external_message_id), InboundInbox(provider, external_event_id), DomainOutbox(idempotency_key) and Order(store_id, display_number).

Detailed field schemas for several entities remain PARTIAL and are not inferred from implementation.