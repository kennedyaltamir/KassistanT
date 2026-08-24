# IA-04 — Scope

## Status vocabulary

- `FACT`: directly supported by repository/baseline evidence.
- `INFERENCE`: consequence of documented boundaries; not a new requirement.
- `PROPOSAL`: future implementation approach, not approved architecture.
- `DECISION`: formally approved project decision.
- `NOT_VERIFIED`: repository evidence is insufficient.

## In scope

IA-04 owns deterministic order behavior under `apps/desktop/electron/order/**`:

1. Draft order lifecycle.
2. Order aggregate behavior.
3. Order item operations and quantities.
4. Deterministic price calculation.
5. Promotion eligibility/application according to approved business rules.
6. Delivery type and required delivery data.
7. Payment-method selection as order business state.
8. Recalculation.
9. Customer confirmation workflow at the order boundary.
10. Order cancellation.
11. Lifecycle state transitions.
12. Order-specific idempotency and concurrency safeguards.
13. Order-related domain-event production, subject to the event contract and Event Infrastructure boundary.
14. Order-related audit integration, subject to the Audit infrastructure boundary.
15. Tests directly associated with the Order Engine.

## Out of scope

IA-04 does not own:

- SQLite schema, migrations, connection lifecycle, or persistence primitives — IA-01.
- General domain entities/value objects/business-rule library — IA-02, except order behavior implemented within IA-04's authorized runtime boundary.
- EventBus, Inbox, Outbox, JobQueue, retry/replay/reconciliation infrastructure — IA-03.
- Conversation lifecycle, LLM execution, Ollama adapter, prompts, AIExecution — IA-05.
- Device enrollment/authentication/revocation — IA-06.
- Gateway HTTP/WSS, webhooks, transport ACK/sequence/replay/resume — IA-07.
- Renderer/UI/widget/tray — IA-08.
- WhatsApp, Google, notification and other provider adapters.
- Shared `packages/contracts/**`.
- Global documentation under protected paths.
- External GitHub/Meta/Google/cloud/Windows/TLS/OAuth/secrets configuration.

## Boundary rules

The Order Engine must not become a second persistence layer, event transport, LLM authority, or Gateway business-rule implementation.

The Order Engine may depend on contracts supplied by other territories, but must not redefine them locally.

`CONTRACT-001` (DomainOutbox) remains unresolved and blocks assumptions about final outbox ownership/scope.

`CONTRACT-002` (`order.status_changed`) remains unresolved and blocks treating that event as definitively normative.

## State authority

`FACT`: The documented lifecycle is `DRAFT`, `CONFIRMED`, `IN_PRODUCTION`, `READY`, `OUT_FOR_DELIVERY`, `DELIVERED`, `CANCELLED`.

`FACT`: `CONFIRMED` is the operational sale milestone.

`FACT`: Invalid transitions are rejected.

`NOT_VERIFIED`: Complete actor/permission rules and complete canonical error codes are not yet specified.

## Financial authority

Price, promotion eligibility, totals, and monetary state are deterministic Core concerns. LLM output may propose structured data but cannot authoritatively determine money or totals.

## Future implementation gate

Implementation begins only after the required contracts/dependencies are sufficiently specified and the implementation phase is explicitly authorized. Configuration work must not be used to close unresolved global contracts implicitly.
