# IA-01 — Table Readiness Matrix

Readiness is evaluated against the next migration gate. A table is not marked ready merely because its remaining issues are conceptually small; the remaining decision must be explicitly identified.

| Table | Readiness | Blockers / Open Items | Required Decision | Dependency / Authority |
|---|---|---|---|---|
| store | READY_AFTER_LOCAL_DECISION | physical naming; exact nullability/defaults | approve physical mapping | IA-01 + operator |
| device | READY_AFTER_CROSS_AGENT_DECISION | status catalog/nullability; FK actions | close device semantic fields | IA-06 + IA-02 |
| settings | BLOCKED | field inventory missing | define canonical settings fields | IA-02 / global product authority |
| product_category | BLOCKED | field inventory missing | define canonical category fields | IA-02 |
| product | READY_AFTER_CROSS_AGENT_DECISION | category optionality; defaults; field nullability | close catalog semantics | IA-02 |
| product_modifier | READY_AFTER_CROSS_AGENT_DECISION | quantity semantics; nullability/defaults | close modifier rules | IA-02 / IA-04 |
| product_image | READY_AFTER_LOCAL_DECISION | physical key representation; image metadata encoding | approve physical mapping | IA-01 |
| promotion | READY_AFTER_CROSS_AGENT_DECISION | `value` representation; product scope representation; nullability | close promotion schema | IA-02 / IA-04 |
| customer | READY_AFTER_CROSS_AGENT_DECISION | Google identifiers; status/nullability | close customer semantic fields | IA-02 / IA-05 |
| customer_address | BLOCKED | complete address field model and parent key | define address schema | IA-02 + IA-04 |
| conversation | READY_AFTER_CROSS_AGENT_DECISION | state nullability/defaults; exact status encoding | freeze conversation contract | IA-02 + IA-05 |
| message | READY_AFTER_CROSS_AGENT_DECISION | direction/type/status encoding; nullability; correlation/causation exactness | freeze message contract | IA-02 + IA-05 + IA-03 |
| order | READY_AFTER_CROSS_AGENT_DECISION | address/payment FK semantics; optionality; status storage | freeze order persistence contract | IA-04 + IA-02 |
| order_item | BLOCKED | parent key not named; FK/ordering/ownership | define item parent/order relationship | IA-04 |
| order_item_modifier | BLOCKED | parent keys and ownership not named | define modifier-to-item relationship | IA-04 |
| order_status_history | BLOCKED | parent key/actor model not named | define history persistence | IA-04 + IA-02 |
| payment_method | BLOCKED | field model incomplete | define MVP recorded-method schema | IA-04 + IA-02 |
| notification | READY_AFTER_CROSS_AGENT_DECISION | exact channel/destination/attempt fields and status encoding | close notification persistence contract | IA-03 + provider owners |
| integration | BLOCKED | provider/status field model incomplete | define integration identity/state | IA-02 + provider owners |
| integration_credential | BLOCKED | secure reference model incomplete | define non-secret credential reference model | IA-06 + provider owners |
| inbound_inbox | READY_AFTER_CROSS_AGENT_DECISION | exact processing-state fields; correlation semantics | freeze inbox persistence contract | IA-03 |
| domain_outbox | READY_AFTER_GLOBAL_DECISION | ownership/scope semantics | resolve CONTRACT-001 | Global authority + IA-03/IA-07 |
| job | READY_AFTER_CROSS_AGENT_DECISION | exact state/lock/attempt fields | freeze job persistence contract | IA-03 |
| audit_log | READY_AFTER_CROSS_AGENT_DECISION | exact actor/entity/reference fields | freeze audit contract | IA-03 + domain owners |
| log | READY_AFTER_LOCAL_DECISION | field encoding/metadata choice | approve log physical mapping | IA-01 |
| ai_profile | READY_AFTER_CROSS_AGENT_DECISION | exact profile field model | freeze AI profile persistence contract | IA-05 + IA-02 |
| ai_execution | READY_AFTER_CROSS_AGENT_DECISION | execution metadata and validation fields | freeze AI execution persistence contract | IA-05 + IA-03 |
| knowledge_item | BLOCKED | field model incomplete | define knowledge persistence contract | IA-02 + IA-05 |

## Reclassification summary

- `READY_AFTER_LOCAL_DECISION`: 3 tables.
- `READY_AFTER_CROSS_AGENT_DECISION`: 14 tables.
- `READY_AFTER_GLOBAL_DECISION`: 1 table.
- `BLOCKED`: 10 tables.
- `NON_BLOCKING_OPEN_ITEMS`: may exist across ready tables (for example performance-only indexes), but do not block `0002` if deliberately deferred.

## Important interpretation

The readiness label means the category of decision required before a table can become deterministic. It does not mean the decision has already been approved.
