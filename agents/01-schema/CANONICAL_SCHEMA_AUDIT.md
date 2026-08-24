# IA-01 — Canonical Schema Audit / Phase 1

Status: **PHASE 1 — CONTRACT-TO-SCHEMA AUDIT / CANONICAL SCHEMA SPECIFICATION**  
Audit branch: `Agent01-schema-canonical-sqlite`  
Audit date: 2026-08-24  
Migration 0002: **NOT CREATED**  
M5.1 foundation: **PRESERVED**

## Authority and evidence rule

This document records only schema facts supported by the current repository and protected documentation. `UNKNOWN` means the source material does not provide enough evidence to define the field/constraint safely. `STRONG_INFERENCE` is used only where the relationship is mechanically implied by an explicitly named field/entity and does not introduce business semantics.

Evidence strength:

- **EXPLICIT** — directly stated by an authoritative source.
- **STRONG_INFERENCE** — mechanically implied by explicit repository terminology; still not a normative decision.
- **PARTIAL** — source establishes the concept but not the complete field-level definition.
- **UNKNOWN** — insufficient evidence.

Implementation status:

- **IMPLEMENTED** — executable repository evidence exists for that schema artifact.
- **PARTIAL** — only part of the required schema exists.
- **DOCUMENTED** — specified but no executable canonical schema exists.
- **NOT_STARTED** — no implementation evidence.
- **BLOCKED** — implementation depends on an unresolved contract or missing normative detail.
- **UNKNOWN** — evidence insufficient to classify.

## Canonical entity matrix

The table name is shown as `NOT_SPECIFIED` for all entities because the protected specification defines the canonical entity inventory but does not normatively freeze physical SQL table names. A later implementation may establish naming only through the approved schema specification; it must not silently convert this gap into a project decision.

