# IA-04 — Memory

Permanent verified facts only.

- KassisT is a Windows 10/11 64-bit desktop MVP prepared for future SaaS evolution.
- The approved baseline states: the LLM interprets; the Core decides.
- Desktop Core owns deterministic business rules and SQLite persistence; Gateway is a transport/integration boundary and does not execute order rules.
- IA-04 owns the Order Engine runtime at `apps/desktop/electron/order/**`.
- Documented order commands: `CreateDraftOrder`, `AddItem`, `RemoveItem`, `ChangeQuantity`, `SetDeliveryType`, `SetAddress`, `SetPaymentMethod`, `ApplyEligiblePromotion`, `RecalculateOrder`, `RequestCustomerConfirmation`, `ConfirmOrder`, `CancelOrder`.
- Order lifecycle: `DRAFT`, `CONFIRMED`, `IN_PRODUCTION`, `READY`, `OUT_FOR_DELIVERY`, `DELIVERED`, `CANCELLED`.
- `CONFIRMED` is the operational sale milestone.
- Quantity is positive integer; money uses integer cents/BRL; totals are deterministic.
- Confirmed orders freeze price state; terminal states do not reopen; confirmation requires final summary plus unequivocal confirmation.
- `ORDER-STATE-V1` is defined but not implemented according to the contract registry.
- Domain commands and state-machine documentation are `DEFINED / PARTIAL`; domain errors are `PARTIAL` and the canonical error-code catalogue is missing.
- Canonical entity field schemas remain partially specified.
- `CONTRACT-001` DomainOutbox ownership/scope is unresolved.
- `CONTRACT-002` `order.status_changed` remains unresolved.
- `GOV-001` baseline version references contain an acknowledged historical/versioning inconsistency.
- IA-04 must not silently resolve global ambiguities.
