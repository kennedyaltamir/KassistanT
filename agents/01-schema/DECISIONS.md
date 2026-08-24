# IA-01 — DECISIONS

## Approved / evidence-based constraints

### D-001 — SQLite for MVP persistence
Status: APPROVED / BASELINE.

### D-002 — UTC persistence
Status: APPROVED / BASELINE.

### D-003 — Integer cents / BRL
Status: APPROVED / BASELINE.

### D-004 — UUIDv7 identifier direction
Status: APPROVED / BASELINE.

### D-005 — Store scoping where explicitly contracted
Status: APPROVED / BASELINE.

### D-006 — Deterministic migration integrity
Status: IMPLEMENTED FOUNDATION / PRESERVE.

### D-007 — Seven normative UNIQUE constraints
Status: APPROVED EVIDENCE CLASSIFICATION.

## Decision package

### D-008 — Semantic authority is separate from physical schema authority
Status: DOCUMENTED / GOVERNANCE ALIGNMENT.
Semantic owners define meaning; IA-01 defines physical SQLite realization once semantics are explicit.

### D-009 — CONTRACT-002 is currently non-blocking for physical schema
Status: DOCUMENTED / NON-BLOCKING.
The disputed `order.status_changed` event does not itself require a physical persistence change.

### D-010 — Performance-only indexes are deferred
Status: DOCUMENTED / DEFERRED.
Only the seven explicit contract-required uniqueness constraints are currently required.

## Phase 2 local proposals — NOT APPROVED

### P-001 — lower_snake_case physical naming
Classification: LOCAL_DECISION / PROPOSAL.
Requires operator confirmation before migration generation.

### P-002 — UUID physical representation as TEXT
Classification: LOCAL_DECISION / PROPOSAL.

### P-003 — UTC timestamp representation as TEXT
Classification: LOCAL_DECISION / PROPOSAL.

### P-004 — Boolean representation as INTEGER 0/1
Classification: LOCAL_DECISION / PROPOSAL.

### P-005 — JSON payload representation as TEXT JSON where relational decomposition is not contracted
Classification: LOCAL_DECISION / PROPOSAL.

## Cross-agent decisions pending

### P-006 — Nullability/default semantics
Authority: IA-02 and relevant semantic owner.

### P-007 — Parent keys for OrderItem / OrderItemModifier / OrderStatusHistory
Authority: IA-04 with IA-02 support where required.

### P-008 — Lifecycle/status physical encoding
Authority: semantic owner plus IA-01 physical mapping.

### P-009 — FK delete/update actions
Authority: relevant semantic owner.

### P-010 — Missing field models
Authorities: IA-02 / IA-04 / IA-05 / IA-06 and provider/security owners according to the authority matrix.

## Global decisions pending

### P-011 — CONTRACT-001 DomainOutbox ownership/scope
Authority: global project authority with IA-03/IA-07 input.

### P-012 — GOV-001 document authority conflict
Required only if an actual normative conflict changes schema interpretation.

## Rule

No proposal in this document is project-authoritative until explicitly approved through governance.
