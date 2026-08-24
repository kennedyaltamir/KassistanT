# IA-02 — Domain Integration Gates

## Gate 0 — Contract authority

Required before first runtime slice:
- no unresolved global decision is encoded locally;
- aggregate boundary is explicit enough;
- required event semantics are stable;
- domain error semantics are sufficient for the slice.

## Gate 1 — IA-01 Schema

IA-02 needs IA-01 only when the slice crosses persistence.

For the proposed first Order slice:
- pure in-memory domain behavior: no schema required;
- persistence integration: required later;
- canonical field names and store scoping must come from IA-01, not invented by IA-02.

Blocking level: `MEDIUM` for pure slice, `HIGH` for persistence integration.

## Gate 2 — IA-03 Event Infrastructure

IA-02 provides domain event concepts; IA-03 provides:
- EventBus;
- durable Outbox/Inbox;
- retries;
- replay/reconciliation;
- AuditLog;
- correlation/causation propagation infrastructure.

Pure in-memory domain validation does not require EventBus, Inbox, Outbox or JobQueue.

Blocking level: `LOW` for pure slice, `HIGH` for durable event integration.

## Gate 3 — IA-04 Order Engine

IA-04 consumes domain order rules and owns application/orchestration under its boundary. IA-02 must not duplicate Order Engine orchestration.

Required alignment:
- command invocation boundary;
- aggregate result handling;
- idempotency boundary;
- concurrency boundary;
- event handoff.

Blocking level: `HIGH` for integrated Order execution.

## Gate 4 — IA-05 Conversation/LLM

IA-05 may produce candidate structured actions but cannot bypass deterministic domain validation.

IA-02 provides deterministic domain semantics; IA-05 supplies untrusted input to the application/domain boundary.

Blocking level: `NON_BLOCKING` for pure Order slice; required later for conversation-driven execution.

## Gate 5 — IA-06 Device Auth

Device identity and authentication stay outside domain rules. Actor context may be supplied by an authorized application boundary.

Blocking level: `NON_BLOCKING` unless the first command explicitly embeds device authorization semantics.

## Gate 6 — IA-07 Gateway/WSS

Transport, ACK, replay, resume and WSS are outside the domain package.

Blocking level: `NON_BLOCKING` for pure domain slice; required for end-to-end delivery.

## Gate 7 — IA-08 Desktop UI

UI consumes application projections/contracts and must not become domain authority.

Blocking level: `NON_BLOCKING` for pure domain slice; required for product integration.

## Integration order

`Global contract lock -> IA-01 boundary confirmation -> IA-02 domain slice -> IA-03 event integration -> IA-04 orchestration -> IA-05 conversation integration -> IA-06/07/08 end-to-end integration`.

This is an integration dependency description, not a mandate to schedule or modify other agents.
