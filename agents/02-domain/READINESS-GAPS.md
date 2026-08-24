# IA-02 — Readiness Gaps

## Normative gaps

### G-001 — Aggregate boundaries
**Classification:** UNKNOWN  
The repository does not explicitly declare aggregate roots/boundaries. `Order` is the strongest candidate but remains inference.

### G-002 — State transition semantics
**Classification:** BLOCKING  
Lifecycle state catalogs exist, but the transition matrices are absent or partial. Do not implement transitions from enum ordering.

### G-003 — Command contracts
**Classification:** PARTIAL  
Order commands are named, but complete input/precondition/output/event/error/idempotency semantics are not frozen.

### G-004 — Query contracts
**Classification:** PARTIAL  
Queries are named, but pagination, ordering, projection, consistency and authorization semantics are incomplete.

### G-005 — Domain errors
**Classification:** PARTIAL  
Error conditions exist, but canonical error codes and stable mappings do not.

### G-006 — Concurrency semantics
**Classification:** PARTIAL  
Idempotency/concurrency are required conceptually, but exact conflict rules and operation keys remain incomplete.

## Cross-agent blockers

### G-007 — `CONTRACT-001`
Affects DomainOutbox ownership, persistence boundary, transactional semantics and external-effect coupling. IA-02 can continue only with pure rules that do not encode Outbox ownership.

### G-008 — `CONTRACT-002`
Affects event vocabulary and order lifecycle event semantics. `order.confirmed` is usable as a documented event; `order.status_changed` is not normatively settled.

### G-009 — IA-01 schema readiness
IA-02 must not reconstruct SQLite schema or repository behavior. Canonical schema direction is a dependency for persistence alignment, not for pure domain objects.

### G-010 — IA-03 event readiness
IA-02 may define pure domain event concepts only where event semantics are stable. Durable delivery/replay/audit belong to IA-03.

### G-011 — IA-04 orchestration boundary
IA-02 owns pure order rules; IA-04 owns application/orchestration. Command handlers that require Electron/DB/outbox orchestration do not belong in `packages/domain/**`.

### G-012 — IA-05 conversation/LLM boundary
IA-02 defines deterministic concepts/invariants consumed by IA-05. Prompting, model calls, tool orchestration and AI execution runtime remain IA-05.

## Open behavior questions

- Which aggregate owns each mutable child entity?
- Which lifecycle transitions are legal, and under which actor/preconditions?
- Which domain events are guaranteed versus optional projections?
- What is the canonical error-code taxonomy?
- What is the domain-level concurrency conflict model?
- Which operations require explicit authorization and where is that boundary enforced?
- Which query consistency guarantees are required?
- Which domain identifiers have typed semantics beyond UUIDv7/string?

## Implementation gate

D2 can begin only for a slice whose aggregate boundary, command contract, transitions, invariants, errors and event set are sufficiently locked. `CONTRACT-001` and `CONTRACT-002` must not remain unresolved for any implementation that depends on them.