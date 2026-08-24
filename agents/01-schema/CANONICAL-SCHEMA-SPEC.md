# IA-01 — Canonical Physical Schema Specification

Status: **SCHEMA DECISION PACKAGE / DDL BLOCKED**
Branch: `Agent01-schema-canonical-sqlite`
Migration `0002`: **NOT CREATED**
M5.1: **PRESERVED**

## 1. Purpose

This document is the physical-schema authority package for IA-01. It does not itself approve unresolved global or cross-agent decisions. It records which physical choices are local implementation details, which require semantic owners, and which remain globally blocked.

Supporting decision artifacts:

- `SCHEMA-DECISION-MATRIX.md`
- `SCHEMA-AUTHORITY-MATRIX.md`
- `TABLE-READINESS-MATRIX.md`
- `ENTITY-PHYSICAL-MAP.md`
- `RELATIONSHIP-SPEC.md`
- `CONSTRAINT-SPEC.md`
- `INDEX-SPEC.md`
- `MIGRATION-0002-READINESS.md`
- `MIGRATION-0002-PROJECTION.md`

## 2. Frozen repository facts

- SQLite is the MVP persistence technology.
- UUIDv7 is the logical identifier convention where supported.
- Persisted timestamps are UTC.
- Monetary values are integer cents in BRL.
- The canonical inventory contains exactly 28 entities.
- Seven UNIQUE constraints are explicitly normative: `Customer(store_id, phone_normalized)`, `Conversation(store_id, external_thread_id)`, `Message(store_id, external_message_id)`, `InboundInbox(provider, external_event_id)`, `DomainOutbox(idempotency_key)`, `Order(store_id, display_number)`, and `Device(store_id, id)`.
- Current `0001_bootstrap.sql` creates only `_schema_metadata`; no canonical business table is implemented. fileciteturn103file0

## 3. Physical decisions and authority

| Concern | Current classification | Authority | Current resolution |
|---|---|---|---|
| Table naming | PROPOSAL | IA-01 local | `lower_snake_case`; operator confirmation required |
| Column naming | PROPOSAL | IA-01 local | preserve documented logical field names using `lower_snake_case` where physically materialized |
| UUID SQLite type | PROPOSAL | IA-01 local | canonical textual UUID (`TEXT`) |
| UTC timestamp SQLite type | PROPOSAL | IA-01 local | canonical UTC RFC3339/ISO-8601 text (`TEXT`) |
| Money SQLite type | FROZEN | baseline/domain | `INTEGER` cents; currency `BRL` |
| Boolean SQLite type | PROPOSAL | IA-01 local | `INTEGER` constrained to `0/1` when a boolean field is semantically frozen |
| JSON/payload encoding | PROPOSAL | IA-01 local | `TEXT` containing canonical JSON only where contract identifies a JSON payload/reference |
| Status/lifecycle physical encoding | BLOCKED | semantic owner + IA-01 | semantic value set first; physical encoding only after owner approval |
| FK delete/update | BLOCKED | semantic owner | no action chosen by convention |
| Performance indexes | DEFERRED | IA-01 | none beyond contract-required indexes |

These physical proposals are implementation-level choices and are not silently promoted to project-wide architectural decisions.

## 4. Entity physical map

Proposed table names:

`store`, `device`, `settings`, `product_category`, `product`, `product_modifier`, `product_image`, `promotion`, `customer`, `customer_address`, `conversation`, `message`, `order`, `order_item`, `order_item_modifier`, `order_status_history`, `payment_method`, `notification`, `integration`, `integration_credential`, `inbound_inbox`, `domain_outbox`, `job`, `audit_log`, `log`, `ai_profile`, `ai_execution`, `knowledge_item`.

Status: `PROPOSED`, not frozen.

## 5. Field authority rule

A field name explicitly present in the approved baseline is a valid logical candidate. A field is `FROZEN` for migration only when its logical meaning, physical type, nullability/default, key semantics and relevant constraints are deterministic.

