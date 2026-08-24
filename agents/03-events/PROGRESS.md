# IA-03 — Progress

## Current phase

Post-Implementation Audit / EventBus Handoff / Inbox Gate.

## Status

`EVENTBUS_MILESTONE_CLOSED / INBOX_BLOCKED`

## EventBus post-implementation audit

| Decision | Actual behavior | Test/code evidence | Status |
|---|---|---|---|
| EBUS-DEC-001 | Failures are isolated, collected and returned in `DispatchResult` after selected handlers settle | `event-bus.ts` + failure tests | MATCH |
| EBUS-DEC-002 | Later subscribers continue after an earlier handler failure | sequential loop + isolation test | MATCH |
| EBUS-DEC-003 | `publish()` is async; handlers are awaited sequentially over a publish-time snapshot | `publish()` implementation + completion test | MATCH |
| EBUS-DEC-004 | Opaque subscription identity; `unsubscribe()` idempotent | subscription implementation + unsubscribe test | MATCH |
| EBUS-DEC-005 | Unsubscribe-only lifecycle cancellation; no `AbortSignal` | API surface and implementation | MATCH |
| EBUS-DEC-006 | No EventBus timeout exists | implementation contains no timeout path | MATCH |
| EBUS-DEC-007 | Publish settles only after all selected handlers finish | awaited handler loop + completion test | MATCH |
| EBUS-DEC-008 | Publish-time snapshot; each subscription invoked at most once per dispatch | snapshot implementation + snapshot/duplicate tests | MATCH |

No implementation divergence was found.

## EventBus handoff

Created `EVENTBUS-HANDOFF.md` with the consumer contract for IA-04, IA-05, IA-06, IA-07 and IA-08.

Downstream integration remains intentionally deferred. No new event types were introduced.

## Inbox gate

Created `INBOX-IMPLEMENTATION-GATE.md`.

`INBOX_V1 = NOT_READY` because IA-01 has not yet supplied the canonical persistence contract required for durable intake, uniqueness and transaction ownership, and IA-07 ACK integration must be explicit.

## Validation

Prior branch validation record: 10 EventBus tests passed with 0 failures, 0 cancellations and 0 skips.

Fresh re-execution requested in this phase was **not completed** because the current environment does not have `tsx` installed and package retrieval was unavailable. Therefore this phase does not claim a new test run.

Remote status lookup for the current branch head returned zero statuses; `REMOTE_CI_STATUS = NOT_VERIFIED`.

## Non-goals preserved

Inbox, Outbox, JobQueue, AuditLog, WSS, Device Auth, replay, reconciliation, dead-letter handling, durable retry and SQLite persistence were not implemented in this phase.

## Global contracts preserved

`CONTRACT-001`, `CONTRACT-002` and `GOV-001` remain open and unchanged.
