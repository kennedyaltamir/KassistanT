# IA-05 — Roadmap

## Purpose

Territory roadmap only. This document does not change the global KassisT roadmap and introduces no architectural decision.

## Phase A — Configuration and audit

Status: COMPLETE.

- Establish IA-05 identity and authority limits.
- Audit baseline, contracts, domain state model, provider boundary and repository runtime.
- Define scope and ownership.
- Record confirmed facts, learnings, decisions, errors and handoff requirements.

## Phase B — Contract closure

Status: PENDING.

Prerequisites:

- AI-V1 executable contract must be sufficiently defined.
- Tool authorization/execution envelope must be unambiguous.
- Prompt/version semantics must be sufficiently defined for implementation.
- Global ambiguities affecting the territory must remain governed by integration authority.

## Phase C — Conversation foundation

Status: NOT_STARTED.

Future work, subject to dependencies and authorization:

- Conversation orchestration.
- Ownership and AI-state enforcement.
- Message processing lifecycle.
- Human takeover and pause/resume.
- Deterministic context assembly.
- Error/timeout/cancellation model.

Primary dependencies: IA-01 schema, IA-02 domain runtime, IA-03 event/inbox infrastructure.

## Phase D — LLM provider runtime

Status: NOT_STARTED.

Future work:

- `LLMProvider` runtime implementation.
- Ollama adapter.
- Health/model discovery/model selection.
- Chat execution.
- Structured output.
- Optional tools where capability and authorization permit.
- Execution limits, timeout and cancellation.
- Degraded/unavailable behavior.

External dependency: local Ollama installation/model availability and future benchmark decision for model selection.

## Phase E — Integrated Conversation + LLM

Status: NOT_STARTED.

Future work:

- Connect Conversation Engine to `LLMProvider`.
- Assemble authoritative Knowledge Base context.
- Validate structured model results.
- Route candidate actions to deterministic Core.
- Persist/observe `AIExecution` according to final schema/contract.
- Prove failure, timeout, cancellation and unavailable-model paths.

## Phase F — Validation and handoff

Status: NOT_STARTED.

Required evidence before claiming completion:

- Unit tests for state transitions and provider boundaries.
- Contract tests for AI-V1.
- Integration tests for Conversation ↔ persistence/events ↔ provider.
- Negative tests proving LLM output cannot bypass business rules.
- Evidence tied to the actual PR HEAD.
- Human review and approved merge.
- Updated handoff and operational records.
