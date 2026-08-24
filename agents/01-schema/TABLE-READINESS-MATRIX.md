# IA-01 — Table Readiness Matrix

Readiness is evaluated against deterministic DDL, not against runtime plausibility.

| Table | Readiness | Blockers / Open Items | Required Decision | Dependency / Authority |
|---|---|---|---|---|
| store | DETERMINISTIC_AFTER_APPROVAL | SD-001 naming; SD-002 identifier representation; SD-003 timestamp representation; remaining physical nullability/default classification | approve local physical conventions and close exact physical field constraints | IA-01 + operator |
| device | DETERMINISTIC_AFTER_CROSS_AGENT_DECISION | device status/nullability; FK actions; local physical conventions | IA-06 semantic response + local approvals | IA-06 + IA-02 + IA-01 |
| settings | BLOCKED | canonical field inventory missing | define canonical settings fields | IA-02 / product authority |
| product_category | BLOCKED | canonical field inventory missing | define category fields | IA-02 |
| product | DETERMINISTIC_AFTER_CROSS_AGENT_DECISION | category optionality; defaults/nullability; local physical conventions | close catalog semantics | IA-02 + IA-01 |
| product_modifier | DETERMINISTIC_AFTER_CROSS_AGENT_DECISION | quantity semantics; nullability/defaults; local physical conventions | close modifier semantics | IA-02 / IA-04 + IA-01 |
| product_image | DETERMINISTIC_AFTER_APPROVAL | physical identifier/timestamp/metadata representation; SD-001..SD-005 where applicable | approve local physical conventions | IA-01 + operator |
| promotion | DETERMINISTIC_AFTER_CROSS_AGENT_DECISION | value representation; product scope; nullability; local physical conventions | close promotion semantics | IA-02 / IA-04 + IA-01 |
| customer | DETERMINISTIC_AFTER_CROSS_AGENT_DECISION | Google identifiers; status/nullability; local physical conventions | close customer persistence semantics | IA-02 / IA-05 + IA-01 |
| customer_address | BLOCKED | complete address model and parent key missing | define address schema | IA-02 + IA-04 |
| conversation | DETERMINISTIC_AFTER_CROSS_AGENT_DECISION | state physical representation; nullability/defaults; message linkage; local physical conventions | freeze conversation persistence contract | IA-02 + IA-05 + IA-01 |
| message | DETERMINISTIC_AFTER_CROSS_AGENT_DECISION | direction/type/provider status/error; correlation/causation fields; Inbox reference; local physical conventions | freeze message/inbox contract | IA-02 + IA-03 + IA-05 + IA-01 |
| order | DETERMINISTIC_AFTER_CROSS_AGENT_DECISION | address/payment FK semantics; field optionality; physical status representation; local physical conventions | freeze Order persistence contract | IA-02 + IA-04 + IA-01 |
| order_item | BLOCKED | parent key name, FK action, ordering/uniqueness still not frozen | IA-04 defines physical relationship contract | IA-04 |
| order_item_modifier | BLOCKED | parent keys, modifier relation, ordering/uniqueness still not frozen | IA-04 defines relationship contract | IA-04 |
| order_status_history | BLOCKED | persistence remains deferred after DREQ-001; parent identity/actor model not frozen | explicit schema decision required; no aggregate-boundary inference | IA-04 + IA-02 |
| payment_method | BLOCKED | field model incomplete | define recorded-method persistence | IA-02 + IA-04 |
| notification | DETERMINISTIC_AFTER_CROSS_AGENT_DECISION | channel/destination/attempt/status field inventory; local physical conventions | close infrastructure/provider contract | IA-03 + provider owner + IA-01 |
| integration | BLOCKED | provider/status/reference field model incomplete | define integration persistence contract | IA-02 + provider owner |
| integration_credential | BLOCKED | secure reference model incomplete | define non-secret credential reference model | IA-06 + provider owner |
| inbound_inbox | DETERMINISTIC_AFTER_CROSS_AGENT_DECISION | exact processing fields; reconciliation/correlation/idempotency physical contract; local conventions | IA-03 field inventory | IA-03 + IA-01 |
| domain_outbox | DETERMINISTIC_AFTER_GLOBAL_DECISION | CONTRACT-001 ownership/scope and transaction boundary | resolve physical ownership semantics | Global authority + IA-03/IA-07 |
| job | DETERMINISTIC_AFTER_CROSS_AGENT_DECISION | exact state/lock/attempt/scheduling fields | IA-03 persistence contract | IA-03 |
| audit_log | DETERMINISTIC_AFTER_CROSS_AGENT_DECISION | actor/entity/before-after representation; correlation fields | IA-03 + domain owners | IA-03 + semantic owners |
| log | DETERMINISTIC_AFTER_APPROVAL | physical metadata encoding and local physical conventions | approve local physical mapping | IA-01 + operator |
| ai_profile | DETERMINISTIC_AFTER_CROSS_AGENT_DECISION | field decomposition/version references | IA-05 + IA-02 persistence contract | IA-05 + IA-02 |
| ai_execution | DETERMINISTIC_AFTER_CROSS_AGENT_DECISION | execution metadata/tool-call/validation/token/latency fields | IA-05/IA-03 field inventory | IA-05 + IA-03 |
| knowledge_item | BLOCKED | identity/content/type/scope model incomplete | define knowledge persistence contract | IA-02 + IA-05 |

