# IA-02 — Memory

## Permanent confirmed facts

- IA-02 is the **Domain Runtime** agent.
- Primary code ownership is `packages/domain/**`.
- The approved baseline states: **LLM interprets; system/Core decides**.
- Domain money semantics are integer cents in BRL; totals are deterministic and LLM output is not authoritative for totals.
- Domain persistence conventions include UTC timestamps and UUIDv7 identifiers where supported.
- The canonical domain inventory contains 29 documented entities.
- Order lifecycle states are DRAFT, CONFIRMED, IN_PRODUCTION, READY, OUT_FOR_DELIVERY, DELIVERED and CANCELLED.
- Conversation lifecycle and ownership are separately modeled: OPEN/CLOSED and AI/HUMAN.
- AI state is ACTIVE/PAUSED/UNAVAILABLE.
- Message lifecycle is RECEIVED/QUEUED/PROCESSING/SENT/DELIVERED/READ/FAILED/REJECTED.
- Invalid state transitions are rejected and terminal order states do not reopen under the current documented rules.
- `order.confirmed` is documented at the confirmation transaction boundary.
- Current domain runtime remains foundation-only: lifecycle types, Money, UTC time, UUIDv7, TransactionBoundary, LLMProvider and foundation tests.
- `CONTRACT-001`, `CONTRACT-002` and `GOV-001` remain unresolved.

## D1 readiness facts

- No explicit aggregate root/boundary was found. `Order` is only a strong inference from the documented command/lifecycle surface.
- Lifecycle documents are state catalogs; they do not provide a complete normative transition matrix.
- Order commands are documented but complete input/output/error/event/idempotency contracts remain partial.
- Query contracts are partial; pagination, ordering, consistency and authorization semantics remain incomplete.
- Domain error conditions exist but the canonical error-code catalog is missing.
- `packages/contracts/src/events.ts` currently contains `order.created`, `order.confirmed`, `order.status_changed` and `order.cancelled`.
- `order.status_changed` remains blocked by CONTRACT-002.

## Memory rule

This file stores durable facts only. D1 findings are recorded as confirmed repository observations; proposals remain in the readiness documents.
