# IA-02 — Learnings

## Verified audit learnings

### L-001 — Documentation is ahead of runtime

The domain documentation defines entities, commands, events, invariants and state machines, while the repository implementation currently exposes foundation primitives only. Therefore documentation must not be treated as implementation evidence.

### L-002 — Domain and infrastructure are separate concerns

The approved architecture separates deterministic business rules from SQLite, event transport, providers, Gateway and UI. IA-02 must preserve this boundary.

### L-003 — Domain ambiguity is a hard implementation boundary

`CONTRACT-001` and `CONTRACT-002` can affect domain behavior but remain unresolved. Encoding either interpretation into runtime without an approved decision would be an unauthorized contract decision.

### L-004 — Current primitives are usable foundations, not the complete model

`packages/domain/src/index.ts`, `money.ts`, `time.ts`, `uuidv7.ts`, `persistence.ts` and `llm-provider.ts` establish limited primitives/interfaces. No evidence was found for complete executable aggregates or command handlers.

### L-005 — M5.1 intentionally stopped before business schema

The only migration observed is `0001_bootstrap.sql`, which creates `_schema_metadata`. Canonical entity persistence is future work and belongs to the schema agent's territory, not to be reconstructed inside IA-02.

## Evidence discipline

Future learnings must cite the concrete repository evidence internally in the agent's working process and must not promote inference or preference to fact.
