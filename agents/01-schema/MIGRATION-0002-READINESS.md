# IA-01 — Migration 0002 Readiness

Status: **BLOCKED**  
Migration `0002`: **PROHIBITED IN PHASE 2**

## Table readiness

| Entity | Readiness |
|---|---|
| Store | BLOCKED |
| Device | BLOCKED |
| Settings | BLOCKED |
| ProductCategory | BLOCKED |
| Product | BLOCKED |
| ProductModifier | BLOCKED |
| ProductImage | BLOCKED |
| Promotion | BLOCKED |
| Customer | BLOCKED |
| CustomerAddress | BLOCKED |
| Conversation | BLOCKED |
| Message | BLOCKED |
| Order | BLOCKED |
| OrderItem | BLOCKED |
| OrderItemModifier | BLOCKED |
| OrderStatusHistory | BLOCKED |
| PaymentMethod | BLOCKED |
| Notification | BLOCKED |
| Integration | BLOCKED |
| IntegrationCredential | BLOCKED |
| InboundInbox | BLOCKED |
| DomainOutbox | BLOCKED |
| Job | BLOCKED |
| AuditLog | BLOCKED |
| Log | BLOCKED |
| AIProfile | BLOCKED |
| AIExecution | BLOCKED |
| KnowledgeItem | BLOCKED |

## Why every table remains blocked

The current protected contract does not yet provide a deterministic combination of physical table names, physical identity encoding, complete field types, nullability, defaults, FK actions and SQL state representation.

This is intentional: marking a table `READY_FOR_MIGRATION` while any of these require interpretation would violate the project evidence policy.

## Blocker matrix

### TABLE-NAMING
Physical SQL names are not explicitly frozen. Lower snake case is a consistent proposal, not an approved decision.

### FIELD-GAPS
The most significant missing schemas are `Settings`, `ProductCategory`, `CustomerAddress`, `PaymentMethod`, `Integration`, `IntegrationCredential`, and `KnowledgeItem`.

### CHILD-KEY-GAPS
`OrderItem`, `OrderItemModifier`, and `OrderStatusHistory` lack explicit parent key field names. A deterministic migration cannot invent them.

### PHYSICAL-TYPE-GAPS
UUID physical representation and timestamp physical representation are not frozen. Money is sufficiently constrained semantically to use integer cents, but a full DDL contract still needs the remaining types.

### NULLABILITY-DEFAULT-GAPS
Exact nullability and SQL defaults are mostly unspecified.

### FK-ACTION-GAPS
ON DELETE / ON UPDATE behavior is unspecified.

### ENUM-PHYSICAL-GAPS
Lifecycle and status values are known semantically, but SQL storage strategy and CHECK representation are not frozen.

### CONTRACT-001
DomainOutbox physical semantics may cross local Core/Gateway boundaries; schema cannot encode an ownership choice unilaterally.

### CONTRACT-002
The event ambiguity does not currently require a schema change by itself; it becomes blocking only if the final event decision introduces a new physical persistence requirement.

### GOV-001
If source authority changes interpretation of a schema-critical field, the matrix must be re-audited before DDL generation.

## Gate to next phase

`0002` may proceed only after every table is either:

- `READY_FOR_MIGRATION`, or
- explicitly excluded from the migration by an approved scope decision.

The deterministic-generation test is: a second engineer must be able to produce identical CREATE TABLE / CREATE INDEX definitions from the specification without asking what a missing field or relationship means.
