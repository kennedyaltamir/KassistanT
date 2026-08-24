# IA-03 — Ownership

## Primary ownership

Future implementation territory:

- `apps/desktop/electron/infrastructure/events/**`
- `apps/desktop/electron/infrastructure/inbox/**`
- `apps/desktop/electron/infrastructure/outbox/**`
- `apps/desktop/electron/infrastructure/jobs/**`
- `apps/desktop/electron/infrastructure/audit/**`

## Ownership meaning

IA-03 is responsible for implementation quality, tests, invariants, recovery behavior and operational documentation inside these directories. Ownership does not grant authority to redefine global contracts.

## Adjacent boundaries

- IA-01: canonical SQLite schema.
- IA-02: domain runtime/business rules.
- IA-04: Order Engine.
- IA-05: Conversation + LLM.
- IA-06: device authentication, including `gateway/src/device-auth/**`.
- IA-07: Gateway HTTP/WSS, excluding IA-06's device-auth subtree.
- IA-08: Desktop UI and renderer.

## Shared/protected files

`packages/contracts/**`, `docs/protocols/**`, `docs/domain/**`, `docs/backend/**`, the approved baseline, `docs/ROADMAP.md`, root package configuration, lockfiles, workflows and other shared configuration are not owned by IA-03. Any necessary shared change requires explicit integration authority and cross-agent coordination.

## Tests

Tests directly associated with IA-03 infrastructure are IA-03 responsibility when they do not replace another agent's tests or alter another territory.

## Boundary invariant

Infrastructure must implement technical delivery/recovery semantics without becoming the source of business decisions. Cross-boundary behavior must follow approved contracts.

## Current state

No production implementation is claimed in the owned directories. The current repository contains contract documentation and only foundation-level persistence outside this future infrastructure territory.
