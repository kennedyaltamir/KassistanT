# KassisT — IA-01 Human Schema Review

Status: **REVIEW REQUIRED / 0002 NOT AUTHORIZED**
Branch: `Agent01-schema-canonical-sqlite`

## 1. Local operator decisions still pending

### SD-001 — Physical SQL naming
**Question:** adopt `lower_snake_case` for physical table/column names?

**Evidence:** repository bootstrap and documented field names already use snake_case, but no protected global naming rule freezes it.

**Recommendation:** approve for IA-01 schema territory.

### SD-002 — UUID physical representation
**Question:** persist canonical UUIDv7 strings as SQLite `TEXT`?

**Evidence:** UUIDv7 is a semantic/project convention; protected documentation does not select BLOB.

**Recommendation:** `TEXT` canonical UUID string.

### SD-003 — UTC timestamp representation
**Question:** persist UTC timestamps as canonical RFC3339/ISO-8601 `TEXT`?

**Evidence:** UTC semantics are frozen; SQLite physical representation is not.

**Recommendation:** canonical UTC text.

### SD-004 — Boolean physical representation
**Question:** use SQLite `INTEGER` with `CHECK (value IN (0,1))`?

**Recommendation:** approve.

### SD-005 — JSON payload representation
**Question:** where the contract explicitly defines JSON and relational decomposition is unnecessary, persist canonical JSON as `TEXT`?

**Recommendation:** approve narrowly; relational fields remain relational.

All five remain `PENDING OPERATOR APPROVAL`.

## 2. Verified cross-agent evidence incorporated

### DREQ-001 — Order aggregate boundary
IA-02 confirms `Order` as aggregate root and `OrderItem`/`OrderItemModifier` as aggregate-owned children. `OrderStatusHistory` is deferred and not required for the V1 aggregate boundary. fileciteturn159file0

**Physical consequence:** ownership is clarified, but parent key names, FK actions, ordering, uniqueness and persistence representation are still open. No DDL follows automatically.

### DREQ-002 — ConfirmOrder
IA-02 confirms `DRAFT -> CONFIRMED` via `ConfirmOrder`, emitting `order.confirmed`. fileciteturn159file0

**Physical consequence:** one semantic transition is confirmed. It does not freeze the complete persisted Order lifecycle or authorize `order.status_changed` persistence.

### DREQ-005 — ConfirmOrder error semantics
Approved domain categories remain semantic outcomes only. IA-02 explicitly does not decide persistence, idempotency or concurrency mechanisms. fileciteturn159file0

**Physical consequence:** no error table, `error_code` column, retry metadata or concurrency/version column is inferred.

### DREQ-006 — Actor / authorization boundary
IA-02 confirms authentication remains outside the aggregate and authorization belongs to application/application-service boundaries. ActorContext shape is not frozen. fileciteturn159file0

**Physical consequence:** no ActorContext persistence is authorized.

### IA-03 — Event infrastructure
IA-03 confirms WSS ACK represents durable local persistence in `InboundInbox`; the execution sequence is EventBus → InboundInbox → Job/Audit and DomainOutbox only after CONTRACT-001 resolution. DomainOutbox remains open. fileciteturn161file0

**Physical consequence:** Inbox persistence is confirmed as a real schema dependency, but the exact field inventory is still absent. DomainOutbox remains a localized global blocker.

### IA-04 — Order Engine
IA-04 confirms `CONFIRMED` as the operational sale milestone and keeps CONTRACT-001/002 open. Its current decision registry does not define the missing parent-key field names or a physical persistence model for OrderStatusHistory. fileciteturn160file0

### IA-05 — Conversation / LLM
IA-05 states AIExecution requires cross-agent logical closure with IA-01/IA-03 and that Conversation transition semantics come from IA-02. No complete physical field inventory is approved. fileciteturn162file0

### IA-06 — Device Authentication
IA-06 confirms the security boundary and that several enrollment/session/idempotency decisions remain open; no canonical SQLite field inventory is frozen by its current decision registry. fileciteturn163file0

### IA-07 — Gateway / WSS
IA-07 confirms Gateway is the external integration boundary and preserves `CONTRACT-001` as ambiguous. No Desktop SQLite ownership decision is added. fileciteturn164file0

## 3. Owner response state

| Owner | Requests | Verified responses | Schema classification |
|---|---:|---:|---|
| IA-02 | 3 | 4 approved domain decisions | PARTIALLY RESOLVED |
| IA-03 | 3 | 1 relevant infrastructure decision set | PARTIALLY RESOLVED |
| IA-04 | 4 | existing order decisions; no parent-key closure | PARTIALLY RESOLVED |
| IA-05 | 3 | contract-closure conclusions; no field inventory | OPEN |
| IA-06 | 2 | security boundary decisions; no field inventory | OPEN |
| IA-07 | 1 | Gateway boundary confirmed; CONTRACT-001 open | OPEN |
| IA-08 | 0 | no persistence request required | NO BLOCKING DEPENDENCY |

Important: the supplied owner decisions were incorporated only where their exact text/evidence closes a schema question. No missing schema field was inferred.

## 4. Priority remaining requests

1. **IA-04 — OrderItem / OrderItemModifier:** exact parent-key names, FK targets/actions, cardinality, ordering and uniqueness.
2. **IA-04 + IA-02 — OrderStatusHistory:** explicit persistence decision; DREQ-001 only defers its aggregate-boundary requirement.
3. **IA-03 — InboundInbox / Job / Audit:** complete physical field inventories and correlation/idempotency representation.
4. **IA-05 — Conversation / Message / AIProfile / AIExecution / KnowledgeItem:** canonical physical field inventories and status/reference representation.
5. **IA-06 — Device / IntegrationCredential:** exact persistence fields that cross the security boundary without secret material.
6. **Global authority — CONTRACT-001:** exact DomainOutbox ownership/scope/transaction implications.

## 5. Current deterministic subset

No table is currently `DETERMINISTIC`.

`DETERMINISTIC_AFTER_APPROVAL`:
- `store`
- `product_image`
- `log`

`DETERMINISTIC_AFTER_CROSS_AGENT_DECISION`:
- 14 tables identified in `TABLE-READINESS-MATRIX.md`.

`BLOCKED`:
- 10 tables with missing field/relationship semantics.

`DETERMINISTIC_AFTER_GLOBAL_DECISION`:
- `domain_outbox`.

## 6. Explicit non-decisions

The following remain outside schema authority:

- domain error categories from DREQ-005;
- ActorContext persistence from DREQ-006;
- aggregate ownership as an automatic authorization to invent FK names;
- `order.confirmed` as authorization to persist `order.status_changed`;
- WSS/EventBus/Gateway runtime structures as Desktop SQLite tables without explicit cross-boundary persistence requirements.

## 7. Operator response format

`APPROVE SD-001`
`REJECT SD-001`
`APPROVE OPTION-B SD-002`

Cross-agent responses should provide `QUESTION_ID + RESPONSE + EVIDENCE`.

Until then, no proposal becomes a decision and migration `0002` remains forbidden.
