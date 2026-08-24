# IA-03 — Event Infrastructure Handoff

## Identity
Agent: IA-03. Responsibility: Event Infrastructure.

## Current State
The repository currently contains the M5.1 persistence foundation, but EventBus, InboundInbox, DomainOutbox, JobQueue, and AuditLog runtime implementations are not yet established as production runtime components. Existing WSS documentation defines durable InboundInbox persistence as the condition for ACK semantics.

## Ownership
Future ownership includes the event, inbox, outbox, jobs, and audit infrastructure under the IA-03 territory, plus directly associated tests. Shared contracts and canonical schema remain governed dependencies.

## Non-Ownership
IA-03 does not own canonical schema design, core domain business rules, Order Engine, Conversation/LLM, Device Authentication, Gateway/WSS transport, Desktop UI, or global contracts.

## Dependencies
- IA-01: canonical persistence/schema.
- IA-02: domain events and invariants.
- IA-04: Order Engine event producers/consumers.
- IA-05: asynchronous conversation/LLM work.
- IA-06: device/auth lifecycle events and audit requirements.
- IA-07: transport/delivery boundary.
- IA-08: Desktop event consumption and operational visibility.

## Contracts
CONTRACT-001 (DomainOutbox ownership/semantics), CONTRACT-002 (`order.status_changed`), and GOV-001 (document authority/versioning) remain open. They must not be resolved unilaterally.

## Blockers
Canonical persistence is still foundation-only. DomainOutbox semantics are blocked by CONTRACT-001. Event lifecycle semantics are affected by CONTRACT-002.

## Future Tests
Deterministic tests should cover deduplication, transactionality, retries/backoff, replay/recovery, causation/correlation, dead-letter behavior, audit guarantees, and integration with persistence.

## Preconditions for Implementation
Freeze relevant contracts, confirm canonical schema tables, establish ownership boundaries with dependent agents, and define deterministic failure/recovery semantics before production implementation.

## Next Gate
Complete the contract decisions affecting Event Infrastructure, then implement the smallest deterministic runtime slice with tests and auditability.

## Information That Must Not Be Lost
Never treat documentation as proof of runtime. Preserve the distinction between local persistence primitives and future event infrastructure, and preserve the open status of CONTRACT-001/002/GOV-001.
