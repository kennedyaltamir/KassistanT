# IA-05 — Conversation Lifecycle Matrix

Status: **PARTIAL / CROSS_AGENT**.

## Normative state vocabulary — FACT / EXPLICIT

- `ConversationLifecycle`: `OPEN`, `CLOSED`.
- `ConversationOwnership`: `AI`, `HUMAN`.
- `AIState`: `ACTIVE`, `PAUSED`, `UNAVAILABLE`.
- `MessageLifecycle`: `RECEIVED`, `QUEUED`, `PROCESSING`, `SENT`, `DELIVERED`, `READ`, `FAILED`, `REJECTED`.

No new state names are introduced here.

## Closure matrix

| Concern | Status | Owner / dependency | Classification | Required closure |
|---|---|---|---|---|
| Conversation lifecycle states | EXPLICIT | IA-02 domain | CROSS_AGENT | Consume executable domain state contract |
| Lifecycle transitions | PARTIAL | IA-02 | CROSS_AGENT | IA-02 defines legal transitions; IA-05 does not infer them |
| Ownership states | EXPLICIT | IA-02 | CROSS_AGENT | Consume AI/HUMAN semantics |
| Ownership transitions | PARTIAL | IA-02 + IA-06 where actor identity applies | CROSS_AGENT | Define actor/authorization semantics |
| AI states | EXPLICIT | IA-02 | CROSS_AGENT | Consume ACTIVE/PAUSED/UNAVAILABLE |
| AI-state transitions | PARTIAL | IA-02 + IA-08 | CROSS_AGENT | Define trigger/authorization/projection semantics |
| Human takeover | PARTIAL | IA-02 + IA-08 | CROSS_AGENT | First-class state transition, not prompt instruction |
| Return-to-AI | PARTIAL | IA-02 + IA-08 | CROSS_AGENT | Exact transition must be approved before runtime |
| Operator identity | UNKNOWN | IA-06/domain/authz | CROSS_AGENT | Consume authoritative actor identity; do not invent local identity fields |
| Active AI profile | PARTIAL | IA-01 + IA-02 | CROSS_AGENT | Define active-profile resolution semantics |
| Persistence | BLOCKED | IA-01 | CROSS_AGENT | Canonical schema/runtime first |
| Message ordering | PARTIAL | IA-01/03/07 | CROSS_AGENT | Use external IDs and transport sequence semantics where defined |
| Message deduplication | PARTIAL | IA-01/03 | CROSS_AGENT | Define logical execution deduplication before AI retry |
| Audit | PARTIAL | IA-03 | CROSS_AGENT | Map state changes/execution to evidence |
| Observability | PARTIAL | IA-03/08 | NON_BLOCKING | Minimum telemetry can follow contract-test slice |
| Cancellation/timeout | UNKNOWN | IA-05 + IA-03/08 | CROSS_AGENT | Close logical outcome before runtime |

## Critical rule

IA-05 must not manufacture missing transitions. Any undefined transition remains `PARTIAL` until IA-02/integration governance publishes the authoritative semantics.
