# IA-04 — Errors / Risks

## E-001 — CONTRACT-002 ambiguity

- Severity: HIGH
- Status: OPEN
- Problem: `order.status_changed` is contradictory between the baseline and current TypeScript contract.
- Impact: event emission, tests, EventBus integration and downstream consumers.
- Rule: do not resolve silently.

## E-002 — CONTRACT-001 ambiguity

- Severity: HIGH
- Status: OPEN
- Problem: DomainOutbox ownership/scope across local Core and Gateway is not fully specified.
- Impact: confirmation transaction, durability, external effects, retry/recovery and integration boundaries.
- Rule: do not invent ownership semantics.

## E-003 — Canonical domain error catalogue incomplete

- Severity: HIGH
- Status: OPEN
- Problem: deterministic rejection requirements exist, but canonical error codes are missing.
- Impact: stable runtime errors and tests.
- Rule: mark unknown codes as unresolved rather than inventing global contract values.

## E-004 — Actor permissions partial

- Severity: MEDIUM/HIGH
- Status: OPEN
- Problem: documented order state transitions do not fully define actor permissions.
- Impact: command authorization and cancellation/transition behavior.
- Rule: do not invent authorization policy.

## E-005 — Canonical entity fields partial

- Severity: HIGH
- Status: OPEN
- Problem: several canonical entity field schemas remain partial.
- Impact: Order Engine persistence/application integration.
- Owner dependency: IA-01 / IA-02 as applicable.

## E-006 — Implementation absent

- Severity: INFORMATIONAL for configuration phase
- Status: CONFIRMED
- Problem: the repository contract registry records Order State as not implemented and M5.1 explicitly excluded the Order Engine.
- Impact: configuration documents must not claim runtime completion.
