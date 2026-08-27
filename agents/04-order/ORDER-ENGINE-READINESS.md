# IA-04 — Order Engine Contract Readiness

Status: AUDITED / BLOCKED
Audit phase: Order Engine Contract Readiness Audit
Branch: `Agent04-order-engine`
Main HEAD audited: `c9b79ae5ef90f4161261a93647d21d36773dd8e3`

## 1. Readiness verdict

The Order Engine is **not implementation-ready as a complete subsystem**.

The repository has a sufficiently explicit conceptual model for the core sale invariant (`CONFIRMED` as the operational sale milestone, deterministic money, immutable confirmed pricing, terminal-state protection), but it does not yet provide complete executable contracts for state transitions, errors, actor authorization, canonical entity fields, promotion semantics, delivery semantics, idempotency/replay policy, or the final DomainOutbox/event boundary.

Implementation must therefore be sliced. A future slice is READY only when it does not encode unresolved global contracts and its required upstream contracts are complete enough to test deterministically.

## 2. Evidence model

Primary evidence:

- `KassisT_Approved_Technical_Baseline_v1.0.1.md` — approved product/architecture baseline.
- `docs/domain/*` — domain contracts; several are explicitly PARTIAL.
- `docs/backend/*` — persistence, idempotency, audit and error-boundary rules.
- `docs/protocols/contract-registry.md` — current contract implementation/status registry.
- `packages/domain/src/money.ts` — implemented money primitive only.
- `packages/contracts/src/events.ts` — implemented event type list, including unresolved `order.status_changed`.
- `apps/desktop/database/migrations/0001_bootstrap.sql` — schema metadata only; canonical business schema absent.

Documentation is not runtime evidence. The registry explicitly marks `ORDER-STATE-V1` and `MONEY-V1` as NOT_IMPLEMENTED even though their contracts are defined.

## 3. Entity readiness summary

| Entity | Documentation | Contract | Runtime | Order role | Readiness |
|---|---|---|---|---|---|
| Order | DEFINED / PARTIAL | ORDER-STATE-V1 defined; fields partial | NOT_IMPLEMENTED | Aggregate root candidate; ownership boundary is not fully executable | BLOCKED |
| OrderItem | DEFINED / PARTIAL | Baseline fields present | NOT_IMPLEMENTED | Child entity of an order; snapshot semantics defined | PARTIAL |
| OrderItemModifier | DEFINED / PARTIAL | Baseline fields present | NOT_IMPLEMENTED | Child of OrderItem; modifier snapshot | PARTIAL |
| OrderStatusHistory | DEFINED / PARTIAL | Transition history fields present | NOT_IMPLEMENTED | Lifecycle history | PARTIAL |
| PaymentMethod | DEFINED | Registered method only; no processor | NOT_IMPLEMENTED | Order business state | PARTIAL |
| Customer | DEFINED / PARTIAL | Canonical entity; field detail partial | NOT_IMPLEMENTED | Referenced aggregate/customer identity | BLOCKED_BY_SCHEMA |
| CustomerAddress | DEFINED / PARTIAL | Structured address; detail partial | NOT_IMPLEMENTED | Delivery address reference | BLOCKED_BY_SCHEMA |
| Product | DEFINED / PARTIAL | price/availability fields documented | NOT_IMPLEMENTED | Catalog input; source of item price | BLOCKED_BY_SCHEMA |
| ProductModifier | DEFINED / PARTIAL | price/availability + min/max documented | NOT_IMPLEMENTED | Modifier pricing/input | BLOCKED_BY_SCHEMA |
| Promotion | DEFINED / PARTIAL | type/value/scope/period fields documented | NOT_IMPLEMENTED | Pricing rule input | BLOCKED |
| Store | DEFINED / PARTIAL | store scoping normative | NOT_IMPLEMENTED | Aggregate/context boundary | BLOCKED_BY_SCHEMA |

## 4. Aggregate analysis

### Aggregate Root

**FACT:** `Order` is the business object whose lifecycle and confirmation are explicitly specified.

**INFERENCE:** `Order` should be treated as the Order Engine aggregate root for future implementation because commands target an order and confirmation atomically persists order-related records/effects.

**Status:** STRONG_INFERENCE; executable aggregate contract still absent.

### Child entities

**FACT:** `OrderItem`, `OrderItemModifier` and `OrderStatusHistory` are canonical entities associated with Order.

