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

## D1 decision-package facts

- No aggregate root is normatively frozen. `Order` remains a candidate only.
- No current non-trivial runtime slice satisfies all first-slice readiness criteria without additional decisions.
- The existing Money, UUIDv7 and UTC primitives are already foundation code; duplicating them is not a valid first Domain Runtime increment.
- `CONTRACT-001` blocks Outbox-integrated work but does not inherently block a pure in-memory domain slice that does not persist or publish through Outbox.
- `CONTRACT-002` blocks slices that require `order.status_changed`; it need not block a slice that demonstrably avoids that event, subject to authority approval.
- The minimum decision set for an Order-oriented first slice is: aggregate boundary, one normative transition, one complete command/error contract, and actor/authorization boundary. A contested event choice can be deferred by using only `order.confirmed`; Outbox ownership can be deferred by keeping the first slice pure and in-memory.
- `agents/01-schema/CANONICAL_SCHEMA_AUDIT.md` is absent at the audited ref and remains a documentation gap only.

## Human decision review

- `HUMAN-DOMAIN-DECISIONS.md` reduces DREQ-001..006 to four required decisions for the proposed first slice: DREQ-001, DREQ-002, DREQ-005 and DREQ-006.
- DREQ-003 is deferred because the proposed slice does not need `order.status_changed`.
- DREQ-004 is deferred because the proposed slice does not require persistence or DomainOutbox.
- No human decision has been applied yet.

## Memory rule

This file stores durable facts only. Recommendations and decision requests remain proposals until formally approved.
