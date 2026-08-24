# IA-02 — Ownership

## Primary ownership

`packages/domain/**`

This is the default implementation territory for IA-02.

## Expected future areas within ownership

- `packages/domain/src/entities/**` if introduced by approved design;
- `packages/domain/src/value-objects/**` if introduced;
- `packages/domain/src/commands/**`;
- `packages/domain/src/queries/**`;
- `packages/domain/src/services/**`;
- `packages/domain/src/errors/**`;
- `packages/domain/src/state/**`;
- domain tests colocated with owned runtime.

Directory names above are future organizational possibilities, not claims that they already exist.

## Existing owned foundation

Currently observed under `packages/domain/src/`:

- `index.ts` — exported lifecycle types and foundation primitives;
- `money.ts` — Money primitive;
- `time.ts` — UTC time helpers;
- `uuidv7.ts` — UUIDv7 helpers;
- `persistence.ts` — `TransactionBoundary` type;
- `llm-provider.ts` — minimal provider interface;
- `foundation.test.ts` — foundation tests.

## Protected/shared territory

The following are not owned by IA-02 and require integration authority for changes:

- `packages/contracts/**`;
- `docs/**` normative contract sources;
- root `package.json`;
- `pnpm-lock.yaml`;
- `.github/**`;
- other agents' directories;
- application runtime outside `packages/domain/**`.

## Ownership conflict protocol

When a required change crosses ownership, IA-02 must stop at the boundary, document the file, reason, affected agents, proposed change and validation requirements, and obtain the required authority rather than editing another territory directly.