| Entity | Table Name | Field | Type | Nullable | Default | Primary Key | Foreign Key | References | Unique | Check Constraint | Index | Store Scoped | Lifecycle / Status | Evidence | Evidence Strength | Implementation Status | Blocker | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Store | NOT_SPECIFIED | id | UUIDv7-compatible identifier | UNKNOWN | UNKNOWN | YES | NO | — | UNKNOWN | UNKNOWN | UNKNOWN | Root scope | UNKNOWN | Baseline §23 | EXPLICIT | NOT_STARTED | Field detail gap | Store is the ownership boundary for operational data. |
| Store | NOT_SPECIFIED | name | UNKNOWN | UNKNOWN | UNKNOWN | NO | NO | — | UNKNOWN | UNKNOWN | UNKNOWN | Root scope | UNKNOWN | Baseline §23 | EXPLICIT | NOT_STARTED | — | Explicit field name only; type/nullability/default are not frozen. |
| Store | NOT_SPECIFIED | phone | UNKNOWN | UNKNOWN | UNKNOWN | NO | NO | — | UNKNOWN | UNKNOWN | UNKNOWN | Root scope | UNKNOWN | Baseline §23 | EXPLICIT | NOT_STARTED | — | — |
| Store | NOT_SPECIFIED | address | UNKNOWN | UNKNOWN | UNKNOWN | NO | NO | — | UNKNOWN | UNKNOWN | UNKNOWN | Root scope | UNKNOWN | Baseline §23 | EXPLICIT | NOT_STARTED | — | Structured representation is not specified. |
| Store | NOT_SPECIFIED | timezone | UNKNOWN | UNKNOWN | UNKNOWN | NO | NO | — | UNKNOWN | UNKNOWN | UNKNOWN | Root scope | UNKNOWN | Baseline §23; UTC display rule | EXPLICIT | NOT_STARTED | — | Persisted timestamps are UTC; display uses Store timezone. |
| Store | NOT_SPECIFIED | timestamps | UTC timestamp fields; exact names unspecified | UNKNOWN | UNKNOWN | NO | NO | — | UNKNOWN | UNKNOWN | UNKNOWN | Root scope | UNKNOWN | Baseline §23; backend database contract | PARTIAL | NOT_STARTED | Field detail gap | Exact timestamp column names are not normative. |
| Device | NOT_SPECIFIED | id | UUIDv7-compatible identifier | UNKNOWN | UNKNOWN | YES | NO | — | YES with store_id | UNKNOWN | REQUIRED candidate via UNIQUE | YES | REVOKED is explicitly used; full status set UNKNOWN | Baseline §23; §66; §23.1 | EXPLICIT | NOT_STARTED | — | `UNIQUE Device(store_id, id)` is normative. |
| Device | NOT_SPECIFIED | store_id | identifier | UNKNOWN | UNKNOWN | NO | YES | Store.id | UNKNOWN | UNKNOWN | REQUIRED candidate | YES | — | Baseline §23; §65-66 | EXPLICIT | NOT_STARTED | — | Reference field name explicit; SQL target type not separately frozen. |
| Device | NOT_SPECIFIED | status | UNKNOWN; enum values not fully specified | UNKNOWN | UNKNOWN | NO | NO | — | UNKNOWN | UNKNOWN | UNKNOWN | YES | REVOKED explicitly documented | Baseline §23; §66 | PARTIAL | NOT_STARTED | — | Enrollment states are a separate flow; do not conflate them with device status. |
| Device | NOT_SPECIFIED | protocol_version | UNKNOWN | UNKNOWN | UNKNOWN | NO | NO | — | UNKNOWN | UNKNOWN | UNKNOWN | YES | — | Baseline §23 | EXPLICIT | NOT_STARTED | — | — |
| Device | NOT_SPECIFIED | app_version | UNKNOWN | UNKNOWN | UNKNOWN | NO | NO | — | UNKNOWN | UNKNOWN | UNKNOWN | YES | — | Baseline §23 | EXPLICIT | NOT_STARTED | — | — |
| Device | NOT_SPECIFIED | last_seen_at | UTC timestamp | UNKNOWN | UNKNOWN | NO | NO | — | UNKNOWN | UNKNOWN | UNKNOWN | YES | — | Baseline §23 | EXPLICIT | NOT_STARTED | — | Exact nullability not specified. |
| Device | NOT_SPECIFIED | revoked_at | UTC timestamp | UNKNOWN | UNKNOWN | NO | NO | — | UNKNOWN | UNKNOWN | UNKNOWN | YES | — | Baseline §23 | EXPLICIT | NOT_STARTED | — | Exact nullability not specified. |
| Device | NOT_SPECIFIED | timestamps | UTC timestamp fields; exact names unspecified | UNKNOWN | UNKNOWN | NO | NO | — | UNKNOWN | UNKNOWN | UNKNOWN | YES | — | Baseline §23 | PARTIAL | NOT_STARTED | — | — |
| Settings | NOT_SPECIFIED | configuration fields | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | Settings scope is documented; state representation is not | Baseline §20 and canonical entity list | PARTIAL | NOT_STARTED | Field schema gap | Product settings are described conceptually, but canonical storage fields are not explicitly enumerated. |
| ProductCategory | NOT_SPECIFIED | field set | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | YES likely by product catalog scope, but not explicitly stated | UNKNOWN | Canonical entity list; UI/catalog documentation | PARTIAL | NOT_STARTED | Field schema gap | No field-level canonical definition found. |
| Product | NOT_SPECIFIED | id | UUIDv7-compatible identifier | UNKNOWN | UNKNOWN | YES | NO | — | UNKNOWN | UNKNOWN | UNKNOWN | YES | — | Baseline §23 | EXPLICIT | NOT_STARTED | — | — |
| Product | NOT_SPECIFIED | store_id | identifier | UNKNOWN | UNKNOWN | NO | YES | Store.id | UNKNOWN | UNKNOWN | REQUIRED candidate | YES | — | Baseline §23 | EXPLICIT | NOT_STARTED | — | — |
| Product | NOT_SPECIFIED | category_id | identifier | UNKNOWN | UNKNOWN | NO | YES | ProductCategory.id | UNKNOWN | UNKNOWN | UNKNOWN | YES | — | Baseline §23 | STRONG_INFERENCE | NOT_STARTED | Field schema gap | Relationship is implied by explicit field/entity names; delete behavior unspecified. |
| Product | NOT_SPECIFIED | name | UNKNOWN | UNKNOWN | UNKNOWN | NO | NO | — | UNKNOWN | UNKNOWN | UNKNOWN | YES | — | Baseline §23 | EXPLICIT | NOT_STARTED | — | — |
| Product | NOT_SPECIFIED | description | UNKNOWN | UNKNOWN | UNKNOWN | NO | NO | — | UNKNOWN | UNKNOWN | UNKNOWN | YES | — | Baseline §23 | EXPLICIT | NOT_STARTED | — | — |
| Product | NOT_SPECIFIED | price_cents | INTEGER cents | UNKNOWN | UNKNOWN | NO | NO | — | UNKNOWN | UNKNOWN | REQUIRED candidate | YES | — | Baseline §23; §75; Money contract | EXPLICIT | NOT_STARTED | — | Never use floating point. |
| Product | NOT_SPECIFIED | currency | BRL | UNKNOWN | BRL in contract | NO | NO | — | UNKNOWN | UNKNOWN | UNKNOWN | YES | — | Baseline §23; §75 | EXPLICIT | NOT_STARTED | — | Currency is fixed to BRL for MVP. |
| Product | NOT_SPECIFIED | available | UNKNOWN / boolean-like concept | UNKNOWN | UNKNOWN | NO | NO | — | UNKNOWN | UNKNOWN | UNKNOWN | YES | — | Baseline §23 | PARTIAL | NOT_STARTED | — | Exact representation not specified. |
| Product | NOT_SPECIFIED | tags | UNKNOWN | UNKNOWN | UNKNOWN | NO | NO | — | UNKNOWN | UNKNOWN | UNKNOWN | YES | — | Baseline §23 | EXPLICIT | NOT_STARTED | Field schema gap | Representation is not specified. |
| Product | NOT_SPECIFIED | timestamps | UTC timestamp fields; exact names unspecified | UNKNOWN | UNKNOWN | NO | NO | — | UNKNOWN | UNKNOWN | UNKNOWN | YES | — | Baseline §23 | PARTIAL | NOT_STARTED | — | — |
| ProductModifier | NOT_SPECIFIED | id | UUIDv7-compatible identifier | UNKNOWN | UNKNOWN | YES | NO | — | UNKNOWN | UNKNOWN | UNKNOWN | YES | — | Baseline §23 | EXPLICIT | NOT_STARTED | — | — |
| ProductModifier | NOT_SPECIFIED | store_id | identifier | UNKNOWN | UNKNOWN | NO | YES | Store.id | UNKNOWN | UNKNOWN | REQUIRED candidate | YES | — | Baseline §23 | EXPLICIT | NOT_STARTED | — | — |
| ProductModifier | NOT_SPECIFIED | product_id | identifier | UNKNOWN | UNKNOWN | NO | YES | Product.id | UNKNOWN | UNKNOWN | REQUIRED candidate | YES | — | Baseline §23; §76 | STRONG_INFERENCE | NOT_STARTED | — | Product → ProductModifier is explicit. |
| ProductModifier | NOT_SPECIFIED | name | UNKNOWN | UNKNOWN | UNKNOWN | NO | NO | — | UNKNOWN | UNKNOWN | UNKNOWN | YES | — | Baseline §23 | EXPLICIT | NOT_STARTED | — | — |
| ProductModifier | NOT_SPECIFIED | price_cents | INTEGER cents | UNKNOWN | UNKNOWN | NO | NO | — | UNKNOWN | UNKNOWN | UNKNOWN | YES | — | Baseline §23; §75 | EXPLICIT | NOT_STARTED | — | — |
| ProductModifier | NOT_SPECIFIED | available | UNKNOWN / boolean-like concept | UNKNOWN | UNKNOWN | NO | NO | — | UNKNOWN | UNKNOWN | UNKNOWN | YES | — | Baseline §23 | PARTIAL | NOT_STARTED | — | — |
| ProductModifier | NOT_SPECIFIED | min_quantity | INTEGER candidate | UNKNOWN | UNKNOWN | NO | NO | — | UNKNOWN | UNKNOWN | UNKNOWN | YES | — | Baseline §23 | PARTIAL | NOT_STARTED | Field schema gap | Quantity semantics require domain contract before NOT NULL/CHECK. |
| ProductModifier | NOT_SPECIFIED | max_quantity | INTEGER candidate | UNKNOWN | UNKNOWN | NO | NO | — | UNKNOWN | UNKNOWN | UNKNOWN | YES | — | Baseline §23 | PARTIAL | NOT_STARTED | Field schema gap | — |
| ProductImage | NOT_SPECIFIED | product_id | identifier | UNKNOWN | UNKNOWN | NO | YES | Product.id | UNKNOWN | UNKNOWN | UNKNOWN | YES | — | Baseline §23 | STRONG_INFERENCE | NOT_STARTED | — | Field name and entity relation are explicit. |
| ProductImage | NOT_SPECIFIED | file_path | UNKNOWN | UNKNOWN | UNKNOWN | NO | NO | — | UNKNOWN | UNKNOWN | UNKNOWN | YES | — | Baseline §23 | EXPLICIT | NOT_STARTED | — | — |
| ProductImage | NOT_SPECIFIED | mime_type | UNKNOWN | UNKNOWN | UNKNOWN | NO | NO | — | UNKNOWN | UNKNOWN | UNKNOWN | YES | — | Baseline §23 | EXPLICIT | NOT_STARTED | — | — |
| ProductImage | NOT_SPECIFIED | dimensions | UNKNOWN | UNKNOWN | UNKNOWN | NO | NO | — | UNKNOWN | UNKNOWN | UNKNOWN | YES | — | Baseline §23 | EXPLICIT | NOT_STARTED | — | Structure unspecified. |
| ProductImage | NOT_SPECIFIED | checksum | UNKNOWN | UNKNOWN | UNKNOWN | NO | NO | — | UNKNOWN | UNKNOWN | UNKNOWN | YES | — | Baseline §23 | EXPLICIT | NOT_STARTED | — | Algorithm/representation unspecified. |
| Promotion | NOT_SPECIFIED | store_id | identifier | UNKNOWN | UNKNOWN | NO | YES | Store.id | UNKNOWN | UNKNOWN | REQUIRED candidate | YES | — | Baseline §23 | STRONG_INFERENCE | NOT_STARTED | — | — |
| Promotion | NOT_SPECIFIED | name | UNKNOWN | UNKNOWN | UNKNOWN | NO | NO | — | UNKNOWN | UNKNOWN | UNKNOWN | YES | — | Baseline §23 | EXPLICIT | NOT_STARTED | — | — |
| Promotion | NOT_SPECIFIED | active | UNKNOWN / boolean-like concept | UNKNOWN | UNKNOWN | NO | NO | — | UNKNOWN | UNKNOWN | UNKNOWN | YES | — | Baseline §23 | PARTIAL | NOT_STARTED | — | — |
| Promotion | NOT_SPECIFIED | start_at | UTC timestamp | UNKNOWN | UNKNOWN | NO | NO | — | UNKNOWN | UNKNOWN | UNKNOWN | YES | — | Baseline §23 | EXPLICIT | NOT_STARTED | — | — |
| Promotion | NOT_SPECIFIED | end_at | UTC timestamp | UNKNOWN | UNKNOWN | NO | NO | — | UNKNOWN | UNKNOWN | UNKNOWN | YES | — | Baseline §23 | EXPLICIT | NOT_STARTED | — | — |
| Promotion | NOT_SPECIFIED | type | ENUM candidate: FIXED_AMOUNT, PERCENTAGE | UNKNOWN | UNKNOWN | NO | NO | — | UNKNOWN | UNKNOWN | UNKNOWN | YES | Defined only for MVP promotion modes | Baseline §23; §75 | EXPLICIT | NOT_STARTED | — | Do not add other types. |
| Promotion | NOT_SPECIFIED | value | UNKNOWN; semantic depends on type | UNKNOWN | UNKNOWN | NO | NO | — | UNKNOWN | UNKNOWN | UNKNOWN | YES | — | Baseline §23; §75 | PARTIAL | NOT_STARTED | Field schema gap | Fixed amount vs percentage representation requires explicit schema decision. |
| Promotion | NOT_SPECIFIED | product_scope | UNKNOWN | UNKNOWN | UNKNOWN | NO | NO | — | UNKNOWN | UNKNOWN | UNKNOWN | YES | — | Baseline §23 | EXPLICIT | NOT_STARTED | Field schema gap | Does not define link representation. |
| Promotion | NOT_SPECIFIED | minimum_quantity | INTEGER candidate | UNKNOWN | UNKNOWN | NO | NO | — | UNKNOWN | UNKNOWN | UNKNOWN | YES | — | Baseline §23 | PARTIAL | NOT_STARTED | Field schema gap | — |
| Customer | NOT_SPECIFIED | store_id | identifier | UNKNOWN | UNKNOWN | NO | YES | Store.id | UNKNOWN | UNKNOWN | REQUIRED candidate | YES | — | Baseline §23 | STRONG_INFERENCE | NOT_STARTED | — | — |
| Customer | NOT_SPECIFIED | phone_normalized | UNKNOWN | UNKNOWN | UNKNOWN | NO | NO | — | YES with store_id | REQUIRED unique constraint | YES | YES | — | Baseline §23; §23.1 | EXPLICIT | NOT_STARTED | — | Exact normalization rules are elsewhere, not field schema. |
| Customer | NOT_SPECIFIED | name | UNKNOWN | UNKNOWN | UNKNOWN | NO | NO | — | UNKNOWN | UNKNOWN | UNKNOWN | YES | — | Baseline §23 | EXPLICIT | NOT_STARTED | — | — |
| Customer | NOT_SPECIFIED | notes | UNKNOWN | UNKNOWN | UNKNOWN | NO | NO | — | UNKNOWN | UNKNOWN | UNKNOWN | YES | — | Baseline §23 | EXPLICIT | NOT_STARTED | — | — |
| Customer | NOT_SPECIFIED | first_order_at | UTC timestamp | UNKNOWN | UNKNOWN | NO | NO | — | UNKNOWN | UNKNOWN | UNKNOWN | YES | — | Baseline §23 | EXPLICIT | NOT_STARTED | — | — |
| Customer | NOT_SPECIFIED | last_order_at | UTC timestamp | UNKNOWN | UNKNOWN | NO | NO | — | UNKNOWN | UNKNOWN | UNKNOWN | YES | — | Baseline §23 | EXPLICIT | NOT_STARTED | — | — |
| Customer | NOT_SPECIFIED | order_count | INTEGER candidate | UNKNOWN | UNKNOWN | NO | NO | — | UNKNOWN | UNKNOWN | UNKNOWN | YES | — | Baseline §23 | PARTIAL | NOT_STARTED | Field schema gap | — |
| Customer | NOT_SPECIFIED | total_spent_cents | INTEGER cents | UNKNOWN | UNKNOWN | NO | NO | — | UNKNOWN | UNKNOWN | UNKNOWN | YES | — | Baseline §23; §75 | EXPLICIT | NOT_STARTED | — | — |
| Customer | NOT_SPECIFIED | currency | BRL | UNKNOWN | BRL in contract | NO | NO | — | UNKNOWN | UNKNOWN | UNKNOWN | YES | — | Baseline §23; §75 | EXPLICIT | NOT_STARTED | — | — |
| Customer | NOT_SPECIFIED | Google identifiers | UNKNOWN | UNKNOWN | UNKNOWN | NO | UNKNOWN | Google external identities | UNKNOWN | UNKNOWN | UNKNOWN | YES | — | Baseline §23; §81 | PARTIAL | NOT_STARTED | Field schema gap | Exact Google identifier names and nullability are unspecified. |
| Customer | NOT_SPECIFIED | status | UNKNOWN | UNKNOWN | UNKNOWN | NO | NO | — | UNKNOWN | UNKNOWN | UNKNOWN | YES | — | Baseline §23 | EXPLICIT | NOT_STARTED | Field schema gap | Status values are not frozen in the accessible contract layer. |
| Customer | NOT_SPECIFIED | timestamps | UTC timestamp fields; exact names unspecified | UNKNOWN | UNKNOWN | NO | NO | — | UNKNOWN | UNKNOWN | UNKNOWN | YES | — | Baseline §23 | PARTIAL | NOT_STARTED | — | — |
| CustomerAddress | NOT_SPECIFIED | structured address fields | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | YES | — | Baseline §23 | PARTIAL | NOT_STARTED | Field schema gap | Address component names, key and relation are not enumerated. |
| CustomerAddress | NOT_SPECIFIED | is_default | UNKNOWN / boolean-like concept | UNKNOWN | UNKNOWN | NO | UNKNOWN | Customer relation implied but target field unspecified | UNKNOWN | UNKNOWN | UNKNOWN | YES | — | Baseline §23 | PARTIAL | NOT_STARTED | Field schema gap | Do not invent `customer_id` or delete semantics. |
| Conversation | NOT_SPECIFIED | store_id | identifier | UNKNOWN | UNKNOWN | NO | YES | Store.id | UNKNOWN | UNKNOWN | REQUIRED candidate | YES | — | Baseline §23 | STRONG_INFERENCE | NOT_STARTED | — | — |
| Conversation | NOT_SPECIFIED | customer_id | identifier | UNKNOWN | UNKNOWN | NO | YES | Customer.id | UNKNOWN | UNKNOWN | UNKNOWN | YES | OPEN/CLOSED lifecycle | Baseline §23; §43 | STRONG_INFERENCE | NOT_STARTED | — | Relation implied by explicit field. |
| Conversation | NOT_SPECIFIED | external_thread_id | UNKNOWN | UNKNOWN | UNKNOWN | NO | NO | — | YES with store_id | REQUIRED unique constraint | YES | YES | — | Baseline §23; §23.1 | EXPLICIT | NOT_STARTED | — | Provider external thread identity. |
| Conversation | NOT_SPECIFIED | lifecycle_state | ENUM: OPEN, CLOSED | UNKNOWN | UNKNOWN | NO | NO | — | UNKNOWN | UNKNOWN | UNKNOWN | YES | OPEN, CLOSED | Baseline §23; domain state machine | EXPLICIT | NOT_STARTED | — | Exact SQL representation unspecified. |
| Conversation | NOT_SPECIFIED | ownership | ENUM: AI, HUMAN | UNKNOWN | UNKNOWN | NO | NO | — | UNKNOWN | UNKNOWN | UNKNOWN | YES | AI, HUMAN | Baseline §23; domain state machine | EXPLICIT | NOT_STARTED | — | — |
| Conversation | NOT_SPECIFIED | ai_state | ENUM: ACTIVE, PAUSED, UNAVAILABLE | UNKNOWN | UNKNOWN | NO | NO | — | UNKNOWN | UNKNOWN | UNKNOWN | YES | ACTIVE, PAUSED, UNAVAILABLE | Baseline §23; domain state machine | EXPLICIT | NOT_STARTED | — | — |
| Conversation | NOT_SPECIFIED | unread count | INTEGER candidate | UNKNOWN | UNKNOWN | NO | NO | — | UNKNOWN | UNKNOWN | UNKNOWN | YES | — | Baseline §23 | PARTIAL | NOT_STARTED | Field schema gap | Exact field name is not specified. |
| Conversation | NOT_SPECIFIED | timestamps | UTC timestamp fields; exact names unspecified | UNKNOWN | UNKNOWN | NO | NO | — | UNKNOWN | UNKNOWN | UNKNOWN | YES | — | Baseline §23 | PARTIAL | NOT_STARTED | — | — |
| Message | NOT_SPECIFIED | store_id | identifier | UNKNOWN | UNKNOWN | NO | YES | Store.id | UNKNOWN | UNKNOWN | REQUIRED candidate | YES | — | Baseline §23 | STRONG_INFERENCE | NOT_STARTED | — | — |
| Message | NOT_SPECIFIED | conversation_id | identifier | UNKNOWN | UNKNOWN | NO | YES | Conversation.id | UNKNOWN | UNKNOWN | REQUIRED candidate | YES | RECEIVED/QUEUED/PROCESSING/SENT/DELIVERED/READ/FAILED/REJECTED | Baseline §23; domain state machine | STRONG_INFERENCE | NOT_STARTED | — | — |
| Message | NOT_SPECIFIED | external_message_id | UNKNOWN | UNKNOWN | UNKNOWN | NO | NO | — | YES with store_id | REQUIRED unique constraint | YES | YES | — | Baseline §23; §23.1 | EXPLICIT | NOT_STARTED | — | — |
| Message | NOT_SPECIFIED | direction | UNKNOWN | UNKNOWN | UNKNOWN | NO | NO | — | UNKNOWN | UNKNOWN | UNKNOWN | YES | — | Baseline §23 | EXPLICIT | NOT_STARTED | Field schema gap | Allowed values not specified. |
| Message | NOT_SPECIFIED | sender_type | UNKNOWN | UNKNOWN | UNKNOWN | NO | NO | — | UNKNOWN | UNKNOWN | UNKNOWN | YES | — | Baseline §23 | EXPLICIT | NOT_STARTED | Field schema gap | Allowed values not specified. |
| Message | NOT_SPECIFIED | message_type | UNKNOWN | UNKNOWN | UNKNOWN | NO | NO | — | UNKNOWN | UNKNOWN | UNKNOWN | YES | — | Baseline §23 | EXPLICIT | NOT_STARTED | Field schema gap | — |
| Message | NOT_SPECIFIED | text | UNKNOWN | UNKNOWN | UNKNOWN | NO | NO | — | UNKNOWN | UNKNOWN | UNKNOWN | YES | — | Baseline §23 | EXPLICIT | NOT_STARTED | — | — |
| Message | NOT_SPECIFIED | media reference | UNKNOWN | UNKNOWN | UNKNOWN | NO | UNKNOWN | External/internal media reference | UNKNOWN | UNKNOWN | UNKNOWN | YES | — | Baseline §23 | PARTIAL | NOT_STARTED | Field schema gap | Exact field names/semantics unspecified. |
| Message | NOT_SPECIFIED | reply reference | UNKNOWN | UNKNOWN | UNKNOWN | NO | UNKNOWN | Message reference | UNKNOWN | UNKNOWN | UNKNOWN | YES | — | Baseline §23 | PARTIAL | NOT_STARTED | Field schema gap | Exact field name and target are unspecified. |
| Message | NOT_SPECIFIED | raw_event_reference | internal identifier | UNKNOWN | UNKNOWN | NO | YES | InboundInbox internal ID | UNKNOWN | UNKNOWN | UNKNOWN | YES | — | Baseline §23; §82 | EXPLICIT | NOT_STARTED | — | Must reference the local Inbox record, not store raw external payload as the reference. |
| Message | NOT_SPECIFIED | lifecycle_state | ENUM: RECEIVED, QUEUED, PROCESSING, SENT, DELIVERED, READ, FAILED, REJECTED | UNKNOWN | UNKNOWN | NO | NO | — | UNKNOWN | UNKNOWN | UNKNOWN | YES | Defined message lifecycle | Baseline §23; domain state machine | EXPLICIT | NOT_STARTED | — | — |
| Message | NOT_SPECIFIED | provider status/error | UNKNOWN | UNKNOWN | UNKNOWN | NO | NO | — | UNKNOWN | UNKNOWN | UNKNOWN | YES | — | Baseline §23 | PARTIAL | NOT_STARTED | Field schema gap | — |
| Message | NOT_SPECIFIED | timestamps | UTC timestamp fields; exact names unspecified | UNKNOWN | UNKNOWN | NO | NO | — | UNKNOWN | UNKNOWN | UNKNOWN | YES | — | Baseline §23 | PARTIAL | NOT_STARTED | — | — |
| Message | NOT_SPECIFIED | correlation_id | UUIDv7-compatible identifier | UNKNOWN | UNKNOWN | NO | NO | — | UNKNOWN | UNKNOWN | REQUIRED candidate | YES | — | Baseline §23; event envelope | EXPLICIT | NOT_STARTED | — | — |
| Message | NOT_SPECIFIED | causation_id | UUIDv7-compatible identifier | UNKNOWN | UNKNOWN | NO | NO | — | UNKNOWN | UNKNOWN | REQUIRED candidate | YES | — | Baseline §23; event envelope | EXPLICIT | NOT_STARTED | — | Nullability semantics unspecified. |
| Order | NOT_SPECIFIED | id | UUIDv7-compatible identifier | UNKNOWN | UNKNOWN | YES | NO | — | UNKNOWN | UNKNOWN | UNKNOWN | YES | DRAFT/CONFIRMED/IN_PRODUCTION/READY/OUT_FOR_DELIVERY/DELIVERED/CANCELLED | Baseline §23; §74 | EXPLICIT | NOT_STARTED | — | Entity ID inferred from canonical ID convention. |
| Order | NOT_SPECIFIED | store_id | identifier | UNKNOWN | UNKNOWN | NO | YES | Store.id | UNKNOWN | UNKNOWN | REQUIRED candidate | YES | — | Baseline §23 | EXPLICIT | NOT_STARTED | — | — |
| Order | NOT_SPECIFIED | display_number | sequential per Store | UNKNOWN | UNKNOWN | NO | NO | — | YES with store_id | REQUIRED unique constraint | YES | — | Baseline §23; §23.1 | EXPLICIT | NOT_STARTED | — | Storage type for sequence not explicitly specified. |
| Order | NOT_SPECIFIED | customer_id | identifier | UNKNOWN | UNKNOWN | NO | YES | Customer.id | UNKNOWN | UNKNOWN | UNKNOWN | YES | — | Baseline §23 | STRONG_INFERENCE | NOT_STARTED | — | — |
| Order | NOT_SPECIFIED | conversation_id | identifier | UNKNOWN | UNKNOWN | NO | YES | Conversation.id | UNKNOWN | UNKNOWN | UNKNOWN | YES | — | Baseline §23 | STRONG_INFERENCE | NOT_STARTED | — | — |
| Order | NOT_SPECIFIED | lifecycle_state | ENUM: DRAFT, CONFIRMED, IN_PRODUCTION, READY, OUT_FOR_DELIVERY, DELIVERED, CANCELLED | UNKNOWN | UNKNOWN | NO | NO | — | UNKNOWN | REQUIRED candidate | YES | Defined order lifecycle | Baseline §23; §74 | EXPLICIT | NOT_STARTED | CONTRACT-002 only if schema encodes event semantics | `order.status_changed` is explicitly contradictory; lifecycle state itself is defined. |
| Order | NOT_SPECIFIED | subtotal_cents | INTEGER cents | UNKNOWN | UNKNOWN | NO | NO | — | UNKNOWN | UNKNOWN | UNKNOWN | YES | — | Baseline §23; §75 | EXPLICIT | NOT_STARTED | — | — |
| Order | NOT_SPECIFIED | discount_cents | INTEGER cents | UNKNOWN | UNKNOWN | NO | NO | — | UNKNOWN | UNKNOWN | UNKNOWN | YES | — | Baseline §23; §75 | EXPLICIT | NOT_STARTED | — | — |
| Order | NOT_SPECIFIED | delivery_fee_cents | INTEGER cents | UNKNOWN | UNKNOWN | NO | NO | — | UNKNOWN | UNKNOWN | UNKNOWN | YES | — | Baseline §23; §75 | EXPLICIT | NOT_STARTED | — | — |
| Order | NOT_SPECIFIED | total_cents | INTEGER cents | UNKNOWN | UNKNOWN | NO | NO | — | UNKNOWN | UNKNOWN | REQUIRED candidate | YES | — | Baseline §23; §74-75 | EXPLICIT | NOT_STARTED | — | Operational revenue uses CONFIRMED.total_cents. |
| Order | NOT_SPECIFIED | currency | BRL | UNKNOWN | BRL in contract | NO | NO | — | UNKNOWN | UNKNOWN | UNKNOWN | YES | — | Baseline §23; §75 | EXPLICIT | NOT_STARTED | — | — |
| Order | NOT_SPECIFIED | delivery_type | UNKNOWN | UNKNOWN | UNKNOWN | NO | NO | — | UNKNOWN | UNKNOWN | UNKNOWN | YES | — | Baseline §23 | EXPLICIT | NOT_STARTED | Field schema gap | Delivery mode values not included in current source. |
| Order | NOT_SPECIFIED | address_id | identifier | UNKNOWN | UNKNOWN | NO | YES | CustomerAddress.id | UNKNOWN | UNKNOWN | UNKNOWN | YES | — | Baseline §23 | STRONG_INFERENCE | NOT_STARTED | — | — |
| Order | NOT_SPECIFIED | payment_method_id | identifier | UNKNOWN | UNKNOWN | NO | YES | PaymentMethod.id | UNKNOWN | UNKNOWN | UNKNOWN | YES | — | Baseline §23 | STRONG_INFERENCE | NOT_STARTED | — | MVP records method; no payment processing. |
| Order | NOT_SPECIFIED | notes | UNKNOWN | UNKNOWN | UNKNOWN | NO | NO | — | UNKNOWN | UNKNOWN | UNKNOWN | YES | — | Baseline §23 | EXPLICIT | NOT_STARTED | — | — |
| Order | NOT_SPECIFIED | timestamps | UTC timestamp fields; exact names unspecified | UNKNOWN | UNKNOWN | NO | NO | — | UNKNOWN | UNKNOWN | UNKNOWN | YES | — | Baseline §23 | PARTIAL | NOT_STARTED | — | — |
| OrderItem | NOT_SPECIFIED | product_name_snapshot | UNKNOWN | UNKNOWN | UNKNOWN | NO | NO | — | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | — | Baseline §23; §76 | EXPLICIT | NOT_STARTED | Field schema gap | Parent order relation and item identity are not enumerated. |
| OrderItem | NOT_SPECIFIED | unit_price_cents_snapshot | INTEGER cents | UNKNOWN | UNKNOWN | NO | NO | — | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | — | Baseline §23; §75 | EXPLICIT | NOT_STARTED | Field schema gap | — |
| OrderItem | NOT_SPECIFIED | quantity | POSITIVE INTEGER | UNKNOWN | UNKNOWN | NO | NO | — | UNKNOWN | CHECK candidate | UNKNOWN | UNKNOWN | — | Baseline §23; domain invariants | EXPLICIT | NOT_STARTED | Field schema gap | Exact parent/key field absent. |
| OrderItem | NOT_SPECIFIED | subtotal_cents | INTEGER cents | UNKNOWN | UNKNOWN | NO | NO | — | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | — | Baseline §23; §75 | EXPLICIT | NOT_STARTED | Field schema gap | — |
| OrderItemModifier | NOT_SPECIFIED | modifier_name_snapshot | UNKNOWN | UNKNOWN | UNKNOWN | NO | NO | — | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | — | Baseline §76 | EXPLICIT | NOT_STARTED | Field schema gap | Parent relation field absent. |
| OrderItemModifier | NOT_SPECIFIED | unit_price_cents_snapshot | INTEGER cents | UNKNOWN | UNKNOWN | NO | NO | — | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | — | Baseline §76 | EXPLICIT | NOT_STARTED | Field schema gap | — |
| OrderItemModifier | NOT_SPECIFIED | quantity | POSITIVE INTEGER | UNKNOWN | UNKNOWN | NO | NO | — | UNKNOWN | CHECK candidate | UNKNOWN | UNKNOWN | — | Baseline §76; quantity invariant | STRONG_INFERENCE | NOT_STARTED | Field schema gap | — |
| OrderItemModifier | NOT_SPECIFIED | subtotal_cents | INTEGER cents | UNKNOWN | UNKNOWN | NO | NO | — | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | — | Baseline §76 | EXPLICIT | NOT_STARTED | Field schema gap | — |
| OrderStatusHistory | NOT_SPECIFIED | from_state | OrderLifecycle state | UNKNOWN | UNKNOWN | NO | NO | — | UNKNOWN | UNKNOWN | UNKNOWN | YES | Order lifecycle | Baseline §23; §74 | EXPLICIT | NOT_STARTED | — | Exact enum storage representation unspecified. |
| OrderStatusHistory | NOT_SPECIFIED | to_state | OrderLifecycle state | UNKNOWN | UNKNOWN | NO | NO | — | UNKNOWN | UNKNOWN | UNKNOWN | YES | Order lifecycle | Baseline §23; §74 | EXPLICIT | NOT_STARTED | — | — |
| OrderStatusHistory | NOT_SPECIFIED | reason | UNKNOWN | UNKNOWN | UNKNOWN | NO | NO | — | UNKNOWN | UNKNOWN | UNKNOWN | YES | — | Baseline §23 | EXPLICIT | NOT_STARTED | — | — |
| OrderStatusHistory | NOT_SPECIFIED | actor | UNKNOWN | UNKNOWN | UNKNOWN | NO | UNKNOWN | Actor identity type unspecified | UNKNOWN | UNKNOWN | UNKNOWN | YES | — | Baseline §23; audit model | PARTIAL | NOT_STARTED | Field schema gap | Actor model not defined at schema level. |
| OrderStatusHistory | NOT_SPECIFIED | timestamp | UTC timestamp | UNKNOWN | UNKNOWN | NO | NO | — | UNKNOWN | UNKNOWN | UNKNOWN | YES | — | Baseline §23 | EXPLICIT | NOT_STARTED | — | — |
| PaymentMethod | NOT_SPECIFIED | method | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | — | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | — | Baseline §23; §75 | PARTIAL | NOT_STARTED | Field schema gap | Only “method informado” is normative; no field-level model. |
| Notification | NOT_SPECIFIED | channel | UNKNOWN | UNKNOWN | UNKNOWN | NO | NO | — | UNKNOWN | UNKNOWN | UNKNOWN | YES/UNKNOWN | — | Baseline §23 | EXPLICIT | NOT_STARTED | Field schema gap | Store scope not explicit at entity field level. |
| Notification | NOT_SPECIFIED | destination | UNKNOWN | UNKNOWN | UNKNOWN | NO | NO | — | UNKNOWN | UNKNOWN | UNKNOWN | YES/UNKNOWN | — | Baseline §23 | EXPLICIT | NOT_STARTED | Field schema gap | — |
| Notification | NOT_SPECIFIED | idempotency data | UNKNOWN | UNKNOWN | UNKNOWN | NO | NO | — | UNKNOWN | UNKNOWN | UNKNOWN | YES/UNKNOWN | — | Baseline §23; §25 | PARTIAL | NOT_STARTED | Field schema gap | Exact key field is unspecified. |
| Notification | NOT_SPECIFIED | attempts | INTEGER candidate | UNKNOWN | UNKNOWN | NO | NO | — | UNKNOWN | UNKNOWN | UNKNOWN | YES/UNKNOWN | — | Baseline §23; §25 | PARTIAL | NOT_STARTED | Field schema gap | — |
| Notification | NOT_SPECIFIED | status | UNKNOWN | UNKNOWN | UNKNOWN | NO | NO | — | UNKNOWN | UNKNOWN | UNKNOWN | YES/UNKNOWN | — | Baseline §23 | EXPLICIT | NOT_STARTED | Field schema gap | — |
| Notification | NOT_SPECIFIED | errors | UNKNOWN | UNKNOWN | UNKNOWN | NO | NO | — | UNKNOWN | UNKNOWN | UNKNOWN | YES/UNKNOWN | — | Baseline §23 | EXPLICIT | NOT_STARTED | Field schema gap | — |
| Notification | NOT_SPECIFIED | timestamps | UTC timestamp fields; exact names unspecified | UNKNOWN | UNKNOWN | NO | NO | — | UNKNOWN | UNKNOWN | UNKNOWN | YES/UNKNOWN | — | Baseline §23 | PARTIAL | NOT_STARTED | — | — |
| Integration | NOT_SPECIFIED | state | ENUM concept: NOT_CONFIGURED, CONNECTED, AUTH_EXPIRED, DEGRADED, UNAVAILABLE | UNKNOWN | UNKNOWN | NO | NO | — | UNKNOWN | UNKNOWN | UNKNOWN | YES/UNKNOWN | Integration state | Baseline §23; §84 | PARTIAL | NOT_STARTED | — | State set is documented globally for integrations, but mapping to each Integration record is not explicit. |
| Integration | NOT_SPECIFIED | field set | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | — | Baseline §23 | PARTIAL | NOT_STARTED | Field schema gap | Integration identity/provider fields are not explicitly enumerated. |
| IntegrationCredential | NOT_SPECIFIED | secure credential reference | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | Windows Secure Storage / secret-management boundary | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | — | Baseline §23; §26 | PARTIAL | BLOCKED | Security boundary | Only a secure reference is normative; raw credentials must not be stored insecurely. |
| IntegrationCredential | NOT_SPECIFIED | field set | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | — | Baseline §23 | UNKNOWN | BLOCKED | Field schema gap | Do not infer OAuth/provider fields. |
| InboundInbox | NOT_SPECIFIED | id | UUIDv7-compatible identifier | UNKNOWN | UNKNOWN | YES | NO | — | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | Processing lifecycle not fully enumerated | Baseline §23; WSS envelope; M5.1 conventions | PARTIAL | NOT_STARTED | — | Entity ID is supported by canonical identifier convention. |
| InboundInbox | NOT_SPECIFIED | provider | UNKNOWN | UNKNOWN | UNKNOWN | NO | NO | — | — | — | REQUIRED candidate via unique tuple | UNKNOWN | — | Baseline §23; §23.1 | EXPLICIT | NOT_STARTED | — | Provider vocabulary is not frozen in schema doc. |
| InboundInbox | NOT_SPECIFIED | external event ID | UNKNOWN | UNKNOWN | UNKNOWN | NO | NO | — | YES with provider | REQUIRED unique | UNKNOWN | — | Baseline §23; §23.1 | EXPLICIT | NOT_STARTED | — | Exact field name not specified. |
| InboundInbox | NOT_SPECIFIED | payload hash/reference | UNKNOWN | UNKNOWN | UNKNOWN | NO | NO | — | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | — | Baseline §23 | EXPLICIT | NOT_STARTED | Field schema gap | Hash vs reference representation unspecified. |
| InboundInbox | NOT_SPECIFIED | processing state | UNKNOWN | UNKNOWN | UNKNOWN | NO | NO | — | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | Processing lifecycle not enumerated | Baseline §23; §85 | PARTIAL | NOT_STARTED | Field schema gap | — |
| InboundInbox | NOT_SPECIFIED | timestamps | UTC timestamp fields; exact names unspecified | UNKNOWN | UNKNOWN | NO | NO | — | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | — | Baseline §23 | PARTIAL | NOT_STARTED | — | — |
| InboundInbox | NOT_SPECIFIED | correlation | UUIDv7-compatible identifier | UNKNOWN | UNKNOWN | NO | NO | — | UNKNOWN | REQUIRED candidate | UNKNOWN | — | Baseline §23 | EXPLICIT | NOT_STARTED | — | Exact field name may be correlation_id; baseline wording is not exact enough for SQL naming. |
| DomainOutbox | NOT_SPECIFIED | event | event payload/reference concept | UNKNOWN | UNKNOWN | NO | UNKNOWN | Event envelope concept | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | — | Baseline §23-24; §73 | PARTIAL | BLOCKED | CONTRACT-001 | Storage/ownership semantics remain ambiguous between local Core and Gateway. |
| DomainOutbox | NOT_SPECIFIED | idempotency key | UNKNOWN | UNKNOWN | UNKNOWN | NO | NO | — | YES | REQUIRED unique | UNKNOWN | — | — | Baseline §23; §23.1 | EXPLICIT | BLOCKED | CONTRACT-001 | Exact field name is not normative but uniqueness is. |
| DomainOutbox | NOT_SPECIFIED | attempts | INTEGER candidate | UNKNOWN | UNKNOWN | NO | NO | — | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | — | Baseline §23; §25 | PARTIAL | BLOCKED | CONTRACT-001 | — |
| DomainOutbox | NOT_SPECIFIED | processed state | UNKNOWN | UNKNOWN | UNKNOWN | NO | NO | — | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | — | Baseline §23; §73 | PARTIAL | BLOCKED | CONTRACT-001 | Exact lifecycle not specified. |
| Job | NOT_SPECIFIED | type | UNKNOWN | UNKNOWN | UNKNOWN | NO | NO | — | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | — | Baseline §23; §25 | EXPLICIT | NOT_STARTED | Field schema gap | — |
| Job | NOT_SPECIFIED | state | UNKNOWN | UNKNOWN | UNKNOWN | NO | NO | — | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | — | Baseline §23; §25 | EXPLICIT | NOT_STARTED | Field schema gap | — |
| Job | NOT_SPECIFIED | payload reference | UNKNOWN | UNKNOWN | UNKNOWN | NO | UNKNOWN | Payload reference | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | — | Baseline §23 | PARTIAL | NOT_STARTED | Field schema gap | — |
| Job | NOT_SPECIFIED | scheduling | UNKNOWN | UNKNOWN | UNKNOWN | NO | NO | — | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | — | Baseline §23 | EXPLICIT | NOT_STARTED | Field schema gap | Exact fields such as run_at are not normative. |
| Job | NOT_SPECIFIED | lock/attempts | UNKNOWN | UNKNOWN | UNKNOWN | NO | NO | — | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | — | Baseline §23; §25 | PARTIAL | NOT_STARTED | Field schema gap | — |
| AuditLog | NOT_SPECIFIED | actor | UNKNOWN | UNKNOWN | UNKNOWN | NO | UNKNOWN | Actor identity model | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | — | Baseline §23; backend audit | EXPLICIT | NOT_STARTED | Field schema gap | — |
| AuditLog | NOT_SPECIFIED | action | UNKNOWN | UNKNOWN | UNKNOWN | NO | NO | — | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | — | Baseline §23; backend audit | EXPLICIT | NOT_STARTED | — | Critical actions are enumerated in audit documentation. |
| AuditLog | NOT_SPECIFIED | entity | UNKNOWN | UNKNOWN | UNKNOWN | NO | UNKNOWN | Canonical entity reference | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | — | Baseline §23; backend audit | EXPLICIT | NOT_STARTED | Field schema gap | Entity identification format unspecified. |
| AuditLog | NOT_SPECIFIED | before/after reference | UNKNOWN | UNKNOWN | UNKNOWN | NO | NO | — | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | — | Backend audit | EXPLICIT | NOT_STARTED | Field schema gap | Reference representation not specified. |
| AuditLog | NOT_SPECIFIED | correlation | UUIDv7-compatible identifier | UNKNOWN | UNKNOWN | NO | NO | — | UNKNOWN | REQUIRED candidate | UNKNOWN | — | Backend audit | EXPLICIT | NOT_STARTED | — | — |
| AuditLog | NOT_SPECIFIED | timestamp | UTC timestamp | UNKNOWN | UNKNOWN | NO | NO | — | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | — | Backend audit | EXPLICIT | NOT_STARTED | — | — |
| Log | NOT_SPECIFIED | timestamp | UTC timestamp | UNKNOWN | UNKNOWN | NO | NO | — | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | — | Baseline §28 / §23 | EXPLICIT | NOT_STARTED | — | — |
| Log | NOT_SPECIFIED | level | ENUM: DEBUG, INFO, WARNING, ERROR, CRITICAL | UNKNOWN | UNKNOWN | NO | NO | — | UNKNOWN | REQUIRED candidate | UNKNOWN | — | Baseline §28 | EXPLICIT | NOT_STARTED | — | — |
| Log | NOT_SPECIFIED | category | ENUM: SYSTEM, WHATSAPP, AI, ORDER, CUSTOMER, GOOGLE, NOTIFICATION, DATABASE, SECURITY | UNKNOWN | UNKNOWN | NO | NO | — | UNKNOWN | REQUIRED candidate | UNKNOWN | — | Baseline §28 | EXPLICIT | NOT_STARTED | — | Do not add categories without approval. |
| Log | NOT_SPECIFIED | event | UNKNOWN | UNKNOWN | UNKNOWN | NO | NO | — | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | — | Baseline §28 | EXPLICIT | NOT_STARTED | — | — |
| Log | NOT_SPECIFIED | correlation | UUIDv7-compatible identifier | UNKNOWN | UNKNOWN | NO | NO | — | UNKNOWN | REQUIRED candidate | UNKNOWN | — | Baseline §28 | EXPLICIT | NOT_STARTED | — | Exact field name may be correlation_id. |
| Log | NOT_SPECIFIED | entity | UNKNOWN | UNKNOWN | UNKNOWN | NO | UNKNOWN | Canonical entity reference | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | — | Baseline §28 | EXPLICIT | NOT_STARTED | Field schema gap | — |
| Log | NOT_SPECIFIED | message | UNKNOWN | UNKNOWN | UNKNOWN | NO | NO | — | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | — | Baseline §28 | EXPLICIT | NOT_STARTED | — | — |
| Log | NOT_SPECIFIED | error code | UNKNOWN | UNKNOWN | UNKNOWN | NO | NO | — | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | — | Baseline §28 | EXPLICIT | NOT_STARTED | Field schema gap | — |
| Log | NOT_SPECIFIED | metadata | UNKNOWN | UNKNOWN | UNKNOWN | NO | NO | — | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | — | Baseline §28 | EXPLICIT | NOT_STARTED | Field schema gap | Representation unspecified. |
| AIProfile | NOT_SPECIFIED | attendant profile | UNKNOWN | UNKNOWN | UNKNOWN | NO | NO | — | UNKNOWN | UNKNOWN | UNKNOWN | YES/UNKNOWN | — | Baseline §10; §23 | PARTIAL | NOT_STARTED | Field schema gap | Product describes name/tone/formality/emojis/goal/rules but does not freeze SQL columns here. |
| AIProfile | NOT_SPECIFIED | rules version | UNKNOWN | UNKNOWN | UNKNOWN | NO | NO | — | UNKNOWN | UNKNOWN | UNKNOWN | YES/UNKNOWN | — | Baseline §79 | EXPLICIT | NOT_STARTED | Field schema gap | — |
| AIProfile | NOT_SPECIFIED | objectives | UNKNOWN | UNKNOWN | UNKNOWN | NO | NO | — | UNKNOWN | UNKNOWN | UNKNOWN | YES/UNKNOWN | — | Baseline §10; §77 | EXPLICIT | NOT_STARTED | Field schema gap | — |
| AIProfile | NOT_SPECIFIED | model | UNKNOWN | UNKNOWN | UNKNOWN | NO | NO | — | UNKNOWN | UNKNOWN | UNKNOWN | YES/UNKNOWN | — | Baseline §23; §79 | EXPLICIT | NOT_STARTED | — | — |
| AIProfile | NOT_SPECIFIED | temperature | UNKNOWN numeric representation | UNKNOWN | UNKNOWN | NO | NO | — | UNKNOWN | UNKNOWN | UNKNOWN | YES/UNKNOWN | — | Baseline §10; §12 | EXPLICIT | NOT_STARTED | Field schema gap | Do not choose REAL/INTEGER without contract evidence. |
| AIProfile | NOT_SPECIFIED | token limit | INTEGER candidate | UNKNOWN | UNKNOWN | NO | NO | — | UNKNOWN | UNKNOWN | UNKNOWN | YES/UNKNOWN | — | Baseline §10; §79 | PARTIAL | NOT_STARTED | Field schema gap | Exact limit semantics unspecified. |
| AIExecution | NOT_SPECIFIED | model | UNKNOWN | UNKNOWN | UNKNOWN | NO | NO | — | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | — | Baseline §79 | EXPLICIT | NOT_STARTED | — | — |
| AIExecution | NOT_SPECIFIED | model version/digest | UNKNOWN | UNKNOWN | UNKNOWN | NO | NO | — | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | — | Baseline §79 | EXPLICIT | NOT_STARTED | Field schema gap | — |
| AIExecution | NOT_SPECIFIED | prompt version | UNKNOWN | UNKNOWN | UNKNOWN | NO | NO | — | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | — | Baseline §79 | EXPLICIT | NOT_STARTED | — | — |
| AIExecution | NOT_SPECIFIED | policy version | UNKNOWN | UNKNOWN | UNKNOWN | NO | NO | — | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | — | Baseline §79 | EXPLICIT | NOT_STARTED | — | — |
| AIExecution | NOT_SPECIFIED | knowledge version | UNKNOWN | UNKNOWN | UNKNOWN | NO | NO | — | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | — | Baseline §79 | EXPLICIT | NOT_STARTED | — | — |
| AIExecution | NOT_SPECIFIED | input hash | UNKNOWN | UNKNOWN | UNKNOWN | NO | NO | — | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | — | Baseline §79 | EXPLICIT | NOT_STARTED | Field schema gap | Hash algorithm not specified. |
| AIExecution | NOT_SPECIFIED | tool calls | UNKNOWN | UNKNOWN | UNKNOWN | NO | NO | — | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | — | Baseline §79 | EXPLICIT | NOT_STARTED | Field schema gap | Representation unspecified. |
| AIExecution | NOT_SPECIFIED | validation | UNKNOWN | UNKNOWN | UNKNOWN | NO | NO | — | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | — | Baseline §79 | EXPLICIT | NOT_STARTED | Field schema gap | — |
| AIExecution | NOT_SPECIFIED | latency | UNKNOWN numeric representation | UNKNOWN | UNKNOWN | NO | NO | — | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | — | Baseline §79 | EXPLICIT | NOT_STARTED | Field schema gap | Unit not explicitly frozen at schema level. |
| AIExecution | NOT_SPECIFIED | token usage | UNKNOWN | UNKNOWN | UNKNOWN | NO | NO | — | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | — | Baseline §79 | EXPLICIT | NOT_STARTED | Field schema gap | — |
| AIExecution | NOT_SPECIFIED | fallback | UNKNOWN | UNKNOWN | UNKNOWN | NO | NO | — | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | — | Baseline §79 | EXPLICIT | NOT_STARTED | — | — |
| AIExecution | NOT_SPECIFIED | timestamps | UTC timestamp fields; exact names unspecified | UNKNOWN | UNKNOWN | NO | NO | — | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | — | Baseline §79 | PARTIAL | NOT_STARTED | — | — |
| KnowledgeItem | NOT_SPECIFIED | store_id | identifier | UNKNOWN | UNKNOWN | NO | YES | Store.id | UNKNOWN | REQUIRED candidate | YES | — | Baseline §23 | EXPLICIT | NOT_STARTED | — | Store-scoped knowledge is explicit. |
| KnowledgeItem | NOT_SPECIFIED | structured content | UNKNOWN | UNKNOWN | UNKNOWN | NO | NO | — | UNKNOWN | UNKNOWN | UNKNOWN | YES | — | Baseline §11; §23 | PARTIAL | NOT_STARTED | Field schema gap | Exact content/type/category fields are not specified. |

