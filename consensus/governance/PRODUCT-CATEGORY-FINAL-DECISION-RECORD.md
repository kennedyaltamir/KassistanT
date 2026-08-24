# ProductCategory — Final Semantic Decision Record

Decision ID: `SCHEMA-PC-001`
Owner: `PRODUCT_CATEGORY_SEMANTIC_OWNER`
Effective: `2026-08-24`

## Decision

`product.category_id -> product_category.id` is an **optional classification relationship**.

- Cardinality: `Product N:1 ProductCategory` when assigned.
- `nullable`: `TRUE`.
- Required for product creation: `FALSE`.
- Required for product publication: `FALSE`.
- `ON DELETE`: `SET NULL`.
- `ON UPDATE`: `RESTRICT`.
- Lifecycle: mutable classification while Product exists; Product remains commercially valid without a Category.

## Rationale

Category organizes catalog presentation but is not required to establish Product identity, price, availability, or commercial validity. A category may therefore be removed without invalidating the Product; the relationship is cleared rather than deleting the Product. Primary-key mutation is not part of normal business lifecycle and is restricted.

## Schema impact

The canonical physical schema must permit a null `category_id` and must not require a Category for Product creation/publication. No auxiliary Category state is introduced.

## Non-scope

No automatic category migration, category hierarchy, category deletion cascade, or new Product business rule is introduced.

## Evidence

`docs/domain/entities.md` defines ProductCategory/Product as canonical entities but keeps detailed field schemas partial; the decision therefore closes only the explicit relationship semantics required by this mandate. `agents/01-schema/SCHEMA-AUTHORITY-MATRIX.md` assigns FK lifecycle semantics to the relevant semantic owner before IA-01 materialization.
