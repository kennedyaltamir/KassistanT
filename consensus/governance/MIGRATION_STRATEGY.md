# IA-01 — Migration Strategy

Status: **STRATEGY_DEFINED / EXECUTION_NOT_AUTHORIZED**
Implementation point: `0e1897cae007530cbe8aed20b97e04a25340cc87`

## Decision basis

`GOV-DRIFT-0002 = OPTION_B`.

`apps/desktop/database/migrations/0002_c1_product_order.sql` is preserved as `NON_AUTHORITATIVE_HISTORICAL_ARTIFACT`.

## Strategy

**Preserve + Append Later** is the only currently defensible physical strategy.

### Preserve

Keep migrations `0001_bootstrap.sql` and physical `0002_c1_product_order.sql` unchanged as historical repository evidence.

Do not execute `0002` merely because it exists.

### Append later

A future migration may be added only after a complete deterministic physical schema contract is available for the exact tables included in that migration.

That future migration must be authored against the normative schema, not as a continuation that treats the historical `0002` contents as canonical.

### Replace / split

Neither replacement nor splitting is authorized in this cycle. If the future physical realization requires one of those strategies, the implementation step must explicitly document how historical `0002` remains preserved while the new migration sequence establishes the canonical active schema.

## Required preconditions for a future executable migration

1. Complete deterministic field inventory for each included table.
2. Frozen PK/FK semantics.
3. Frozen nullability/defaults.
4. Frozen required uniqueness constraints.
5. Frozen required indexes only where contractually justified.
6. Deterministic money/currency representation.
7. Deterministic timestamp/UUID physical representation.
8. No unresolved business-rule inference.
9. Explicit reconciliation with existing Product/Order runtime persistence contracts.
10. Independent verification before execution/merge.

## Current migration recommendation

`CREATE NEW MIGRATION = NOT AUTHORIZED IN THIS CYCLE`.

Reason: Inventory, InventoryMovement and Sale do not yet have sufficient normative semantic evidence, while Product/Order and DomainOutbox still have physical field-level gaps.

## Truth rule

`Migration strategy defined != migration created != migration executed != schema verified`.
