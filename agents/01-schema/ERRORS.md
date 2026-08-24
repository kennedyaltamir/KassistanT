# IA-01 — ERRORS

## Schema decision blocker classification

### E-001 — CONTRACT-001: DomainOutbox ownership/scope
Status: GLOBAL / BLOCKING ONLY FOR AFFECTED DESIGN.
Physical ownership and scope remain ambiguous across Core/Gateway.

### E-002 — CONTRACT-002: `order.status_changed`
Status: NON-BLOCKING FOR CURRENT SCHEMA.
Only becomes blocking if final event semantics add a physical persistence requirement.

### E-003 — GOV-001: document authority/history
Status: DEFERRED.
Escalate only if an actual normative conflict changes schema interpretation.

### E-004 — FIELD-GAPS
Status: CROSS-AGENT / BLOCKING.
Incomplete field models remain for Settings, ProductCategory, CustomerAddress, PaymentMethod, Integration, IntegrationCredential, KnowledgeItem and other partial concepts.

### E-005 — CHILD-KEY-GAPS
Status: CROSS-AGENT / BLOCKING.
OrderItem, OrderItemModifier and OrderStatusHistory require explicit parent keys and ownership semantics.

### E-006 — TABLE-NAMING
Status: LOCAL DECISION / PROPOSAL.
`lower_snake_case` is consistent but requires explicit operator confirmation before DDL.

### E-007 — PHYSICAL-TYPE-GAPS
Status: MIXED.
IA-01 may decide physical encoding for already-frozen primitives after approval; semantic-sensitive encodings remain cross-agent.

### E-008 — NULLABILITY-DEFAULT-GAPS
Status: CROSS-AGENT / BLOCKING.
Semantic owners must close required/optional/default behavior.

### E-009 — FK-ACTION-GAPS
Status: CROSS-AGENT / BLOCKING.
No ON DELETE/ON UPDATE behavior may be invented.

### E-010 — ENUM-PHYSICAL-GAPS
Status: CROSS-AGENT / BLOCKING.
Semantic state catalogs exist, but physical representation remains open.

### E-011 — M5.1 foundation boundary
Status: CONFIRMED / NON-BLOCKING FOR DOCUMENT WORK.
`0001_bootstrap.sql` and SQLite runtime remain unchanged and protected.

### E-012 — Performance-only indexes
Status: NON-BLOCKING / DEFERRED.
No performance index is required without explicit query/integrity evidence.

## Error handling rule

A blocker is closed only by authoritative evidence or explicit project decision. A convenient implementation is not closure evidence.
