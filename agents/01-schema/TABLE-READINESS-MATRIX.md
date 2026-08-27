# IA-01 — Table Readiness Matrix

Readiness is evaluated against deterministic DDL. A condition label is not itself an approval and does not imply that other unresolved gates disappear.

## Current deterministic classification

Under the current execution rules, a table is `DETERMINISTIC` only when **all** physical properties are closed. A table is `DETERMINISTIC_AFTER_HUMAN_APPROVAL` only when human approval is the sole remaining condition. A table is `DETERMINISTIC_AFTER_CROSS_AGENT_RESPONSE` only when an owner response is the sole remaining condition.

Because SD-001..SD-005 are still pending **and** several tables also have unresolved semantic nullability/default/FK/state decisions, no table currently satisfies either single-condition state.

| Table | Readiness | Exact blocking conditions | Authority |
|---|---|---|---|
| store | BLOCKED | SD-001..SD-003; physical nullability/defaults | IA-01 + operator |
| device | BLOCKED | IA-06 lifecycle/status; IA-02 semantics; FK actions; local physical conventions | IA-06 + IA-02 + IA-01 |
| settings | BLOCKED | field inventory missing; scope/nullability/defaults | IA-02 / product authority |
| product_category | BLOCKED | field inventory missing; scope/nullability/defaults | IA-02 |
| product | BLOCKED | category optionality; nullability/defaults; local physical conventions | IA-02 + IA-01 |
| product_modifier | BLOCKED | quantity semantics; nullability/defaults; local physical conventions | IA-02 / IA-04 + IA-01 |
| product_image | BLOCKED | parent/timestamp/metadata physical representation; local physical conventions | IA-01 |
| promotion | BLOCKED | value/product-scope physical semantics; nullability; local physical conventions | IA-02 / IA-04 + IA-01 |
| customer | BLOCKED | Google identifier fields; status/nullability; local physical conventions | IA-02 / IA-05 + IA-01 |
| customer_address | BLOCKED | full address model; parent key; nullability/defaults | IA-02 + IA-04 |
| conversation | BLOCKED | state physical encoding; nullability/defaults; message linkage; local physical conventions | IA-02 + IA-05 + IA-01 |
| message | BLOCKED | direction/type/provider status/error; Inbox reference; correlation/causation; local physical conventions | IA-02 + IA-03 + IA-05 + IA-01 |
| order | BLOCKED | address/payment relation semantics; optionality; persisted state encoding; local physical conventions | IA-02 + IA-04 + IA-01 |
| order_item | BLOCKED | parent key name; FK actions; ordering; uniqueness; local physical conventions | IA-04 + IA-01 |
| order_item_modifier | BLOCKED | parent keys; modifier relation; ordering; uniqueness; local physical conventions | IA-04 + IA-01 |
| order_status_history | BLOCKED | persistence model remains under-specified; parent identity; actor/history fields; no aggregate-boundary inference allowed | IA-04 + IA-02 |
| payment_method | BLOCKED | complete recorded-method field model; nullability/defaults | IA-02 + IA-04 |
| notification | BLOCKED | channel/destination/attempt/status inventory; provider semantics; local physical conventions | IA-03 + provider owners + IA-01 |
| integration | BLOCKED | provider/status/reference field model; scope/nullability | IA-02 + provider owners |
| integration_credential | BLOCKED | secure reference model; provider metadata boundary | IA-06 + provider owners |
| inbound_inbox | BLOCKED | processing/reconciliation/correlation/idempotency field inventory; local physical conventions | IA-03 + IA-01 |
| domain_outbox | BLOCKED | CONTRACT-001 ownership/scope/transaction boundary | Global authority + IA-03/IA-07 |
| job | BLOCKED | state/lock/attempt/scheduling fields; local physical conventions where used | IA-03 + IA-01 |
| audit_log | BLOCKED | actor/entity/before-after representation; correlation fields; local physical conventions | IA-03 + semantic owners + IA-01 |
| log | BLOCKED | physical metadata encoding; local physical conventions | IA-01 + operator |
| ai_profile | BLOCKED | field decomposition/version references; local physical conventions | IA-05 + IA-02 + IA-01 |
| ai_execution | BLOCKED | execution/tool/validation/token/latency fields; IA-03 correlation semantics; local physical conventions | IA-05 + IA-03 + IA-01 |
| knowledge_item | BLOCKED | identity/content/type/scope model; nullability/defaults | IA-02 + IA-05 |

## Summary

- `DETERMINISTIC`: **0**
- `DETERMINISTIC_AFTER_HUMAN_APPROVAL`: **0**
- `DETERMINISTIC_AFTER_CROSS_AGENT_RESPONSE`: **0**
- `BLOCKED`: **28**
- `UNKNOWN`: **0**

This is a stricter classification than the earlier conditional readiness matrix. The earlier values (`3` local, `14` cross-agent, `1` global, `10` blocked) remain useful as **dependency categories**, but they are not deterministic states because most tables require more than one condition.

## Latest evidence incorporated

### DREQ-001 — Order aggregate boundary
Approved by IA-02: `Order` is the aggregate root and `OrderItem`/`OrderItemModifier` are aggregate-owned children. This establishes ownership semantics but **does not freeze physical parent-key names, FK actions, ordering, uniqueness or SQL representation**. `OrderItem` and `OrderItemModifier` therefore remain `BLOCKED`. `OrderStatusHistory` remains independently unresolved because aggregate ownership was explicitly deferred. fileciteturn159file0

### DREQ-002 — ConfirmOrder
Approved transition: `DRAFT -> CONFIRMED` via `ConfirmOrder` and `order.confirmed`. This confirms an initial Order lifecycle transition, but does not freeze the complete persisted status contract or authorize `order.status_changed`. `Order` therefore remains blocked by physical and cross-agent decisions. fileciteturn159file0

### DREQ-005 — Domain error semantics
Approved semantic error categories do not authorize error tables, error-code columns, retry metadata, idempotency persistence or concurrency/version fields. No schema readiness changes. fileciteturn159file0

### DREQ-006 — Actor / authorization boundary
Approved application-service authorization boundary; ActorContext shape remains NOT_FROZEN. No schema changes or persistence fields are authorized. fileciteturn159file0

### IA-03
IA-03 confirms durable Inbox ACK means persistence in `InboundInbox`, while `DomainOutbox` remains open under CONTRACT-001. This confirms a physical dependency but does not close the field inventory. fileciteturn161file0

### IA-04
IA-04 confirms `CONFIRMED` as the operational sale milestone but keeps parent-key schema details unresolved. fileciteturn160file0

### IA-05 / IA-06 / IA-07
AIExecution, device persistence and Gateway boundary semantics remain decision-gated. No new canonical SQLite field contract was supplied. fileciteturn162file0turn163file0turn164file0

## Dependency categories for parallel work

The previous category counts are retained as planning information:

- Local physical decisions: 3 candidate tables (`store`, `product_image`, `log`).
- Cross-agent semantic dependencies: 14 candidate tables.
- Global dependency: 1 candidate table (`domain_outbox`).
- Directly blocked/incomplete field models: 10 tables.

These are dependency buckets, not current readiness states.

## Gate

No table is promoted to `DETERMINISTIC` until every physical property is evidenced and closed. No DDL is generated from a plausible or merely proposed SQL shape.
