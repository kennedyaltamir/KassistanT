# IA-03 — Event Infrastructure Readiness

Status: AUDITED / IMPLEMENTATION FROZEN  
Agent: IA-03  
Branch: `Agent03-event-infrastructure`  
Integration authority: `main`

## 1. Purpose

This document converts the current Event Infrastructure gap into an implementation-ready plan without resolving protected ambiguities and without creating runtime code.

## 2. Current evidence

| Area | State | Evidence strength | Consequence |
|---|---|---|---|
| EventBus | DOCUMENTED / NOT_STARTED | STRONG | Contract exists; no runtime. |
| InboundInbox | DOCUMENTED / NOT_STARTED | STRONG | Durable-before-ACK semantics defined; runtime and canonical schema absent. |
| DomainOutbox | BLOCKED | STRONG | `CONTRACT-001` prevents safe runtime semantics. |
| JobQueue | DOCUMENTED / NOT_STARTED | STRONG | Idempotency/retry/locking are required, but exact policies are incomplete. |
| AuditLog | DOCUMENTED / NOT_STARTED | STRONG | Required fields and critical events documented; runtime absent. |
| Retry/backoff | PARTIAL | STRONG | Required concept; exact local policy is incomplete. |
| Replay | DOCUMENTED / NOT_STARTED | STRONG | WSS resume/replay is defined; local runtime absent. |
| Reconciliation | PLANNED | MEDIUM | Recovery requirement documented; algorithm/state model not complete. |
| Dead Letter | PLANNED | MEDIUM | Concept exists; exact lifecycle/policy is not normative. |
| Causation/correlation | PARTIAL | STRONG | Envelope fields are contracted; runtime propagation absent. |
| Observability | PARTIAL | STRONG | Requirements exist; runtime telemetry is absent. |

## 3. Readiness verdict

The territory is **not implementation-ready as a whole**.

The first production slice must wait for sufficient canonical persistence from IA-01 and stable domain/event semantics from IA-02. `DomainOutbox` remains separately blocked by `CONTRACT-001`. `order.status_changed` remains affected by `CONTRACT-002`.

A preparatory implementation may only be considered for a slice whose correctness does not encode those unresolved decisions. No such slice is promoted to implementation automatically by this document.

## 4. First safe implementation target

**Candidate first runtime slice:** EventBus abstraction and in-process dispatch only, provided IA-02's event type/envelope contract is stable enough to consume without redefining it.

Required properties before coding:

1. no durable storage semantics;
2. no DomainOutbox behavior;
3. no interpretation of `order.status_changed` beyond consuming the approved type set;
4. no business decision authority;
5. deterministic publish/subscribe tests;
6. explicit unknowns for ordering, concurrency and failure behavior where contracts are silent.

This is a readiness candidate, not an implementation authorization.

## 5. Proposed implementation order

1. EventBus in-process boundary.
2. InboundInbox after IA-01 canonical tables and persistence APIs are available.
3. JobQueue after `Job` persistence and retry/locking semantics are explicit.
4. AuditLog after canonical audit persistence and sensitive-data policy are explicit.
5. Reliability mechanisms after state persistence and retryable-error taxonomy are explicit.
6. DomainOutbox only after `CONTRACT-001` is resolved.
7. Replay/resume/reconciliation/dead-letter integration after Inbox/Queue semantics and transport contracts are jointly stable.

## 6. Hard gates

| Gate | Required state | Owner / dependency |
|---|---|---|
| G0 | Authority and protected contracts identified | Project governance |
| G1 | Canonical persistence tables/transaction primitives available | IA-01 |
| G2 | Domain event types and producer semantics stable | IA-02 |
| G3 | `CONTRACT-001` resolved for any Outbox slice | Global decision |
| G4 | `CONTRACT-002` resolved before normative order-event dispatch/tests | Global decision |
| G5 | Error retryability and recovery semantics explicit enough for the target slice | Core/contracts |
| G6 | Deterministic tests defined for every implemented invariant | IA-03 |

## 7. Implementation evidence standard

A component is not `IMPLEMENTED` because documentation or tests exist. Runtime claims require executable code, deterministic tests, relevant CI evidence, scope validation, review and authorized integration into `main`.

## 8. Security boundary

Audit and event infrastructure must not leak customer data, conversations, credentials or private keys. Secrets remain outside this territory unless an approved contract explicitly requires a safe reference rather than secret material.
