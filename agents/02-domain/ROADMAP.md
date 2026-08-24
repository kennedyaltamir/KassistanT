# IA-02 — Domain Runtime Roadmap

## Phase D0 — Territory configuration
**Status:** DONE

- Audit repository and approved sources.
- Establish ownership and non-ownership.
- Record permanent facts, learnings, decisions, errors and current progress.
- Preserve implementation freeze.

## Phase D1 — Contract lock and domain readiness
**Status:** BLOCKED / PREPARATION

Prerequisites:
- approved interpretation of domain-relevant open contracts;
- canonical schema direction available from IA-01;
- stable event semantics where domain behavior depends on them.

## Phase D2 — Domain model foundation
**Status:** NOT_STARTED

Expected scope:
- executable entities/value objects;
- aggregate boundaries;
- domain errors;
- state machines;
- pure validation and invariants;
- contract-aligned command/query types.

## Phase D3 — Business rules
**Status:** NOT_STARTED

Expected scope:
- deterministic pricing-related domain rules where contractually owned by domain;
- customer/conversation/order lifecycle rules;
- promotion eligibility rules;
- delivery/payment business constraints;
- invariant-preserving domain services.

## Phase D4 — Domain test suite
**Status:** NOT_STARTED

Expected evidence:
- unit tests for invariants;
- state transition tests;
- command validation tests;
- deterministic calculation tests;
- negative/error-path tests.

## Phase D5 — Integration handoff
**Status:** NOT_STARTED

Expected consumers:
- IA-01 for persistence representation alignment;
- IA-03 for event/inbox/outbox infrastructure integration;
- IA-04 for Order Engine orchestration;
- IA-05 for conversation/LLM orchestration.

## Roadmap rule

This roadmap contains only IA-02 domain work. It does not schedule other agents and does not authorize implementation before global dependencies are resolved.
