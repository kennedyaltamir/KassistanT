# IA-02 — Proposed First Domain Slice

## Status

`BLOCKED`

## Candidate

`Order` aggregate with one command and one transition.

## Why this candidate

Order has the strongest documented business surface: lifecycle, deterministic totals, confirmation milestone, price-freeze invariant and a coherent command vocabulary.

## Required shape

- Aggregate: `Order`.
- Command: one complete command, candidate `ConfirmOrder`.
- Transition: candidate `DRAFT -> CONFIRMED`.
- Invariants: deterministic total, valid draft, final summary, unequivocal confirmation, price freeze after confirmation.
- Errors: invalid transition, incomplete confirmation data, duplicate operation; exact final semantics still partial.
- Event: `order.confirmed` is documented; no local use of `order.status_changed` while CONTRACT-002 remains open.
- Persistence: pure domain model may be in-memory; durable persistence is outside IA-02 and requires IA-01 alignment.
- Event infrastructure: domain event production is separable from EventBus/Outbox mechanics; IA-03 owns delivery infrastructure.
- Tests: aggregate invariant tests, transition tests, invalid-input/error tests and deterministic calculations.

## Readiness assessment

| Criterion | Status | Blocker |
|---|---|---|
| Aggregate root explicitly authorized | BLOCKED | DREQ-001 |
| Complete command contract | BLOCKED | DREQ-005 plus command semantics |
| Normative transition | BLOCKED | DREQ-002 |
| Invariants | PARTIAL / mostly defined | exact confirmation semantics |
| Domain errors | PARTIAL | stable semantic contract incomplete |
| Event semantics | PARTIAL | `order.confirmed` usable; contested status event unresolved |
| Persistence dependency | UNDERSTOOD | IA-01 boundary needed only for persistence integration |
| Event infrastructure dependency | UNDERSTOOD | IA-03 needed for durable delivery, not pure event creation |
| Authorization | BLOCKED for actor-sensitive behavior | DREQ-006 |
| Tests | READY TO SPECIFY | implementation not started |

## Why not call this READY

At least the aggregate boundary, transition semantics, command/error semantics and actor boundary still require cross-agent or global decisions. Declaring this slice ready would encode unresolved architecture as implementation.

## Smallest independent work before D2

No new product runtime slice is currently both non-trivial and fully contract-independent.

The existing `Money`, UUIDv7 and UTC primitives are already implemented foundation pieces; duplicating them would not constitute a meaningful first Domain Runtime increment.

Therefore the correct action is to close the minimum decision set first, then implement the Order slice above.
