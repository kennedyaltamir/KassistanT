# IA-03 — InboundInbox Implementation Gate

## Status

`BLOCKED / WAITING FOR IA-01 CANONICAL PERSISTENCE`

This document defines the minimum evidence IA-03 requires before implementing InboundInbox V1. It intentionally does not define DDL, migrations or schema ownership.

## Purpose

InboundInbox is the durable intake boundary for inbound events received through the Gateway/WSS path. Its persistence boundary is required before ACK can be considered valid under the existing transport contract.

```text
receive
  ↓
validate
  ↓
durable Inbox persistence
  ↓
ACK
```

`ACK != business processing complete`.

## REQUIRED_SCHEMA

IA-01 must provide a canonical schema representation for the Inbox fields and constraints needed by the V1 runtime.

Required schema evidence:

- canonical table/entity identity;
- field types and nullability;
- store scoping;
- device scoping;
- durable timestamps;
- external-event identity;
- transport sequence where applicable;
- payload storage representation;
- correlation/causation representation when contractually present;
- processing state representation;
- uniqueness constraint representation.

No DDL is prescribed here.

## REQUIRED_FIELDS

The final canonical contract must define, at minimum, the fields necessary to implement:

- provider/source identity;
- external event identity / deduplication key;
- store identity;
- device identity when supplied by transport;
- transport sequence when supplied by WSS;
- received timestamp;
- persisted timestamp;
- raw/validated event payload;
- processing state;
- correlation identifier when present;
- causation identifier when present.

Exact field names belong to the canonical persistence contract.

## REQUIRED_KEYS

IA-03 requires an explicitly defined durable uniqueness key for duplicate detection. Current evidence points to `(provider, external_event_id)` as the Inbox idempotency concept; the canonical schema must confirm the exact key and its scope.

The key must be usable deterministically before ACK.

## REQUIRED_UNIQUENESS

The canonical schema must enforce or otherwise provide an atomic uniqueness mechanism for the Inbox deduplication key.

Application-only pre-checks are insufficient as the sole duplicate-safety mechanism under concurrency.

## REQUIRED_TRANSACTION_BOUNDARY

The minimum safe boundary is:

```text
receive event
→ validate enough to persist
→ durable Inbox write / idempotent duplicate resolution
→ transaction commit
→ ACK
```

IA-03 must receive the canonical transaction primitive/ownership contract from IA-01. EventBus is not involved in the durable ACK decision.

## REQUIRED_DEDUPLICATION

IA-03 requires deterministic behavior for:

- first delivery;
- duplicate delivery;
- concurrent duplicate delivery;
- already-persisted event;
- persistence failure;
- malformed/invalid inbound data.

The exact duplicate result state must be documented before implementation.

## REQUIRED_ACK_SIGNAL

IA-07 owns transport-level receipt/ACK signaling.

IA-03 owns the durable Inbox state required to make the ACK condition true.

Core/Domain owns business processing after durable intake.

The implementation must never report an ACK-ready state before the Inbox persistence boundary is committed.

## REQUIRED_TESTS

Before Inbox V1 implementation, deterministic tests must be possible for:

- first insert;
- duplicate insert;
- concurrent duplicate insert;
- uniqueness enforcement;
- transaction rollback on persistence failure;
- payload preservation;
- correlation/causation preservation when present;
- processing-state transition boundaries;
- ACK eligibility only after durable commit;
- ACK not implying business completion.

## REQUIRED_OWNER_RESPONSES

### IA-01 — Canonical persistence

Must provide:

- canonical Inbox schema/contract;
- exact uniqueness key and scope;
- transaction API/boundary;
- timestamp conventions;
- persistence failure semantics;
- migration/versioning evidence;
- deterministic test fixture support.

### IA-02 — Domain semantics

Must provide only the domain/event semantics needed after durable intake. IA-02 is not required to own Inbox persistence.

### IA-07 — Gateway/WSS

Must provide:

- inbound event identity/source mapping;
- device/store mapping available at receipt;
- ACK invocation boundary;
- transport sequence semantics where present;
- replay/resume interaction that affects Inbox processing.

### Core / Domain

Must provide the post-intake processing contract and state transition ownership. Business completion remains outside ACK.

## REQUIRED_FOR_INBOX_V1

- canonical Inbox persistence contract from IA-01;
- exact uniqueness/deduplication key;
- transaction boundary;
- durable state representation;
- payload storage representation;
- ACK integration contract with IA-07;
- deterministic duplicate/failure semantics;
- required correlation/causation handling;
- tests for durability/uniqueness/ACK boundary.

## NOT_REQUIRED_FOR_INBOX_V1

- full KassisT business schema;
- DomainOutbox resolution;
- JobQueue implementation;
- AuditLog implementation;
- Desktop UI integration;
- LLM/Conversation integration;
- business processing completion.

## FUTURE

- advanced replay/reconciliation;
- retention/cleanup policies not yet finalized;
- dead-letter lifecycle;
- broader observability integration;
- cross-agent Inbox consumers/producers.

## BLOCKED

- implementation before IA-01 canonical persistence is available;
- implementation before ACK ownership/boundary with IA-07 is explicit;
- implementation while uniqueness semantics are ambiguous;
- implementation that creates competing temporary schema inside IA-03.

## Gate result

`INBOX_V1 = NOT_READY`

The next IA-03 runtime milestone is InboundInbox, but implementation must wait for the IA-01 dependency described above.
