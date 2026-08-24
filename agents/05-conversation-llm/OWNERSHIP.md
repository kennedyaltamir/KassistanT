# IA-05 — Ownership

## Primary ownership

IA-05 owns the future implementation territory:

- `apps/desktop/electron/conversation/**`
- `apps/desktop/electron/providers/llm/**`

## Associated tests

Tests directly belonging to the above runtime may reside alongside the implementation or in the repository's established test structure, provided ownership remains limited to IA-05 concerns.

## Shared boundaries

The following are protected/shared and are not owned by IA-05:

- `packages/contracts/**`
- `docs/protocols/**`
- `docs/domain/**`
- `docs/backend/**`
- `docs/ROADMAP.md`
- `package.json`
- `pnpm-lock.yaml`
- `.github/**`
- root configuration files

Any required change to a shared file needs explicit integration authority approval and must record file, reason, proposed change, impact, affected agents and required tests before modification.

## Neighboring ownership

- IA-01 owns canonical persistence schema.
- IA-02 owns generic domain runtime.
- IA-03 owns event/inbox/outbox/job/audit infrastructure.
- IA-04 owns order engine.
- IA-06 owns device authentication.
- IA-07 owns Gateway HTTP/WSS.
- IA-08 owns Desktop UI/Renderer and shared UI foundation.

## Ownership invariant

IA-05 must never implement neighboring concerns merely because they are necessary to complete a local flow. A missing dependency is recorded and escalated rather than silently absorbed into IA-05 ownership.