## Relationship matrix

| Source Entity | Source Field / Concept | Target Entity | Target Field | Cardinality | Delete Behavior | Update Behavior | Evidence | Strength | Status / Blocker |
|---|---|---|---|---|---|---|---|---|---|
| Device | store_id | Store | id | MANY:1 | UNKNOWN | UNKNOWN | Baseline §23, §65-66 | EXPLICIT | NOT_STARTED |
| Product | store_id | Store | id | MANY:1 | UNKNOWN | UNKNOWN | Baseline §23 | EXPLICIT | NOT_STARTED |
| Product | category_id | ProductCategory | id | MANY:1 expected | UNKNOWN | UNKNOWN | Baseline §23 | STRONG_INFERENCE | Field contract incomplete |
| ProductModifier | store_id | Store | id | MANY:1 | UNKNOWN | UNKNOWN | Baseline §23 | EXPLICIT | NOT_STARTED |
| ProductModifier | product_id | Product | id | MANY:1 | UNKNOWN | UNKNOWN | Baseline §23, §76 | STRONG_INFERENCE | NOT_STARTED |
| ProductImage | product_id | Product | id | MANY:1 | UNKNOWN | UNKNOWN | Baseline §23 | STRONG_INFERENCE | NOT_STARTED |
| Promotion | store_id | Store | id | MANY:1 expected | UNKNOWN | UNKNOWN | Baseline §23 | STRONG_INFERENCE | Field contract incomplete |
| Customer | store_id | Store | id | MANY:1 | UNKNOWN | UNKNOWN | Baseline §23 | STRONG_INFERENCE | NOT_STARTED |
| CustomerAddress | customer relation | Customer | id | MANY:1 expected | UNKNOWN | UNKNOWN | Baseline §23 “structured + is_default” | STRONG_INFERENCE | Field name not specified |
| Conversation | store_id | Store | id | MANY:1 | UNKNOWN | UNKNOWN | Baseline §23 | STRONG_INFERENCE | NOT_STARTED |
| Conversation | customer_id | Customer | id | MANY:1 | UNKNOWN | UNKNOWN | Baseline §23 | STRONG_INFERENCE | NOT_STARTED |
| Message | store_id | Store | id | MANY:1 | UNKNOWN | UNKNOWN | Baseline §23 | STRONG_INFERENCE | NOT_STARTED |
| Message | conversation_id | Conversation | id | MANY:1 | UNKNOWN | UNKNOWN | Baseline §23 | STRONG_INFERENCE | NOT_STARTED |
| Message | raw_event_reference | InboundInbox | internal id | MANY:1 expected | UNKNOWN | UNKNOWN | Baseline §23; §82 | EXPLICIT | NOT_STARTED |
| Order | store_id | Store | id | MANY:1 | UNKNOWN | UNKNOWN | Baseline §23 | EXPLICIT | NOT_STARTED |
| Order | customer_id | Customer | id | MANY:1 | UNKNOWN | UNKNOWN | Baseline §23 | STRONG_INFERENCE | NOT_STARTED |
| Order | conversation_id | Conversation | id | MANY:1 expected | UNKNOWN | UNKNOWN | Baseline §23 | STRONG_INFERENCE | Field behavior incomplete |
| Order | address_id | CustomerAddress | id | MANY:1 expected | UNKNOWN | UNKNOWN | Baseline §23 | STRONG_INFERENCE | Field contract incomplete |
| Order | payment_method_id | PaymentMethod | id | MANY:1 expected | UNKNOWN | UNKNOWN | Baseline §23 | STRONG_INFERENCE | PaymentMethod schema incomplete |
| OrderItem | parent order relation | Order | UNKNOWN | MANY:1 required conceptually | UNKNOWN | UNKNOWN | Baseline §23 order-item section | STRONG_INFERENCE | **Field not named; blocks deterministic FK specification** |
| OrderItemModifier | parent item relation | OrderItem | UNKNOWN | MANY:1 required conceptually | UNKNOWN | UNKNOWN | Baseline §76 | STRONG_INFERENCE | **Field not named; blocks deterministic FK specification** |
| OrderItemModifier | modifier relation | ProductModifier | UNKNOWN | MANY:1 expected | UNKNOWN | UNKNOWN | Baseline §76 | STRONG_INFERENCE | Field not named; snapshot is normative, identity relation is not |
| OrderStatusHistory | parent order relation | Order | UNKNOWN | MANY:1 required conceptually | UNKNOWN | UNKNOWN | Baseline §23 | STRONG_INFERENCE | **Field not named; blocks deterministic FK specification** |
| IntegrationCredential | secure credential reference | external secure store | UNKNOWN | MANY:1/1:1 unknown | N/A | UNKNOWN | Baseline §26 | EXPLICIT | Security boundary; no raw secrets in SQLite |
| InboundInbox | provider + external event ID | external provider event | UNKNOWN | MANY:1 event identity | N/A | N/A | Baseline §23.1 | EXPLICIT | Unique deduplication tuple is normative |
| KnowledgeItem | store_id | Store | id | MANY:1 | UNKNOWN | UNKNOWN | Baseline §23 | EXPLICIT | NOT_STARTED |

