# IA-02 — Domain Readiness Audit

**Phase:** D1 — Contract Lock and Domain Readiness Audit
**Branch:** `Agent02-domain-runtime`
**Main audited:** `cb9f278a22925f58ef26188e444a86d826cbe8e4`
**Status:** `COMPLETE / IMPLEMENTATION_FROZEN`

## Executive verdict

The domain vocabulary is substantially documented, but the Domain Runtime is **not implementation-ready**. The repository has foundation primitives only; no executable entities, aggregates, command handlers, domain services or complete error catalog exist.

Primary blockers:

- `CONTRACT-001`: DomainOutbox ownership/scope is ambiguous.
- `CONTRACT-002`: `order.status_changed` is present in `packages/contracts/src/events.ts` but remains normatively ambiguous.
- Aggregate boundaries are not explicit. `Order` is only a strong inference from the command/lifecycle surface.
- Lifecycle documents provide state catalogs, not normative transition matrices.
- Query semantics, error codes, concurrency rules and authorization dependencies remain partial.
- Canonical SQLite business schema is not implemented; IA-02 must not infer persistence shape.

## Entity inventory

All canonical entities are documented. No dedicated executable entity exists in `packages/domain/**` at the audited HEAD; `packages/contracts/**` contains protocol/event contracts rather than executable domain entities.

| Entity | Docs | Code contract | Runtime | Aggregate status | Readiness |
|---|---|---|---|---|---|
| Store | EXPLICIT | NONE | NOT_STARTED | UNKNOWN | PARTIAL |
| Device | EXPLICIT | NONE | NOT_STARTED | UNKNOWN | OUTSIDE CORE DOMAIN |
| Settings | EXPLICIT | NONE | NOT_STARTED | UNKNOWN | PARTIAL |
| ProductCategory | EXPLICIT | NONE | NOT_STARTED | UNKNOWN | PARTIAL |
| Product | EXPLICIT | NONE | NOT_STARTED | UNKNOWN | PARTIAL |
| ProductModifier | EXPLICIT | NONE | NOT_STARTED | UNKNOWN | PARTIAL |
| ProductImage | EXPLICIT | NONE | NOT_STARTED | UNKNOWN | UNDEFINED |
| Promotion | EXPLICIT | NONE | NOT_STARTED | UNKNOWN | PARTIAL |
| Customer | EXPLICIT | NONE | NOT_STARTED | UNKNOWN | PARTIAL |
| CustomerAddress | EXPLICIT | NONE | NOT_STARTED | UNKNOWN | PARTIAL |
| Conversation | EXPLICIT | NONE | NOT_STARTED | CANDIDATE / INFERENCE | BLOCKED |
| Message | EXPLICIT | NONE | NOT_STARTED | CHILD / INFERENCE | BLOCKED |
| Order | EXPLICIT | NONE | NOT_STARTED | CANDIDATE ROOT / STRONG_INFERENCE | BLOCKED |
| OrderItem | EXPLICIT | NONE | NOT_STARTED | CHILD / INFERENCE | BLOCKED |
| OrderItemModifier | EXPLICIT | NONE | NOT_STARTED | CHILD / INFERENCE | BLOCKED |
| OrderStatusHistory | EXPLICIT | NONE | NOT_STARTED | CHILD / INFERENCE | BLOCKED |
| PaymentMethod | EXPLICIT | NONE | NOT_STARTED | UNKNOWN | PARTIAL |
| Notification | EXPLICIT | NONE | NOT_STARTED | UNKNOWN | IA-03/provider |
| Integration | EXPLICIT | NONE | NOT_STARTED | UNKNOWN | provider boundary |
| IntegrationCredential | EXPLICIT | NONE | NOT_STARTED | UNKNOWN | security/provider |
| InboundInbox | EXPLICIT | NONE | NOT_STARTED | infrastructure | IA-03/IA-01 |
| DomainOutbox | EXPLICIT | PARTIAL boundary | NOT_STARTED | infrastructure | CONTRACT-001 |
| Job | EXPLICIT | NONE | NOT_STARTED | infrastructure | IA-03 |
| AuditLog | EXPLICIT | NONE | NOT_STARTED | infrastructure | IA-03 |
| Log | EXPLICIT | NONE | NOT_STARTED | infrastructure | observability |
| AIProfile | EXPLICIT | NONE | NOT_STARTED | UNKNOWN | IA-05 |
| AIExecution | EXPLICIT | NONE | NOT_STARTED | UNKNOWN | IA-05 |
| KnowledgeItem | EXPLICIT | NONE | NOT_STARTED | UNKNOWN | IA-05 |

## Aggregate analysis