## Reclassification summary

- `DETERMINISTIC`: 0.
- `DETERMINISTIC_AFTER_APPROVAL`: 3 (`store`, `product_image`, `log`).
- `DETERMINISTIC_AFTER_CROSS_AGENT_DECISION`: 14.
- `BLOCKED`: 10.
- `UNKNOWN`: 0.

## Latest evidence incorporated

### DREQ-001 — Order aggregate boundary
Approved by IA-02: `Order` is the aggregate root and `OrderItem`/`OrderItemModifier` are aggregate-owned children. This establishes ownership semantics but **does not freeze physical parent-key names, FK actions, ordering, uniqueness or SQL representation**. `OrderItem` and `OrderItemModifier` therefore remain `BLOCKED`.

### DREQ-002 — ConfirmOrder
Approved transition: `DRAFT -> CONFIRMED` via `ConfirmOrder` and `order.confirmed`. This confirms an initial Order lifecycle transition, but does not freeze the complete persisted status contract or authorize `order.status_changed`. `Order` therefore remains `DETERMINISTIC_AFTER_CROSS_AGENT_DECISION`.

### DREQ-005 — Domain error semantics
Approved semantic error categories do not authorize error tables, error-code columns, retry metadata, idempotency persistence or concurrency/version fields. No schema readiness changes.

### DREQ-006 — Actor / authorization boundary
Approved application-service authorization boundary; ActorContext shape remains NOT_FROZEN. No schema changes or persistence fields are authorized.

### IA-03 latest evidence
IA-03 confirms durable Inbox ACK means persistence in `InboundInbox`, while `DomainOutbox` remains open under CONTRACT-001. This supports the Inbox persistence dependency but does not provide its missing field inventory. fileciteturn161file0

### IA-04 latest evidence
IA-04 confirms `CONFIRMED` as the operational sale milestone and retains CONTRACT-001/002 open. No additional parent-key schema evidence is supplied by the current branch. fileciteturn160file0

### IA-05 latest evidence
AIExecution requires cross-agent logical closure with IA-01/IA-03; Conversation transition semantics come from IA-02. This confirms the cross-agent blocker without inventing fields. fileciteturn162file0

### IA-06 / IA-07 latest evidence
Device authentication persistence/security boundaries remain decision-gated; Gateway confirms DomainOutbox ambiguity remains open. No new canonical SQLite field contract is supplied. fileciteturn163file0turn164file0

## Determinism interpretation

No table is currently `DETERMINISTIC` because the five IA-01 physical conventions remain pending operator approval and several tables still require cross-agent semantic closure. No table is promoted merely because an SQL shape is plausible.