## Constraint matrix

| Constraint | Entity/Table | Definition | Classification | Evidence | Status | Blocker |
|---|---|---|---|---|---|---|
| Primary key | all entity tables | UUIDv7-compatible entity IDs where supported | REQUIRED_BY_CONTRACT | Baseline §23; domain UUIDv7 primitive | DOCUMENTED | None |
| UNIQUE | Customer | `(store_id, phone_normalized)` | REQUIRED_BY_CONTRACT | Baseline §23.1 | DOCUMENTED | None |
| UNIQUE | Conversation | `(store_id, external_thread_id)` | REQUIRED_BY_CONTRACT | Baseline §23.1 | DOCUMENTED | None |
| UNIQUE | Message | `(store_id, external_message_id)` | REQUIRED_BY_CONTRACT | Baseline §23.1 | DOCUMENTED | None |
| UNIQUE | InboundInbox | `(provider, external_event_id)` | REQUIRED_BY_CONTRACT | Baseline §23.1 | DOCUMENTED | None |
| UNIQUE | DomainOutbox | `(idempotency_key)` | REQUIRED_BY_CONTRACT | Baseline §23.1 | BLOCKED | CONTRACT-001 affects ownership/scope |
| UNIQUE | Order | `(store_id, display_number)` | REQUIRED_BY_CONTRACT | Baseline §23.1 | DOCUMENTED | None |
| UNIQUE | Device | `(store_id, id)` | REQUIRED_BY_CONTRACT | Baseline §23.1 | DOCUMENTED | None |
| CHECK | Product price | integer cents | STRONGLY_JUSTIFIED | Money contract | DOCUMENTED | Exact SQL domain/check representation not separately frozen |
| CHECK | ProductModifier price | integer cents | STRONGLY_JUSTIFIED | Money contract | DOCUMENTED | Exact SQL representation not frozen |
| CHECK | Order monetary fields | integer cents | STRONGLY_JUSTIFIED | Money contract | DOCUMENTED | Exact SQL representation not frozen |
| CHECK | OrderItem quantity | positive integer | REQUIRED_BY_CONTRACT | Domain invariant | DOCUMENTED | Exact SQL check syntax not frozen |
| CHECK | OrderItemModifier quantity | positive integer | REQUIRED_BY_CONTRACT | Quantity invariant | DOCUMENTED | Exact SQL check syntax not frozen |
| CHECK | Promotion.type | `FIXED_AMOUNT` / `PERCENTAGE` only | REQUIRED_BY_CONTRACT | Baseline §75 | DOCUMENTED | Representation not frozen |
| CHECK | currency fields | `BRL` | REQUIRED_BY_CONTRACT | Baseline §75 | DOCUMENTED | Exact SQL check syntax not frozen |
| CHECK | status/lifecycle fields | defined enum sets | REQUIRED_BY_CONTRACT where state set is explicit | Domain state machines; §74 | DOCUMENTED | Exact SQL representation not frozen |
| FK | store-scoped entities | `store_id -> Store.id` where explicitly/strongly implied | REQUIRED/STRONG by entity structure | Baseline §23 | PARTIAL | Individual nullability/delete behavior absent |
| FK | product/category/modifier/image | entity relations named by fields | STRONGLY_JUSTIFIED | Baseline §23, §76 | PARTIAL | Delete/update behavior absent |
| FK | order/customer/conversation/address/payment | named relation fields | STRONGLY_JUSTIFIED | Baseline §23 | PARTIAL | Delete/update behavior absent |
| FK | message/raw event | `raw_event_reference -> InboundInbox internal ID` | REQUIRED_BY_CONTRACT | Baseline §23; §82 | PARTIAL | Exact target PK naming not frozen |

