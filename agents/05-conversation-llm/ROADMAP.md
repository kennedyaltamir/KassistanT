# IA-05 — Roadmap

## Phase A — Territory configuration
Status: COMPLETE.

## Phase B — AI-V1 readiness audit
Status: COMPLETE.

## Phase C — AI-V1 contract closure / decision package
Status: COMPLETE AS PROPOSAL PACKAGE; **BLOCKED FOR APPROVAL**.

Delivered:

- `AI-V1-DECISION-PACKAGE.md`
- `AI-V1-GLOBAL-DECISIONS.md`
- `AI-V1-FIRST-SLICE.md`
- reconciled provider, execution, tool, prompt, conversation, dependency and gate matrices.

Required approvals remain:

1. typed `LLMProvider` request/result/error contract;
2. AIExecution logical and persistence semantics;
3. deterministic tool authorization boundary;
4. prompt identity/version/provenance semantics;
5. external model-selection decision;
6. executable Conversation transition semantics from IA-02;
7. persistence/event dependencies;
8. global `CONTRACT-001`, `CONTRACT-002` and `GOV-001` as applicable.

## Phase D — First contract-test slice
Status: **PROPOSED / READY_AFTER_DECISION**.

Scope proposal: deterministic tests for typed LLM request/result/error behavior and negative validation paths.

No implementation begins until shared contract approval is recorded.

## Phase E — Conversation foundation
Status: NOT_STARTED.

## Phase F — LLM provider runtime
Status: NOT_STARTED.

## Phase G — Integrated Conversation + LLM
Status: NOT_STARTED.

## Phase H — Validation/handoff
Status: NOT_STARTED.

No phase after C may be claimed complete from documentation alone. Runtime completion requires executable tests, security/CI evidence, human review and approved integration.
