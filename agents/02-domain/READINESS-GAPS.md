# IA-02 — Readiness Gaps

## Reconciliation closure

The D1 entity-count inconsistency is closed: **28 canonical entities**. The prior 29 count was a reporting/counting error; no extra entity exists.

## Blocking gaps

| Gap | Severity | Impact | Required closure |
|---|---|---|---|
| Aggregate root not normative | CRITICAL | Prevents deterministic aggregate implementation | Approve first-slice aggregate boundary |
| Lifecycle transition matrices incomplete | CRITICAL | Prevents state machine implementation | Freeze explicit transitions, triggers and invalid cases |
| Command contracts partial | CRITICAL | Prevents command implementation | Complete one command end-to-end before D2 |
| Domain error codes/mapping partial | HIGH | Prevents stable failure semantics | Approve stable error semantics/codes |
| CONTRACT-001 | CRITICAL | Blocks Outbox/persistence-effect boundary | Human decision |
| CONTRACT-002 | HIGH | Blocks ambiguous Order event behavior | Human decision or explicit first-slice exclusion |
| IA-01 schema direction incomplete | HIGH | Persistence alignment unavailable | Canonical schema direction for selected slice |
| IA-03 event boundary incomplete | HIGH | Domain event handoff unstable | Stable event consumption/production boundary |
| GOV-001 | MEDIUM | Affects normative-history governance | Governance decision |
| Query semantics partial | MEDIUM | Blocks standalone query runtime | Define only queries required by first slice |
| Concurrency semantics partial | HIGH | Risks race-condition behavior | Define conflict model for selected aggregate |
| Authorization boundary partial | HIGH | Risks actor enforcement placement | Define domain/application boundary |
| IA-01 audit artifact missing | LOW | Reduces cross-agent evidence completeness | IA-01 may add requested audit artifact later |

## Non-blocking work

Documentation, reconciliation, test planning and dependency mapping may continue without modifying product code.

## D2 gate

No runtime implementation is authorized until the first slice passes all readiness criteria in `FIRST-DOMAIN-SLICE-READINESS.md`.