## Index matrix

Only one class of indexes is fully normative in the current contract layer: the six/equivalent uniqueness indexes plus Device unique composite. Additional indexing must not be added merely for anticipated performance.

| Table | Fields | Unique | Classification | Motivation | Evidence | Status |
|---|---|---|---|---|---|---|
| Customer | `store_id, phone_normalized` | YES | REQUIRED_BY_CONTRACT | Customer deduplication | Baseline §23.1 | DOCUMENTED |
| Conversation | `store_id, external_thread_id` | YES | REQUIRED_BY_CONTRACT | Conversation external-thread deduplication | Baseline §23.1 | DOCUMENTED |
| Message | `store_id, external_message_id` | YES | REQUIRED_BY_CONTRACT | Message external-ID deduplication | Baseline §23.1 | DOCUMENTED |
| InboundInbox | `provider, external_event_id` | YES | REQUIRED_BY_CONTRACT | Inbound event deduplication | Baseline §23.1 | DOCUMENTED |
| DomainOutbox | `idempotency_key` | YES | REQUIRED_BY_CONTRACT | External effect idempotency | Baseline §23.1 | BLOCKED by CONTRACT-001 |
| Order | `store_id, display_number` | YES | REQUIRED_BY_CONTRACT | Sequential per-store order number uniqueness | Baseline §23.1 | DOCUMENTED |
| Device | `store_id, id` | YES | REQUIRED_BY_CONTRACT | Device uniqueness within Store | Baseline §23.1 | DOCUMENTED |

