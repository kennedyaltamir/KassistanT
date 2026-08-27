# IA-03 — Event Infrastructure Handoff

## Identity
Agent: IA-03. Responsibility: Event Infrastructure.

## EventBus milestone

`EVENTBUS_V1_IMPLEMENTED / HANDOFF_COMPLETE`

The operator explicitly approved EBUS-DEC-001 through EBUS-DEC-008. Post-implementation source audit found no divergence from those decisions.

## Consumer contract

The public V1 surface is:

```ts
subscribe(eventType, handler): Subscription
unsubscribe(subscription): void
publish(event): Promise<DispatchResult>
```

EventBus is:

- in-process;
- post-commit;
- non-durable;
- no durable retry;
- `NO_ORDERING_GUARANTEE`;
- unsubscribe-only cancellation;
- no V1 timeout;
- completion after all selected handlers settle.

Subscriber failures are isolated and returned in `DispatchResult`. `partial_failure` means some selected handlers failed; `complete_failure` means all selected handlers failed.

## Explicit authority exclusions

EventBus has no authority over:

- business rules;
- persistence;
- DomainOutbox;
- InboundInbox;
- JobQueue;
- AuditLog;
- WSS;
- Device Authentication.

## Future consumers

IA-04, IA-05, IA-06, IA-07 and IA-08 may consume the EventBus through the handoff contract. They must not rely on unsupported ordering, durability, automatic retry or business-completion semantics. No new event types are introduced by IA-03 through this handoff.

`order.status_changed` remains subject to `CONTRACT-002`.

## InboundInbox next gate

`INBOX_V1 = NOT_READY`

The next IA-03 runtime milestone is InboundInbox, but implementation is blocked until IA-01 provides the canonical persistence contract and IA-07 provides the explicit ACK integration boundary.

### IA-01 must provide

- canonical Inbox entity/table contract;
- exact required fields and types;
- exact uniqueness/deduplication key and scope;
- store/device scoping rules;
- timestamp rules;
- payload representation;
- processing-state representation;
- correlation/causation representation when applicable;
- transaction primitive and commit semantics;
- persistence failure semantics;
- migration/versioning evidence;
- deterministic persistence test fixtures.

### IA-03 will consume

- canonical persistence API/transaction primitive;
- canonical uniqueness semantics;
- durable state model;
- persistence error behavior;
- field mapping required for Inbox V1.

### IA-07 must provide

- inbound source/provider identity;
- external event identity;
- device/store mapping available at receipt;
- ACK invocation boundary;
- WSS sequence semantics where applicable;
- replay/resume interaction relevant to Inbox intake.

### ACK ownership

```text
IA-07 receive
    ↓
IA-03 validate + durable Inbox persistence
    ↓
commit
    ↓
IA-07 ACK
    ↓
Core/Domain business processing
```

`ACK != business processing complete`.

## What is not required for Inbox V1

- complete KassisT business schema;
- DomainOutbox resolution;
- JobQueue implementation;
- AuditLog implementation;
- Desktop UI integration;
- Conversation/LLM integration;
- business processing completion.

## Validation state

Prior branch validation record states 10 deterministic EventBus tests passed. Fresh re-execution was requested during this handoff phase but could not be completed because the current environment lacks the `tsx` executable and package retrieval was unavailable. `REMOTE_CI_STATUS = NOT_VERIFIED` because the remote status lookup returned no statuses.

## Protected boundaries preserved

`CONTRACT-001`, `CONTRACT-002` and `GOV-001` remain open. No EventBus downstream integration, Inbox runtime, Outbox, JobQueue or AuditLog implementation was performed in this phase.
