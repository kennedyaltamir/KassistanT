# IA-05 — Handoff

## Territory

IA-05 owns `apps/desktop/electron/conversation/**` and `apps/desktop/electron/providers/llm/**` plus directly associated tests. Documentation authority for this phase is `agents/05-conversation-llm/**`.

## Current readiness

**HOLD / BLOCKED_BY_CONTRACT_GAPS / PROPOSAL_ONLY**.

Production runtime is not implemented.

## Approval entry point

`AI-V1-APPROVAL-REQUEST.md` is the single entry point for integration approval. DR-001..DR-007 remain `PROPOSAL / PENDING_APPROVAL`.

## Package

- `AI-V1-DECISION-PACKAGE.md`
- `AI-V1-GLOBAL-DECISIONS.md`
- `AI-V1-FIRST-SLICE.md`
- `AI-V1-APPROVAL-REQUEST.md`
- `AI-V1-READINESS.md`
- `LLM-PROVIDER-MATRIX.md`
- `AI-EXECUTION-CONTRACT.md`
- `TOOL-AUTHORIZATION-MATRIX.md`
- `PROMPT-VERSION-MATRIX.md`
- `CONVERSATION-LIFECYCLE-MATRIX.md`
- `AI-DEPENDENCIES.md`
- `IMPLEMENTATION-GATES.md`

## Cross-agent validation

**FACT:** Current ownership documents for IA-01, IA-02, IA-03 and IA-04 are consistent with the IA-05 proposals. No structural ownership conflict was found in the audited evidence set.

IA-05 consumes:

- IA-01 physical persistence contracts;
- IA-02 authoritative domain state/error semantics;
- IA-03 durable event/audit/recovery semantics;
- IA-04 order commands only through the approved tool boundary.

IA-05 does not absorb those ownerships.

## Critical blockers

- Shared typed `LLMProvider` contract requires approval.
- AIExecution logical semantics require IA-01/03 alignment.
- Tool authorization requires an independent deterministic boundary.
- Prompt/version/provenance requires cross-agent alignment.
- Conversation transitions require IA-02 authoritative semantics.
- Concrete model selection remains external/open.
- `CONTRACT-001` and `CONTRACT-002` remain global/open.
- `GOV-001` is non-blocking for proposal documentation but relevant before normative approval.

## Proposed first slice

Deterministic contract tests around a typed LLM request/result/error envelope after explicit shared-contract approval. This is a **PROPOSAL**, not a decision, and is not implemented.

## Evidence truth

`TEST_STATUS = NOT_RUN / NOT_REQUIRED_FOR_DOCUMENT_ONLY_EXECUTION`  
`CI_STATUS = NOT_VERIFIED`  
`SECURITY_STATUS = NO_SECURITY_CHANGE_OBSERVED / NOT_VERIFIED`

## Critical invariants

1. Model output is untrusted.
2. Model output cannot directly persist business state.
3. Tools cannot bypass deterministic authorization/validation.
4. Human takeover is a state boundary, not a prompt convention.
5. Conversation, ownership, AI and message state machines remain distinct.
6. Provider-specific behavior remains behind `LLMProvider`.
7. No concrete model is a normative default without explicit external/integration approval.

## Handoff state

Only `agents/05-conversation-llm/**` is modified by IA-05 in this correction. No product code, shared contracts, schema, global docs or external platforms were modified. No merge, approval or Ready-for-Review action was performed.
