# IA-05 — AI-V1 Approval Request

Status: **PROPOSAL / PENDING_APPROVAL**  
Authority requested: integration authority (`main`)  
Runtime implementation: **NOT_STARTED**

This document is the single approval entry point for AI-V1 closure. It contains proposals, not approved decisions.

## Approval vs Implementation Authorization

`CONTRACT_APPROVAL` and `IMPLEMENTATION_AUTHORIZATION` are independent authority decisions.

- **CONTRACT_APPROVAL:** approval of the proposed logical contract as normative shared behavior.
- **IMPLEMENTATION_AUTHORIZATION:** explicit permission for a named owner to modify code within an identified scope and execute the required tests/review gates.
- **CONTRACT_APPROVAL does not automatically imply IMPLEMENTATION_AUTHORIZATION.**
- A contract may therefore be `APPROVED` while implementation remains `NOT_AUTHORIZED` or `BLOCKED`.
- Implementation authorization must identify, at minimum: owner, files/scope, tests, and review gate.

### Allowed contract states

`PROPOSAL` · `APPROVED` · `APPROVED_WITH_CONSTRAINTS` · `REJECTED` · `DEFERRED` · `NEEDS_EVIDENCE`

### Allowed implementation-authorization states

`NOT_REQUESTED` · `NOT_AUTHORIZED` · `AUTHORIZED` · `BLOCKED` · `EXTERNAL`

### Allowed implementation-readiness states

`NOT_READY` · `READY_WITH_GATES` · `READY` · `BLOCKED` · `EXTERNAL`

Current package state for every DR is intentionally:

- `CONTRACT_STATUS = PROPOSAL`
- `IMPLEMENTATION_AUTHORIZATION = NOT_AUTHORIZED`
- `IMPLEMENTATION_READINESS = BLOCKED` or `EXTERNAL` as specified below

No DR is a `DECISION`.

## Cross-agent validation

- **FACT:** IA-01 owns physical persistence representation for `Conversation`, `Message`, `AIProfile`, `AIExecution` and `KnowledgeItem`; IA-05 must provide logical requirements and not define columns, indexes or migrations.
- **FACT:** IA-02 owns `packages/domain/**`, including the current `LLMProvider` foundation and domain state semantics; IA-05 cannot close the shared executable provider contract alone.
- **FACT:** IA-03 owns durable events, Inbox, Outbox, Jobs and Audit infrastructure and cannot redefine protected contracts locally.
- **FACT:** IA-04 owns Order Engine runtime and does not own Conversation/LLM or `packages/domain/**`.
- **CONFLICT:** No structural ownership conflict was identified in this audit set.
- **AUTHORITY:** Shared contracts and normative domain semantics remain under integration authority and their designated owners.

## Decision order

| Order | Decision | Primary owner | Dependency | Unblocks | Remains blocked |
|---|---|---|---|---|---|
| 1 | DR-001 Typed LLMProvider | Integration + IA-02 | contract approval | contract-test design, provider boundary | AIExecution persistence, model selection, tools |
| 2 | DR-002 AIExecution logical outcome | Integration + IA-01/02/03 | DR-001 recommended | execution evidence model | physical schema and durable event runtime |
| 3 | DR-003 Tool authorization boundary | Integration/security | DR-002/context | safe tool proposals | concrete tool permissions/execution |
| 4 | DR-004 Prompt identity/versioning | Integration + IA-01 | DR-002 | reproducible prompt references | physical persistence details |
| 5 | DR-005 Model selection authority | External + integration | capability contract | runtime model resolution | provider runtime until environment exists |
| 6 | DR-006 Conversation ownership/handoff | Integration + IA-02/08 | domain semantics | Conversation runtime | UI projection details until IA-08 aligns |
| 7 | DR-007 Reliability outcomes | Integration + IA-03 | DR-002 + event boundary | deterministic recovery contract | numeric policy until separately approved |

## Decision requests

### DR-001 — Typed LLMProvider contract

**Status**  
- `CONTRACT_STATUS = PROPOSAL`
- `IMPLEMENTATION_AUTHORIZATION = NOT_AUTHORIZED`
- `IMPLEMENTATION_READINESS = READY_WITH_GATES`

**Problem:** The current executable `LLMProvider` uses `unknown` for chat input/output, preventing deterministic contract validation.

**CurrentState:** `chat(input: unknown): Promise<unknown>` plus `healthCheck`, `discoverModels`, `selectModel`.

