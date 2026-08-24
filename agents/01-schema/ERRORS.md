# IA-01 — ERRORS

## Known inconsistencies, risks and traps

### E-001 — CONTRACT-001: DomainOutbox ownership/scope

- **Status:** OPEN / BLOCKING FOR AFFECTED DESIGN
- **Classification:** CONTRACT AMBIGUITY
- **Evidence:** contract registry and backend persistence documentation.
- **Problem:** DomainOutbox appears in the local domain transaction flow and Gateway architecture without a single unambiguous ownership/scope definition.
- **Risk:** a schema could encode the wrong ownership model and make future reconciliation or delivery semantics difficult to change.
- **Rule:** do not silently resolve.

### E-002 — CONTRACT-002: `order.status_changed`

- **Status:** OPEN
- **Classification:** CONTRACT AMBIGUITY
- **Evidence:** contract registry and baseline sections on events/lifecycle.
- **Problem:** normative material contains conflicting statements about the existence/semantics of `order.status_changed`.
- **Risk:** schema fields or status history structures could be prematurely tailored to one event model.
- **Rule:** schema remains neutral until the normative event decision is resolved.

### E-003 — GOV-001: documentation authority/history mismatch

- **Status:** OPEN
- **Classification:** GOVERNANCE / DOCUMENT DRIFT
- **Evidence:** baseline filename/version references and documentation history.
- **Problem:** `KassisT_Approved_Technical_Baseline_v1.0.1.md` contains internal historical v1.0.0 references, while `docs/product` contains an older specification copy.
- **Risk:** schema work could accidentally use a stale normative source.
- **Rule:** use current protected authority and do not rewrite global documentation from IA-01.

### E-004 — Main roadmap snapshot is stale relative to Git history

- **Status:** OBSERVED / NOT_OWNED
- **Classification:** DOCUMENTATION DRIFT
- **Evidence:** current `main` advanced after PR #4, while `docs/ROADMAP.md` text still identifies an older main HEAD.
- **Risk:** relying solely on the roadmap can misstate repository state.
- **Rule:** Git state is authoritative for current branch/commit status.

### E-005 — Canonical field definitions are partial

- **Status:** OPEN / SCHEMA-SPECIFICATION GAP
- **Classification:** CONTRACT DETAIL GAP
- **Evidence:** `docs/domain/entities.md` explicitly marks several detailed fields as partial.
- **Risk:** inventing columns, defaults or constraints creates accidental architecture.
- **Rule:** unresolved fields require authoritative evidence or explicit approved decision.

### E-006 — Existing migration is foundation-only

- **Status:** CONFIRMED
- **Classification:** IMPLEMENTATION GAP
- **Evidence:** `0001_bootstrap.sql` creates only `_schema_metadata`.
- **Risk:** downstream agents may assume canonical tables exist because documentation enumerates them.
- **Rule:** implementation claims require executable repository evidence.

### E-007 — SQLite runtime files are adjacent but outside IA-01 ownership

- **Status:** CONFIRMED
- **Classification:** OWNERSHIP TRAP
- **Evidence:** M5.1 files under `apps/desktop/electron/database/**` implement runtime behavior, while IA-01 ownership is restricted to migrations/schema artifacts and schema tests.
- **Risk:** modifying runtime files would create cross-agent ownership conflict.
- **Rule:** do not edit those files unless integration authority explicitly changes ownership.

### E-008 — Shared contracts are protected

- **Status:** CONFIRMED
- **Classification:** GOVERNANCE TRAP
- **Evidence:** activation instructions and repository governance.
- **Risk:** editing `packages/contracts/**`, `docs/protocols/**`, or other protected files from a schema branch can silently redefine system contracts.
- **Rule:** report required changes instead of directly editing them.

## Error handling rule

This file records verified problems and traps. A proposal is not an error; speculative concerns are excluded unless supported by repository evidence.
