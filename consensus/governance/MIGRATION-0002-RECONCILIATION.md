# Migration 0002 — Governance Reconciliation

Status: **NON-AUTHORITATIVE HISTORICAL ARTIFACT**

## Physical artifact

`apps/desktop/database/migrations/0002_c1_product_order.sql` exists physically in `MVP2`.

## Normative treatment

Per `GOV-DRIFT-0002` Option B, physical existence does not confer normative authority. Migration 0002 is not part of the current canonical schema baseline.

## Preserved evidence

The file creates `product`, `order`, `order_item` and `order_item_modifier` and adds related indexes. Its content is narrower than the canonical projection and therefore cannot be promoted as the canonical MVP schema.

## Authorized actions in this reconciliation

- classify the artifact as historical/non-authoritative;
- update documentation and readiness records;
- identify dependencies on its physical presence.

## Prohibited actions

- execute migration;
- delete migration;
- rename migration;
- replace migration;
- create a replacement migration;
- alter schema history.

Those actions require a separate explicit physical implementation authorization.

## Dependency note

Any runtime code that currently assumes tables introduced by 0002 must be treated as implementation evidence to be audited/reconciled separately. Such code does not make 0002 normative.
