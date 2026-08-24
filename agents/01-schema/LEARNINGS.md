# IA-01 — LEARNINGS

## Audit-derived learnings

### L-001 — M5.1 is a foundation, not the canonical schema
M5.1 remains intact; `0001_bootstrap.sql` still creates only `_schema_metadata`.

### L-002 — Migration integrity is already a concrete contract
Future migrations must preserve deterministic discovery, SHA-256 checksums, idempotent application and checksum-drift detection.

### L-003 — Field-level schema is materially incomplete
Phase 2 confirms that several entities cannot receive deterministic DDL without additional authoritative field definitions.

### L-004 — Physical naming is itself a contract input
A lower_snake_case proposal is mechanically consistent but cannot be treated as frozen without an approved naming convention.

### L-005 — Child parent keys are not safe to infer
`OrderItem`, `OrderItemModifier` and `OrderStatusHistory` require explicit parent-key names before migration generation.

### L-006 — Unique constraints are the strongest current physical index evidence
The seven declared unique constraints are REQUIRED_BY_CONTRACT. Other performance indexes remain unapproved.

### L-007 — Store scoping must be evidence-driven per entity
The architecture uses Store as a major boundary, but adding `store_id` to every table would be unsupported where field evidence is absent.

### L-008 — Money is physically constrained enough for integer storage
Money is integer cents in BRL; floating point is prohibited. Full DDL still requires remaining field rules.

### L-009 — Semantic lifecycle values are known but SQL encoding is not
Conversation, AI, Message and Order state sets are defined; the SQLite storage strategy and CHECK policy are not frozen.

### L-010 — DomainOutbox remains the principal cross-boundary schema blocker
CONTRACT-001 can change physical ownership/scope and must be resolved before affected DDL is generated.

### L-011 — `order.status_changed` does not presently justify schema changes
CONTRACT-002 is primarily an event contract ambiguity and becomes schema-blocking only if the final event decision changes persistence.

### L-012 — Phase 2 can produce a deterministic semantic map before it can produce deterministic DDL
The physical specification now makes every known choice explicit and every missing choice visible. That is the correct stopping point before migration implementation.
