# IA-03 — Human EventBus Decision Package

## EXECUTIVE_SUMMARY

Status: `PROPOSAL / HUMAN APPROVAL REQUIRED`

The first EventBus slice can remain entirely local to IA-03. No new global persistence, transport, domain, or contract authority is required.

Current evidence establishes only:

- EventBus is in-process communication.
- Local consumers operate post-commit.
- EventBus is not durable storage.
- EventBus does not own durable retry.
- No ordering guarantee is established.

The remaining gaps are implementation semantics of the local EventBus runtime. They can be defined as an IA-03 local runtime policy without changing `packages/contracts/**`, provided the operator approves the proposed V1 behavior before implementation.

## DECISIONS_REQUIRED_NOW

| ID | Topic | Classification | Current state | Blocks V1? |
|---|---|---|---|---|
| EBUS-DEC-001 | Subscriber failure propagation | `LOCAL_RUNTIME_POLICY` | UNKNOWN | Yes |
| EBUS-DEC-002 | Subscriber failure isolation | `LOCAL_RUNTIME_POLICY` | UNKNOWN | Yes |
| EBUS-DEC-003 | Scheduling semantics | `LOCAL_RUNTIME_POLICY` | UNKNOWN | Yes |
| EBUS-DEC-004 | Unsubscribe lifecycle | `LOCAL_RUNTIME_POLICY` | UNKNOWN | Yes |
| EBUS-DEC-005 | Cancellation | `LOCAL_RUNTIME_POLICY` | UNKNOWN | Yes if unsupported behavior is left implicit |
| EBUS-DEC-006 | Timeout | `DEFERRED` | UNKNOWN | No, if explicitly absent in V1 |
| EBUS-DEC-007 | Dispatch completion | `LOCAL_RUNTIME_POLICY` | UNKNOWN | Yes |
| EBUS-DEC-008 | Multiple subscriber semantics | `LOCAL_RUNTIME_POLICY` | UNKNOWN | Yes |
| EBUS-DEC-009 | Runtime contract minimum | `LOCAL_RUNTIME_POLICY` | Derivative of E001-E008 | Yes |

No item below is recorded as an approved project decision.

## EBUS-DEC-001 — Subscriber Failure Propagation

### CURRENT_STATE
`UNKNOWN`

### QUESTION
When a subscriber fails, what does `publish()` return?

### EXISTING_EVIDENCE
The repository does not define the subscriber failure API. EventBus is in-process/post-commit and durable retry is outside EventBus.

### WHY_IT_MATTERS
The publisher needs deterministic visibility into dispatch failure without turning EventBus into business-rule authority.

### OPTIONS

- A: propagate the first handler error immediately.
- B: isolate handler errors and never reject `publish()`.
- C: continue dispatch, collect all subscriber failures, then reject with an aggregate error.
- D: convert failures into an event/telemetry-only path.

### RECOMMENDED_OPTION
`C — PROPOSAL`

### RECOMMENDATION_RATIONALE
Continue dispatching all selected subscribers so one local consumer cannot suppress independent consumers. Return an aggregate failure after dispatch completes so the publisher still receives deterministic failure visibility. Do not retry automatically.

### BENEFITS

- preserves subscriber isolation;
- preserves publisher visibility;
- deterministic tests;
- no hidden durable retry;
- no business outcome decision inside EventBus.

### RISKS

- requires an explicit aggregate error contract;
- callers must decide whether a local dispatch error is operationally significant.

### FAILURE_MODES

- handler throws;
- handler rejects;
- multiple handlers fail.

### AFFECTED_AGENTS
IA-02, IA-04, IA-05, IA-06, IA-08 consume or may depend on local dispatch behavior.

### AFFECTED_CONTRACTS
No global contract change required.

### IMPLEMENTATION_IMPACT
`publish()` returns a Promise and resolves only when all selected handlers have completed; rejects with aggregate failure when one or more fail.

### TEST_IMPACT
Tests must prove that one failure does not suppress other selected subscribers and that failure aggregation is deterministic.

### OBSERVABILITY_IMPACT
Every failure must be observable with correlation/causation identifiers when present.

### APPROVAL_REQUIRED
`TRUE` — human approval of the local V1 runtime policy.

### BLOCKING_SCOPE
Blocks EventBus V1 only until approved.

### REVERSIBILITY
High. The policy is local and does not alter protected contracts.

## EBUS-DEC-002 — Subscriber Failure Isolation

### CURRENT_STATE
`UNKNOWN`

### QUESTION
Does subscriber A failing prevent B/C from executing?

### RECOMMENDED_OPTION
`SEQUENTIAL-ISOLATED — PROPOSAL`

Selected subscribers are invoked independently in a stable internal iteration. A failed subscriber does not prevent the remaining selected subscribers from executing. The implementation must not expose registration order as a public ordering guarantee.

