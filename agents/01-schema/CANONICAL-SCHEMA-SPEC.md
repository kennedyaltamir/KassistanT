# IA-01 — Canonical Physical Schema Specification

Status: **PHASE 2 — SPECIFICATION / BLOCKED FOR DDL**  
Branch: `Agent01-schema-canonical-sqlite`  
Migration `0002`: **NOT CREATED**  
M5.1: **PRESERVED**

## 1. Authority

The specification is derived from current Git/GitHub state, the approved baseline SHA `02830152099f58307912ce382c064a3c4075f505`, protected domain/backend/protocol documentation, current packages and the Phase 1 audit.

This document distinguishes:

- `FROZEN` — sufficiently authoritative for deterministic DDL.
- `PARTIAL` — concept is authoritative but physical detail is incomplete.
- `BLOCKED` — implementation requires an unresolved contract or missing normative field detail.
- `UNKNOWN` — evidence is insufficient.
- `PROPOSED` — a mechanically derived design proposal, not project-approved.

## 2. Global physical conventions

| Concern | Current specification | Status | Evidence |
|---|---|---|---|
| Storage | SQLite local Desktop Core | FROZEN | Baseline §23; backend database |
| Identifier semantic | UUIDv7 where supported | FROZEN | Baseline §23; M5.1 UUIDv7 primitive |
| UUID physical SQLite type | Not explicitly frozen | UNKNOWN | Protected docs do not select TEXT/BLOB |
| Timestamp semantic | UTC | FROZEN | Baseline §23; backend database |
| Timestamp physical SQLite type | Not explicitly frozen | UNKNOWN | No protected physical encoding decision found |
| Money semantic | integer cents | FROZEN | Baseline §15/75; domain money primitive |
| Currency | BRL | FROZEN | Baseline §75 |
| Money physical SQLite type | INTEGER is compatible and mechanically required by integer-cent semantic | STRONG_INFERENCE | Baseline + `packages/domain/src/money.ts` |
| Naming convention | lower_snake_case proposed from existing `_schema_metadata` / field names | PROPOSED | Existing repository naming; not normatively frozen |
| Store isolation | Where explicitly required by canonical field inventory / uniqueness contracts | FROZEN | Baseline §23 / §23.1 |
| Unknown store scope | Must remain UNKNOWN rather than adding `store_id` | FROZEN | Phase 1 evidence rule |
| SQL enum strategy | Not frozen; exact state values are semantic contracts | UNKNOWN | State machines define values but not SQL encoding |
| FK delete/update behavior | Not frozen | UNKNOWN | No protected schema source defines actions |

## 3. Physical table map

Physical names below are deterministic **proposals**, not frozen decisions. The proposal applies lower_snake_case to the canonical entity name. This is intentionally not promoted to `FROZEN` because the protected sources do not currently state a SQL naming convention.

| Entity | Proposed table | Status | Migration readiness |
|---|---|---|---|
| Store | `store` | PROPOSED | BLOCKED — TABLE-NAMING |
| Device | `device` | PROPOSED | BLOCKED — TABLE-NAMING |
| Settings | `settings` | PROPOSED | BLOCKED — FIELD-GAPS |
| ProductCategory | `product_category` | PROPOSED | BLOCKED — FIELD-GAPS |
| Product | `product` | PROPOSED | BLOCKED — TABLE-NAMING |
| ProductModifier | `product_modifier` | PROPOSED | BLOCKED — TABLE-NAMING |
| ProductImage | `product_image` | PROPOSED | BLOCKED — TABLE-NAMING |
| Promotion | `promotion` | PROPOSED | BLOCKED — FIELD-GAPS |
| Customer | `customer` | PROPOSED | BLOCKED — TABLE-NAMING / NULLABILITY |
| CustomerAddress | `customer_address` | PROPOSED | BLOCKED — FIELD-GAPS |
| Conversation | `conversation` | PROPOSED | BLOCKED — TABLE-NAMING |
| Message | `message` | PROPOSED | BLOCKED — TABLE-NAMING |
| Order | `order` | PROPOSED | BLOCKED — SQL naming verification |
| OrderItem | `order_item` | PROPOSED | BLOCKED — MISSING PARENT KEY |
| OrderItemModifier | `order_item_modifier` | PROPOSED | BLOCKED — MISSING PARENT KEY |
| OrderStatusHistory | `order_status_history` | PROPOSED | BLOCKED — MISSING PARENT KEY |
| PaymentMethod | `payment_method` | PROPOSED | BLOCKED — FIELD-GAPS |
| Notification | `notification` | PROPOSED | BLOCKED — FIELD-GAPS |
| Integration | `integration` | PROPOSED | BLOCKED — FIELD-GAPS |
| IntegrationCredential | `integration_credential` | PROPOSED | BLOCKED — FIELD-GAPS / SECURITY |
| InboundInbox | `inbound_inbox` | PROPOSED | BLOCKED — PROCESSING MODEL DETAIL |
| DomainOutbox | `domain_outbox` | PROPOSED | BLOCKED — CONTRACT-001 |
| Job | `job` | PROPOSED | BLOCKED — FIELD-GAPS |
| AuditLog | `audit_log` | PROPOSED | BLOCKED — FIELD-GAPS |
| Log | `log` | PROPOSED | BLOCKED — FIELD-GAPS |
| AIProfile | `ai_profile` | PROPOSED | BLOCKED — FIELD-GAPS |
| AIExecution | `ai_execution` | PROPOSED | BLOCKED — FIELD-GAPS |
| KnowledgeItem | `knowledge_item` | PROPOSED | BLOCKED — FIELD-GAPS |

