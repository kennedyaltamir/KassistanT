# Product / Order Physical Compatibility Matrix — IA-01

Implementation point: `0e1897cae007530cbe8aed20b97e04a25340cc87`

| Area | Existing physical evidence | Canonical logical evidence | Compatibility | Action |
|---|---|---|---|---|
| Product PK | `id TEXT PRIMARY KEY` | UUIDv7-oriented identity direction | Compatible as candidate physical representation | Preserve as evidence; final representation remains schema-level choice |
| Product scope | `store_id TEXT NOT NULL` | Product is explicitly store-scoped | Compatible | Preserve semantic |
| Product name | `name TEXT NOT NULL` | Product name is canonical logical field | Compatible | Preserve semantic |
| Product price | `price_amount_cents INTEGER`, `price_currency TEXT` | integer cents / BRL | Semantically compatible; logical naming differs | Reconcile logical-to-physical naming before canonical DDL |
| Product availability | absent in 0002 | `available` is documented logical field | Incomplete | Requires canonical persistence decision before final DDL |
| Product category | absent in 0002 | `category_id` is documented logical field | Incomplete | Requires field/relationship closure |
| Order PK | `id TEXT PRIMARY KEY` | UUIDv7-oriented identity direction | Compatible as candidate physical representation | Preserve as evidence |
| Order scope | `store_id TEXT NOT NULL` | Order is explicitly store-scoped | Compatible | Preserve semantic |
| Order status | `status TEXT NOT NULL` | Order lifecycle catalog documented | Partially compatible | SQL encoding/nullability remains schema work |
| Order totals | `total_amount_cents`, `total_currency` | integer cents / BRL; logical `total_cents`/`currency` | Semantically compatible; logical naming differs | Reconcile naming before canonical DDL |
| Order customer | absent in 0002 | `customer_id` documented logically | Incomplete | Requires canonical FK field closure |
| Order conversation | absent in 0002 | `conversation_id` documented logically | Incomplete | Requires canonical FK field closure |
| Order items | `order_id` explicit FK with CASCADE | OrderItem child relationship concept exists | Partially compatible | FK action must be confirmed by semantic authority; cannot be blindly promoted |
| Item snapshots | `name`, `unit_price_cents`, `unit_price_currency`, `quantity` | snapshot semantics documented | Semantically compatible | Logical/physical naming reconciliation required |
| Item modifiers | explicit `order_item_id` FK with CASCADE | child modifier semantics documented | Partially compatible | FK action requires authoritative confirmation |

## Verdict

The existing Product/Order surface is **partially compatible**, not canonical. The historical migration provides useful implementation evidence but cannot become normative through existence.

`CANONICAL_PHYSICAL_COMPATIBILITY = PARTIAL`

No physical migration change is authorized by this matrix.
