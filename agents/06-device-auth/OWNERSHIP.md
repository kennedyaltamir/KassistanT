# IA-06 Ownership

## Primary future ownership

The agent registry assigns IA-06 the following runtime territory:

- `apps/desktop/electron/auth/**`
- `gateway/src/device-auth/**`
- tests directly associated with device authentication.

This ownership is future implementation ownership. It does not imply that the paths are currently implemented.

## Current observed state

- `apps/desktop/electron/auth/**`: no verified device-auth runtime was found during this audit.
- `gateway/src/device-auth/**`: no verified device-auth runtime was found during this audit.
- Device authentication tests: no verified runtime test suite was found during this audit.

Therefore the territory is currently `NOT_IMPLEMENTED` despite having contractual documentation.

## Shared/protected territory

IA-06 may read but must not independently modify:

- `packages/contracts/**`
- `docs/protocols/**`
- `docs/backend/**`
- `docs/domain/**`
- `docs/ROADMAP.md`
- `KassisT_Approved_Technical_Baseline_v1.0.1.md`
- `package.json`
- `pnpm-lock.yaml`
- `.github/**`
- shared TypeScript configuration
- other agent directories.

## Cross-boundary files

If implementation requires a shared-file change, IA-06 must document:

1. exact file;
2. reason;
3. proposed change;
4. impact;
5. affected agents;
6. required tests;
7. approval required.

No shared-file change is authorized by ownership alone.

## Gateway boundary

IA-06 owns `gateway/src/device-auth/**`, while IA-07 owns the remainder of `gateway/**`. The boundary must be treated as explicit. Generic HTTP/WSS routing, transport sequencing, replay/resume and Gateway operations remain IA-07 territory.

## Desktop boundary

IA-06 owns privileged device-auth runtime under `apps/desktop/electron/auth/**`. UI, renderer and operational screens remain IA-08 territory. The private key must never be exposed to the Renderer merely for UI convenience.
