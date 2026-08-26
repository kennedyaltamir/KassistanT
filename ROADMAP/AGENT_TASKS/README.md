# KassisT — Agent Implementation Task Index v1.0

## Purpose
Canonical index for the implementation packets used by the five operational agents. These packets are derived from the approved decisions, frozen P0 contracts, Permission Matrix and Quality Gates.

## Packets

| Agent | Packet | Current authorization |
|---|---|---|
| `AG-AI-01` | `AG-AI-01.md` | P0-002, P0-003 |
| `AG-ENG-01` | `AG-ENG-01.md` | P0-001 |
| `AG-QAOPS-01` | `AG-QAOPS-01.md` | P0-004; P0-005 verification |
| `AG-UX-01` | `AG-UX-01.md` | P0-006 |
| `AG-GROWTH-01` | `AG-GROWTH-01.md` | no product implementation P0; GROWTH-001 analysis/readiness |

## Execution order

`P0-001 ∥ P0-002 ∥ P0-004 ∥ P0-006`

`P0-003` depends on P0-002.

`P0-005` depends on P0-001 and the required cross-territory dependencies.

## Global rules

1. Implement only within the declared technical territory and allowed paths.
2. Protected/shared paths require explicit authorization.
3. Contract changes require a new decision/contract review; do not silently rewrite frozen contracts.
4. `IMPLEMENTED` is not `APPROVED` or `RELEASED`.
5. Every task must produce reproducible evidence with the exact starting and resulting SHA.
6. Quality gates are mandatory.
7. Human approval remains required for governance, security policy, ownership changes, merge/release and other explicitly protected transitions.

## Canonical references

- `ROADMAP/07_DECISION_LOG.md`
- `ROADMAP/12_IMPLEMENTATION_BACKLOG.md`
- `ROADMAP/13_P0_IMPLEMENTATION_TASKS.md`
- `GOVERNANCE/PERMISSION_MATRIX.md`
- `GOVERNANCE/QUALITY_GATES.md`
- `docs/protocols/wss-runtime-contract-v1.md`
- `docs/ai/AI-V1-CONTRACTS.md`
- `docs/protocols/contract-registry.md`
