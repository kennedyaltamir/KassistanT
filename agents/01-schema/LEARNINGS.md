# IA-01 — LEARNINGS

## Audit-derived learnings

### L-001 — M5.1 is a foundation, not the canonical schema

**Evidence:** the repository migration `0001_bootstrap.sql` creates only `_schema_metadata`; `docs/backend/database.md` explicitly marks business tables as `NOT_IMPLEMENTED`.

**Operational consequence:** no schema entity may be treated as implemented merely because the baseline lists it.

### L-002 — Migration integrity is already a concrete contract

**Evidence:** M5.1 contains deterministic migration discovery, SHA-256 checksums, idempotent application and checksum-drift rejection.

**Operational consequence:** future canonical migrations must remain compatible with those guarantees rather than introducing an incompatible migration mechanism.

### L-003 — Several entity details are intentionally incomplete

**Evidence:** `docs/domain/entities.md` states that detailed field schemas for several entities remain partial and must not be inferred from implementation.

**Operational consequence:** field-level choices require contract evidence or explicit approved decisions; absence of detail is not permission to invent.

### L-004 — DomainOutbox is a cross-boundary schema risk

**Evidence:** `CONTRACT-001` is recorded as ambiguous because the baseline uses DomainOutbox in both local domain transaction flow and Gateway architecture.

**Operational consequence:** IA-01 cannot independently finalize ownership, storage scope or cross-system semantics by choosing a schema shape.

### L-005 — Order event ambiguity is not primarily a schema problem

**Evidence:** `CONTRACT-002` concerns the normative semantics of `order.status_changed`.

**Operational consequence:** IA-01 should not add schema semantics merely to force a resolution of an event contract disagreement.

### L-006 — Schema and runtime ownership are different

**Evidence:** existing SQLite lifecycle files implement the M5.1 runtime foundation, while the assigned IA-01 ownership explicitly targets migrations and schema artifacts.

**Operational consequence:** IA-01 must not expand from schema ownership into repository or database-runtime ownership without an explicit governance change.

### L-007 — Documentation can lag repository history

**Evidence:** current `main` advanced after PR #4 while the roadmap text still references an older `main` HEAD.

**Operational consequence:** repository state and current Git history must be checked directly before treating documentation snapshots as current state.

### L-008 — Store scoping is a persistent architectural invariant

**Evidence:** baseline and domain documentation define Store as an operational boundary and specify uniqueness/indexing patterns involving `store_id`.

**Operational consequence:** any canonical schema proposal must preserve tenant/store isolation semantics already approved for the MVP.

## Classification rule

These are audit learnings derived from repository evidence. They are not architectural proposals and do not override protected contracts.