No missing field, parent key, default, FK action or enum encoding is invented by IA-01.

### Explicit logical field sets

**Store:** `id`, `name`, `phone`, `address`, `timezone`, timestamps.

**Device:** `id`, `store_id`, `status`, `protocol_version`, `app_version`, `last_seen_at`, `revoked_at`, timestamps.

**Product:** `id`, `store_id`, `category_id`, `name`, `description`, `price_cents`, `currency`, `available`, `tags`, timestamps.

**ProductModifier:** `id`, `store_id`, `product_id`, `name`, `price_cents`, `available`, `min_quantity`, `max_quantity`.

**ProductImage:** `product_id`, `file_path`, `mime_type`, `dimensions`, `checksum`.

**Promotion:** `store_id`, `name`, `active`, `start_at`, `end_at`, `type`, `value`, `product_scope`, `minimum_quantity`; semantic promotion types are `FIXED_AMOUNT` and `PERCENTAGE`.

**Customer:** `store_id`, `phone_normalized`, `name`, `notes`, `first_order_at`, `last_order_at`, `order_count`, `total_spent_cents`, `currency`, Google identifiers, `status`, timestamps.

**Conversation:** `store_id`, `customer_id`, `external_thread_id`, `lifecycle_state`, `ownership`, `ai_state`, unread count, timestamps. Semantic states: lifecycle `OPEN|CLOSED`; ownership `AI|HUMAN`; AI state `ACTIVE|PAUSED|UNAVAILABLE`.

**Message:** `store_id`, `conversation_id`, `external_message_id`, `direction`, `sender_type`, `message_type`, `text`, media reference, reply reference, `raw_event_reference`, `lifecycle_state`, provider status/error, timestamps, `correlation_id`, `causation_id`. Message lifecycle: `RECEIVED|QUEUED|PROCESSING|SENT|DELIVERED|READ|FAILED|REJECTED`.

**Order:** `store_id`, `display_number`, `customer_id`, `conversation_id`, `lifecycle_state`, `subtotal_cents`, `discount_cents`, `delivery_fee_cents`, `total_cents`, `currency`, `delivery_type`, `address_id`, `payment_method_id`, `notes`, timestamps. Order lifecycle: `DRAFT|CONFIRMED|IN_PRODUCTION|READY|OUT_FOR_DELIVERY|DELIVERED|CANCELLED`.

**OrderItem:** `product_name_snapshot`, `unit_price_cents_snapshot`, `quantity`, `subtotal_cents`; parent key and identity remain blocked pending IA-04.

**OrderItemModifier:** `modifier_name_snapshot`, `unit_price_cents_snapshot`, `quantity`, `subtotal_cents`; parent keys remain blocked pending IA-04.

**OrderStatusHistory:** `from_state`, `to_state`, `reason`, `actor`, `timestamp`; parent order key and row identity remain blocked pending IA-04/IA-02.

**PaymentMethod:** MVP records a payment method only; exact physical fields remain blocked.

**Notification:** channel, destination, idempotency data, attempts, status, errors, timestamps; exact physical decomposition remains partial.

**Integration:** state/configuration concept; exact field inventory remains blocked.

**IntegrationCredential:** secure credential-reference concept only; plaintext secrets are prohibited; exact reference schema remains blocked.

**InboundInbox:** `provider`, `external_event_id`, payload hash/reference, processing state, timestamps, correlation; `UNIQUE(provider, external_event_id)` is frozen.

**DomainOutbox:** domain-transaction event, `idempotency_key`, attempts, processed state; `UNIQUE(idempotency_key)` is frozen; ownership/scope remains blocked by CONTRACT-001.

**Job:** type, state, payload reference, scheduling, lock/attempts; exact physical decomposition remains partial.

**AuditLog:** actor, action, entity, before/after reference, correlation, timestamp; exact representation remains partial.

**Log:** timestamp, level, category, event, correlation, entity, message, error code, metadata.

**AIProfile:** attendant profile, rules version, objectives, model, temperature, token limit.