**INFERENCE:** these are aggregate-owned records for Order operations. The exact repository/application mapping must remain aligned with IA-01 schema.

**Status:** PARTIAL.

### Value objects

**FACT:** Money is implemented in `packages/domain/src/money.ts` as BRL + safe integer cents.

**FACT:** address, delivery type, payment method, promotion and identifiers are described, but their complete executable schemas are not present.

**Status:** Money = IMPLEMENTED primitive; remaining Order value objects = PARTIAL/UNKNOWN.

### Command boundary

Commands explicitly documented: `CreateDraftOrder`, `AddItem`, `RemoveItem`, `ChangeQuantity`, `SetDeliveryType`, `SetAddress`, `SetPaymentMethod`, `ApplyEligiblePromotion`, `RecalculateOrder`, `RequestCustomerConfirmation`, `ConfirmOrder`, `CancelOrder`.

No implementation is authorized from this document alone.

### Persistence boundary

Order Engine consumes IA-01 persistence. IA-04 does not own migrations or repositories. Confirmation requires an atomic persistence boundary for Order, items, status history, `order.confirmed` and a durable external-effect record, but DomainOutbox ownership is unresolved by CONTRACT-001.

### Event boundary

Order Engine produces order events through IA-03 contracts. `order.status_changed` is not safe to treat as normative because CONTRACT-002 is OPEN.

### Concurrency boundary

The logical consistency boundary is the Order operation against the current aggregate state and its idempotency/concurrency context. Exact locking/version semantics are not yet defined.

## 5. Core invariants already sufficiently evidenced

- Quantity is a positive integer.
- Money is integer cents in BRL.
- Totals are deterministic.
- LLM output cannot authoritatively set totals.
- Confirmed orders freeze price state.
- Terminal states do not reopen.
- Confirmation requires final summary plus unequivocal confirmation.
- `order.confirmed` is persisted with the Order transaction and durable effect.
- Invalid transitions must be rejected.

These are suitable as future test invariants, subject to final executable contracts.

## 6. Required implementation gates

Before complete Order Engine implementation:

1. IA-01 provides sufficient canonical Order/OrderItem/OrderItemModifier/OrderStatusHistory/Customer/Address/Product/Modifier/Promotion fields and constraints.
2. IA-02 provides sufficient domain semantics/primitives without duplicate authority.
3. IA-03 provides a usable event/durable-effect interface; CONTRACT-001 must not be encoded locally.
4. Lifecycle transitions are explicitly specified rather than only catalogued.
5. Pricing semantics specify all required inputs and ordering of calculation.
6. Promotion eligibility/conflict semantics are specified.
7. Delivery and payment state semantics required by the MVP are explicit.
8. Actor/permission semantics for Order commands are explicit enough to reject unauthorized operations deterministically.
9. Canonical error names/codes and retryability are sufficient for stable tests.
10. Idempotency/replay semantics are sufficient for each critical command.
11. CONTRACT-002 is resolved or the specific implementation slice demonstrably does not depend on it.
12. CONTRACT-001 is resolved or the specific implementation slice demonstrably does not depend on DomainOutbox semantics.

## 7. Safe implementation slices

| Slice | Status | Reason |
|---|---|---|
| Deterministic Money arithmetic | READY | Existing Money primitive is explicit and independently testable; no unresolved Order semantics required for arithmetic only. |
| Order aggregate executable model | BLOCKED | Canonical fields, transition semantics and errors remain incomplete. |
| Pure pricing function | BLOCKED | Promotion, delivery-fee, rounding and tax scope are not complete enough as one normative algorithm. |
| Promotion evaluation | BLOCKED | Eligibility, stacking, priority, usage limits and conflict semantics are incomplete. |
| Lifecycle validation | PARTIAL | State catalog + reject-invalid-transition rule exist, but transition graph and actor rules are incomplete. |
| Idempotency primitives for Order | PARTIAL | Critical-operation duplicate safety is explicit, but operation-specific key/scope/replay policy is incomplete. |
| Concurrency model | PARTIAL | Race classes are identifiable, but exact serialization/versioning contract is not fixed. |
| Deterministic test fixtures | PARTIAL | Core invariants are known, but canonical fields/errors and full command outputs are incomplete. |
| Error taxonomy | BLOCKED | Domain error catalog is explicitly MISSING. |

## 8. Non-goals for this phase

No runtime code, migrations, schema changes, global contract changes, event-contract changes, repository implementation, external integration configuration or test execution was performed.