**Non-normative index candidates intentionally excluded:** indexes on timestamps, foreign keys, lifecycle/status, sequence, correlation/causation, and lookup fields. They may be operationally justified later but are not contractually established by the current Phase 1 evidence.

## Blocker matrix

| ID | Scope | Impact on schema | Status | Required resolution |
|---|---|---|---|---|
| CONTRACT-001 | DomainOutbox | Can change physical ownership, fields, transaction boundary and cross-boundary persistence model | BLOCKING | Define whether local Core and Gateway references represent one logical contract or distinct persistence concerns and assign ownership/scope explicitly. |
| CONTRACT-002 | `order.status_changed` | Affects event-facing columns/metadata only if schema is designed around the disputed event model | OPEN / CONDITIONAL | Resolve whether `order.status_changed` is normative; do not encode event semantics in schema before decision. |
| GOV-001 | Baseline/document authority | Can change which field-level specification is normative where sources differ | OPEN | Establish authoritative version/history rules between baseline and `docs/product`. |
| FIELD-GAPS | Multiple entities | Prevents deterministic DDL for nullability/defaults/types/FKs | BLOCKING FOR DETERMINISTIC 0002 | Publish authoritative field-level schema for currently partial entities or approve explicit schema decisions through governance. |
| TABLE-NAMING | All entities | Physical table names are not explicitly frozen | OPEN | Decide/approve SQL naming convention before implementation; do not silently encode it as normative. |

