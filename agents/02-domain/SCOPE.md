# IA-02 — Scope

## In scope

The domain boundary is the deterministic business model inside `packages/domain/**`:

- entities and aggregate invariants;
- value objects and domain primitives;
- domain commands and validation;
- domain queries where they are pure domain contracts;
- domain event concepts/types when owned by the domain model, without transport infrastructure;
- lifecycle/state-machine transition rules;
- domain errors;
- pure domain services and business rules;
- deterministic calculations and validation;
- domain-facing interfaces that remain infrastructure-agnostic.

## Explicitly out of scope

- SQL schema, migrations, indexes and database adapters: IA-01.
- persistence transaction implementation and database repositories: IA-01/IA-03 according to the concrete boundary.
- EventBus, Inbox, Outbox, Queue, Replay and Audit infrastructure: IA-03.
- Electron process/application orchestration: other designated territories.
- Order Engine orchestration under `apps/desktop/electron/order/**`: IA-04.
- Conversation and LLM runtime: IA-05.
- device authentication: IA-06.
- Gateway/WSS transport: IA-07.
- UI and renderer behavior: IA-08.
- external provider SDKs and credentials.
- global contract changes.

## Boundary rule

A concern belongs to IA-02 only when its correctness can be expressed as domain behavior without requiring transport, persistence technology, external provider state or UI state.

## Dependency rule

IA-02 may consume approved contract types where necessary, but should keep the domain model independent from infrastructure implementations.

## Current status

The repository proves only a domain foundation. Full runtime entities, commands, services and executable lifecycle logic are NOT_IMPLEMENTED.