### CLASSIFICATION
`LOCAL_RUNTIME_POLICY / PROPOSAL`

### RATIONALE
This is the smallest deterministic model that preserves independent local consumers without introducing parallel scheduling, race conditions or implicit durability.

### BENEFITS
Simple failure reasoning, deterministic tests, easier observability, no hidden concurrency contract.

### RISKS
A slow subscriber delays later subscribers because V1 does not introduce parallelism.

### APPROVAL_REQUIRED
`TRUE`.

### BLOCKING_SCOPE
Blocks V1 only until approved.

### REVERSIBILITY
High.

## EBUS-DEC-003 — Scheduling Semantics

### CURRENT_STATE
`UNKNOWN`

### RECOMMENDED_OPTION
`ASYNC_PUBLISH / SYNCHRONOUS HANDLER EXECUTION — PROPOSAL`

`publish()` is asynchronous at the API boundary and dispatches after the caller reaches the post-commit boundary. Handlers are invoked by the EventBus and awaited in sequence; no durable queue or external scheduler is introduced.

### WHY
It avoids synchronous stack coupling to the publisher while keeping handler execution deterministic and testable.

### IMPLEMENTATION_IMPACT
`publish()` returns `Promise<DispatchResult>` under the local runtime contract.

### APPROVAL_REQUIRED
`TRUE`.

### BLOCKING_SCOPE
Yes.

### REVERSIBILITY
High.

## EBUS-DEC-004 — Unsubscribe Lifecycle

### CURRENT_STATE
`UNKNOWN`

### RECOMMENDED_OPTION
`OPAQUE SUBSCRIPTION TOKEN + IDEMPOTENT UNSUBSCRIBE — PROPOSAL`

`subscribe()` returns an opaque subscription object/token. `unsubscribe()` deactivates the registration. Repeated unsubscribe is a no-op. Inactive subscriptions are not invoked. The implementation must release the registration from the active subscriber set so lifecycle cleanup is deterministic.

### APPROVAL_REQUIRED
`TRUE`.

### BLOCKING_SCOPE
Yes.

### REVERSIBILITY
High.

## EBUS-DEC-005 — Cancellation

### CURRENT_STATE
`UNKNOWN`

### RECOMMENDED_OPTION
`UNSUBSCRIBE-ONLY CANCELLATION — PROPOSAL`

V1 does not introduce `AbortSignal` or a second cancellation protocol. Removing the subscription is the cancellation mechanism for future dispatches. An already-started handler is not forcibly cancelled by EventBus.

### WHY
It is the smallest lifecycle surface and avoids inventing cancellation semantics for arbitrary application handlers.

### APPROVAL_REQUIRED
`TRUE`.

### BLOCKING_SCOPE
Yes only because the runtime must not leave cancellation behavior implicit.

### REVERSIBILITY
High.

## EBUS-DEC-006 — Timeout

### CURRENT_STATE
`UNKNOWN`

### RECOMMENDED_OPTION
`NO TIMEOUT IN V1 / DEFERRED — PROPOSAL`

EventBus V1 does not impose a timeout and does not synthesize a timeout error. Long-running durable work belongs to the appropriate JobQueue/application boundary.

### WHY
No timeout value or timeout owner is normatively defined, and introducing one would create arbitrary policy.

### APPROVAL_REQUIRED
`TRUE` for explicit V1 exclusion.

### BLOCKING_SCOPE
Non-blocking after explicit approval because the absence of timeout becomes a documented V1 boundary.

### REVERSIBILITY
High.

## EBUS-DEC-007 — Dispatch Completion Semantics

### CURRENT_STATE
`UNKNOWN`

### RECOMMENDED_OPTION
`ALL SELECTED HANDLERS COMPLETED — PROPOSAL`

`await publish(event)` completes only after all selected handlers have either completed successfully or failed and their failures have been collected. It does not mean durable persistence, external delivery or business processing completion.

### WHY
This gives deterministic tests and a precise local meaning without claiming durability.

### APPROVAL_REQUIRED
`TRUE`.

### BLOCKING_SCOPE
Yes.

### REVERSIBILITY
High.

## EBUS-DEC-008 — Multiple Subscriber Semantics

### CURRENT_STATE
`UNKNOWN`

### RECOMMENDED_OPTION
`SNAPSHOT + DISTINCT REGISTRATIONS — PROPOSAL`

At publish start, EventBus captures the active subscriber registrations matching the event type. Each registration is invoked at most once for that dispatch. Registering the same function/object twice creates two distinct registrations; each receives its own subscription token. Unsubscribe affects future dispatches; an in-flight dispatch uses its already captured subscriber set.

This defines lifecycle behavior but does not create a public ordering guarantee.

