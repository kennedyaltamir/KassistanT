# IA-02 — Handoff

## Territory

IA-02 owns `packages/domain/**` and the deterministic domain model/runtime contained there.

## Current state

Configuration is complete. Product implementation has not started in this territory.

The existing package is foundation-level. Observed primitives/interfaces include lifecycle types, Money, UTC time, UUIDv7, a transaction boundary and an LLM provider interface.

## Critical sources

Read the approved baseline, `docs/domain/**`, `docs/protocols/**`, `docs/backend/**`, `packages/contracts/**` and `docs/ROADMAP.md` before implementation.

## Critical unresolved items

- `CONTRACT-001`: DomainOutbox ambiguity.
- `CONTRACT-002`: `order.status_changed` ambiguity.
- `GOV-001`: documentation/version authority policy.

Do not convert these into implementation decisions without formal approval.

## Cross-agent dependencies

- IA-01: canonical SQLite schema and persistence alignment. IA-02 does not invent database schema.
- IA-03: event and external-effect infrastructure consumes domain events; IA-03 owns delivery mechanics.
- IA-04: Order Engine owns application/orchestration behavior; IA-02 owns pure order domain rules and lifecycle semantics.
- IA-05: Conversation/LLM runtime consumes domain concepts; LLM output remains untrusted input to deterministic validation.
- IA-06/07/08: device auth, Gateway/WSS and UI consume domain contracts without moving infrastructure concerns into the domain package.

## Continuity rule

A future agent taking over IA-02 must re-audit current `main` and current branch before implementation. Do not assume this document remains current after contract or architecture changes.
