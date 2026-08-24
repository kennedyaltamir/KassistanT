# IA-02 — Learnings

## Verified audit learnings

### L-001 — Documentation is ahead of runtime
Domain documentation defines entities, commands, events, invariants and state machines, while repository code exposes foundation primitives only.

### L-002 — Domain and infrastructure are separate concerns
Pure business rules remain independent from SQLite, event transport, providers, Gateway and UI.

### L-003 — Contract ambiguity is a hard implementation boundary
`CONTRACT-001` and `CONTRACT-002` cannot be encoded through local implementation choices.

### L-004 — Foundation primitives are not the complete domain model
`index.ts`, `money.ts`, `time.ts`, `uuidv7.ts`, `persistence.ts` and `llm-provider.ts` are foundations only.

### L-005 — M5.1 intentionally stopped before business schema
Canonical entity persistence is IA-01 territory and remains unimplemented.

## D1 findings

### L-006 — State catalogs are not state machines
Order, Conversation, AI and Message states are enumerated, but normative transition guards are not sufficiently specified. Enum order must never be treated as transition order.

### L-007 — Aggregate boundaries are not explicit
`Order` is a plausible root but only an inference. Domain runtime must not assume aggregate ownership without explicit contract evidence.

### L-008 — Command names do not equal executable contracts
The order command catalog lacks complete canonical input, output, event, error, idempotency and authorization semantics.

### L-009 — Event contract has normative mismatch
`packages/contracts/src/events.ts` includes `order.status_changed`, while the normative documentation intentionally leaves its status ambiguous under CONTRACT-002.

### L-010 — D1 can narrow the implementation gate without implementing code
A safe first increment can be defined as a pure, infrastructure-free slice after contract lock; no such slice is authorized yet.