## Implementation readiness matrix

| Entity | Contract completeness | Relationship completeness | Constraint completeness | Implementation readiness | 0002 readiness |
|---|---|---|---|---|---|
| Store | PARTIAL | HIGH | PARTIAL | BLOCKED_BY_FIELD_GAPS | NO |
| Device | PARTIAL | HIGH | HIGH for unique identity | BLOCKED_BY_FIELD_GAPS | NO |
| Settings | LOW | UNKNOWN | LOW | BLOCKED | NO |
| ProductCategory | LOW | UNKNOWN | LOW | BLOCKED | NO |
| Product | HIGH conceptually / field details partial | HIGH | PARTIAL | BLOCKED_BY_FIELD_GAPS | NO |
| ProductModifier | HIGH conceptually / field details partial | HIGH | PARTIAL | BLOCKED_BY_FIELD_GAPS | NO |
| ProductImage | PARTIAL | MEDIUM | LOW | BLOCKED | NO |
| Promotion | PARTIAL | LOW | PARTIAL | BLOCKED | NO |
| Customer | HIGH conceptually / field details partial | HIGH | HIGH for declared unique | BLOCKED_BY_FIELD_GAPS | NO |
| CustomerAddress | LOW | LOW | LOW | BLOCKED | NO |
| Conversation | HIGH | HIGH | HIGH for declared unique | BLOCKED_BY_FIELD_GAPS | NO |
| Message | HIGH | HIGH | HIGH for declared unique | BLOCKED_BY_FIELD_GAPS | NO |
| Order | HIGH conceptually / field details partial | HIGH | HIGH for lifecycle/unique concept | BLOCKED_BY_FIELD_GAPS + CONDITIONAL CONTRACT-002 | NO |
| OrderItem | PARTIAL | LOW | PARTIAL | BLOCKED | NO |
| OrderItemModifier | PARTIAL | LOW | PARTIAL | BLOCKED | NO |
| OrderStatusHistory | PARTIAL | LOW | LOW | BLOCKED | NO |
| PaymentMethod | LOW | UNKNOWN | LOW | BLOCKED | NO |
| Notification | PARTIAL | UNKNOWN | LOW | BLOCKED | NO |
| Integration | PARTIAL | UNKNOWN | LOW | BLOCKED | NO |
| IntegrationCredential | LOW | UNKNOWN | LOW | BLOCKED_BY_SECURITY_SCHEMA_GAP | NO |
| InboundInbox | HIGH conceptually / field details partial | MEDIUM | HIGH for declared unique | BLOCKED_BY_FIELD_GAPS | NO |
| DomainOutbox | PARTIAL | AMBIGUOUS | HIGH for declared unique | BLOCKED_BY_CONTRACT-001 | NO |
| Job | PARTIAL | UNKNOWN | LOW | BLOCKED | NO |
| AuditLog | PARTIAL | UNKNOWN | LOW | BLOCKED | NO |
| Log | HIGH conceptually / field details partial | UNKNOWN | PARTIAL | BLOCKED_BY_FIELD_GAPS | NO |
| AIProfile | PARTIAL | UNKNOWN | LOW | BLOCKED | NO |
| AIExecution | PARTIAL | UNKNOWN | LOW | BLOCKED_BY_FIELD_GAPS | NO |
| KnowledgeItem | PARTIAL | HIGH on store scope | LOW | BLOCKED_BY_FIELD_GAPS | NO |

