# IA-02 — Domain Readiness Audit

**Phase:** D1 — Contract Lock and Domain Readiness + Reconciliation
**Branch:** `Agent02-domain-runtime`
**Main reference:** `c9b79ae5ef90f4161261a93647d21d36773dd8e3`
**Status:** `COMPLETE / IMPLEMENTATION_FROZEN`

## Executive verdict

The Domain Runtime is **NOT implementation-ready**. The repository contains foundation primitives only; executable entities, aggregate implementations, complete command contracts, normative lifecycle matrices and a final domain error catalog are absent.

## Canonical entity count

**28.**

The previous D1 prose statement "29-entity inventory" was an erroneous count. The actual D1 inventory table has 28 rows, and `docs/domain/entities.md` explicitly lists the same 28 canonical entities and identifies baseline §23 as its source. No additional 29th entity was found.

See `CANONICAL-ENTITY-INVENTORY.md` and `D1-RECONCILIATION.md`.

## Aggregate status

No aggregate root is normatively frozen.

- `Order`: candidate root / STRONG_INFERENCE.
- `Conversation`: candidate root / INFERENCE.
- No other aggregate root is explicit.

## State-machine status

`OrderLifecycle`, `ConversationLifecycle` and `MessageLifecycle` remain **STATE_CATALOG_ONLY**. Invalid transitions are required to be rejected, terminal Order states do not reopen under current rules, and `CONFIRMED` is the operational sale milestone; a complete transition matrix is still missing.

## Command status

The twelve documented Order commands remain PARTIAL. `ConfirmOrder` is additionally blocked by unresolved event semantics. No new domain commands are introduced.

## Value-object status

- `Money`: IMPLEMENTED FOUNDATION.
- `UUIDv7`: IMPLEMENTED FOUNDATION.
- UTC timestamp: IMPLEMENTED FOUNDATION.
- Quantity: documented primitive rule.
- Phone, Address, IdempotencyKey, CorrelationId and CausationId: PARTIAL.
- Email: incomplete canonical contract.

## Invariants

Documented invariants include positive quantity, integer BRL cents, deterministic totals, `CONFIRMED` as sale milestone, price freeze after confirmation, terminal-state protection, final-summary confirmation and rejection of invalid transitions.

## Contract blockers

- `CONTRACT-001`: DomainOutbox ownership/scope — CRITICAL.
- `CONTRACT-002`: `order.status_changed` normative status — HIGH.
- `GOV-001`: document authority/version history — MEDIUM.

## First slice

`Order` remains the strongest candidate, but **FIRST_SLICE_STATUS = BLOCKED/PARTIAL**. It lacks a normatively frozen aggregate boundary, complete command contract, transition matrix, stable error semantics and fully reconciled event/persistence boundaries.

## D2 gate

D2 may begin only after the selected first slice has all required semantics explicitly frozen and does not depend on unresolved global contracts.
