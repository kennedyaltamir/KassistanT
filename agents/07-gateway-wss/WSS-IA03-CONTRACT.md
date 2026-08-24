# IA-03 → IA-07 WSS Durable Intake / ACK / Replay Contract

Status: GATE DEFINITION / CURRENTLY BLOCKED
Date: 2026-08-24

## Purpose

Define the minimum infrastructure interface IA-07 must consume from IA-03 before implementing WSS message receive, ACK and recovery paths. IA-07 must never implement a competing Inbox, ACK store or replay store.

## Gate B — Durable inbound intake

### Conceptual flow

`WSS receive → envelope validation → IA-03 durable intake → persistence result → ACK decision`

| Input / output | Required | Current evidence | Status |
|---|---|---|---|
| inbound event envelope | YES | WSS v1 envelope is explicit | READY_FOR_CONSUMPTION at structural level |
| event_id | YES when event applies | Envelope explicitly supports it | PARTIAL |
| device_id | YES | Envelope field | READY_FOR_CONSUMPTION |
| sequence | WHEN APPLICABLE | Monotonic per `(store_id, device_id)` | PARTIAL |
| correlation_id | WHEN PRESENT | Explicit envelope metadata | PARTIAL |
| causation_id | WHEN PRESENT | Explicit envelope metadata | PARTIAL |
| durable intake success | YES | Persistence-before-ACK rule | BLOCKED until IA-03 runtime exists |
| duplicate result | YES | Inbox deduplication is part of IA-03 | BLOCKED |
| persistence failure | YES | Failure means no ACK | BLOCKED |

### Minimum executable interface required

IA-03 must expose a deterministic intake boundary that accepts a validated inbound event and returns at least:

- `accepted/persisted` outcome;
- `duplicate` outcome when applicable;
- failure outcome that guarantees no ACK authorization;
- the event identity used for deduplication;
- correlation/causation metadata preservation result;
- a clear ownership statement that persistence remains in IA-03.

Exact field names are not prescribed here because `packages/contracts/**` is protected and no equivalent executable interface currently exists.

## Gate C — ACK authorization

ACK becomes legal only after successful durable Inbox persistence. ACK means durable intake, not business processing completion.

### Minimum executable interface required

IA-03 must make the following observable to IA-07:

- persistence success → ACK MAY be emitted;
- persistence failure → ACK MUST NOT be emitted;
- duplicate event → required ACK behavior explicitly defined;
- retry behavior before ACK explicitly defined;
- ACK repeat/idempotency behavior explicitly defined.

Current state: `BLOCKED`.

## Gate D — Replay / resume / resync

The WSS protocol defines the concepts but not all recovery semantics. IA-03 must provide the durable source of pending events/recovery state before IA-07 can implement transport recovery.

| Capability | IA-07 consumes | Required IA-03 evidence | Status |
|---|---|---|---|
| resume | pending events/recovery result | request/response shape, retention policy | BLOCKED |
| replay | ordered pending events | sequence source, ordering, retention | BLOCKED |
| gap recovery | gap/recovery decision | duplicate/gap semantics and source of truth | BLOCKED |
| resync | authoritative recovery state/snapshot boundary | state-sync payload/source | BLOCKED |
| reconciliation | recovery result | deterministic completion semantics | BLOCKED |

## Sequence boundary

The protocol states monotonic sequence per `(store_id, device_id)`. IA-03 must define persistence/duplicate/gap interaction before IA-07 relies on sequence for reconnect or replay. fileciteturn100file0turn101file0

## Acceptance criteria

- IA-07 can hand a validated message to IA-03 without knowing SQLite details.
- IA-03 determines durable persistence and deduplication.
- ACK authorization can be decided deterministically from IA-03's result.
- Replay/resume source and ordering are explicit for the selected V1 recovery slice, or explicitly deferred.
- No DomainOutbox semantics are assumed while `CONTRACT-001` remains unresolved.

## Current gate

`IA03_INTAKE_GATE = BLOCKED`  
`IA03_ACK_GATE = BLOCKED`  
`IA03_REPLAY_GATE = BLOCKED`

IA-03 runtime is not implemented and several recovery/retention semantics remain partial. fileciteturn99file0turn100file0
