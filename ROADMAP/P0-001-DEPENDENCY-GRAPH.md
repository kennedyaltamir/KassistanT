# P0-001 — Dependency Graph v1.1

**Status:** CANONICAL / ACTIVE  
**Baseline:** `MVP2`

## Contract dependency closure

`D-010 — Inbox/Outbox Persistence Boundary` was approved by **Kennedy Altamir + Esdras Ribeiro** on **2026-08-25 23:11:44 America/Sao_Paulo (UTC−03:00)**.

D-010 closes the P0-001B contract dependency:

- `INBOX-V1` = FROZEN
- `OUTBOX-V1` = FROZEN
- `CONTRACT-001` = RESOLVED
- IA-01 = canonical SQLite schema/migration owner
- IA-03 ↔ IA-01 = explicit, versioned, SQLite-independent persistence boundary
- no physical DLQ in P0-001B; `FAILED_TERMINAL` is the terminal failure state

D-010 satisfies the **contract prerequisite** for P0-001B. It does not itself satisfy implementation, testing or verification gates.

## Execution chain

```text
P0-001A — IA-06 Device Authentication Runtime
        |
        v
D-010 — Inbox/Outbox Persistence Boundary (contract prerequisite satisfied)
        |
        v
P0-001B — IA-03 Inbox/Outbox Runtime Integration
        |
        v
P0-001 — IA-07 WSS Runtime Transport
        |
        v
P0-005 — QAOPS WSS End-to-End Verification
```

## Operational ownership

- `P0-001A`: `AG-ENG-01` operationally delegated per D-009; technical territory remains `IA-06`.
- `P0-001B`: `AG-ENG-01` operationally delegated per D-009; technical territory remains `IA-03`.
- `P0-001`: `AG-ENG-01` / `IA-07`.
- `P0-005`: `AG-QAOPS-01`.

Operational delegation does not merge technical namespaces or authorize cross-territory editing.

## Rules

- P0-001A and P0-001B are independent dependency implementation tasks.
- P0-001B may begin implementation only against the frozen D-010 boundary and its exact task packet.
- P0-001 MUST NOT bypass IA-06 or IA-03 ownership to unblock itself.
- P0-005 MUST NOT report PASS until P0-001 is implemented and testable.
- Dependency completion requires implementation evidence and QAOPS verification; an implementation claim alone is insufficient.
- All tasks follow `GOVERNANCE/IMPLEMENTATION_BASELINE.md`.
- A dependency must reach at least `READY_FOR_REVIEW` before it can unlock P0-001.

## Handoff requirements

**P0-001A → P0-001:** expose and document the approved device-auth consumer boundary.  
**P0-001B → P0-001:** expose and document the approved Inbox/Outbox consumer boundary.  
**P0-001 → P0-005:** provide testable WSS runtime, exact SHA, runtime evidence and failure-path evidence.

## Baseline requirements

Every task records:

- `BASELINE_REF`
- `BASELINE_SHA_AT_START`
- `TASK_BRANCH`
- `FINAL_TASK_SHA`

`MVP2` is the default implementation baseline. `main` is not a baseline for this wave unless a task explicitly says so.
