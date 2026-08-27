# AG-UX-01 — Implementation Task Packet v1.1

**Agent:** `AG-UX-01`  
**Territory:** UX, UI, Web & Conversão  
**Implementation state:** AUTHORIZED for P0-006 within UI/documentation scope.

## Baseline requirement

- Baseline ref: `MVP2`.
- Before any file change, record exact `BASELINE_SHA_AT_START`, task branch and task ID.
- `main` is reference-only unless explicitly authorized by the task.
- If `GOVERNANCE/IMPLEMENTATION_BASELINE.md` or the authoritative packet is unavailable on `MVP2`, report `BASELINE_MISMATCH` and stop before editing.

## Mission

Apply D-006 consistently without silently renaming domain contracts or coupling the product model to WhatsApp.

## P0-006 — Canonical Conversation/Message terminology

**Issue:** #48

### Canonical terminology

- `Conversas` = UI/navigation experience
- `Conversation` = domain concept
- `Message` = domain concept
- `Contact` = domain concept
- `Channel/Provider` = transport/integration concept
- `WhatsApp` = concrete channel/provider

### Allowed paths

- UI/navigation paths
- renderer presentation paths
- assigned product terminology documentation
- tests directly associated with UI terminology

### Protected paths

- domain contracts
- backend/core schemas
- `packages/contracts/**`
- IA-05/IA-07/IA-03/IA-06 implementation paths unless explicitly coordinated and authorized
- governance files except task-specific documentation explicitly permitted

### Dependencies

- D-006 Decision Log entry
- `GOVERNANCE/TERMINOLOGY.md`
- `GOVERNANCE/IMPLEMENTATION_BASELINE.md`
- existing UI navigation and renderer state on `MVP2`

### Acceptance

- navigation labels consistently use `Conversas` where the experience is provider-neutral;
- `WhatsApp` remains visible where identifying the concrete channel is useful;
- no domain contract is silently renamed;
- terminology is consistent across UI, copy and documentation;
- screenshots/runtime evidence demonstrate affected surfaces when a UI surface exists.

### Required tests

- UI/navigation regression tests where available;
- terminology cross-check;
- renderer smoke checks where available;
- changed-path review.

## Collaboration

Consult AG-ENG-01 or AG-AI-01 only when a UI change exposes a real cross-boundary contract issue. Do not expand P0-006 into domain or backend refactoring.

## Evidence

Report baseline ref, starting SHA, branch, changed paths, final SHA, tests and any UI limitations.

## Forbidden

- changing business/domain contracts;
- changing provider semantics;
- altering architecture;
- merge/release approval;
- silent baseline/ref changes.
