# IA-02 — Decisions

## Approved decisions relevant to IA-02

### D-001 — LLM authority boundary
**Status:** DECISION / APPROVED. LLM output is not authoritative for price, money, persistence, authorization or critical state.

### D-002 — Money representation
**Status:** DECISION / APPROVED. Money uses integer cents and BRL semantics.

### D-003 — Order confirmation milestone
**Status:** DECISION / APPROVED. `CONFIRMED` is the operational sale milestone and confirmed orders freeze price state.

### D-004 — State integrity
**Status:** DECISION / APPROVED. Invalid transitions are rejected and terminal order states do not reopen.

## Open global decisions

### D-005 — CONTRACT-001 / DomainOutbox
**Status:** OPEN / NOT APPROVED. Ownership/scope remains ambiguous.

### D-006 — CONTRACT-002 / `order.status_changed`
**Status:** OPEN / NOT APPROVED. Current TypeScript contract includes it; normative status remains unresolved.

### D-007 — GOV-001 / document authority history
**Status:** OPEN / NOT APPROVED.

## Human decisions — First Domain Slice

### DREQ-001 — Aggregate boundary
**Status:** DECISION / APPROVED.

**Option:** A with V1 refinement.

**Approved boundary:** `Order` is the aggregate root for the first slice. `OrderItem` and `OrderItemModifier` are aggregate-owned children. `OrderStatusHistory` is deferred and is not required for the V1 aggregate boundary.

**Important:** this does not decide persistence, audit or schema representation for `OrderStatusHistory`.

### DREQ-002 — First normative transition
**Status:** DECISION / APPROVED.

**Option:** A.

**Approved transition:** `DRAFT -> CONFIRMED`, triggered by `ConfirmOrder`, producing the domain event `order.confirmed`.

**Scope:** this approval covers only the first normative transition. It does not define the complete Order lifecycle and does not approve additional lifecycle events such as `order.status_changed`.

### DREQ-005 — ConfirmOrder domain error semantics
**Status:** DECISION / APPROVED.

**Option:** A.

**Approved semantic categories:**
- `INVALID_ORDER_STATE`
- `CONFIRMATION_DATA_INVALID`
- `DUPLICATE_CONFIRMATION`
- `CONCURRENCY_CONFLICT`

**Explicitly not decided here:** HTTP/transport/UI mappings, public/global error codes, authentication/authorization errors, persistence/provider errors, full idempotency protocol, and concurrency mechanism.

`DUPLICATE_CONFIRMATION` remains a semantic category, not an idempotency protocol. `CONCURRENCY_CONFLICT` remains a semantic result, not a decision about locking/versioning/serialization/transactions.

### DREQ-006 — Actor / authorization boundary
**Status:** DECISION / APPROVED.

**Option:** A.

**Approved boundary:** authentication remains outside the aggregate; authorization is decided at the application/application-service boundary; the domain receives a minimal approved `ActorContext` without credentials; the aggregate does not authenticate, query an identity provider, or interpret tokens, keys or sessions; Gateway/WSS does not decide Order business rules.

**ActorContext shape:** intentionally NOT FROZEN by this decision. No specific DTO, schema or persistence fields are approved by DREQ-006.

## Implementation authorization state

**IMPLEMENTATION_AUTHORIZATION = PENDING_HUMAN_AUTHORIZATION**

The four DREQ decisions above are approved human decisions, but they do not authorize implementation automatically. The first slice must be re-audited after these decisions and may proceed only after an explicit implementation authorization decision.

## Deferred first-slice decisions

### DREQ-003 — `order.status_changed`
**Status:** DEFERRED / NOT DECIDED. Not required for the first slice.

### DREQ-004 — DomainOutbox
**Status:** DEFERRED / NOT DECIDED. Not required for the first pure in-memory slice.

No decision above authorizes changes outside the IA-02 ownership boundary or changes to global contracts.