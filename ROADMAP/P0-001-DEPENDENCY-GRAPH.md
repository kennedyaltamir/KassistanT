# P0-001 — Dependency Graph v1.0

**Status:** CANONICAL / ACTIVE
**Baseline:** `MVP2`

## Execution chain

```text
P0-001A — IA-06 Device Authentication Runtime
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

## Rules

- P0-001A and P0-001B are independent dependency implementation tasks.
- P0-001 MUST NOT bypass IA-06 or IA-03 ownership to unblock itself.
- P0-005 MUST NOT report a PASS until P0-001 is implemented and testable.
- Dependency completion requires evidence and QAOPS verification; an implementation claim alone is insufficient.
- All tasks follow `GOVERNANCE/IMPLEMENTATION_BASELINE.md`.

## Handoff requirements

**P0-001A → P0-001:** expose and document the approved device-auth consumer boundary.

**P0-001B → P0-001:** expose and document the approved Inbox/Outbox consumer boundary.

**P0-001 → P0-005:** provide testable WSS runtime, exact SHA, runtime evidence and failure-path evidence.

## Gate states

A dependency is considered satisfied only when it has reached at least `READY_FOR_REVIEW` with required evidence. `IMPLEMENTED` alone is not sufficient to unlock a dependent task.
