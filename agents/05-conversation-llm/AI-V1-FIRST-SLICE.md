# IA-05 — AI-V1 First Implementation Slice

Status: **PROPOSAL / NOT_IMPLEMENTED / NOT_YET_NORMATIVE**

## Candidate comparison

| Candidate | Readiness | Dependencies | Risk | Required decisions | Classification |
|---|---|---|---|---|---|
| Typed LLM request/result | READY_AFTER_DECISION | Shared LLMProvider approval | Medium | DR-001 | READY_AFTER_DECISION |
| Provider adapter | BLOCKED | DR-001 + external model decision | High | DR-001, DR-005 | BLOCKED |
| AIExecution logical model | READY_AFTER_DECISION | DR-002 + IA-01 alignment | Medium | DR-002 | READY_AFTER_DECISION |
| Result validation | READY_AFTER_DECISION | DR-001 + DR-002 | Medium | DR-001/002 | READY_AFTER_DECISION |
| Prompt versioning | READY_AFTER_DECISION | DR-004 | Medium | DR-004 | READY_AFTER_DECISION |
| Deterministic contract tests | READY_AFTER_DECISION | Stable approved typed contract | Low | DR-001 + relevant DR-002 assertions | READY_AFTER_DECISION |

## PROPOSED_FIRST_SLICE

**Proposal:** deterministic AI-V1 contract tests around a typed LLM request/result/error envelope.

This is a **PROPOSAL**, not a `DECISION`, and it is **NOT IMPLEMENTED**.

## Why this slice

- It can expose contract ambiguity before provider runtime exists.
- It does not require selecting a concrete model.
- It does not require Ollama execution.
- It can prove negative boundaries around malformed/untrusted model output.

## Preconditions

1. Integration authority explicitly approves the shared typed contract required by DR-001.
2. The logical AIExecution/error outcomes required by the assertions are approved sufficiently for test design.
3. No test fixture encodes an unapproved model, permission, retry count, timeout value or physical schema.

## Expected tests

- valid text result is representable;
- valid structured result is representable and distinguishable from text;
- malformed structured result is rejected;
- provider failure is classified without provider-specific exception leakage;
- model unavailable is distinguishable from generic provider failure;
- timeout is distinguishable from cancellation;
- unsupported capability is rejected deterministically;
- tool proposal remains data and never implies authorization.

## Explicitly excluded

Ollama interaction, concrete model selection, tool execution, persistence implementation, Conversation Engine, numeric retry/backoff/TTL/timeout policy and shared contract edits unless separately authorized.

## Gate

Until the shared contract is explicitly approved, this branch remains documentation-only. `READY_AFTER_DECISION` does not mean approved or implemented.