### APPROVAL_REQUIRED
`TRUE`.

### BLOCKING_SCOPE
Yes.

### REVERSIBILITY
High.

## EBUS-DEC-009 — Runtime Contract Minimum

### CURRENT_STATE
`PARTIAL`

### RECOMMENDED V1 CONTRACT — PROPOSAL

Conceptual TypeScript API only; not yet an approved global contract:

```ts
subscribe(
  eventType: DomainEventType,
  handler: EventHandler
): Subscription;

unsubscribe(subscription: Subscription): void;

publish(event: DomainEvent): Promise<DispatchResult>;
```

Where:

- `EventHandler` consumes the approved event object and may return `void` or `Promise<void>`.
- `Subscription` is an opaque local registration identity.
- `DispatchResult` reports local dispatch completion and failure state; it does not represent persistence or business outcome.
- handler failures are isolated and aggregated;
- no automatic durable retry;
- no ordering guarantee;
- no persistence;
- no DomainOutbox coupling;
- cancellation is unsubscribe-only;
- timeout is absent/deferred in V1.

### APPROVAL_REQUIRED
`TRUE`.

### BLOCKING_SCOPE
Yes for implementation authorization.

### REVERSIBILITY
High.

## DECISIONS_LOCAL_TO_IA03

These are local implementation-policy candidates and do not require global architectural changes:

- subscription identity;
- unsubscribe lifecycle;
- subscriber snapshot semantics;
- handler scheduling;
- failure isolation;
- failure aggregation;
- absence of timeout in V1;
- absence of AbortSignal in V1.

They still require human approval before production implementation because they define observable runtime behavior.

## DECISIONS_REQUIRING_OTHER_AGENTS

`IA-02`: semantic stability of domain event types and payloads.

`IA-04`: producer/consumer expectations for Order events.

`IA-05`, `IA-06`, `IA-07`, `IA-08`: compatibility with their EventBus consumer expectations. These do not need to redesign the EventBus, but their usage assumptions must remain compatible with the approved local contract.

## DECISIONS_REQUIRING_GLOBAL_AUTHORITY

`CONTRACT-001` remains global and external to EventBus.

`CONTRACT-002` remains global and unresolved. IA-03 does not decide whether `order.status_changed` is normative.

`GOV-001` remains global and unresolved.

No global decision is required to choose the proposed local lifecycle semantics, provided they remain inside the EventBus territory and do not alter protected contracts.

## NON_BLOCKING_GAPS

- Metrics schema can be deferred; log/trace visibility is required at the implementation boundary.
- No timeout is required for V1 if explicitly approved as a non-goal.
- No AbortSignal integration is required for V1 if unsubscribe-only cancellation is approved.
- Global event catalogue closure is not required to build infrastructure primitives, but `CONTRACT-002` remains relevant to Order event integration tests.

## PROPOSED_EVENTBUS_V1_CONTRACT

1. In-process only.
2. Publish from post-commit application boundary.
3. No persistence.
4. No durable retry.
5. No ordering guarantee.
6. `subscribe()` returns an opaque subscription token.
7. `unsubscribe()` is idempotent.
8. Each active subscription is invoked at most once per dispatch snapshot.
9. One subscriber failure does not suppress other selected subscribers.
10. `publish()` completes after all selected handlers settle.
11. Failure is reported after dispatch through an aggregate error/result.
12. Cancellation is unsubscribe-only.
13. No V1 timeout.
14. Correlation/causation metadata is preserved when supplied by the approved event source.
15. No business decision, persistence, DomainOutbox or transport semantics are owned by EventBus.

## PROPOSED_FIRST_RUNTIME_SLICE

`IN-PROCESS EVENTBUS`

Scope:

- subscription registry;
- event-type routing;
- post-commit publication boundary;
- handler invocation;
- failure isolation/aggregation;
- unsubscribe lifecycle;
- deterministic unit tests;
- observability hooks that do not create a new protected contract.

Explicitly excluded:

- SQLite;
- Inbox/Outbox/JobQueue/AuditLog;
- WSS;
- durable retry;
- replay/reconciliation/dead-letter;
- business rules;
- changes to `packages/contracts/**`.

## RISK_IF_IMPLEMENTED_TOO_EARLY

Implementing before approval would turn local assumptions about handler concurrency, error propagation, lifecycle and completion into de facto product behavior. The resulting runtime could force cross-agent consumers to depend on undocumented semantics and would be difficult to change without compatibility cost.

## FINAL RECOMMENDATION

`EVENTBUS_RUNTIME_READINESS = READY_AFTER_HUMAN_APPROVAL`

The remaining items are local implementation policy rather than global architecture blockers. Human approval should be obtained before code is written so that the observable V1 runtime contract is intentional rather than accidental.
