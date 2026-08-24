# Inventory — Canonical Contract

Status: **BLOCKED / NORMATIVE CONFLICT**

## Existing authority

The approved baseline contains both:

1. `ADR-015 — Estoque binário no MVP — Obrigatória`.
2. `3.2 Pós-MVP — Estoque quantitativo`.

These statements imply materially different persistence models.

## Consequence

IA-01 cannot legitimately choose between:

- binary availability (`available` / unavailable),
- quantitative on-hand stock (`quantity_on_hand`),
- or a hybrid model,

without a normative decision clarifying which requirement supersedes or reconciles the other.

## InventoryMovement

No authoritative evidence currently freezes:

- movement identity;
- movement type taxonomy;
- quantity unit;
- idempotency key;
- Order/Sale reference semantics;
- concurrency/versioning model;
- database enforcement strategy for stock non-negativity.

The candidate model in the closure mandate is therefore treated as `PROPOSAL`, not contract.

## Required Operator decision package

`INVENTORY-MVP-MODEL` must explicitly determine the MVP stock model and whether quantitative inventory is in scope. Until then, `Inventory` and `InventoryMovement` remain blocked.
