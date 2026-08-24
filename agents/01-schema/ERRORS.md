# IA-01 — ERRORS

## Phase 2 schema blockers

### E-001 — CONTRACT-001: DomainOutbox ownership/scope
Status: OPEN / BLOCKING FOR AFFECTED DESIGN. Physical ownership, scope and event persistence semantics remain ambiguous across Core/Gateway.

### E-002 — CONTRACT-002: `order.status_changed`
Status: OPEN / CURRENTLY NON-BLOCKING FOR EXISTING SCHEMA. Becomes blocking only if final event semantics require new physical persistence.

### E-003 — GOV-001: documentation authority/history mismatch
Status: OPEN. Must be escalated if source authority changes interpretation of schema-critical material.

### E-004 — Field specification gaps
Status: OPEN / BLOCKING. Exact fields remain incomplete for Settings, ProductCategory, CustomerAddress, PaymentMethod, Integration, IntegrationCredential and KnowledgeItem.

### E-005 — Child parent-key names absent
Status: OPEN / BLOCKING. OrderItem, OrderItemModifier and OrderStatusHistory cannot receive deterministic FKs without explicit parent-key field names.

### E-006 — Physical SQL table naming not frozen
Status: OPEN / BLOCKING. lower_snake_case is only a proposal.

### E-007 — Physical UUID/timestamp encoding not frozen
Status: OPEN / BLOCKING FOR DDL. Semantic conventions are known; SQLite encoding is not explicitly selected.

### E-008 — Nullability/defaults not frozen
Status: OPEN / BLOCKING. Do not add NOT NULL or DEFAULT based on intuition.

### E-009 — FK delete/update behavior not frozen
Status: OPEN / BLOCKING where explicit actions are required for deterministic DDL.

### E-010 — SQL state representation not frozen
Status: OPEN / BLOCKING. Semantic state values are known, physical representation is not.

### E-011 — Existing migration is foundation-only
Status: CONFIRMED. `0001_bootstrap.sql` remains unchanged and creates only `_schema_metadata`.

### E-012 — M5.1 runtime remains outside IA-01 write scope
Status: CONFIRMED. `apps/desktop/electron/database/**` is protected in this phase.

### E-013 — Performance-only indexes are unapproved
Status: CONFIRMED. Only seven explicit uniqueness indexes are contract-required.

## Error handling rule

No blocker is removed because a convenient implementation exists. Resolution requires authoritative evidence or explicit project decision.
