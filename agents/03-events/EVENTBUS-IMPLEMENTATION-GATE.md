# IA-03 — EventBus Implementation Gate

## Current state

`READY_AFTER_HUMAN_APPROVAL`

This gate does not authorize runtime code by itself. It records the local EventBus policy package that is ready for approval.

## Closed evidence-backed gates

### G0 — Branch
`Agent03-event-infrastructure` remains based on current `main` and contains only IA-03 territory changes.

### G1 — Event contract boundary
Consume approved event objects without modifying `packages/contracts/**`. `CONTRACT-002` remains open and must not be normalized locally.

### G2 — Envelope
The currently materialized minimum event envelope remains the protected input boundary. No silent contract expansion.

### G3 — Post-commit boundary
Dispatch is in-process and post-commit. EventBus is not a transaction manager and does not implement DomainOutbox.

### G5 — Ordering
`NO_ORDERING_GUARANTEE` is explicit.

### G6 — Retry boundary
EventBus does not own durable retry. JobQueue remains the documented durable retry boundary.

## Local policy gates proposed for approval

### G4 — Subscriber lifecycle/handler contract
Proposed local policy closes:

- async publication boundary;
- sequential handler invocation over a publish-time snapshot;
- failure isolation;
- failure aggregation;
- opaque subscription identity;
- idempotent unsubscribe;
- unsubscribe-only cancellation;
- no V1 timeout;
- all-selected-handlers-settled completion semantics;
- duplicate registration as distinct subscriptions.

Status: `PROPOSAL / HUMAN APPROVAL REQUIRED`.

### G7 — Deterministic tests
The test matrix now directly reflects the proposed local policy. Runtime tests remain unimplemented until approval.

Status: `READY_AFTER_HUMAN_APPROVAL`.

## External blockers outside EventBus V1

`CONTRACT-001` remains open and blocks DomainOutbox.

`CONTRACT-002` remains open and affects the normative Order event catalogue. It does not require mutation of the current EventBus implementation boundary.

`GOV-001` remains open.

None requires changing the proposed local EventBus runtime policy.

## Approval condition

Human approval of `HUMAN-EVENTBUS-DECISIONS.md` is the required gate before writing production EventBus code.

The approval must cover the proposed local observable behavior. No global contract modification is requested.

## Start condition after approval

After approval, the first runtime slice may begin within:

`apps/desktop/electron/infrastructure/events/**`

with directly associated tests only, maintaining the explicit non-goals:

- SQLite persistence;
- Inbox/Outbox/JobQueue/AuditLog;
- WSS;
- durable retry;
- replay/reconciliation/dead-letter;
- business rules;
- protected contract changes.
