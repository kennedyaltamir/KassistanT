# KassisT — ProductImage Physical Contract

Status: **BLOCKED / NOT DETERMINISTIC**
Protocol: `KASSIST-PHYSICAL-IMAGE`
Version: `1.0.0`
Agent: `IA-PHYSICAL-IMAGE`
Repository: `kennedyaltamir/KassistanT`
Base branch: `MVP2`
Verified MVP2 HEAD: `0e1897cae007530cbe8aed20b97e04a25340cc87`
Baseline implementation point: `0e1897cae007530cbe8aed20b97e04a25340cc87`

## 1. Result

`PHYSICAL_IMAGE_READY = FALSE`

`ProductImage` is a canonical entity, but its physical contract is not deterministic in the current evidence set.

The contract is intentionally **not** completed by inference. The current normative MVP decision also places **Image outside the approved MVP scope**.

## 2. Normative evidence

- The approved technical baseline defines `ProductImage` as a canonical entity and publishes the logical field set: `product_id`, `file_path`, `mime_type`, `dimensions`, `checksum`.
- The canonical schema audit classifies the current `ProductImage` physical properties as unresolved and marks the entity `BLOCKED`.
- The canonical physical schema specification requires logical meaning, physical type, nullability/default, key semantics and relevant constraints to be deterministic before migration readiness.
- The operator decision record dated 2026-08-24 explicitly lists `Image` in `explicit_non_scope` for the approved MVP.
- No authoritative source freezes a ProductImage primary key, alternate key, checksum uniqueness, timestamp fields, FK actions, lifecycle state machine, or nullability/default policy.

## 3. Physical contract matrix

| Concern | Current result | Evidence | Closure |
|---|---|---|---|
| identity | **OPEN / UNKNOWN** | Baseline lists no `id`; canonical schema audit lists only `product_id`, `file_path`, `mime_type`, `dimensions`, `checksum` | Not closed. No identifier invented. |
| primary_key_or_approved_key_model | **UNKNOWN** | No PK or alternate-key rule is frozen for ProductImage | Not closed. |
| product_id | **EXPLICIT relational field; physical semantics partial** | References `Product.id` by strong inference; store scope is inherited through Product by strong inference | Relationship direction known; nullability/delete/update remain open. |
| file_path | **EXPLICIT / physical type UNKNOWN** | Baseline field only | Not closed. |
| mime_type | **EXPLICIT / physical type UNKNOWN** | Baseline field only | Not closed. |
| dimensions | **EXPLICIT / representation UNKNOWN** | Baseline field only; structure unspecified | Not closed. |
| checksum | **EXPLICIT / representation UNKNOWN** | Baseline field only; algorithm/representation unspecified | Not closed. |
| created_at | **NOT SPECIFIED** | No ProductImage timestamp field exists in the authoritative logical field set | Must not be invented. |
| updated_at | **NOT SPECIFIED** | No ProductImage timestamp field exists in the authoritative logical field set | Must not be invented. |
| nullability | **UNKNOWN for all ProductImage fields** | Canonical schema audit | No blanket `NOT NULL` may be inferred. |
| defaults | **UNKNOWN** | Canonical schema specification forbids inference of SQL defaults from semantic defaults | None assigned. |
| uniqueness | **NONE FROZEN** | No ProductImage unique constraint is listed among normative unique surfaces | Checksum uniqueness explicitly not assumed. |
| on_delete | **UNKNOWN** | Relationship exists by strong inference only | No action chosen by convention. |
| on_update | **UNKNOWN** | Relationship exists by strong inference only | No action chosen by convention. |
| lifecycle | **NOT DEFINED** | Domain state machines define Conversation, Message and Order lifecycles only; no ProductImage lifecycle is defined | No lifecycle invented. |

## 4. Relationship

The only repository-supported relationship is:

`ProductImage.product_id -> Product.id`

Cardinality is mechanically consistent with multiple images belonging to a product, but a canonical physical cardinality/integrity policy is not frozen. The evidence does not authorize `ON DELETE CASCADE`, `RESTRICT`, `SET NULL`, or any `ON UPDATE` action.

Store scoping is inherited through `Product` by strong inference. `ProductImage` has no independently specified `store_id` field.

## 5. Identity and uniqueness prohibition

The following are deliberately **not** frozen:

- standalone UUID/ID column;
- `(product_id, file_path)` as a compound key;
- checksum as an identity;
- checksum as a unique constraint;
- `file_path` as a unique constraint;
- position/order field;
- primary/thumbnail flag.

These may become valid future contract decisions only through an authoritative semantic decision and subsequent schema reconciliation.

## 6. MVP scope conflict

The normative operator decision record for 2026-08-24 approves `TEXT_FIRST_REAL_COMMERCIAL_OPERATION` and explicitly places `Image` in the non-scope of the MVP.

Therefore this closure cannot promote `ProductImage` to an MVP migration-ready table merely because the entity exists in the canonical inventory.

## 7. Lifecycle conclusion

No ProductImage lifecycle state machine is currently defined. The existing domain state-machine document defines:

- `ConversationLifecycle`: `OPEN`, `CLOSED`;
- `ConversationOwnership`: `AI`, `HUMAN`;
- `AIState`: `ACTIVE`, `PAUSED`, `UNAVAILABLE`;
- `MessageLifecycle`: `RECEIVED`, `QUEUED`, `PROCESSING`, `SENT`, `DELIVERED`, `READ`, `FAILED`, `REJECTED`;
- `OrderLifecycle`: `DRAFT`, `CONFIRMED`, `IN_PRODUCTION`, `READY`, `OUT_FOR_DELIVERY`, `DELIVERED`, `CANCELLED`.

No ProductImage lifecycle is present. No CRUD or deletion semantics are invented here.

## 8. Migration gate

No DDL was created.

No migration was created.

No existing migration was authorized or modified by this closure.

`apps/desktop/database/migrations/0002_c1_product_order.sql` remains physically present and non-authoritative under the approved governance decision.

## 9. Required future closure decisions

Before `PHYSICAL_IMAGE_READY` can become `TRUE`, an authoritative contract must explicitly resolve at minimum:

1. ProductImage identity / PK or approved key model.
2. Physical representation of every published field.
3. Nullability for every field.
4. Defaults, if any.
5. Uniqueness constraints, including explicit confirmation that checksum uniqueness is or is not intended.
6. FK delete/update actions for `product_id`.
7. Whether timestamps exist and, if so, their names and semantics.
8. Lifecycle, mutability and deletion semantics for an image.
9. Whether ProductImage is promoted into an approved MVP scope or remains future scope.

## 10. Final classification

**PHYSICAL_IMAGE_READY = FALSE**

**Classification: BLOCKED_BY_NORMATIVE_FIELD_GAPS_AND_MVP_SCOPE**

This artifact intentionally preserves uncertainty rather than manufacturing a physical schema.
