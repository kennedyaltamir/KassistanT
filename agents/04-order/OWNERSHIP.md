# IA-04 — Ownership

## Primary ownership

**Runtime directory:** `apps/desktop/electron/order/**`

All future production Order Engine implementation is confined to this directory unless the integration authority explicitly authorizes a shared-file change.

## Tests

Tests directly associated with the Order Engine are part of IA-04's functional territory. Their exact repository location is `NOT_VERIFIED` from the current bootstrap; no test directory is claimed outside the runtime ownership without evidence.

## Shared/protected resources — read-only by default

IA-04 may consume but must not modify during normal implementation:

- `packages/contracts/**`
- `docs/protocols/**`
- `docs/domain/**`
- `docs/backend/**`
- `docs/ROADMAP.md`
- `KassisT_Approved_Technical_Baseline_v1.0.1.md`
- `package.json`
- `pnpm-lock.yaml`
- `.github/**`
- TypeScript configuration files
- other agents' directories

Any required shared change must be escalated with file, reason, proposed change, impact, affected agents, and required tests.

## Ownership exclusions

IA-04 does not own:

- `apps/desktop/database/migrations/**`
- `apps/desktop/electron/database/schema/**`
- `packages/domain/**`
- `apps/desktop/electron/infrastructure/events/**`
- `apps/desktop/electron/infrastructure/inbox/**`
- `apps/desktop/electron/infrastructure/outbox/**`
- `apps/desktop/electron/infrastructure/jobs/**`
- `apps/desktop/electron/infrastructure/audit/**`
- `apps/desktop/electron/conversation/**`
- `apps/desktop/electron/providers/llm/**`
- `apps/desktop/electron/auth/**`
- `gateway/**`
- `apps/desktop/src/**`
- `packages/ui/**`

## Current state

`apps/desktop/electron/order/**` was audited for this configuration phase; executable Order Engine implementation is `NOT_VERIFIED` and the repository contract registry states the Order State implementation is not implemented.

The configuration files under `agents/04-order/**` are owned by IA-04 and are the only files modified during this phase.
