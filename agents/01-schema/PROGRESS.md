# IA-01 — PROGRESS

## Current phase

**Schema Decision Execution / Cross-Agent Closure**

## Phase status

- Phase 1: `DONE WITH BLOCKERS`.
- Phase 2: `COMPLETE AS SPECIFICATION / BLOCKED FOR DDL`.
- Decision package: `COMPLETE / REVIEW REQUIRED`.
- Decision execution: `REQUESTS PREPARED / AWAITING RESPONSES`.

## Decision package

- `SCHEMA-DECISION-MATRIX.md` — owner, blocker impact, approval and request state.
- `SCHEMA-AUTHORITY-MATRIX.md` — semantic authority vs physical ownership.
- `TABLE-READINESS-MATRIX.md` — per-table readiness and request state.
- `HUMAN-SCHEMA-REVIEW.md` — operator-ready local/global decisions and targeted cross-agent requests.

## Current readiness

- READY_FOR_MIGRATION: 0.
- READY_AFTER_LOCAL_DECISION: 3.
- READY_AFTER_CROSS_AGENT_DECISION: 14.
- READY_AFTER_GLOBAL_DECISION: 1.
- READY_AFTER_EXTERNAL_DECISION: 0.
- BLOCKED: 10.

No table was promoted in this execution because no explicit approval or semantic response was received.

## Requests prepared

- IA-02: domain nullability/defaults, lifecycle/state semantics, store scoping.
- IA-03: Inbox, Outbox, Job, Audit and correlation/idempotency physical semantics.
- IA-04: OrderItem, OrderItemModifier, OrderStatusHistory parent keys and order persistence semantics.
- IA-05: Conversation/Message and AIProfile/AIExecution/KnowledgeItem persistence semantics.
- IA-06: Device lifecycle and secure identity persistence boundaries.
- IA-07: Gateway/Desktop persistence boundary relevant to CONTRACT-001.
- IA-08: no blocking request required for canonical persistence at this stage.
- Global authority: CONTRACT-001 and any genuinely architecture-wide decision.

## Contract impact

- CONTRACT-001: localized global blocker for DomainOutbox physical design.
- CONTRACT-002: currently non-blocking for physical schema.
- GOV-001: conditional/deferred; only escalated when a real source conflict changes schema interpretation.

## Implementation status

`IMPLEMENTATION_STARTED = FALSE`.

No migration was created. `0001_bootstrap.sql`, M5.1 runtime, contracts, global documentation and other agent territories remain unchanged.

## Next gate

Collect explicit responses/approvals, incorporate them into the decision and readiness matrices, and only then evaluate whether a first deterministic migration slice is authorized.
