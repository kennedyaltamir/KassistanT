# IA-01 — Schema Decision Matrix

Status: **DECISION PACKAGE / RESPONSE CONSOLIDATION**

This matrix separates physical decisions owned by IA-01 from semantic decisions owned by other agents and global governance. A recommendation never becomes a decision without explicit approval.

## IA-01 local decisions

| Decision ID | Question | Current State | Recommendation | Approval |
|---|---|---|---|---|
| SD-001 | Physical SQL naming | PROPOSAL | `lower_snake_case` for physical table/column names | OPERATOR REQUIRED |
| SD-002 | UUID physical representation | PROPOSAL | canonical UUID string in SQLite `TEXT` | OPERATOR REQUIRED |
| SD-003 | UTC timestamp representation | PROPOSAL | canonical RFC3339/ISO-8601 UTC `TEXT` | OPERATOR REQUIRED |
| SD-004 | Boolean representation | PROPOSAL | SQLite `INTEGER` + `CHECK (... IN (0,1))` | OPERATOR REQUIRED |
| SD-005 | JSON-like payload representation | PROPOSAL | canonical JSON `TEXT` only where contract defines JSON; relational decomposition otherwise | OPERATOR REQUIRED |

These five decisions remain pending. They are not inferred from the recommendations in this document.

## Cross-agent decisions

| ID | Owner | Current State | Schema Impact | Status |
|---|---|---|---|---|
| SD-006 | IA-02 + relevant semantic owner | semantic state sets known; SQL encoding open | physical CHECK/representation | REQUEST_READY |
| SD-007 | IA-02 + relevant domain owners | required/optional/null/default semantics incomplete | physical NOT NULL/DEFAULT | REQUEST_READY |
| SD-008 | IA-04 | aggregate ownership now approved; physical parent key still unknown | OrderItem FK | PARTIALLY_RESOLVED / REQUEST_READY |
| SD-009 | IA-04 | aggregate ownership now approved; parent/modifier keys still unknown | OrderItemModifier FKs/order | PARTIALLY_RESOLVED / REQUEST_READY |
| SD-010 | IA-04 + IA-02 | OrderStatusHistory persistence explicitly not required for V1 aggregate boundary; persistence model still undefined | table/key/actor schema | DEFERRED_SCHEMA_DECISION |
| SD-011 | semantic owner | FK actions unspecified | physical FK clauses | REQUEST_READY |
| SD-012 | IA-02 / product authority | Settings fields incomplete | table/fields | REQUEST_READY |
| SD-013 | IA-02 | ProductCategory fields incomplete | table/fields | REQUEST_READY |
| SD-014 | IA-02 + IA-04 | CustomerAddress incomplete | table/fields/FK | REQUEST_READY |
| SD-015 | IA-02 + IA-04 | PaymentMethod incomplete | table/fields | REQUEST_READY |
| SD-016 | IA-02 + provider owner | Integration incomplete | table/fields | REQUEST_READY |
| SD-017 | IA-06 + provider owner | secure credential reference incomplete | table/fields/security boundary | REQUEST_READY |
| SD-018 | IA-02 + IA-05 | KnowledgeItem incomplete | table/fields/scope | REQUEST_READY |
| SD-022 | IA-02/domain owner + IA-06 for Device | Store scope still field-by-field | `store_id` and uniqueness scope | REQUEST_READY |
| SD-024 | IA-02/IA-04 | immutability rules incomplete | explicit constraints only | REQUEST_READY |
| SD-025 | IA-03 | explicit idempotency keys known; additional infrastructure dedup fields open | UNIQUE/index/fields | REQUEST_READY |

## Latest approved domain evidence

### DREQ-001 — Aggregate boundary
`Order` is the aggregate root. `OrderItem` and `OrderItemModifier` are aggregate-owned. `OrderStatusHistory` is deferred and is not required for the V1 aggregate boundary.

**Physical effect:** ownership is clarified, but parent column names, FK actions, ordering, uniqueness and persistence representation remain open. Therefore SD-008/SD-009 are only partially resolved and SD-010 remains deferred for persistence.

### DREQ-002 — ConfirmOrder
`DRAFT -> CONFIRMED` via `ConfirmOrder`, emitting `order.confirmed`.

**Physical effect:** confirms one semantic transition only. It does not define the complete persisted Order lifecycle or authorize `order.status_changed`. No new field/index/table is inferred.

### DREQ-005 — ConfirmOrder errors
The approved categories (`INVALID_ORDER_STATE`, `CONFIRMATION_DATA_INVALID`, `DUPLICATE_CONFIRMATION`, `CONCURRENCY_CONFLICT`) remain domain semantics. No schema artifact is derived from them.

### DREQ-006 — Actor / authorization boundary
Authentication remains outside the aggregate; authorization belongs to application/application-service boundaries; ActorContext shape is intentionally not frozen.

**Physical effect:** no ActorContext persistence is authorized.

## Cross-agent evidence checked

- IA-02 confirms the four DREQ decisions above and keeps implementation authorization pending; its current branch does not define additional physical schema fields. fileciteturn159file0
- IA-03 confirms durable Inbox ACK means local persistence in `InboundInbox` and keeps DomainOutbox open under CONTRACT-001. It does not provide a complete Inbox/Job/Audit field inventory. fileciteturn161file0
- IA-04 confirms `CONFIRMED` as sale milestone, but does not define missing parent keys or a persistence model for `OrderStatusHistory`. fileciteturn160file0
- IA-05 keeps AIExecution cross-agent closure open and does not provide a complete schema inventory. fileciteturn162file0
- IA-06 keeps secure device-auth layers decision-gated; no additional canonical SQLite field contract is established. fileciteturn163file0
- IA-07 keeps CONTRACT-001 ambiguous and supplies no Desktop SQLite ownership decision. fileciteturn164file0

## Global contracts

- `CONTRACT-001`: global decision required only for DomainOutbox physical ownership/scope.
- `CONTRACT-002`: currently non-blocking for physical schema unless a future normative event decision changes persistence.
- `GOV-001`: conditional/deferred; escalate only if a source conflict changes a schema-critical interpretation.

## Approval rule

A table becomes `DETERMINISTIC` only when its remaining physical and semantic decisions are closed and approved. No local recommendation is sufficient to generate `0002`.
