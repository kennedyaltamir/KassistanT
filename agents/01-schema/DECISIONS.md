# IA-01 — DECISIONS

## Approved / evidence-based constraints

### D-001 — SQLite for MVP persistence
Status: APPROVED / BASELINE. Source: approved baseline and ADR-002.

### D-002 — UTC persistence
Status: APPROVED / BASELINE. Source: baseline §23 and backend database contract.

### D-003 — Integer cents / BRL
Status: APPROVED / BASELINE. Source: baseline §15/75 and M5.1 money primitive.

### D-004 — UUIDv7 identifier direction
Status: APPROVED / BASELINE. Source: baseline §23 and M5.1 primitive.

### D-005 — Store scoping where explicitly contracted
Status: APPROVED / BASELINE. Store isolation must not be generalized to entities whose field scope is not explicit.

### D-006 — Deterministic migration integrity
Status: IMPLEMENTED FOUNDATION / PRESERVE. Future migrations remain compatible with M5.1.

### D-007 — Seven normative UNIQUE constraints
Status: APPROVED EVIDENCE CLASSIFICATION. Source: baseline §23.1.

### D-008 — Phase 2 physical specification is proposal-level except for semantic contracts
Status: DOCUMENTED / NOT APPROVED FOR DDL. `CANONICAL-SCHEMA-SPEC.md` separates FROZEN semantics from PROPOSED physical choices.

## Phase 2 proposals — NOT APPROVED

### P-001 — lower_snake_case physical table names
Mechanically derived proposal. Requires project approval before becoming FROZEN.

### P-002 — physical UUID/timestamp encoding
No physical SQLite encoding is selected by current protected documents. Must be approved before deterministic DDL.

### P-003 — SQL lifecycle/status representation
Semantic values are known, physical representation is not. No CHECK representation is silently introduced.

### P-004 — FK delete/update policy
Current evidence does not specify cascade/restrict/set-null behavior. Must remain UNKNOWN.

### P-005 — parent keys for OrderItem/OrderItemModifier/OrderStatusHistory
Must be explicitly defined by authoritative schema/domain material; names such as `order_id` are not approved by IA-01 alone.

### P-006 — full physical models for Settings/ProductCategory/CustomerAddress/PaymentMethod/Integration/IntegrationCredential/KnowledgeItem
Blocked on field-level contract detail.

## Global contract handling

`CONTRACT-001` remains OPEN and blocks affected DomainOutbox physical design.

`CONTRACT-002` remains OPEN but is currently NON-BLOCKING FOR EXISTING SCHEMA STATE unless its final decision changes physical persistence.

`GOV-001` remains OPEN and must be escalated if source authority affects a schema-critical decision.

No Phase 2 proposal is project-authoritative until integrated and approved through normal governance.
