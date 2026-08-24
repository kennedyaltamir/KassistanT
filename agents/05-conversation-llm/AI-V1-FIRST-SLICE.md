# IA-05 — AI-V1 First Implementation Slice

Status: **PROPOSED / NOT IMPLEMENTED**

## Candidate comparison

| Candidate | Readiness | Dependencies | Risk | Required decisions | Classification |
|---|---|---|---|---|---|
| Typed LLM request/result | READY_AFTER_DECISION | Shared LLMProvider contract | Medium | DR-001 | READY_AFTER_DECISION |
| Provider adapter | BLOCKED | Typed provider contract, model decision, Ollama runtime semantics | High | DR-001, DR-005 | BLOCKED |
| AIExecution state model | READY_AFTER_DECISION | Logical AIExecution contract + IA-01 alignment | Medium | DR-002 | READY_AFTER_DECISION |
| Result validation | READY_AFTER_DECISION | Typed result envelope + structured-output contract | Medium | DR-001/002 | READY_AFTER_DECISION |
| Prompt versioning | READY_AFTER_DECISION | Prompt contract + AIExecution reference | Medium | DR-004 | READY_AFTER_DECISION |
| Deterministic contract tests | READY_AFTER_DECISION | Stable typed contract | Low | DR-001/002 | READY_AFTER_DECISION |

## PROPOSED_FIRST_SLICE

**Deterministic AI-V1 contract tests around a typed LLM request/result/error envelope**, together with the minimal shared contract decision required to make those tests meaningful.

This is a proposal, not an approval and not an implementation.

## Why this slice

- It does not require choosing a concrete model.
- It does not require implementing Ollama.
- It exposes ambiguity before runtime code exists.
- It creates executable evidence for the contract rather than relying only on documentation.
- It can be designed with deterministic fixtures and negative cases.
- It preserves the separation between LLM interpretation and Core authority.

## Required preconditions

1. DR-001 approved: typed LLMProvider boundary.
2. AIExecution logical result/error semantics sufficiently approved for test assertions.
3. No unresolved decision may be hidden inside provider-specific test fixtures.

## Expected tests

- valid text result is representable;
- valid structured result is representable and distinguishable from text;
- malformed structured result is rejected;
- provider failure is classifiable without provider-specific exception leakage;
- model unavailable is distinguishable from generic provider failure;
- timeout is distinguishable from cancellation;
- unsupported capability is rejected deterministically;
- tool proposal remains data and never implies authorization.

## Explicitly excluded

- Ollama network/process interaction;
- concrete model selection;
- tool execution;
- persistence implementation;
- Conversation Engine;
- retry counts/backoff algorithms;
- global contract edits in this branch.

## Gate to implementation

The proposed slice may begin only after the integration authority approves the shared contract changes required outside IA-05's documentation territory. Until then the branch remains documentation-only.