**Evidence:** `packages/domain/src/llm-provider.ts`; AI-V1 registry is PARTIAL.

**WhyDecisionIsNeeded:** The shared boundary must be stable before provider adapters or deterministic tests are written.

**Scope:** Logical request/result/error envelope; provider/model/execution/correlation identities; cancellation and timeout outcomes.

**OutOfScope:** physical columns, concrete Ollama model, numeric timeout/retry/backoff, credentials, roles, tool permissions.

**Options:** A) keep `unknown`; B) shared typed envelope; C) provider-specific interfaces outside `LLMProvider`.

**RecommendedOption:** **B — PROPOSAL ONLY.**

**Tradeoffs:** Shared typing increases coordination cost but removes ad-hoc runtime parsing and provider leakage.

**AffectedAgents:** IA-02, IA-05; later IA-01/03.

**AffectedFiles:** `packages/domain/**` and associated contract tests if separately authorized.

**Dependencies:** shared contract approval.

**ImplementationConsequence:** Enables deterministic contract tests and provider adapter integration, but does not authorize IA-05 to modify `packages/domain/**`.

**TestingConsequence:** Typed valid/invalid result fixtures become possible after an implementation owner is authorized.

**SecurityConsequence:** Raw LLM output remains untrusted and cannot become business authority.

**ApprovalRequired:** Integration authority; IA-02 coordination.

**ImplementationOwnerRequired:** Explicit owner must be named by integration authority. IA-02 remains owner of `packages/domain/**`; IA-05 may implement only separately authorized files/tests within its territory.

**ReviewGateRequired:** Shared-contract review plus relevant IA-02/IA-05 tests must pass before runtime work proceeds.

---

### DR-002 — AIExecution logical outcome model

**Status**  
- `CONTRACT_STATUS = PROPOSAL`
- `IMPLEMENTATION_AUTHORIZATION = NOT_AUTHORIZED`
- `IMPLEMENTATION_READINESS = BLOCKED`

**Problem:** `AIExecution` exists as a canonical entity, but request/result/status/error/retry/timeout/cancellation semantics are incomplete.

**CurrentState:** Logical schema is PARTIAL; physical representation is IA-01 territory.

**Evidence:** Domain entity registry and readiness package.

**WhyDecisionIsNeeded:** Runtime and audit need a stable logical execution record independent of provider format.

**Scope:** Logical execution identity, request/context references, provider/model identity, prompt reference, outcome/status, error, timestamps, retry/cancel/timeout outcomes, correlation/causation, audit reference.

**OutOfScope:** SQLite columns, indexes, constraints, migrations, retention policy.

**Options:** A) raw provider response; B) logical execution + validated outcome; C) logs-only.

**RecommendedOption:** **B — PROPOSAL ONLY.**

**Tradeoffs:** More structure versus stronger reproducibility/auditability.

**AffectedAgents:** IA-01, IA-02, IA-03, IA-05.

**AffectedFiles:** IA-05 documentation now; IA-01/02/03 implementation later if explicitly authorized by their owners.

**Dependencies:** DR-001 recommended; IA-01/03 coordination.

**ImplementationConsequence:** Supplies a stable target for Conversation runtime but does not define physical persistence.

**TestingConsequence:** Enables deterministic outcome and failure-path assertions after owner-specific authorization.

**SecurityConsequence:** Reduces need to persist raw, unvalidated provider output as authoritative state.

**ApprovalRequired:** Integration authority with IA-01/02/03 coordination.

**ImplementationOwnerRequired:** IA-01 for physical persistence; IA-02/IA-03 for their respective runtime boundaries.

**ReviewGateRequired:** Cross-agent contract review before persistence/event implementation.

---

### DR-003 — Tool authorization boundary

**Status**  
- `CONTRACT_STATUS = PROPOSAL`
- `IMPLEMENTATION_AUTHORIZATION = NOT_AUTHORIZED`
- `IMPLEMENTATION_READINESS = BLOCKED`

**Problem:** Tool calling is conceptually supported but authorization semantics are incomplete.

**CurrentState:** LLM output is untrusted; caller/scope/capability/confirmation details are incomplete.

**Evidence:** AI docs and current authorization state.

**WhyDecisionIsNeeded:** Model interpretation must not imply permission.

**Scope:** Logical `candidate action -> authorization -> execution -> validation -> audit` boundary.

**OutOfScope:** roles, permissions, endpoints, confirmation policy, sandbox rules, numeric limits.

**Options:** A) model executes; B) deterministic authorization boundary; C) permanently disable tools.

