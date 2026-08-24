# IA-02 — Memory

## Permanent confirmed facts

- IA-02 is the **Domain Runtime** agent.
- Primary code ownership is `packages/domain/**`.
- The approved baseline states: **LLM interprets; system/Core decides**.
- Domain money semantics are integer cents in BRL; totals are deterministic and LLM output is not authoritative for totals. cite removed
- Domain persistence conventions include UTC timestamps and UUIDv7 identifiers where supported.
- Canonical domain entities are documented, including Store, Device, Settings, Product, Customer, Conversation, Message, Order, PaymentMethod, InboundInbox, DomainOutbox, Job, AuditLog, AIProfile, AIExecution and KnowledgeItem.
- Order lifecycle states are DRAFT, CONFIRMED, IN_PRODUCTION, READY, OUT_FOR_DELIVERY, DELIVERED and CANCELLED.
- Conversation lifecycle and ownership are separately modeled: lifecycle OPEN/CLOSED; ownership AI/HUMAN.
- AI state is ACTIVE/PAUSED/UNAVAILABLE.
- Message lifecycle is RECEIVED/QUEUED/PROCESSING/SENT/DELIVERED/READ/FAILED/REJECTED.
- Invalid state transitions are rejected; terminal order states do not reopen under the current documented rules.
- `order.confirmed` is documented as a persisted domain event at the confirmation transaction boundary.
- Current domain runtime is partial: repository evidence shows only foundation primitives and interfaces, not full business runtime.
- Current SQLite migration is only a bootstrap metadata table; canonical business schema is not yet implemented.
- `CONTRACT-001`, `CONTRACT-002` and `GOV-001` remain unresolved and must not be silently decided.

## Memory rule

This file stores durable facts only. It is not an activity diary. Future entries must be grounded in repository evidence and labeled when the fact is superseded.
