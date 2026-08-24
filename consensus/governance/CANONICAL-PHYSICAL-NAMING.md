# Canonical Physical Naming

Status: **CLOSED — IA-01 LOCAL PHYSICAL CONVENTION**

This is a local schema-materialization convention. It does not promote itself to a project-wide architectural decision.

| Concern | Canonical convention |
|---|---|
| Tables | `lower_snake_case`, singular entity names (`customer`, `conversation`, `message`, `order_item`) |
| Primary key | `id` |
| Foreign keys | `<parent_entity>_id` (`customer_id`, `conversation_id`, `order_id`, `order_item_id`) |
| Store scoping | `store_id` |
| Creation timestamp | `created_at` |
| Update timestamp | `updated_at` |
| Event/processing timestamp | explicit `<verb>_at` such as `processed_at`, `received_at`, `last_seen_at` |
| Monetary amount | `*_cents` with integer SQLite representation |
| Currency | `currency` |
| External provider identifier | `external_<concept>_id` where needed (`external_message_id`, `external_thread_id`) |
| Correlation | `correlation_id` |
| Causation | `causation_id` |
| Boolean | `INTEGER` constrained to `0/1` when semantically frozen |
| UUID | textual `TEXT` representation |
| UTC timestamp | textual RFC3339/ISO-8601 representation |
| JSON payload/reference | `TEXT` containing canonical JSON only where contract requires it |

## Rules

No historical aliases are retained merely for compatibility.

Historical Migration 0002 names are evidence only and do not override this convention.

This convention does not select FK lifecycle actions, nullability, defaults or semantic field ownership.
