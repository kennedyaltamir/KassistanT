# Migration Strategy

Status: **CONSISTENT_WITH_OPTION_B**

## Policy

`PRESERVE + APPEND LATER`

## Rules

- `apps/desktop/database/migrations/0002_c1_product_order.sql` remains physically present.
- Migration 0002 remains `NON_AUTHORITATIVE_HISTORICAL_ARTIFACT` under `GOV-DRIFT-0002 = OPTION_B`.
- Migration 0002 is not executed, renamed, deleted or modified by this cycle.
- No replacement migration is created in this cycle.
- Future physical changes must be represented by a new migration created only after the canonical physical contract is fully deterministic and separately authorized for implementation.

## Current consequence

The schema closure may define canonical physical semantics without executing them. Historical Migration 0002 remains evidence for compatibility analysis only.

## Readiness

Migration strategy itself is deterministic and compatible with Option B. It is not the remaining blocker for `SCHEMA_IMPLEMENTATION_READY`.