**RecommendedOption:** **B — PROPOSAL ONLY.**

**Tradeoffs:** Cross-agent coordination is required, but authority remains deterministic.

**AffectedAgents:** IA-02, IA-04, IA-06, IA-07, IA-08, IA-05.

**AffectedFiles:** Shared authorization contract only after explicit approval.

**Dependencies:** domain/security ownership.

**ImplementationConsequence:** Approval of this boundary does not authorize any individual tool and does not authorize a Tool Runtime.

**TestingConsequence:** Negative tests can prove tool proposals do not imply allow.

**SecurityConsequence:** Preserves least privilege and Core authority.

**ApprovalRequired:** Integration/security authority.

**ImplementationOwnerRequired:** Must be explicitly designated; tool-owning subsystem remains responsible for execution.

**ReviewGateRequired:** Security/integration review before any concrete tool is enabled.

---

### DR-004 — Prompt identity/versioning

**Status**  
- `CONTRACT_STATUS = PROPOSAL`
- `IMPLEMENTATION_AUTHORIZATION = NOT_AUTHORIZED`
- `IMPLEMENTATION_READINESS = BLOCKED`

**Problem:** Prompt configuration is not yet reproducibly identified and versioned.

**CurrentState:** Prompt construction is conceptual; identity/provenance fields are incomplete.

**Evidence:** Prompt matrix and AIExecution analysis.

**WhyDecisionIsNeeded:** Execution configuration must be reconstructable for audit/debugging.

**Scope:** Logical prompt identity, immutable version reference, source/configuration provenance, variable provenance, context provenance, result-schema reference.

**OutOfScope:** prompt wording, storage columns, concrete templates.

**Options:** A) free-form text; B) immutable versioned references; C) embed without version identity.

**RecommendedOption:** **B — PROPOSAL ONLY.**

**Tradeoffs:** Requires version discipline but improves reproducibility.

**AffectedAgents:** IA-01, IA-05, IA-08 indirectly.

**Dependencies:** DR-002 and profile/persistence alignment.

**ImplementationConsequence:** Prompt engine can later be deterministic, but no implementation is authorized by contract approval alone.

**TestingConsequence:** Same references can reconstruct equivalent configuration once implementation is explicitly authorized.

**SecurityConsequence:** Reduces hidden-context injection risk.

**ApprovalRequired:** Integration authority with persistence alignment.

**ImplementationOwnerRequired:** Explicit owner and file scope must be designated before code changes.

**ReviewGateRequired:** Contract review followed by owner-specific implementation review.

---

### DR-005 — Model selection authority

**Status**  
- `CONTRACT_STATUS = PROPOSAL`
- `IMPLEMENTATION_AUTHORIZATION = EXTERNAL`
- `IMPLEMENTATION_READINESS = EXTERNAL`

**Problem:** The baseline intentionally leaves concrete model selection open.

**CurrentState:** Ollama is the initial provider direction; no concrete model is normative.

**Evidence:** Provider integration documentation.

**WhyDecisionIsNeeded:** Runtime needs an authoritative source and capability check for model selection.

**Scope:** who selects, when, configuration/profile source, capability check, unavailable behavior, recorded model identity.

**OutOfScope:** choosing a concrete model in this IA-05 package.

**Options:** A) hard-code; B) approved configuration/profile policy; C) arbitrary runtime selection.

**RecommendedOption:** **B — PROPOSAL ONLY**, concrete model remains external.

**Tradeoffs:** Requires configuration discipline but avoids architecture-level hard-coding.

**AffectedAgents:** IA-01/02/05 plus external runtime owner.

**Dependencies:** model capability contract and external benchmark.

**ImplementationConsequence:** Runtime remains externally gated until model-selection authority is resolved.

**TestingConsequence:** Capability mismatch and unavailable-model fixtures can be designed after external selection authority exists.

**SecurityConsequence:** Prevents uncontrolled provider/model switching.

**ApprovalRequired:** External model-selection owner + integration authority for contract shape.

**ImplementationOwnerRequired:** External decision owner and designated runtime owner.

**ReviewGateRequired:** External benchmark evidence plus integration approval.

---

### DR-006 — Conversation ownership/handoff semantics

**Status**  
- `CONTRACT_STATUS = PROPOSAL`
- `IMPLEMENTATION_AUTHORIZATION = NOT_AUTHORIZED`
- `IMPLEMENTATION_READINESS = BLOCKED`

