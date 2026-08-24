# IA-04 — GOV-DRIFT-0002 Decision Package

Status: **OPEN_DECISION / READY_FOR_NORMATIVE_AUTHORITY**
Owner: IA-04 — Domain & Contract Architect
Decision authority: **Global project governance / Operator**
Physical schema authority: IA-01, after semantic authority is explicit

## 1. Decision identity

- Decision ID: `GOV-DRIFT-0002`
- Scope: `apps/desktop/database/migrations/0002_c1_product_order.sql`
- Operational branch audited: `MVP2`
- Implementation point audited: `0bea2a0ca7c52729cfd58bebc8cd568373222230`
- Integration target: `main` at `86387b02ed55ef3af3b24f1591b3e0b0ff436a30`

## 2. Facts

1. Migration `0002_c1_product_order.sql` exists physically on `MVP2`.
2. The same migration content is already present in the immediate parent of the current `MVP2` HEAD (`720dbdd442e9dc221d2e3f545bddbc8302f10b54`). Therefore its presence is not attributable to the latest revert commit.
3. The migration creates `product`, `order`, `order_item`, and `order_item_modifier`.
4. The migration creates indexes on store/order parent references.
5. The migration writes `_schema_metadata.schema_version = '0002'`.
6. `agents/01-schema/MIGRATION-0002-READINESS.md` classifies migration `0002` as `PROHIBITED` and `BLOCKED — DECISION PACKAGE PENDING`.
7. `agents/01-schema/HANDOFF.md` contains an older statement that no migration `0002` exists. That statement is contradicted by the current repository state.
8. `agents/01-schema/SCHEMA-AUTHORITY-MATRIX.md` assigns semantic domain meaning to domain owners and physical SQLite realization to IA-01 after semantic decisions are explicit. Global project authority owns `DomainOutbox` ownership and the global contract registry/version authority.
9. `agents/01-schema/SCHEMA-DECISION-MATRIX.md` states that a recommendation does not become a decision without explicit approval and that `0002` cannot be generated from proposal-level evidence alone.

## 3. Current physical state

The migration contains the following physical structures:

### `product`

- `id TEXT PRIMARY KEY`
- `store_id TEXT NOT NULL`
- `name TEXT NOT NULL`
- `price_amount_cents INTEGER NOT NULL CHECK (price_amount_cents >= 0)`
- `price_currency TEXT NOT NULL`
- index: `idx_product_store_id`

### `order`

- `id TEXT PRIMARY KEY`
- `store_id TEXT NOT NULL`
- `status TEXT NOT NULL`
- `total_amount_cents INTEGER NOT NULL CHECK (total_amount_cents >= 0)`
- `total_currency TEXT NOT NULL`
- index: `idx_order_store_id`

### `order_item`

- `id TEXT PRIMARY KEY`
- `order_id TEXT NOT NULL`
- `name TEXT NOT NULL`
- `quantity INTEGER NOT NULL CHECK (quantity > 0)`
- `unit_price_cents INTEGER NOT NULL CHECK (unit_price_cents >= 0)`
- `unit_price_currency TEXT NOT NULL`
- FK: `order_id -> order(id) ON DELETE CASCADE`
- index: `idx_order_item_order_id`

### `order_item_modifier`

- `id TEXT PRIMARY KEY`
- `order_item_id TEXT NOT NULL`
- `name TEXT NOT NULL`
- `quantity INTEGER NOT NULL CHECK (quantity > 0)`
- `price_cents INTEGER NOT NULL CHECK (price_cents >= 0)`
- `price_currency TEXT NOT NULL`
- FK: `order_item_id -> order_item(id) ON DELETE CASCADE`
- index: `idx_order_item_modifier_order_item_id`

### Schema metadata

The migration executes:

`INSERT OR REPLACE INTO _schema_metadata(key, value) VALUES ('schema_version', '0002')`

This is physical state only. It does not prove normative authorization.

## 4. Current normative state

The current schema governance documents do not authorize migration `0002` for implementation:

- `MIGRATION-0002-READINESS.md`: `PROHIBITED / BLOCKED — DECISION PACKAGE PENDING`.
- `HANDOFF.md`: schema deterministic gate is pending and migration `0002` is described as prohibited, although one historical sentence incorrectly states that the file does not exist.
- `SCHEMA-AUTHORITY-MATRIX.md`: semantic owners decide meaning; IA-01 materializes the physical representation after those semantics are explicit; global project authority remains responsible for global contract authority.
- `SCHEMA-DECISION-MATRIX.md`: physical table determinism requires all semantic/physical decisions to be closed and approved.

No evidence in the current repository grants IA-04 or IA-01 unilateral authority to convert the physical existence of the file into normative approval.

