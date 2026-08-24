# IA-02 — Handoff

## Territory
`packages/domain/**`

## Current phase
D1 Decision Package / First Slice Preparation

## Current result
Runtime implementation remains frozen. Decision package is complete, but D2 is blocked.

## Canonical inventory closure
- Canonical entity count: **28**.
- Previous D1 count of 29 was a reporting/counting error.
- No 29th entity is evidenced by the baseline, domain entity catalog, contracts or runtime.

## Decision package
- `DOMAIN-DECISION-PACKAGE.md`
- `DOMAIN-GLOBAL-DECISIONS.md`
- `FIRST-DOMAIN-SLICE.md`
- `DOMAIN-INTEGRATION-GATES.md`

## Critical findings
- No aggregate root is normatively frozen.
- `Order` is the strongest candidate, but remains `INFERENCE`.
- Lifecycle artifacts remain `STATE_CATALOG_ONLY`.
- Order command contracts are partial.
- Domain error semantics are incomplete for a command-ready slice.
- `CONTRACT-001` blocks Outbox-integrated behavior, not inherently pure in-memory validation.
- `CONTRACT-002` blocks slices that require `order.status_changed`; it need not block an approved slice that avoids it.
- `GOV-001` remains a governance decision outside IA-02 authority.

## First-slice conclusion
No non-trivial first Domain Runtime slice is currently `READY`. The proposed first slice is an Order-oriented pure domain slice, candidate `ConfirmOrder` with `DRAFT -> CONFIRMED`, but it is `BLOCKED` pending the minimum decision set.

## Consumers/dependencies
- IA-01: canonical schema/persistence boundary when persistence is required.
- IA-03: EventBus/Outbox/Inbox/Audit infrastructure for durable event handling.
- IA-04: Order Engine orchestration and application boundary.
- IA-05: Conversation/LLM runtime supplies untrusted candidate actions.
- IA-06/07/08: authentication, transport and UI boundaries remain external to domain authority.

## D2 gate
Do not implement until aggregate boundary, one normative transition, one complete command/error contract, stable event semantics and deterministic test strategy are explicit and free of unresolved architectural assumptions.
