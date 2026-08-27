# PAYMENT-METHOD-PHYSICAL-CONTRACT

Status: **PHYSICAL PAYMENT READY**
Protocol: `KASSIST-PHYSICAL-PAYMENT-METHOD`
Agent: `IA-PHYSICAL-PAYMENT`
Repository: `kennedyaltamir/KassistanT`
Branch baseline: `MVP2`
Verified implementation point before this closure: `0e1897cae007530cbe8aed20b97e04a25340cc87`

## 1. Scope

This contract closes only the minimum physical persistence model required for `Order.payment_method_id` to reference `PaymentMethod` in the MVP.

The entity records the payment method informed/selected for the business transaction. It is **not** a payment instrument vault, payment processor, token store, or provider integration.

No real payment collection is represented by this entity.

## 2. Authoritative evidence

- The approved technical baseline defines `Order.payment_method_id` and states: `PaymentMethod: Somente método informado no MVP; não representa processamento financeiro.`
- The same baseline states that payment processing online is outside the MVP and that the MVP should only register the informed method.
- The canonical schema lists `PaymentMethod` but explicitly says its exact physical fields remain blocked until the semantic/physical closure.
- The relationship specification identifies `Order.payment_method_id -> PaymentMethod` and leaves only the target identity as unresolved.
- The repository security policy prohibits secrets/credentials in source and requires protection of customer/business data.
- The current physical `0002` migration is non-authoritative and is not modified by this closure.

## 3. Physical entity

### Table

Proposed physical table name: `payment_method`.

This follows the existing IA-01 lower-snake-case physical naming proposal. This artifact does not independently promote global SQL naming governance.

### Fields

| Field | Physical type | Required | Nullable | Default | Semantics |
|---|---|---:|---:|---|---|
| `id` | `TEXT` | YES | NO | none | Canonical entity identity. UUIDv7 textual representation. Immutable. |
| `customer_id` | `TEXT` | YES | NO | none | References `Customer.id`. PaymentMethod is customer-linked in this physical contract. |
| `method_type` | `TEXT` | YES | NO | none | Normalized application-level method kind. No provider-specific enum is frozen here. |
| `display_label` | `TEXT` | YES | NO | none | Human-readable label used by domain/UI. Must not contain secrets or raw credentials. |
| `created_at` | `TEXT` | YES | NO | none | UTC timestamp in canonical RFC3339/ISO-8601 text form. |

No additional field is authorized by this closure.

## 4. Explicitly omitted fields

### `external_token`

**NOT PRESENT.**

No external provider is authorized by the current contract, no token format is defined, and the MVP does not perform payment processing. A nullable token column would create storage authority without a semantic need.

### `external_reference`

**NOT PRESENT.**

The same reasoning applies. A generic reference field is not introduced as a future-proofing escape hatch.

### Card/account data

The table must not contain:

- full card number/PAN;
- CVV/CVC;
- PIN;
- bank account credentials;
- payment secrets;
- access tokens;
- private credentials;
- raw provider payloads containing financial credentials.

Masked/derived payment details are also not introduced by convenience because no such semantic requirement is frozen for the MVP.

## 5. Nullability and defaults

No field has an SQL default.

All five persisted fields are required and non-null.

The contract intentionally does not infer defaults such as `method_type`, `display_label`, customer identity, timestamps or lifecycle values.

## 6. Identity and relationship

`PaymentMethod.id` is the internal identity referenced by `Order.payment_method_id`.

`customer_id` is a required foreign-key candidate to `Customer.id`.

The relationship is:

`Customer 1:N PaymentMethod`

and

`Order N:1 PaymentMethod`

This closure does not choose `ON DELETE` or `ON UPDATE` behavior. Those actions remain subject to the schema relationship owner/governance rule and are not invented here.

## 7. Method type semantics

`method_type` is a normalized domain string, not a provider contract.

This contract deliberately does **not** freeze a physical CHECK/enum set such as `PIX`, `CASH`, `CARD`, etc., because the current approved evidence does not provide a normative closed value catalog.

The application/domain layer remains responsible for accepting only semantically valid values defined by its upstream contract.

This avoids silently turning examples into an architectural enum.

## 8. Display label semantics

`display_label` is required because the MVP needs a deterministic human-readable representation of the method that was informed/selected.

It is presentation/business data, not a credential field.

It must never be used to smuggle:

- card numbers;
- CVV/PIN;
- access tokens;
- provider secrets;
- raw authorization headers;
- opaque payment credentials.

## 9. Lifecycle

`PaymentMethod` has **no persisted lifecycle/status column** in the MVP.

The record is treated as an immutable domain record once referenced by an order.

Therefore this physical contract does not introduce:

- `status`;
- `active`;
- `revoked_at`;
- `deleted_at`;
- payment authorization states;
- settlement states;
- capture/refund states.

Those concepts belong to payment processing, which is explicitly outside the current MVP payment contract.

## 10. Mutability

Immutable after creation:

- `id`;
- `customer_id`;
- `method_type`;
- `display_label`;
- `created_at`.

The model is intentionally snapshot-oriented. Changes in a customer's future payment preference should not silently rewrite the method referenced by a historical order.

## 11. Timestamps

Only `created_at` is required.

`updated_at` is intentionally omitted because the entity is immutable in the MVP contract and has no mutable lifecycle state.

All persisted timestamps remain UTC and use the repository's canonical textual timestamp representation.

## 12. Uniqueness

The only normative uniqueness constraint is the primary key:

`UNIQUE(id)` / primary-key identity.

No secondary unique constraint is frozen.

In particular, this contract does **not** invent uniqueness on:

- `(customer_id, method_type)`;
- `(customer_id, display_label)`;
- `(method_type, display_label)`;
- any provider reference.

Reason: the current evidence does not establish the deduplication semantics of customer payment-method records, and forcing a secondary UNIQUE could reject legitimate repeated/snapshot records.

## 13. Security boundary

`payment_method` is a low-data representation of an informed business method.

The physical model MUST remain outside payment-credential storage boundaries.

Secrets and financial credentials belong to provider/security boundaries only when a future approved payment integration defines them. No such integration is defined by this contract.

Logs, diagnostics and audit payloads must not expose any forbidden financial credential because the entity itself does not authorize storing one.

## 14. DDL gate

This document is a physical contract closure artifact only.

It does **not** authorize:

- migration creation;
- migration execution;
- alteration of `0002_c1_product_order.sql`;
- production deployment;
- real payment collection;
- payment provider onboarding.

The existing `0002` file remains physically present and non-authoritative under the operator governance decision.

## 15. Closure

`PHYSICAL_PAYMENT_READY = TRUE`

The minimum PaymentMethod physical contract required for `Order.payment_method_id` is now deterministic without introducing unauthorized payment credentials, provider assumptions, or payment-processing semantics.
