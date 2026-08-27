# IA-01 — Migration 0002 Readiness

Status: **BLOCKED — DECISION PACKAGE PENDING**
Migration `0002`: **PROHIBITED**

## Reclassified table readiness

| Category | Tables |
|---|---|
| READY_AFTER_LOCAL_DECISION | `store`, `product_image`, `log` |
| READY_AFTER_CROSS_AGENT_DECISION | `device`, `product`, `product_modifier`, `promotion`, `customer`, `conversation`, `message`, `order`, `notification`, `inbound_inbox`, `job`, `audit_log`, `ai_profile`, `ai_execution` |
| READY_AFTER_GLOBAL_DECISION | `domain_outbox` |
| READY_AFTER_EXTERNAL_DECISION | none |
| BLOCKED | `settings`, `product_category`, `customer_address`, `order_item`, `order_item_modifier`, `order_status_history`, `payment_method`, `integration`, `integration_credential`, `knowledge_item` |

## Important interpretation

These categories describe the decision authority required to make the table deterministic. They do not mean that the required decision has already been approved.

### Local decisions

IA-01 may propose and, after explicit operator confirmation, standardize physical SQLite choices for already-frozen semantics: table/column naming, UUID textual representation, UTC timestamp textual representation, boolean `INTEGER 0/1`, JSON payloads as `TEXT`, and deferral of performance-only indexes.

### Cross-agent decisions

Semantic owners must close field inventory, nullability/defaults, lifecycle catalogs, parent keys, store scope and FK actions before IA-01 can freeze DDL. Primary authorities are IA-02, IA-04, IA-05, IA-06 and IA-03 according to `SCHEMA-AUTHORITY-MATRIX.md`.

### Global decision

`DomainOutbox` remains dependent on CONTRACT-001 because physical ownership/scope may differ between local Core and Gateway.

## Non-blocking items

`CONTRACT-002` is currently non-blocking for physical schema. The order lifecycle state remains defined; the disputed `order.status_changed` event catalog does not require a schema change unless the approved event decision introduces persisted state/history changes.

Performance-only indexes are deferred and do not block `0002`.

## Required gate

`0002` becomes authorized only when every table included in the migration is deterministic and every schema-critical dependency is either explicitly approved or explicitly excluded by approved scope. Deferred future tables may remain outside the migration only through an explicit scope decision.
