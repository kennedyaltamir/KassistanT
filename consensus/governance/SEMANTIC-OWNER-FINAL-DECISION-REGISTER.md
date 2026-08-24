# Semantic Owner Final Decision Register

Effective: 2026-08-24
Baseline: MVP2 @ 0e1897cae007530cbe8aed20b97e04a25340cc87

| Decision ID | Relation | Owner | Decision |
|---|---|---|---|
| SCHEMA-PC-001 | Product.category_id -> ProductCategory.id | PRODUCT_CATEGORY_SEMANTIC_OWNER | optional classification; nullable; SET NULL/RESTRICT |
| SCHEMA-ORDER-CUSTOMER-001 | Order.customer_id -> Customer.id | ORDER_SEMANTIC_OWNER | optional in DRAFT, mandatory at confirmation; RESTRICT/RESTRICT |
| SCHEMA-ORDER-ADDRESS-001 | Order.address_id -> CustomerAddress.id | ORDER_SEMANTIC_OWNER | optional in DRAFT; required for delivery confirmation; snapshot at confirmation; SET NULL/RESTRICT |
| SCHEMA-ORDER-PAYMENT-001 | Order.payment_method_id -> PaymentMethod.id | ORDER_SEMANTIC_OWNER | optional in DRAFT, mandatory at confirmation; frozen commercial meaning; RESTRICT/RESTRICT |
| SCHEMA-ORDER-SUPPORT-OTHER-001 | Other Order support relations | ORDER_SEMANTIC_OWNER | none promoted beyond the listed canonical relations |

## Conflict status

No owner conflict is recorded in this decision round.

## Impact

These decisions close the semantic questions required for IA-01's final physical schema reconciliation. They do not authorize schema mutation, migration creation/execution, runtime implementation, or merge.
