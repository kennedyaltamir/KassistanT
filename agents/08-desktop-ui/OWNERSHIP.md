# Ownership — IA-08

## Future ownership
- `apps/desktop/src/**`: renderer/UI composition and user experience.
- `packages/ui/**`: reusable UI primitives and design-system implementation.

## Shared/boundary areas
`apps/desktop/electron/main.cjs` and `preload.cjs` are security-sensitive integration boundaries; changes require explicit scope/contract alignment. IPC contracts are not owned unilaterally. `packages/contracts/**`, `packages/domain/**`, database and Gateway remain outside IA-08 ownership.

## Coupling rule
UI may depend on published contracts, not duplicate or silently reinterpret domain logic.

## Evidence
Current `packages/ui/src` is a minimal package entrypoint; no design-system implementation was observed.
