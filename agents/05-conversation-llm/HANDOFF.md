# IA-05 — Handoff

## Territory

IA-05 owns `apps/desktop/electron/conversation/**` and `apps/desktop/electron/providers/llm/**` plus directly associated tests.

## Current readiness

**HOLD / BLOCKED_BY_CONTRACT_GAPS**.

The AI-V1 Decision Package is complete as a proposal package. Production runtime is not implemented.

## Decision package

- `AI-V1-DECISION-PACKAGE.md`
- `AI-V1-GLOBAL-DECISIONS.md`
- `AI-V1-FIRST-SLICE.md`
- `AI-V1-READINESS.md`
- `LLM-PROVIDER-MATRIX.md`
- `AI-EXECUTION-CONTRACT.md`
- `TOOL-AUTHORIZATION-MATRIX.md`
- `PROMPT-VERSION-MATRIX.md`
- `CONVERSATION-LIFECYCLE-MATRIX.md`
- `AI-DEPENDENCIES.md`
- `IMPLEMENTATION-GATES.md`

## Critical blockers

- Shared typed `LLMProvider` contract requires approval.
- AIExecution semantics require IA-01/IA-03 alignment.
- Tool authorization requires a deterministic independent boundary.
- Prompt/version/provenance requires cross-agent alignment.
- Conversation transitions require IA-02 authoritative semantics.
- Model selection is external/open.
- IA-01 persistence dependency unfinished.
- IA-03 event/audit dependency unfinished.
- `CONTRACT-001`, `CONTRACT-002` and `GOV-001` remain global decisions.

## Proposed first slice

Deterministic contract tests around a typed LLM request/result/error envelope, after the shared contract approval. This is a **PROPOSAL**, not a decision and not implemented.

## Critical invariants

1. Model output is untrusted.
2. Model output cannot directly persist business state.
3. Tools cannot bypass deterministic authorization/validation.
4. Human takeover is a state boundary, not a prompt convention.
5. Conversation, ownership, AI and message state machines remain distinct.
6. Provider-specific behavior remains behind `LLMProvider`.
7. No concrete model is a normative default until externally/integration approved.

## Handoff state

Only `agents/05-conversation-llm/**` was changed. No product code, shared contracts, schema, global docs or external platforms were modified. No merge, approval or Ready-for-Review action was performed.
