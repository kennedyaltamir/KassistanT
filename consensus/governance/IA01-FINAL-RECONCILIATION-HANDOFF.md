# IA-01 Final Semantic Handoff

Status: `READY_FOR_IA01_FINAL_RECONCILIATION`
Effective: 2026-08-24
Implementation point: `0e1897cae007530cbe8aed20b97e04a25340cc87`
Branch: `semantic-owner/final-decisions-20260824`

## Closed relations

- Product.category_id
- Order.customer_id
- Order.address_id
- Order.payment_method_id
- no additional Order support relation beyond the explicit canonical set

## Closed semantic values

- Product.category_id: nullable; optional classification; SET NULL/RESTRICT.
- Order.customer_id: nullable only during DRAFT; mandatory at confirmation; RESTRICT/RESTRICT.
- Order.address_id: nullable; required for delivery confirmation; snapshot at confirmation; SET NULL/RESTRICT after snapshot preservation.
- Order.payment_method_id: nullable; mandatory at confirmation; commercial meaning frozen at confirmation; RESTRICT/RESTRICT.

## Remaining semantic blockers

None within the scope of this decision package.

## Required next action

IA-01 must materialize these semantics into the canonical schema documentation and reassess `SCHEMA_IMPLEMENTATION_READY`. IA-01 must not reopen the decisions, and must not create or execute migrations in that reconciliation.

## Truth boundary

`SEMANTIC_DECISION_CLOSED != SCHEMA_IMPLEMENTATION_READY != SCHEMA_IMPLEMENTED != VERIFIED != AUDIT_ACCEPTED != MERGE_AUTHORIZED`.
