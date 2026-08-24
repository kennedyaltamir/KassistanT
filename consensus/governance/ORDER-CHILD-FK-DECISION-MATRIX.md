# Order Child FK Decision Matrix

Status: **CLOSED — SEMANTIC CONTRACT**

Implementation point: `MVP2 @ 0e1897cae007530cbe8aed20b97e04a25340cc87`.

| Child field | Parent | Cardinality | Nullable | ON DELETE | ON UPDATE | Rationale |
|---|---|---|---|---|---|---|
| `order_item.order_id` | `order.id` | N:1 | NO | RESTRICT | RESTRICT | OrderItem cannot exist outside an Order; parent identity is immutable and commercial child data must not disappear silently. |
| `order_item_modifier.order_item_id` | `order_item.id` | N:1 | NO | RESTRICT | RESTRICT | Modifier belongs to exactly one OrderItem; parent deletion must not silently erase commercial snapshot data. |
| `order_item_modifier.product_modifier_id` | `product_modifier.id` | N:1 optional | YES | SET NULL | RESTRICT | Catalog reference is non-authoritative because order modifier data is snapshotted; catalog deletion must not invalidate the order snapshot. |
| `order_status_history.order_id` | `order.id` | N:1 | NO | RESTRICT | RESTRICT | Historical evidence must survive independently of mutable lifecycle state; Order identity is immutable. |

## Additional semantic constraints

- `SET NULL` is permitted only for the optional `ProductModifier` catalog reference.
- No required parent relation uses `SET NULL`.
- No relation uses `CASCADE`.
- No parent identity is expected to change during normal operation; `ON UPDATE RESTRICT` protects that invariant.
- Physical FK actions are subordinate to the domain rule that confirmed commercial snapshots remain authoritative.

## Boundary

IA-01 owns physical realization. This matrix closes the semantic action, nullability and rationale only; it does not define SQL syntax or migration execution.
