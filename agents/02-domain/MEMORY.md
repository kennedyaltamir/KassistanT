# IA-02 — Memory

## Permanent confirmed facts

- IA-02 is the **Domain Runtime** agent.
- Primary code ownership is `packages/domain/**`.
- The approved baseline states: LLM interprets; system/Core decides.
- Domain money semantics are integer cents in BRL; totals are deterministic and LLM output is not authoritative for totals.
- Domain persistence conventions include UTC timestamps and UUIDv7 identifiers where supported.
- The canonical domain inventory contains **28 entities**. The previous D1 count of 29 was a reporting/counting error; no 29th entity is evidenced.
- Order lifecycle states are DRAFT, CONFIRMED, IN_PRODUCTION, READY, OUT_FOR_DELIVERY, DELIVERED and CANCELLED.
- Conversation lifecycle and ownership are OPEN/CLOSED and AI/HUMAN.
- AI state is ACTIVE/PAUSED/UNAVAILABLE.
- Message lifecycle is RECEIVED/QUEUED/PROCESSING/SENT/DELIVERED/READ/FAILED/REJECTED.
- Invalid state transitions are rejected and terminal order states do not reopen under current documented rules.
- `order.confirmed` is documented at the confirmation transaction boundary.
- Current domain runtime remains foundation-only: lifecycle types, Money, UTC time, UUIDv7, TransactionBoundary, LLMProvider and foundation tests.
- `CONTRACT-001`, `CONTRACT-002` and `GOV-001` remain unresolved.

## D1 reconciliation facts

- No explicit aggregate root/boundary was found. `Order` is only a strong inference from the documented command/lifecycle surface.
- Lifecycle documents are state catalogs; they do not provide a complete normative transition matrix.
- Twelve Order commands are documented; complete input/output/error/event/idempotency contracts remain partial.
- Query contracts are partial; pagination, ordering, consistency and authorization semantics remain incomplete.
- Domain error conditions exist but the canonical error-code catalog is missing.
- `packages/contracts/src/events.ts` contains `order.created`, `order.confirmed`, `order.status_changed` and `order.cancelled`.
- `order.status_changed` remains blocked by `CONTRACT-002`.
- `agents/01-schema/CANONICAL_SCHEMA_AUDIT.md` was requested by reconciliation but is absent at the audited ref; this is a documentation gap, not evidence of another entity.
- First domain slice readiness is BLOCKED; Order remains a proposal only.

## Memory rule

This file stores durable facts only. Proposals and unresolved interpretations remain outside the fact register.