**AIExecution:** model, model version/digest, prompt version, policy version, knowledge version, input hash, tool calls, validation, latency, token usage, fallback, timestamps.

**KnowledgeItem:** structured content and `store_id`; exact identity/content fields remain blocked.

## 6. Store scoping

Store scoping is frozen only where explicit. Current classification:

- Explicit store-scoped: Device, Product, ProductModifier, Customer, Conversation, Message, Order, KnowledgeItem.
- Explicit unique scope additionally exists on Customer, Conversation, Message, Order and Device.
- ProductImage is store-scoped only through Product by strong inference.
- Promotion is store-scoped by explicit `store_id` field.
- Settings, ProductCategory, CustomerAddress, PaymentMethod, Notification, Integration, IntegrationCredential, Job, AuditLog, Log, AIProfile and AIExecution remain unknown/partial where the field-level contract does not explicitly establish `store_id`.
- DomainOutbox remains unknown across Core/Gateway because of CONTRACT-001.

IA-01 must not blanket-add `store_id` to every entity.

## 7. Relationships

The relationship matrix remains authoritative for the 23 identified relationships. Key unresolved relationships are:

- `OrderItem` parent reference: blocked; field name/identity not frozen.
- `OrderItemModifier` parent reference(s): blocked; field names/ownership not frozen.
- `OrderStatusHistory` parent order reference: blocked.
- `DomainOutbox` ownership/scope: blocked by CONTRACT-001.
- Other relationships that are mechanically indicated by explicit field names may be prepared after semantic owners confirm optionality and FK actions.

No `ON DELETE` or `ON UPDATE` action is currently frozen.

## 8. Nullability and defaults

No blanket `NOT NULL` policy is authorized. SQL defaults are not inferred from semantic defaults. `currency = BRL` is a frozen semantic convention but does not by itself authorize `DEFAULT 'BRL'` in SQLite.

Required/optional semantics must be closed by the semantic owner before physical DDL is frozen.

## 9. Mutability and immutability

Stable identifiers remain semantically immutable. Order snapshot values are intended to preserve transaction-time values, but SQL-level immutability is not introduced without an explicit contract. Lifecycle mutation belongs to domain/application runtime, not schema triggers invented by IA-01.

## 10. Idempotency, deduplication and traceability

Frozen uniqueness/deduplication surfaces:

- Customer `(store_id, phone_normalized)`
- Conversation `(store_id, external_thread_id)`
- Message `(store_id, external_message_id)`
- InboundInbox `(provider, external_event_id)`
- DomainOutbox `(idempotency_key)`
- Order `(store_id, display_number)`
- Device `(store_id, id)`

Message correlation/causation are contractually present, but exact nullability/format are not frozen.

## 11. Blocker closure status

### CONTRACT-001
Schema impact: only `DomainOutbox` and any physical boundary fields whose meaning depends on local-Core vs Gateway ownership. Other tables are non-blocked by this contract.

Classification: `GLOBAL_DECISION / BLOCKED`.

### CONTRACT-002
Current schema impact: no mandatory physical change. Order lifecycle state is already defined independently of the disputed event catalog.

Classification: `NON_BLOCKING` for current schema; becomes blocking only if the approved event decision changes persisted state/history or a new physical column/constraint.

### GOV-001
Only schema interpretations that rely on conflicting normative documents are affected. It does not block local implementation choices already supported by consistent current evidence.

Classification: `GLOBAL_DECISION / DEFERRED`.

### FIELD-GAPS / CHILD-KEY-GAPS
These are cross-agent blockers, not blanket global blockers. Their closure belongs to the semantic owners listed in `SCHEMA-AUTHORITY-MATRIX.md`.

### TABLE-NAMING
Local IA-01 decision, subject to operator confirmation because the decision becomes repository-visible physical convention.

## 12. Migration gate

`0002` remains prohibited until the decision package is approved and all schema-critical fields are deterministic. A table may advance independently when its semantic owner and physical representation are closed; the entire schema does not need every future table to be complete merely to classify readiness.
