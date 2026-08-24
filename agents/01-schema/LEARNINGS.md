# IA-01 — LEARNINGS

### L-001 — M5.1 is a foundation, not the canonical schema
`0001_bootstrap.sql` still creates only `_schema_metadata`; canonical business tables are not implemented.

### L-002 — Migration integrity is already a concrete contract
Future migrations must preserve deterministic discovery, SHA-256 checksums, idempotent application and checksum-drift detection.

### L-003 — Field-level schema remains materially incomplete
Several entities cannot receive deterministic DDL without additional authoritative field definitions.

### L-004 — Physical naming is a visible implementation decision
`lower_snake_case` is mechanically consistent with the repository but remains a PROPOSAL pending operator confirmation.

### L-005 — Child parent keys are not safe to infer
`OrderItem`, `OrderItemModifier` and `OrderStatusHistory` require explicit parent-key semantics from IA-04/IA-02.

### L-006 — Unique constraints are the strongest current physical index evidence
The seven declared unique constraints are REQUIRED_BY_CONTRACT. Other performance indexes remain deferred.

### L-007 — Store scoping must remain evidence-driven
Do not add `store_id` merely because Store is a global architectural boundary.

### L-008 — Money is physically constrained enough for integer storage
Money is integer cents in BRL; floating point is prohibited.

### L-009 — Semantic state values are known, SQL encoding is not
Lifecycle/state catalogs can be preserved semantically without inventing SQL enum/lookup encoding.

### L-010 — DomainOutbox is a localized global blocker
CONTRACT-001 blocks only physical decisions that depend on local-Core versus Gateway ownership; it is not a reason to block unrelated tables.

### L-011 — `order.status_changed` is currently non-blocking for schema
CONTRACT-002 is primarily an event contract ambiguity and requires schema action only if the final decision introduces a physical persistence requirement.

### L-012 — Decision authority must be explicit
Semantic owners decide meaning; IA-01 decides physical SQLite realization after the meaning is closed.

### L-013 — Deferred indexes are valid engineering posture
No performance-only index is required for `0002` until query or integrity evidence exists.

### L-014 — Decision requests must be closed questions
Cross-agent coordination is more reliable when each owner receives an exact question, evidence, affected tables, blocking impact and required response instead of a generic request to review the schema.

## Classification

These are audit-derived engineering learnings. They do not override protected contracts or project decisions.
