# IA-02 — D1 Reconciliation

## Status

**D1_COMPLETE_WITH_RECONCILIATION_REQUIRED → RECONCILED**

Implementation remains frozen.

## 1. Entity-count reconciliation

The canonical count is **28**, not 29.

`docs/domain/entities.md` lists exactly these 28 entities and identifies baseline §23 as the source:

Store, Device, Settings, ProductCategory, Product, ProductModifier, ProductImage, Promotion, Customer, CustomerAddress, Conversation, Message, Order, OrderItem, OrderItemModifier, OrderStatusHistory, PaymentMethod, Notification, Integration, IntegrationCredential, InboundInbox, DomainOutbox, Job, AuditLog, Log, AIProfile, AIExecution, KnowledgeItem.

The previous D1 prose said "29-entity inventory", but the actual D1 table had 28 rows. No source artifact supplied a 29th canonical entity. The extra count is therefore classified as **ERROR DE INVENTÁRIO/RELATO**, not as a project entity.

## 2. Cross-reference findings

### Baseline

Baseline §23 is the normative source identified by `docs/domain/entities.md`. No baseline amendment is permitted for this reconciliation.

### Domain documentation

`docs/domain/entities.md` explicitly contains the 28-entity canonical list.

### Contracts

`packages/contracts/src/events.ts` defines domain event contracts, not entity definitions. It does not establish a 29th entity.

### Runtime

`packages/domain/src/` contains lifecycle types and foundation primitives (`Money`, UTC, UUIDv7, transaction boundary, LLM provider interface) but no executable entity model.

### IA-01 schema audit

The requested `agents/01-schema/CANONICAL_SCHEMA_AUDIT.md` is absent at the audited branch ref. This is a documentation-gap fact. It does not justify inventing or promoting another entity.

## 3. Aggregate reconciliation

No aggregate root is normatively frozen in the reviewed sources.

- `Order`: **CANDIDATE / STRONG_INFERENCE**, supported by order commands, lifecycle, pricing/confirmation invariants and order events.
- `Conversation`: **CANDIDATE / INFERENCE**, supported by lifecycle/ownership state but lacking explicit aggregate boundary and concurrency semantics.
- No other aggregate root is explicitly normative.

Therefore aggregate readiness remains **BLOCKED**.

## 4. State-machine reconciliation

### OrderLifecycle

States are explicitly catalogued: DRAFT, CONFIRMED, IN_PRODUCTION, READY, OUT_FOR_DELIVERY, DELIVERED, CANCELLED.

Normative transition matrix: **NOT_COMPLETE**.

Documented invariant: invalid transitions are rejected; terminal states do not reopen; `CONFIRMED` is the operational sale milestone.

Status: **STATE_CATALOG_ONLY / BLOCKED**.

### ConversationLifecycle

States: OPEN, CLOSED.

No complete normative transition matrix was found.

Status: **STATE_CATALOG_ONLY / BLOCKED**.

### MessageLifecycle

States: RECEIVED, QUEUED, PROCESSING, SENT, DELIVERED, READ, FAILED, REJECTED.

No complete normative transition matrix was found.

Status: **STATE_CATALOG_ONLY / BLOCKED**.

## 5. Command reconciliation

The documented Order commands remain the only canonical executable-domain command catalog identified:

CreateDraftOrder, AddItem, RemoveItem, ChangeQuantity, SetDeliveryType, SetAddress, SetPaymentMethod, ApplyEligiblePromotion, RecalculateOrder, RequestCustomerConfirmation, ConfirmOrder, CancelOrder.

All remain **PARTIAL**. `ConfirmOrder` is additionally **BLOCKED** by unresolved event/persistence semantics affecting its boundary.

No new commands are introduced by this reconciliation.

## 6. Error reconciliation

The domain documentation establishes conceptual errors for invalid transition, unavailable product/modifier, insufficient delivery data, invalid quantity, promotion violation and duplicate operation.

Stable codes, retryability and cross-boundary mappings are not normatively complete. No final error-code catalog is invented here.

## 7. Contract blockers

| Blocker | Severity | Affected area | Independent work | Required decision |
|---|---|---|---|---|
| CONTRACT-001 | CRITICAL | DomainOutbox boundary, persistence/event transaction semantics | Pure domain rules that do not depend on Outbox semantics | Human-approved ownership/semantics |
| CONTRACT-002 | HIGH | Domain event set, Order lifecycle/event emission | Domain calculations and rules independent of ambiguous event | Decide normative status of `order.status_changed` or explicitly exclude first slice |
| GOV-001 | MEDIUM | Documentation authority/version history | Technical analysis and implementation planning | Governance authority/versioning decision |

## 8. First-slice reconciliation

A first slice must have: approved aggregate root, complete command, normative transition, invariants, domain errors, event semantics, persistence boundary and tests.

Current evidence does **not** satisfy all requirements.

`Order` is therefore **PARTIAL / BLOCKED**, not READY.

The strongest candidate remains an Order-focused slice after contract lock, but implementation must not begin until the required semantics are explicitly frozen.

## 9. Conclusion

D1 reconciliation closes the 28-vs-29 inconsistency without altering the baseline. The canonical inventory is **28**. The previously reported 29th count was a reporting error, not an entity.

D2 remains blocked pending contract closure and completion of first-slice semantics.
