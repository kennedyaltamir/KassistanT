# IA-03 — Implementation Gates

Status: READINESS / IMPLEMENTATION FROZEN

## Gate model

### G0 — Governance

**Required:** `main` remains integration authority; protected contracts and baseline are unchanged locally.

**Evidence:** repository rules and agent ownership documents.

**State:** PASS.

### G1 — Persistence

**Required:** canonical tables and transaction/persistence primitives for the target slice exist and are validated.

**Owner:** IA-01.

**Current state:** BLOCKED. M5.1 establishes only migration infrastructure and `_schema_metadata`; canonical business tables are absent.

### G2 — Domain semantics

**Required:** the target event types, invariants and producer semantics are sufficiently stable to consume without inventing business rules.

**Owner:** IA-02 / protected contracts.

**Current state:** PARTIAL.

### G3 — DomainOutbox decision

**Required for any DomainOutbox implementation:** `CONTRACT-001` resolved and integrated through governance.

**Current state:** BLOCKED.

### G4 — Normative order event catalogue

**Required for order-event dispatch/replay/tests:** `CONTRACT-002` resolved.

**Current state:** OPEN.

### G5 — Operational reliability semantics

**Required for JobQueue/recovery:** retryable vs non-retryable errors, attempt state, locking/lease semantics, backoff policy and recovery transitions are sufficiently defined for the target slice.

**Current state:** PARTIAL / several values UNKNOWN.

### G6 — Observability and audit boundary

**Required:** correlation/causation handling and sensitive-data policy are defined well enough to prevent accidental leakage.

**Current state:** PARTIAL.

### G7 — Deterministic tests

**Required:** every implemented invariant has an executable deterministic test; tests do not encode undocumented guarantees.

**Owner:** IA-03.

**Current state:** NOT_STARTED.

### G8 — Integration validation

**Required:** target slice passes relevant typecheck/lint/test/CI checks on actual branch HEAD and stays within ownership.

**Current state:** NOT_STARTED.

## Slice gates

| Slice | Minimum gates | Readiness |
|---|---|---|
| EventBus | G0 + G2 + G7 | CANDIDATE, pending contract stability |
| InboundInbox | G0 + G1 + G2 + G6 + G7 | BLOCKED on IA-01 |
| DomainOutbox | G0 + G1 + G2 + G3 + G6 + G7 | BLOCKED |
| JobQueue | G0 + G1 + G2 + G5 + G6 + G7 | BLOCKED / PARTIAL policies |
| AuditLog | G0 + G1 + G6 + G7 | BLOCKED on persistence/policy |
| Replay | G0 + G1 + target event semantics + WSS contract + G7 | BLOCKED / PARTIAL |
| Reconciliation | G0 + target persistence + target state models + G7 | NOT_READY |
| Dead Letter | G0 + durable job/event state + G5 + G6 + G7 | NOT_READY |

## Stop conditions

Stop implementation and escalate when:

- a global contract would need interpretation;
- another agent's file must be changed;
- canonical schema is insufficient;
- a retry/error policy would have to be invented;
- security or sensitive-data handling is unclear;
- test behavior would imply an undocumented guarantee.

## Readiness exit criteria

IA-03 may leave readiness mode for a concrete slice only when the applicable gates are green and the slice does not encode an unresolved global decision.