## 4. Field specification

### 4.1 FROZEN semantic fields

The following names are explicitly present in the approved baseline and therefore may be carried forward exactly as logical/physical column candidates. Their **SQL type, nullability and default are not automatically frozen** unless stated below.

#### Store
`id`, `name`, `phone`, `address`, `timezone`, timestamp concept.  
`id` is the entity identifier; physical representation remains UNKNOWN.

#### Device
`id`, `store_id`, `status`, `protocol_version`, `app_version`, `last_seen_at`, `revoked_at`, timestamp concept.  
`store_id -> Store.id` is explicit. `UNIQUE(store_id,id)` is explicit.

#### Product
`id`, `store_id`, `category_id`, `name`, `description`, `price_cents`, `currency`, `available`, `tags`, timestamp concept.  
`price_cents` = integer cents; `currency` = BRL. `category_id -> ProductCategory.id` is a strong inference from explicit naming and entity inventory, not a new business rule.

#### ProductModifier
`id`, `store_id`, `product_id`, `name`, `price_cents`, `available`, `min_quantity`, `max_quantity`.  
`product_id -> Product.id` is a strong inference supported by baseline §76.

#### ProductImage
`product_id`, `file_path`, `mime_type`, `dimensions`, `checksum`.  
`product_id -> Product.id` is a strong inference from explicit field/entity naming.

#### Promotion
`store_id`, `name`, `active`, `start_at`, `end_at`, `type`, `value`, `product_scope`, `minimum_quantity`.  
`type` allowed semantic values are `FIXED_AMOUNT` and `PERCENTAGE`. Physical encoding and `value` representation remain UNKNOWN/PARTIAL.

#### Customer
`store_id`, `phone_normalized`, `name`, `notes`, `first_order_at`, `last_order_at`, `order_count`, `total_spent_cents`, `currency`, Google identifiers, `status`, timestamp concept.  
`UNIQUE(store_id,phone_normalized)` is FROZEN by contract. Google identifier physical fields are not frozen.

#### CustomerAddress
Structured address + `is_default`.  
**BLOCKED:** authoritative component field names and parent key are absent.

#### Conversation
`store_id`, `customer_id`, `external_thread_id`, `lifecycle_state`, `ownership`, `ai_state`, unread count, timestamps.  
`customer_id -> Customer.id` is mechanically implied but not separately frozen. `UNIQUE(store_id,external_thread_id)` is FROZEN. State values are FROZEN semantically: lifecycle `OPEN|CLOSED`, ownership `AI|HUMAN`, AI state `ACTIVE|PAUSED|UNAVAILABLE`.

#### Message
`store_id`, `conversation_id`, `external_message_id`, `direction`, `sender_type`, `message_type`, `text`, `media reference`, `reply reference`, `raw_event_reference`, `lifecycle_state`, provider status/error, timestamps, `correlation_id`, `causation_id`.  
`conversation_id -> Conversation.id` is mechanically implied. `raw_event_reference` must reference the internal Inbox identity. `UNIQUE(store_id,external_message_id)` is FROZEN. Message lifecycle values are FROZEN semantically: `RECEIVED|QUEUED|PROCESSING|SENT|DELIVERED|READ|FAILED|REJECTED`.

#### Order
`store_id`, `display_number`, `customer_id`, `conversation_id`, `lifecycle_state`, `subtotal_cents`, `discount_cents`, `delivery_fee_cents`, `total_cents`, `currency`, `delivery_type`, `address_id`, `payment_method_id`, `notes`, timestamps.  
Money fields are integer cents, currency is BRL. Order lifecycle values are FROZEN semantically. `UNIQUE(store_id,display_number)` is FROZEN. Parent FKs are not physically frozen by the protected schema texts.

#### OrderItem
`product_name_snapshot`, `unit_price_cents_snapshot`, `quantity`, `subtotal_cents`.  
`quantity` is a positive integer by domain invariant. **BLOCKED:** parent key(s), item identifier and exact ownership relation are not explicitly named.