## 5. Conflict

The repository simultaneously contains:

- a physical migration that materially advances the SQLite schema to version `0002`; and
- governance evidence that migration `0002` is not authorized and remains decision-gated.

Those states may coexist as **historical physical state under review**, but they cannot simultaneously be represented as an approved normative baseline. Treating the migration as approved would infer authorization from implementation. Treating it as nonexistent would contradict verifiable repository state.

Correct classification:

`GOVERNANCE_DRIFT`
`CONTRACT_CONFLICT`
`PHYSICAL_STATE_PRESENT`
`NORMATIVE_AUTHORIZATION_UNRESOLVED`

## 6. Unknowns

The following remain intentionally unresolved:

1. Whether migration `0002` was created as a legitimate historical implementation before a later governance restriction.
2. Which exact governance event or decision caused the current `0002` prohibition, if any.
3. Whether the physical content is intended to be preserved as historical state, replaced by another migration, or formally rejected from the normative baseline.
4. Whether the table subset in `0002` is still the intended MVP2 schema scope.
5. Whether any other normative document supersedes the current schema-readiness decision package.

The current evidence does not establish any of these unknowns.

## 7. Authority

### Normative decision authority

`Global project governance / Operator` is the competent authority for deciding whether the physical migration becomes part of the normative MVP2 baseline, because the repository explicitly separates semantic ownership from physical realization and reserves global contract authority for governance-level decisions.

### Physical schema authority

`IA-01` owns the physical SQLite realization once the semantic and normative decision is explicit. IA-01 does not independently approve the underlying product/schema policy.

### Domain semantic authorities

- Product/Customer/Conversation semantics: IA-02 and relevant domain owners.
- Order semantics and parent relationships: IA-04 + IA-02.
- Inbox reliability semantics: IA-03.
- DomainOutbox ownership/scope: global project governance.

## 8. Decision required

**Question:** What is the normative status of migration `0002_c1_product_order.sql` in the MVP2 baseline?

The decision must be explicit and recorded through the project's authoritative governance mechanism.

## 9. Options

### Option A — `APPROVE_EXISTING_MIGRATION`

Approve the existing physical migration as normative, subject to a deterministic schema review proving that every included table, field, constraint, FK action, status representation and scope is consistent with the approved domain contracts.

Consequence: the migration can become a candidate baseline artifact after reconciliation and explicit approval. This option does not authorize execution automatically.

### Option B — `DEPRECATE_OR_REJECT_EXISTING_MIGRATION`

Declare the existing migration historical/non-normative and keep it physically present until a separately authorized cleanup/replacement process determines the safe treatment.

Consequence: downstream domains must not consume its physical model as canonical.

### Option C — `REPLACE_WITH_APPROVED_MIGRATION`

Declare the current migration non-normative and authorize a future replacement migration after the semantic/physical contract set is closed.

Consequence: replacement work is a subsequent governed implementation task. No replacement migration is authorized by this package.

## 10. IA-04 recommendation

**No option is recommended at this gate.**

Available evidence is sufficient to establish drift, but insufficient to determine historical intent or grant normative approval. Choosing A, B, or C only to unblock implementation would violate the anti-invention rule.

Recommended status:

`OPEN_DECISION`

## 11. Unblock conditions

GOV-DRIFT-0002 is resolved only when all of the following are true:

1. Global project authority explicitly selects A, B, or C.
2. The decision is recorded in the authoritative governance mechanism.
3. The approved semantic scope of included tables is explicit.
4. IA-01 reconciles the physical schema against the approved semantics.
5. Any required physical changes are performed only in a subsequent authorized implementation step.
6. The obsolete contradictory wording in schema handoff/readiness documents is corrected without erasing the historical record of the finding.
7. A deterministic schema review confirms the resulting state.

## 12. Non-actions in this package

This package does not:

- delete or modify migration `0002`;
- create a replacement migration;
- approve migration `0002`;
- change functional source code;
- change domain business policy;
- declare schema readiness;
- declare `READY_FOR_IA03`.

## 13. Evidence

- Physical migration: `apps/desktop/database/migrations/0002_c1_product_order.sql` at `MVP2`.
- Immediate parent comparison: same migration is present at `720dbdd442e9dc221d2e3f545bddbc8302f10b54`.
- Readiness: `agents/01-schema/MIGRATION-0002-READINESS.md`.
- Schema authority: `agents/01-schema/SCHEMA-AUTHORITY-MATRIX.md`.
- Decision matrix: `agents/01-schema/SCHEMA-DECISION-MATRIX.md`.
- Schema decisions: `agents/01-schema/DECISIONS.md`.

## 14. Decision package status

`READY_FOR_NORMATIVE_AUTHORITY`
