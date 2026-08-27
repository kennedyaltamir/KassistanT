# Database

Status: DEFINED / CURRENT bootstrap + D-010 boundary.

MVP persistence is SQLite. Timestamps persist in UTC, monetary values use integer cents/BRL, and canonical entities are scoped by store. The audited migration currently establishes only schema metadata; business tables are NOT_IMPLEMENTED.

## Persistence ownership

`IA-01` is the technical owner of the canonical SQLite schema and schema migrations. `IA-03` must not create or alter SQLite schema or migrations unilaterally as part of P0-001B.

## IA-03 ↔ IA-01 boundary

D-010 freezes an explicit, versioned persistence boundary that is independent of SQLite. IA-03 consumes semantic persistence operations without depending on SQL, table names, SQLite internals, migration numbers or other physical storage details.

Canonical operations are:

`accept_inbound`, `deduplicate`, `retrieve_pending`, `stage_outbound`, `mark_processing`, `mark_delivered`, `record_retry`, `record_failure`, `recover_pending`.

Persistence stores durable state, attempts, timestamps and failure metadata. Event/runtime semantics, retry policy and recovery orchestration remain owned by IA-03. Business semantics remain in Core/Domain.

The D-010 boundary does not authorize schema creation, migrations or physical DLQ infrastructure. Those remain subject to IA-01 ownership and any required future human decision.