#### OrderItemModifier
`modifier_name_snapshot`, `unit_price_cents_snapshot`, `quantity`, `subtotal_cents`.  
**BLOCKED:** parent key(s), modifier relation and exact ownership relation are not explicitly named.

#### OrderStatusHistory
`from_state`, `to_state`, `reason`, `actor`, `timestamp`.  
`from_state/to_state` reuse the Order lifecycle semantic set. **BLOCKED:** parent Order key and history row identifier are not explicitly named.

#### PaymentMethod
Concept: method recorded for MVP; no real financial processing.  
**BLOCKED:** exact field names/representation are not frozen.

#### Notification
`channel`, `destination`, idempotency data, `attempts`, `status`, `errors`, timestamps.  
**PARTIAL/BLOCKED:** exact idempotency field, status values and error representation are not frozen.

#### Integration
Integration state/configuration concept.  
**BLOCKED:** exact field inventory is absent.

#### IntegrationCredential
Secure credential reference concept.  
**BLOCKED:** exact fields are absent; plaintext secrets are prohibited by security contract. Physical secret material must not be invented.

#### InboundInbox
`provider`, `external_event_id`, payload hash/reference, processing state, timestamps, correlation.  
`UNIQUE(provider,external_event_id)` is FROZEN. Processing-state values/field decomposition are not frozen.

#### DomainOutbox
Event created in a domain transaction, `idempotency_key`, `attempts`, processed state.  
`UNIQUE(idempotency_key)` is FROZEN. **BLOCKED:** physical ownership/scope and complete event field set depend on CONTRACT-001.

#### Job
`type`, `state`, payload reference, scheduling, lock/attempts.  
Retry/backoff/idempotency are required behaviorally; exact physical fields are not fully frozen.

#### AuditLog
`actor`, `action`, `entity`, before/after reference, `correlation`, `timestamp`.  
Exact actor/entity key types and before/after representation remain UNKNOWN.

#### Log
`timestamp`, `level`, `category`, `event`, `correlation`, `entity`, `message`, error code, metadata.  
Exact physical types and structured metadata encoding remain UNKNOWN.

#### AIProfile
attendant profile, rules version, objectives, model, temperature, token limit.  
Exact column decomposition is not frozen.

#### AIExecution
model, model version/digest, prompt version, policy version, knowledge version, input hash, tool calls, validation, latency, token usage, fallback, timestamps.  
Exact physical decomposition is not frozen.

#### KnowledgeItem
structured content and `store_id`.  
**BLOCKED:** exact content/identity fields are absent.

### 4.2 Physical column status rule

Where the baseline names a logical field but does not define its SQLite representation, the physical column is `PARTIAL/UNKNOWN`, not an inferred `TEXT/INTEGER` decision. The only current type-level exception is money: integer cents is contractually established, and the domain primitive uses a safe integer.

## 5. Nullability/defaults

No blanket `NOT NULL` policy is authorized by current protected schema documents. No business default is added solely from intuition. Each unresolved field remains `UNKNOWN` until authoritative evidence closes it.

Explicitly known semantic default:

- Currency semantic = `BRL`.

This does **not** automatically authorize a SQL `DEFAULT 'BRL'` constraint; default behavior remains `UNKNOWN` pending physical contract.

## 6. Mutability

`id` identifiers are semantically stable. Snapshot fields in OrderItem/OrderItemModifier are intended to preserve order-time values, but exact immutability enforcement is not specified by SQL contract. Runtime immutability belongs to domain/order logic, not inferred CHECK/trigger behavior.

Known operational timestamps such as `revoked_at`, `last_seen_at`, `first_order_at`, `last_order_at` are mutable lifecycle data; exact update rules are not frozen here.

## 7. Store/device/actor scope

