# IA-04 — Handoff

## Territory

IA-04 owns the deterministic Order Engine at `apps/desktop/electron/order/**`.

## What the next agent must know

1. The product baseline is authoritative; local agent documents do not override it.
2. `CONFIRMED` is the operational sale milestone.
3. Order lifecycle is `DRAFT`, `CONFIRMED`, `IN_PRODUCTION`, `READY`, `OUT_FOR_DELIVERY`, `DELIVERED`, `CANCELLED`.
4. Order commands are documented but executable command schemas remain partial.
5. Money is integer cents/BRL and totals must be deterministic.
6. Confirmed orders freeze price state; terminal states do not reopen.
7. Confirmation requires final summary plus unequivocal confirmation.
8. Critical confirmation persistence and durable external effect are specified as an atomic transaction boundary.
9. LLM output is not authoritative for price, money, totals, or lifecycle state.
10. IA-01 owns canonical SQLite schema/persistence schema.
11. IA-02 owns domain model/business rules/domain runtime.
12. IA-03 owns EventBus, Inbox, Outbox, Queue and Audit infrastructure.
13. IA-05 owns Conversation + LLM.
14. IA-06 owns Device Authentication.
15. IA-07 owns Gateway + WSS.
16. IA-08 owns Desktop UI.

## Blockers to preserve

- `CONTRACT-001` DomainOutbox ownership/scope is unresolved.
- `CONTRACT-002` `order.status_changed` is unresolved.
- Canonical domain error codes are incomplete.
- Actor permission details are partial.
- Several canonical entity field schemas are partial.

Do not resolve these locally. Escalate global decisions through the integration authority.

## Current implementation status

No verified production Order Engine implementation exists in the audited repository state. The configuration phase created documentation only; product implementation remains frozen.

## Shared files

`packages/contracts/**`, `docs/**`, baseline, package/tooling/configuration files and other agent directories are protected/shared by default. Any required shared change needs explicit authority and an impact/test record.

## External dependencies

The Order Engine itself has no identified required external platform configuration at this phase. External integrations are consumed through other boundaries and must not be configured by IA-04 without a later explicit assignment.

## Continuation rule

Before implementation, reread this file, `MEMORY.md`, `LEARNINGS.md`, `DECISIONS.md`, `ERRORS.md`, and the current `main` contracts. Re-audit the repository if the global contracts or ownership registry changed.