### Order
`Order` is a **candidate aggregate root**, not an approved decision. Evidence: order command catalog, lifecycle, total invariants, confirmation milestone and price freeze. Missing: explicit aggregate boundary, child mutation semantics, transaction boundary and complete event boundary.

### Conversation
`Conversation` is a possible aggregate root, but only an `INFERENCE`. Lifecycle, ownership and AI state are documented, while message mutation and concurrency ownership are not.

No other aggregate root is explicitly normative.

## Value object readiness

- **Money:** IMPLEMENTED FOUNDATION. Representation `{amount_cents, currency}`; safe integer cents; same-currency arithmetic; BRL is canonical.
- **UUIDv7:** IMPLEMENTED FOUNDATION. Generator and validator exist.
- **UTC timestamp:** IMPLEMENTED FOUNDATION. Canonical string form is ISO-8601 UTC with milliseconds.
- **Quantity:** normative positive integer rule exists; no dedicated value object is required by current evidence.
- **Phone:** normalization/E.164 direction is documented; canonical executable object is absent.
- **Email:** no complete canonical validation/equality/serialization contract found.
- **Address:** delivery sufficiency is referenced, but detailed domain representation is partial.
- **Idempotency key:** uniqueness is documented in relevant contracts; complete domain semantics are partial.
- **Correlation/causation identifiers:** required in event envelope documentation; complete domain type/semantics are partial.

No new value object is authorized by this audit.

## Core invariants found

1. Quantity is a positive integer.
2. Money uses integer cents and BRL.
3. Totals are deterministic; LLM output is not authoritative.
4. `CONFIRMED` is the operational sale milestone.
5. Confirmed orders freeze price state.
6. Terminal order states do not reopen under the current rules.
7. Confirmation requires final summary plus unequivocal confirmation.
8. `order.confirmed` is documented at the confirmation transaction boundary.
9. Invalid transitions must be rejected deterministically.
10. Domain remains independent of Electron, Gateway and provider SDKs.

These are sufficient as invariant inventory, but not sufficient for full runtime because supporting transition/error/authorization semantics remain incomplete.

## Domain readiness matrix

| Area | State | Evidence | Missing | Readiness |
|---|---|---|---|---|
| Entities | DOCUMENTED | domain inventory | executable fields/behavior | PARTIAL |
| Aggregates | UNKNOWN/PARTIAL | order-centered command surface | explicit roots/boundaries | BLOCKED |
| Value Objects | PARTIAL | money/time/UUIDv7 code | remaining canonical objects | PARTIAL |
| Commands | DOCUMENTED/PARTIAL | order command catalog | complete schemas/errors/events/idempotency | BLOCKED |
| Queries | DOCUMENTED/PARTIAL | product/store/delivery/payment/order/customer reads | pagination/auth/consistency | BLOCKED |
| Invariants | DEFINED | invariants document | supporting semantics | PARTIAL |
| State machines | STATE_CATALOG_ONLY | lifecycle/state docs | transition matrix | BLOCKED |
| Events | DEFINED/AMBIGUOUS | events docs + TS contract | status_changed resolution | BLOCKED |
| Errors | DEFINED/PARTIAL | domain errors doc | canonical codes/mapping | BLOCKED |
| Validation | PARTIAL | command/invariant text | full input validation | BLOCKED |
| Idempotency | PARTIAL | backend/contracts | exact command semantics | BLOCKED |
| Concurrency | PARTIAL | order/runtime requirements | conflict model | BLOCKED |
| Authorization | PARTIAL | backend/security docs | actor/domain boundary | BLOCKED |
| Persistence boundary | DEFINED/AMBIGUOUS | backend + contracts | DomainOutbox semantics | BLOCKED |
| Event boundary | DEFINED/AMBIGUOUS | events + architecture | normative event set | BLOCKED |
| Testing | FOUNDATION | foundation tests | runtime suite | NOT_READY |

## Minimum pre-D2 contract lock

1. Explicit aggregate boundaries for the first slice.
2. Normative transition matrix for every implemented lifecycle.
3. Complete command contract: input, preconditions, output, side effects, events, errors and idempotency.
4. Canonical domain error semantics.
5. Query semantics for reads required by the first slice.
6. Formal decision for `CONTRACT-001`.
7. Formal decision for `CONTRACT-002`, or an explicit approved way to avoid it in the first slice.
8. Stable IA-01 schema/domain boundary.
9. Stable IA-03 event boundary.

## Smallest safe post-lock increment

A pure domain slice with one approved aggregate, existing foundation primitives, one complete command, a small set of explicitly approved transitions, stable events only and focused unit tests. `Order` is the most plausible first slice, but this is a **PROPOSAL**, not a decision.