| Entity | Current scope classification | Evidence status |
|---|---|---|
| Store | GLOBAL ROOT | FROZEN |
| Device | STORE_SCOPED | FROZEN (`store_id`) |
| Settings | UNKNOWN / likely Store configuration | PARTIAL |
| ProductCategory | UNKNOWN | PARTIAL |
| Product | STORE_SCOPED | FROZEN (`store_id`) |
| ProductModifier | STORE_SCOPED | FROZEN (`store_id`) |
| ProductImage | STORE_SCOPED via Product | STRONG_INFERENCE |
| Promotion | STORE_SCOPED | STRONG_INFERENCE (`store_id`) |
| Customer | STORE_SCOPED | FROZEN (`store_id`) |
| CustomerAddress | UNKNOWN | BLOCKED |
| Conversation | STORE_SCOPED | FROZEN (`store_id`) |
| Message | STORE_SCOPED | FROZEN (`store_id`) |
| Order | STORE_SCOPED | FROZEN (`store_id`) |
| OrderItem | UNKNOWN via Order | BLOCKED pending parent key |
| OrderItemModifier | UNKNOWN via OrderItem | BLOCKED pending parent key |
| OrderStatusHistory | UNKNOWN via Order | BLOCKED pending parent key |
| PaymentMethod | UNKNOWN | BLOCKED |
| Notification | UNKNOWN | PARTIAL |
| Integration | UNKNOWN | BLOCKED |
| IntegrationCredential | UNKNOWN | BLOCKED |
| InboundInbox | Provider-scoped; store relation not explicitly enumerated | PARTIAL |
| DomainOutbox | UNKNOWN across Core/Gateway | BLOCKED — CONTRACT-001 |
| Job | UNKNOWN | PARTIAL |
| AuditLog | UNKNOWN / operational store likely, but not field-frozen | PARTIAL |
| Log | UNKNOWN | PARTIAL |
| AIProfile | UNKNOWN / likely Store operational profile | PARTIAL |
| AIExecution | UNKNOWN / likely Store execution context | PARTIAL |
| KnowledgeItem | STORE_SCOPED (`store_id`) | FROZEN |

## 8. Lifecycle/status storage

Semantic state sets that are safe to preserve:

- Conversation lifecycle: `OPEN`, `CLOSED`.
- Conversation ownership: `AI`, `HUMAN`.
- AI state: `ACTIVE`, `PAUSED`, `UNAVAILABLE`.
- Message lifecycle: `RECEIVED`, `QUEUED`, `PROCESSING`, `SENT`, `DELIVERED`, `READ`, `FAILED`, `REJECTED`.
- Order lifecycle: `DRAFT`, `CONFIRMED`, `IN_PRODUCTION`, `READY`, `OUT_FOR_DELIVERY`, `DELIVERED`, `CANCELLED`.
- Promotion type: `FIXED_AMOUNT`, `PERCENTAGE`.

The physical SQL representation (`TEXT`, integer code, lookup table, etc.) is not frozen by current contracts. SQL CHECKs cannot be finalized until that representation is explicitly approved.

## 9. Idempotency / deduplication / causation

Currently contractually significant:

- `Customer(store_id,phone_normalized)` — logical identity uniqueness.
- `Conversation(store_id,external_thread_id)` — external thread deduplication.
- `Message(store_id,external_message_id)` — external message deduplication.
- `InboundInbox(provider,external_event_id)` — inbound event deduplication.
- `DomainOutbox(idempotency_key)` — outbound effect idempotency.
- Message `correlation_id` / `causation_id` — traceability metadata.

The exact nullability, format and FK status of correlation/causation fields are not frozen.

## 10. Delete/update actions

No protected schema source currently specifies `ON DELETE` or `ON UPDATE` actions. Therefore all such actions remain `UNKNOWN`. No cascade may be introduced by convention during Phase 2.

## 11. Immutable vs mutable

### Semantically stable
- entity identifiers;
- external identity keys used for deduplication;
- Order snapshot values after confirmation, subject to domain invariant.

### Operationally mutable
- status/lifecycle fields;
- retry/attempt state;
- timestamps such as `last_seen_at` / `revoked_at`;
- availability/active state.

SQL immutability enforcement is not authorized where the contract only establishes a domain invariant.

## 12. Implementation order proposal

The following is a dependency-aware **proposal**, not an approved migration plan:

1. Store
2. Device
3. Settings
4. ProductCategory
5. Product
6. ProductModifier
7. ProductImage
8. Promotion
9. Customer
10. CustomerAddress
11. Conversation
12. Message
13. PaymentMethod
14. Integration
15. IntegrationCredential
16. KnowledgeItem
17. Order
18. OrderItem
19. OrderItemModifier
20. OrderStatusHistory
21. InboundInbox
22. Job
23. AuditLog
24. Log
25. AIProfile
26. AIExecution
27. Notification
28. DomainOutbox — only after CONTRACT-001 is resolved if physical ownership is schema-significant.

This order keeps obvious parent-before-child dependencies ahead of child tables but does not bypass unresolved contract semantics.

## 13. Overall status

**Phase 2 cannot freeze the physical schema yet.** The repository supports a deterministic semantic map, but the following still require authoritative closure before `0002` can be generated without interpretation:

1. physical SQL naming convention;
2. field-level definitions for seven underspecified entities;
3. parent key names for OrderItem, OrderItemModifier and OrderStatusHistory;
4. nullability/default rules;
5. FK actions;
6. SQL representation of lifecycle enums;
7. DomainOutbox ownership/physical scope where applicable;
8. source-authority decision if GOV-001 changes interpretation.
