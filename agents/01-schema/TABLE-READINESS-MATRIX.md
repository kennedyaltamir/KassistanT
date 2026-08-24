# IA-01 — Table Readiness Matrix

Readiness is evaluated against the next migration gate. A table is not marked ready merely because its remaining issues are conceptually small; the required decision must be explicitly identified and approved.

| Table | Readiness | Blockers / Open Items | Required Decision | Dependency / Authority | Request State |
|---|---|---|---|---|---|
| store | READY_AFTER_LOCAL_DECISION | physical naming; exact nullability/defaults | approve physical mapping and root semantics | IA-01 + operator | READY_FOR_APPROVAL |
| device | READY_AFTER_CROSS_AGENT_DECISION | status catalog/nullability; FK actions | close device semantic fields | IA-06 + IA-02 | REQUEST_READY |
| settings | BLOCKED | field inventory missing | define canonical settings fields | IA-02 / global product authority | REQUEST_READY |
| product_category | BLOCKED | field inventory missing | define canonical category fields | IA-02 | REQUEST_READY |
| product | READY_AFTER_CROSS_AGENT_DECISION | category optionality; defaults; nullability | close catalog semantics | IA-02 | REQUEST_READY |
| product_modifier | READY_AFTER_CROSS_AGENT_DECISION | quantity semantics; nullability/defaults | close modifier rules | IA-02 / IA-04 | REQUEST_READY |
| product_image | READY_AFTER_LOCAL_DECISION | physical key representation; image metadata encoding | approve physical mapping | IA-01 + operator | READY_FOR_APPROVAL |
| promotion | READY_AFTER_CROSS_AGENT_DECISION | `value` representation; product scope; nullability | close promotion schema | IA-02 / IA-04 | REQUEST_READY |
| customer | READY_AFTER_CROSS_AGENT_DECISION | Google identifiers; status/nullability | close customer semantic fields | IA-02 / IA-05 | REQUEST_READY |
| customer_address | BLOCKED | complete address fields and parent key | define address schema | IA-02 + IA-04 | REQUEST_READY |
| conversation | READY_AFTER_CROSS_AGENT_DECISION | state nullability/defaults; physical encoding | freeze conversation contract | IA-02 + IA-05 | REQUEST_READY |
| message | READY_AFTER_CROSS_AGENT_DECISION | direction/type/status; nullability; correlation/causation | freeze message contract | IA-02 + IA-05 + IA-03 | REQUEST_READY |
| order | READY_AFTER_CROSS_AGENT_DECISION | address/payment FK semantics; optionality; status storage | freeze order persistence contract | IA-04 + IA-02 | REQUEST_READY |
| order_item | BLOCKED | parent key, FK, ordering, ownership | define item parent/order relationship | IA-04 | REQUEST_READY — PRIORITY |
| order_item_modifier | BLOCKED | parent keys, ownership, ordering | define modifier-to-item relationship | IA-04 | REQUEST_READY — PRIORITY |
| order_status_history | BLOCKED | parent key, actor/history identity | define history persistence | IA-04 + IA-02 | REQUEST_READY — PRIORITY |
| payment_method | BLOCKED | field model incomplete | define MVP recorded-method schema | IA-04 + IA-02 | REQUEST_READY |
| notification | READY_AFTER_CROSS_AGENT_DECISION | exact channel/destination/attempt fields and status | close notification persistence contract | IA-03 + provider owner | REQUEST_READY |
| integration | BLOCKED | provider/status/reference fields incomplete | define integration identity/state | IA-02 + provider owners | REQUEST_READY |
| integration_credential | BLOCKED | secure reference model incomplete | define non-secret credential reference model | IA-06 + provider owners | REQUEST_READY |
| inbound_inbox | READY_AFTER_CROSS_AGENT_DECISION | processing-state fields; correlation semantics | freeze inbox persistence contract | IA-03 | REQUEST_READY |
| domain_outbox | READY_AFTER_GLOBAL_DECISION | ownership/scope semantics | resolve CONTRACT-001 | Global authority + IA-03/IA-07 | GLOBAL_REQUEST_READY |
| job | READY_AFTER_CROSS_AGENT_DECISION | state/lock/attempt/scheduling fields | freeze job persistence contract | IA-03 | REQUEST_READY |
| audit_log | READY_AFTER_CROSS_AGENT_DECISION | actor/entity/reference fields | freeze audit contract | IA-03 + domain owners | REQUEST_READY |
| log | READY_AFTER_LOCAL_DECISION | field encoding/metadata choice | approve log physical mapping | IA-01 + operator | READY_FOR_APPROVAL |
| ai_profile | READY_AFTER_CROSS_AGENT_DECISION | exact profile field model | freeze AI profile persistence contract | IA-05 + IA-02 | REQUEST_READY |
| ai_execution | READY_AFTER_CROSS_AGENT_DECISION | execution metadata/validation fields | freeze AI execution persistence contract | IA-05 + IA-03 | REQUEST_READY |
| knowledge_item | BLOCKED | field model incomplete | define knowledge persistence contract | IA-02 + IA-05 | REQUEST_READY |

## Reclassification summary

Current, without any new agent responses or human approvals:

- `READY_FOR_MIGRATION`: 0.
- `READY_AFTER_LOCAL_DECISION`: 3.
- `READY_AFTER_CROSS_AGENT_DECISION`: 14.
- `READY_AFTER_GLOBAL_DECISION`: 1.
- `READY_AFTER_EXTERNAL_DECISION`: 0.
- `BLOCKED`: 10.

## Important interpretation

The readiness label means the category of decision required before the table can become deterministic. It does not mean the decision has already been approved.

No table was promoted to `READY_FOR_MIGRATION` in this execution because no new semantic response or approval was received.
