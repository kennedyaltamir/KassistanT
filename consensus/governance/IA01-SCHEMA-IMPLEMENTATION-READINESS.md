# IA-01 — Schema Implementation Readiness

Status: **SCHEMA_IMPLEMENTATION_READY = FALSE**
Authority: `IA-01_SCHEMA_IMPLEMENTATION_READINESS`
Implementation point: `0e1897cae007530cbe8aed20b97e04a25340cc87`
Branch: `ia01/schema-readiness-20260824`

## 1. Verdict

A parte da superfície física diretamente sustentada pelos contratos já aprovados foi reconciliada, mas o schema completo solicitado para `Customer`, `Conversation`, `Message`, `Inbox`, `Product`, `Order`, `Inventory`, `InventoryMovement`, `Sale` e `DomainOutbox` **não é deterministicamente implementable ainda**.

`SCHEMA_IMPLEMENTATION_READY = FALSE`.

Isso decorre de gaps de autoridade física/semântica, não de `GOV-DRIFT-0002`, Customer Identity, Conversation, Message ou CONTRACT-001.

## 2. Repository facts

- `MVP2` remoto no início da reconciliação: `0e1897cae007530cbe8aed20b97e04a25340cc87`.
- `tmp/ia02-core-mvp` permanece em `0e1897cae007530cbe8aed20b97e04a25340cc87` e não foi alterado.
- PR #24 permanece separado e não foi alterado por este ciclo.
- `0001_bootstrap.sql` cria somente `_schema_metadata`.
- `0002_c1_product_order.sql` existe fisicamente e permanece `NON_AUTHORITATIVE_HISTORICAL_ARTIFACT`.

## 3. Deterministic contract surfaces

### Customer

Frozen identity:

`UNIQUE(store_id, phone_normalized)`.

Logical fields explicitly supported by the current evidence set include `id`, `store_id`, `phone_normalized`, `name`, `notes` and timestamps. Google identifiers/status/history fields exist in broader domain documentation but are not required for the minimal identity contract.

Physical PK representation may use the repository UUID convention, but exact nullability/default clauses are not globally frozen.

**Status:** PARTIALLY DETERMINISTIC; blocked for final DDL by field-level nullability/default and physical-key closure.

### Conversation

Frozen semantics:

- `Customer 1:N Conversation`
- `Conversation.id != external_thread_id`
- `UNIQUE(store_id, external_thread_id)`
- `customer_id -> customer.id` is an explicit relationship.

Lifecycle/ownership/AI state value sets are documented, but their SQL physical encoding and exact nullability/defaults are not frozen.

**Status:** PARTIALLY DETERMINISTIC; blocked for final DDL by physical state encoding/nullability/defaults.

### Message

Frozen semantics:

- `conversation_id -> conversation.id`
- inbound provider idempotency: `UNIQUE(store_id, external_message_id)`.

Logical direction/type/lifecycle/correlation fields are documented, but complete physical encoding and nullability/defaults are not frozen.

Outbound identity is explicitly not frozen.

**Status:** PARTIALLY DETERMINISTIC; blocked for final DDL by field-level physical contract gaps.

### Inbox / InboundInbox

`UNIQUE(provider, external_event_id)` is frozen by the existing evidence set.

The exact processing/reconciliation/correlation field contract is not sufficiently closed to generate deterministic DDL without inventing semantics.

**Status:** BLOCKED.

### Product / Order / OrderItem / OrderItemModifier

Existing physical migration and repository code demonstrate a partial Product/Order surface, but that physical shape is not the normative baseline because Migration 0002 is non-authoritative.

The existing DDL uses:

- `price_amount_cents` / `price_currency` on Product;
- `total_amount_cents` / `total_currency` on Order;
- snapshot fields on OrderItem and OrderItemModifier;
- explicit FK cascade behavior on child rows.

The canonical documentation uses different logical names in places, including `price_cents`, `currency`, `total_cents` and snapshot naming. Therefore the existing physical surface cannot simply be promoted to canonical DDL.

Order/OrderItem/OrderItemModifier also retain unresolved semantic ownership/parent-key/FK-action questions.

**Status:** BLOCKED pending physical reconciliation with the semantic contract.

### Inventory / InventoryMovement

The current mandate proposes fields, uniqueness and the non-negative on-hand invariant, but the current repository evidence set does not contain an approved Inventory contract establishing these as normative domain semantics.

IA-01 cannot promote the supplied candidate model to a canonical business schema without explicit semantic authority evidence.

**Status:** STOP_AT_SCHEMA_AUTHORITY_BOUNDARY.

### Sale

The current mandate proposes a `sale` table and `UNIQUE(store_id, order_id)`, but the current repository evidence does not contain a frozen Sale entity contract sufficient to establish its cardinality, lifecycle, monetary snapshot semantics or uniqueness as normative.

`CONFIRMED` is the operational sale milestone, but that does not itself freeze a separate `Sale` persistence aggregate/table.

**Status:** STOP_AT_SCHEMA_AUTHORITY_BOUNDARY.

### DomainOutbox

CONTRACT-001 is resolved:

- Domain owns event intent.
- IA-03 owns durable Outbox mechanics and worker.
- Business state + intent share the required atomic transaction boundary where applicable.
- Provider invocation occurs only after durable intent exists.

The exact physical field inventory requested by this mandate (`store_id`, `event_type`, `aggregate_type`, `aggregate_id`, `payload`, `status`, etc.) is not fully established by the current approved schema contract.

Existing normative evidence freezes `idempotency_key` uniqueness, but does not authorize IA-01 to invent every remaining physical field or retry/status model.

**Status:** PARTIALLY DETERMINISTIC; blocked for final DDL.

## 4. Blocking conditions

1. Final nullability/default semantics are not frozen for all required tables.
2. FK `ON DELETE` / `ON UPDATE` semantics are not frozen for all required relationships.
3. Product/Order logical field names and existing physical field names are not fully reconciled into one canonical DDL contract.
4. Inventory and InventoryMovement semantic contracts are not sufficiently evidenced as normative.
5. Sale table semantics and uniqueness are not sufficiently evidenced as normative.
6. DomainOutbox physical field inventory beyond the frozen idempotency surface is incomplete.
7. Order child parent keys / OrderStatusHistory persistence details remain unresolved in the schema authority matrix.

## 5. Explicit non-actions

- No migration executed.
- Migration 0002 untouched.
- No new executable migration created.
- No runtime implementation performed.
- PR #24 untouched.
- `tmp/ia02-core-mvp` untouched.
- No normative decision reopened.

## 6. Readiness conclusion

The correct state is:

`SCHEMA_IMPLEMENTATION_READY = FALSE`

`STOP_AT_SCHEMA_AUTHORITY_BOUNDARY`

IA-02 cannot safely receive a claim that the complete requested physical surface is deterministic without inventing schema semantics for Inventory, InventoryMovement, Sale and unresolved field-level details.

The next legitimate action is to obtain/record the missing semantic contracts, then rerun IA-01 schema reconciliation.