## Schema-level findings

1. The canonical entity inventory is explicit and contains exactly 28 entities.
2. The baseline gives useful field-level content for 21 of the entities, but it does not provide a complete executable schema for any of the 28 entities.
3. Seven entities are especially underspecified at field level: `Settings`, `ProductCategory`, `CustomerAddress`, `PaymentMethod`, `Integration`, `IntegrationCredential`, and `KnowledgeItem`; several others remain partial because parent/identifier/default/nullability details are missing.
4. The seven normative unique constraints are explicit: Customer, Conversation, Message, InboundInbox, DomainOutbox, Order and Device.
5. Money representation is explicit: integer cents and BRL; floating-point storage is prohibited.
6. UTC persistence is explicit; exact timestamp column names are not.
7. UUIDv7 is the identifier direction, but exact primary-key/default generation semantics are not SQL-frozen.
8. Store scoping is explicit for the operational entity model, but the current baseline does not enumerate a `store_id` column for every entity in the 28-entity list. Such columns must not be invented purely for consistency.
9. Foreign-key target relationships are partly explicit through field names and entity structure, but delete/update actions and several parent-key field names are absent.
10. The existing M5.1 migration remains metadata-only; no canonical business table is currently implemented.
11. `DomainOutbox` is not implementation-ready because of `CONTRACT-001`.
12. `order.status_changed` must not be used as a schema driver until `CONTRACT-002` is resolved.
13. No performance-only indexes are currently contractually justified beyond the normative unique indexes.

## Phase 1 gate result

**PHASE 1 AUDIT: COMPLETE WITH BLOCKERS.**

The matrix is sufficiently complete to identify what is known and what remains unspecified, but it is **not yet sufficient to generate a deterministic 0002 migration**. The next phase requires authoritative closure of field-level gaps and the schema naming/relationship details identified above. No migration is created in Phase 1.
