# IA-05 — AI-V1 Global Decision Requests

Status: **REQUESTS FOR APPROVAL — NOT DECISIONS**

`Recommended Option` entries are proposals only. No item below is an approved architectural decision.

## DR-001 — Typed LLMProvider contract

**Problem**  
The current interface accepts/returns `unknown` for chat execution, which prevents deterministic validation.

**Current evidence**  
`packages/domain/src/llm-provider.ts` exposes `chat(input: unknown): Promise<unknown>`, plus health/model operations. AI-V1 is registered as PARTIAL.

**Options**

- A. Keep `unknown` and validate ad hoc in Conversation runtime.
- B. Define a shared typed request/result/error contract behind `LLMProvider`.
- C. Create provider-specific typed interfaces outside `LLMProvider`.

**Recommended Option**  
B. The boundary should expose typed semantics while provider-specific details remain isolated.

**Risks**  
Changing the shared interface affects IA-05 implementation and any future provider adapters.

**Affected Agents**  
IA-05, IA-02; potentially IA-03/IA-01 for execution persistence.

**Affected Contracts**  
AI-V1, ERROR-V1.

**Approval Required**  
Integration authority; shared contract change.

## DR-002 — AIExecution logical result/outcome model

**Problem**  
AIExecution is a canonical entity but its logical request/result/status/error model is incomplete.

**Current evidence**  
Domain entities define AIExecution but detailed field schemas are partial.

**Options**

- A. Persist only raw provider response.
- B. Define logical execution metadata and validated result/error outcomes independent of provider format.
- C. Leave execution state implicit in logs.

**Recommended Option**  
B.

**Risks**  
Requires IA-01 persistence alignment and IA-03 audit alignment.

**Affected Agents**  
IA-01, IA-02, IA-03, IA-05.

**Affected Contracts**  
AI-V1, DOMAIN-ENTITY-V1, ERROR-V1.

**Approval Required**  
Integration authority with IA-01/02/03 coordination.

## DR-003 — Tool authorization boundary

**Problem**  
Tool calling is allowed conceptually, but authorization semantics are incomplete.

**Current evidence**  
AI docs state that LLM output is untrusted; AUTHZ-V1 is missing/partial; tool matrix has unknown caller, scope, confirmation and sandbox semantics.

**Options**

- A. Let Conversation execute model-proposed tools.
- B. Route every tool proposal through deterministic authorization, then execution owned by the responsible subsystem.
- C. Disable tools for V1 permanently.

**Recommended Option**  
B. It preserves the core authority boundary while keeping future tools possible.

**Risks**  
Requires a cross-agent authorization contract.

**Affected Agents**  
IA-02, IA-04, IA-06, IA-07, IA-05; potentially IA-08 for confirmation UI.

**Affected Contracts**  
AUTHZ-V1, AI-V1.

**Approval Required**  
Global security/integration authority.

## DR-004 — Prompt identity and versioning

**Problem**  
Prompt construction is conceptually required but not reproducibly versioned.

**Current evidence**  
Prompt matrix marks identity, variables, provenance and reproducibility incomplete.

**Options**

- A. Store free-form prompt text only.
- B. Identify immutable prompt configuration by stable identity/version and reference approved context/configuration provenance.
- C. Put prompt content directly in AIExecution fields without version identity.

**Recommended Option**  
B.

**Risks**  
Could require shared AIExecution references, depending on final persistence design.

**Affected Agents**  
IA-01, IA-05, IA-08 indirectly.

**Affected Contracts**  
AI-V1, DOMAIN-ENTITY-V1.

**Approval Required**  
Integration authority; persistence alignment required.

## DR-005 — Model selection authority

**Problem**  
The baseline intentionally leaves the default model open.

**Current evidence**  
Ollama is the initial local provider direction; concrete model choice is explicitly benchmark/external.

**Options**

- A. Hard-code a model in IA-05.
- B. Resolve model through approved configuration/profile policy and record selected model identity.
- C. Allow arbitrary runtime model selection without policy.

**Recommended Option**  
B, with the concrete model selected externally.

**Risks**  
Requires external benchmark/operational decision.

**Affected Agents**  
IA-05, IA-01/02 for profile/config persistence; external runtime environment.

**Affected Contracts**  
AI-V1, configuration/profile semantics.

**Approval Required**  
External model-selection owner plus integration authority for contract shape.

## DR-006 — Conversation ownership/handoff semantics

**Problem**  
`AI/HUMAN` ownership and `ACTIVE/PAUSED/UNAVAILABLE` state vocabulary are defined, but transitions and actor semantics are incomplete.

**Current evidence**  
Domain state-machine docs define states but actor permissions remain partial.

**Options**

- A. Infer transitions in Conversation runtime.
- B. IA-02 closes authoritative transition semantics; IA-05 consumes them; IA-08 projects them.
- C. Collapse ownership and AI state into one runtime field.

**Recommended Option**  
B.

**Risks**  
Requires coordination between IA-02 and IA-08.

**Affected Agents**  
IA-02, IA-05, IA-08, possibly IA-06 for actor identity.

**Affected Contracts**  
Domain state machine, AI-V1.

**Approval Required**  
Integration authority with IA-02/08.

## DR-007 — Retry/cancellation/timeout semantics

**Problem**  
AI execution needs deterministic recovery behavior, but numeric or terminal semantics are not specified.

**Current evidence**  
Provider docs mention retries/execution limits generically; cancellation is not typed; timeout ownership is partial.

**Options**

- A. Implement ad hoc provider retries/timeouts.
- B. Define logical outcomes and idempotency boundaries first; leave numeric policy configurable/external.
- C. Disable recovery semantics.

**Recommended Option**  
B.

**Risks**  
Requires AIExecution + event/infrastructure alignment.

**Affected Agents**  
IA-03, IA-05, IA-08; IA-01 persistence.

**Affected Contracts**  
AI-V1, JOB/INBOX/OUTBOX where applicable.

**Approval Required**  
Cross-agent/integration authority.

## DR-008 — Global contract ambiguities

**Problem**  
`CONTRACT-001`, `CONTRACT-002` and `GOV-001` affect downstream interpretation.

**Recommended Option**  
Resolve centrally; IA-05 records dependency but does not encode assumptions.

**Affected Agents**  
Multiple agents.

**Approval Required**  
Integration authority.
