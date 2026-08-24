# IA-02 — Errors and Risks

## Existing risks

- **E-001 / CONTRACT-001:** DomainOutbox ownership/scope ambiguity. OPEN.
- **E-002 / CONTRACT-002:** `order.status_changed` ambiguity. OPEN.
- **E-003:** domain documentation/runtime gap. EXPECTED.
- **E-004:** cross-agent ownership risk. OPEN.
- **E-005:** schema coupling risk. OPEN.
- **E-006:** external-provider contamination risk. OPEN.

## D1 readiness risks

### E-007 — Aggregate boundary undefined
**Class:** DOMAIN_CONTRACT_GAP  
Implementation could accidentally couple child entities to the wrong root.

### E-008 — Transition semantics incomplete
**Class:** STATE_MACHINE_GAP  
State catalogs are insufficient for deterministic runtime.

### E-009 — Error taxonomy incomplete
**Class:** ERROR_CONTRACT_GAP  
Conditions exist without stable canonical error codes and retryability mapping.

### E-010 — Command contract incompleteness
**Class:** COMMAND_CONTRACT_GAP  
Order commands lack fully frozen input/output/event/idempotency/auth semantics.

### E-011 — Query contract incompleteness
**Class:** QUERY_CONTRACT_GAP  
Consistency, ordering, pagination and authorization semantics are incomplete.

### E-012 — Event envelope mismatch risk
**Class:** CONTRACT_CONSISTENCY  
`packages/contracts/src/events.ts` is narrower than the richer event envelope documented in `docs/domain/events.md`; reconciliation must be handled by contract governance.

## Stop rule

Any implementation that requires assuming aggregate boundaries, transition semantics, canonical error codes, unresolved event semantics or Outbox ownership must stop and escalate instead of guessing.