**Problem:** State vocabulary exists, but legal transitions and actor semantics are incomplete.

**CurrentState:** `OPEN/CLOSED`, `AI/HUMAN`, `ACTIVE/PAUSED/UNAVAILABLE` are evidenced; transition details are not.

**Evidence:** Domain state-machine documentation.

**WhyDecisionIsNeeded:** IA-05 must not invent state transitions.

**Scope:** authority for transition semantics and actor identity consumption.

**OutOfScope:** duplicating the domain state machine or renderer internals.

**Options:** A) infer locally; B) IA-02 defines authoritative transitions, IA-05 consumes, IA-08 projects; C) collapse states.

**RecommendedOption:** **B — PROPOSAL ONLY.**

**Tradeoffs:** Depends on IA-02/IA-08 coordination, but preserves domain ownership.

**AffectedAgents:** IA-02, IA-05, IA-08; IA-06 where identity applies.

**Dependencies:** domain and UI ownership.

**ImplementationConsequence:** Conversation runtime remains a consumer of domain authority and cannot begin from this approval alone.

**TestingConsequence:** Transition tests belong to the authoritative domain boundary; IA-05 adds consumer tests only after implementation authorization.

**SecurityConsequence:** Prevents prompt-only takeover bypass.

**ApprovalRequired:** Integration authority with IA-02/08.

**ImplementationOwnerRequired:** IA-02 owns domain transition implementation; IA-05 may implement consumer behavior only if separately authorized.

**ReviewGateRequired:** IA-02 domain validation before IA-05 consumer implementation.

---

### DR-007 — Retry/cancellation/timeout semantics

**Status**  
- `CONTRACT_STATUS = PROPOSAL`
- `IMPLEMENTATION_AUTHORIZATION = NOT_AUTHORIZED`
- `IMPLEMENTATION_READINESS = BLOCKED`

**Problem:** Recovery semantics are not typed and numeric policies are unspecified.

**CurrentState:** Generic retry/execution-limit references exist; cancellation is not typed.

**Evidence:** Provider/backend documentation and AIExecution analysis.

**WhyDecisionIsNeeded:** Runtime needs distinguishable outcomes without embedding arbitrary policy.

**Scope:** logical timeout outcome, cancellation outcome, retryability classification and idempotency boundary.

**OutOfScope:** retry counts, backoff, TTLs and numeric timeouts.

**Options:** A) ad hoc provider policy; B) logical outcomes first; C) disable recovery semantics.

**RecommendedOption:** **B — PROPOSAL ONLY.**

**Tradeoffs:** Better determinism at cost of cross-agent coordination.

**AffectedAgents:** IA-01, IA-03, IA-05, IA-08.

**Dependencies:** DR-002 and IA-03 event/recovery boundary.

**ImplementationConsequence:** Provides safe provider failure and takeover paths only after the corresponding owner-specific implementation is authorized.

**TestingConsequence:** Timeout/cancellation/retryability negative cases can be added after owner and contract authorization.

**SecurityConsequence:** Prevents hidden retries or duplicated business effects.

**ApprovalRequired:** Integration authority with IA-03/01 coordination.

**ImplementationOwnerRequired:** Explicit owner per persistence/event/runtime boundary.

**ReviewGateRequired:** Cross-agent reliability review before runtime implementation.

## Global ambiguity status

- `CONTRACT-001`: **GLOBAL / OPEN**. Not resolved by IA-05.
- `CONTRACT-002`: **GLOBAL / OPEN**. Not resolved by IA-05.
- `GOV-001`: **NON_BLOCKING for documentation-only proposal work; RELEVANT before normative approval.**

## Approval record model

The integration authority should record two independent decisions for every DR:

1. **Contract decision:** `APPROVED`, `APPROVED_WITH_CONSTRAINTS`, `REJECTED`, `DEFERRED` or `NEEDS_EVIDENCE`.
2. **Implementation decision:** `NOT_AUTHORIZED`, `AUTHORIZED`, `BLOCKED` or `EXTERNAL`.

Example valid outcome:

`DR-001: CONTRACT_STATUS=APPROVED; IMPLEMENTATION_AUTHORIZATION=NOT_AUTHORIZED; IMPLEMENTATION_READINESS=READY_WITH_GATES.`

This means the contract is normative, but no agent has permission to modify code yet.

## Approval rule

No `DR-001` through `DR-007` becomes `DECISION` until the integration authority explicitly approves it. Contract approval never implies implementation authorization. No wording in this package is normative merely because it is detailed.
