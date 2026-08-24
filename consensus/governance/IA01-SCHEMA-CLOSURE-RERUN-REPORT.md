# IA-01 — Schema Closure Rerun Report

Status: **SCHEMA_CLOSURE_BLOCKED**
Protocol: `KASSIST-IA01-SCHEMA-CLOSURE`
Implementation point: `0e1897cae007530cbe8aed20b97e04a25340cc87`
Branch: `ia01/schema-closure-20260824`

## Entry verification

- `MVP2` factual HEAD: `0e1897cae007530cbe8aed20b97e04a25340cc87`.
- PR #26 remains open/draft and contains this rerun.
- `STOCK-MODEL-MVP-001` is registered as `APPROVED_OPTION_A / BINARY_AVAILABILITY`.
- Migration 0002 remains physically present and non-authoritative.

## Closure results

| Target | Result | Evidence / blocker |
|---|---|---|
| SCHEMA-001 Product / Order | PARTIALLY_CLOSED | Canonical logical mappings reconciled; historical names not promoted. Repository-wide physical naming convention and Order child parent-key semantics remain unresolved. |
| SCHEMA-002 Nullability / Defaults | PARTIALLY_CLOSED | Product availability is deterministic (`INTEGER NOT NULL`, no SQL default). Remaining Order/support field optionality/defaults are incomplete. |
| SCHEMA-003 Foreign Keys | BLOCKED | Authoritative relationship matrix keeps ON DELETE / ON UPDATE UNKNOWN and several parent keys unresolved. |
| SCHEMA-004 Sale | CLOSED | Canonical MVP entity inventory has no Sale entity; `Order.CONFIRMED` is the operational sale milestone. |
| SCHEMA-005 Binary Availability | CLOSED | `Product.available` is the authoritative binary state; no quantitative Inventory/InventoryMovement is required. |
| SCHEMA-006 Migration strategy | CLOSED | `PRESERVE + APPEND LATER`, consistent with GOV-DRIFT-0002 Option B. |

## Sale closure rationale

The canonical entity inventory contains 28 entities and does not contain `Sale`. The Order contract defines `CONFIRMED` as the operational sale milestone. Therefore IA-01 does not introduce a second Sale persistence entity or duplicate monetary snapshot.

## Remaining blockers

1. FK `ON DELETE` / `ON UPDATE` semantics remain UNKNOWN in the authoritative relationship matrix.
2. Order child parent-key names remain unresolved (`OrderItem`, `OrderItemModifier`, `OrderStatusHistory`).
3. Final nullability/default semantics remain incomplete for unresolved child/support schema.
4. Repository-wide physical table/column naming convention remains a proposal that requires governance confirmation before becoming the canonical physical convention.

## Non-actions

- No runtime implementation.
- No migration creation or execution.
- Migration 0002 untouched.
- No Customer/Conversation/Message/DomainOutbox decision reopened.
- No separate PR created; rerun is contained in PR #26.

## Verdict

`SCHEMA_IMPLEMENTATION_READY = FALSE`.

The stock-model blocker is removed. The remaining blockers are physical schema-authority issues, not business-model ambiguity.
