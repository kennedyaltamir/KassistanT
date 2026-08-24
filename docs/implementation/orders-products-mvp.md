# Orders + Products — MVP Implementation

## Baseline

- Baseline branch: `MVP2`
- Baseline SHA: `636f08a5d377879d80766cf017684f8a6f955376`
- Working branch: `feature/orders-products`

## Product workflow

The Products screen now loads canonical records from the SQLite `product` table through the Electron IPC boundary. Product creation accepts a display name and a BRL price, converts the price to integer cents in the renderer, and validates the canonical integer-cents value again in the application service before persistence.

The current schema does not provide an approved update/deactivate contract, so this slice does not invent one. The UI explicitly states that limitation.

## Order workflow

The Orders screen loads persisted orders through the same IPC boundary. A draft order can be created from persisted Products only; the application service reads the canonical product price and builds the `OrderItem` snapshot and deterministic integer-cent total through the existing domain `Order.createDraft` aggregate.

Confirmation calls the existing `confirmOrder` domain command. The service rejects invalid confirmation data, invalid lifecycle state and duplicate confirmation, then persists the new `CONFIRMED` state transactionally through the existing SQLite repository.

Only the documented `DRAFT -> CONFIRMED` operation is exposed. Later lifecycle states are not invented because their executable command contracts are not complete in the current baseline.

## Persistence boundary

- SQLite remains the canonical local persistence mechanism.
- Existing `SQLiteDatabase` transaction and migration infrastructure is reused.
- Existing Product and Order repositories remain the persistence boundary.
- Order items and modifiers are persisted transactionally when an order is created.
- Confirmation updates only the existing Order aggregate row and preserves the already persisted item-price snapshot.

## Store scope

The current canonical business schema requires `store_id`, but an executable Store selection/identity contract is not present in the baseline. This slice therefore uses `KASSIST_STORE_ID` when supplied and otherwise uses the explicit single-store MVP fallback `mvp-local-store`. This fallback is local-scope infrastructure and must be replaced by the canonical Store identity contract when that contract is introduced.

## Security boundary

- Renderer input is treated as untrusted.
- IPC exposes only five fixed commerce operations.
- No arbitrary IPC channel or filesystem/database operation is exposed to the renderer.
- Product prices used by Orders are read from canonical persistence; the renderer cannot set the order total.
- No credentials or secrets are handled by the Orders + Products slice.

## Error semantics

Application validation errors are returned through the IPC promise rejection path with deterministic codes including:

- `INVALID_PRODUCT_NAME`
- `INVALID_PRODUCT_PRICE`
- `EMPTY_ORDER`
- `INVALID_ORDER_QUANTITY`
- `PRODUCT_NOT_FOUND`
- `ORDER_NOT_FOUND`
- `INVALID_ORDER_STATE`
- `CONFIRMATION_DATA_INVALID`
- `DUPLICATE_CONFIRMATION`
- `CONCURRENCY_CONFLICT`

## Recovery

The feature relies on the existing SQLite persistence and migration infrastructure. The added service tests create the records, close the database, reopen it and verify the canonical data is recovered.

## Tests

Added/updated coverage:

- product creation and integer-cent validation;
- product retrieval and restart recovery;
- order creation from canonical product pricing;
- empty/invalid quantities and missing product references;
- invalid confirmation data;
- successful confirmation through the existing domain command;
- duplicate confirmation rejection;
- renderer/preload IPC contract coverage;
- removal of the previous Orders/Products renderer fixture boundary.

The official Desktop test runner now includes `apps/desktop/electron/commerce-service.test.ts`.

## Runtime note

Electron currently boots from CommonJS while the canonical desktop/database/domain runtime is TypeScript. This implementation uses the repository's existing `tsx` package as the loader (`tsx/cjs`) to keep the runtime boundary on the existing TypeScript source rather than duplicating domain logic. Packaging/install policy for shipping `tsx` as a production dependency is not defined by the current desktop package; that remains a deployment-level follow-up before a packaged commercial installer release.
