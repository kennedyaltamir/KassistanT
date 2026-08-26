# KassisT — P0 Implementation Task Packets v1.0

**Status:** READY_FOR_IMPLEMENTATION
**Baseline:** `MVP2`
**Governance:** D-001 through D-007 approved; Permission Matrix v1.0 and Quality Gates v1.0 are canonical.
**Rule:** These task packets authorize implementation only within the declared scope. They do not authorize merge, release, governance changes, or silent cross-territory ownership.

## Global execution rules

Every agent executing a task must follow `GOVERNANCE/PERMISSION_MATRIX.md` and `GOVERNANCE/QUALITY_GATES.md`.

Every implementation task must produce:

- task ID and owner;
- exact branch and starting SHA;
- changed paths;
- tests executed and results;
- build/typecheck/lint results when applicable;
- security checks when applicable;
- evidence package;
- handoff to QAOPS and the next dependent task.

`IMPLEMENTED` does not mean `APPROVED` or `RELEASED`.

---

## P0-001 — WSS Runtime Transport

**Owner:** `AG-ENG-01`

**Primary technical territory:** `IA-07 — Gateway + WSS`

**Supporting territories:** `IA-06` for device authentication; `IA-03` for Inbox/Outbox/event integration; `IA-08` for Desktop integration tests.

**Contracts:**

- `WSS-V1`
- `WSS-RUNTIME-V1`
- device authentication/enrollment contracts
- Inbox/Outbox contracts
- relevant baseline architecture rules

**Allowed paths:**

- `gateway/**`
- tests directly associated with Gateway/WSS in the IA-07 territory

**Protected paths:**

- `packages/contracts/**`
- `docs/protocols/**`
- `docs/domain/**`
- `gateway/src/device-auth/**`
- `.github/**`
- root/shared configuration

Changes to protected paths require explicit cross-territory authorization and must be recorded before modification.

**Dependencies:**

1. `WSS-RUNTIME-V1` frozen.
2. `IA-06` device-auth contract available.
3. `IA-03` Inbox/Outbox integration contract available.
4. Current Gateway entry points verified.

**Acceptance criteria:**

- `attachWssTransport()` no longer returns `not_implemented`.
- WSS runtime binds to the approved Gateway lifecycle without bypassing Core authority.
- Handshake/auth boundary follows the frozen contract.
- Envelope/message types are validated against WSS-V1.
- ACK/correlation/causation behavior is deterministic.
- reconnect/resume and duplicate delivery behavior follow the frozen runtime contract.
- protocol errors are explicit and do not mutate business state directly.
- ownership boundaries remain intact.

**Required tests:**

- WSS unit tests;
- handshake/auth boundary tests;
- envelope validation tests;
- ACK/correlation tests;
- reconnect/resume tests;
- duplicate/idempotency tests;
- integration test covering Gateway ↔ WSS boundary;
- failure-path tests.

**Evidence:**

- changed-path inventory;
- exact commit SHA;
- test output;
- build/typecheck/lint output where applicable;
- runtime evidence of WSS attach/listen lifecycle;
- negative-path evidence;
- unresolved risks.

**Handoff:** `AG-QAOPS-01` for quality gate verification.

---

## P0-002 — AI Provider Contract Implementation

**Owner:** `AG-AI-01`

**Technical territory:** `IA-05 — Conversation + LLM`

**Contracts:**

- `AI-V1`
- `LLMProvider`
- model profile/selection contract
- prompt provenance/version contract

**Allowed paths:**

- `apps/desktop/electron/conversation/**`
- `apps/desktop/electron/providers/llm/**`
- tests directly belonging to IA-05

**Protected/shared paths:**

- `packages/contracts/**`
- `docs/protocols/**`
- `docs/domain/**`
- neighboring IA territory paths
- root/shared configuration

**Dependencies:**

1. `AI-V1` frozen.
2. Provider abstraction remains behind `LLMProvider`.
3. No concrete model is elevated to a normative product decision.

**Acceptance criteria:**

- `LLMProvider` has a typed, deterministic contract.
- provider-specific behavior remains behind the abstraction.
- model identity/profile is explicit in execution metadata.
- prompt provenance/version is represented and auditable.
- provider failures map to the frozen error/fallback semantics.
- provider output remains untrusted data.
- no provider can mutate business state directly.

**Required tests:**

- provider contract tests;
- mock provider tests;
- failure/timeout tests;
- provenance/version tests;
- model-profile selection tests;
- regression tests for existing conversation behavior.

**Evidence:**

- contract implementation diff;
- representative provider test results;
- failure-path evidence;
- provenance evidence;
- exact commit SHA.

**Handoff:** `P0-003` and `AG-QAOPS-01`.

---

## P0-003 — AI Execution + Structured Output + Tool Authorization Boundary

**Owner:** `AG-AI-01`

**Technical territory:** `IA-05 — Conversation + LLM`

**Contracts:**

- `AI-V1`
- AIExecution
- structured output envelope
- tool interpretation / tool authorization separation
- context provenance and persistence/event boundaries

**Allowed paths:**

- `apps/desktop/electron/conversation/**`
- `apps/desktop/electron/providers/llm/**`
- IA-05 tests

**Dependencies:**

1. P0-002 complete or its provider interface accepted by tests.
2. `AI-V1` frozen.
3. Existing domain/core authorization boundary remains authoritative.

**Acceptance criteria:**

- AIExecution has explicit input/output boundaries.
- structured output is validated before downstream use.
- invalid model output fails closed.
- tool calls are interpreted separately from authorization.
- only deterministic authorization can permit execution.
- AI cannot persist business state directly.
- context provenance is retained for auditability.
- failure/fallback/recovery semantics are deterministic.

**Required tests:**

- valid/invalid structured-output tests;
- prompt-injection/tool-confusion tests;
- unauthorized-tool tests;
- malformed-output tests;
- timeout/fallback tests;
- context provenance tests;
- persistence/event boundary tests.

**Evidence:**

- execution contract examples;
- authorization denial cases;
- structured-output validation results;
- negative security tests;
- exact commit SHA;
- known limitations.

**Handoff:** `AG-QAOPS-01` for security and quality verification.

---

## P0-004 — Quality Gate Automation Baseline

**Owner:** `AG-QAOPS-01`

**Technical territory:** QA/Release operations with explicit shared-configuration authority per Permission Matrix.

**Contracts/policies:**

- `GOVERNANCE/QUALITY_GATES.md`
- Permission Matrix
- repository CI policy

**Allowed paths:**

- QA/release documentation paths;
- dedicated quality scripts/tests;
- `.github/**` only where the task is explicitly authorized by human/integration authority.

**Dependencies:**

1. `GOVERNANCE/QUALITY_GATES.md` frozen.
2. Repository scripts and current CI structure audited.
3. No weakening of existing gates.

**Acceptance criteria:**

- required quality stages are executable or their missing automation is explicitly recorded;
- CI reports lint/typecheck/unit/integration/build/security outcomes where applicable;
- evidence is associated with an exact commit;
- `READY_FOR_REVIEW` cannot be claimed without the evidence package;
- `APPROVED` and `RELEASED` remain human-only transitions;
- exceptions require explicit documentation and reviewer acceptance.

**Required tests:**

- dry-run of the gate pipeline;
- failure injection for at least one required stage;
- verification that evidence points to the correct commit;
- regression check that gates are not silently weakened.

**Evidence:**

- workflow/run references;
- command outputs;
- failure-path evidence;
- gate mapping to policy;
- reviewer notes.

**Handoff:** all implementation agents; `AG-QAOPS-01` remains the evidence owner.

---

## P0-005 — Cross-Territory WSS Integration Verification

**Owner:** `AG-QAOPS-01`

**Supporting agents:** `AG-ENG-01`, with `IA-03`, `IA-06`, `IA-08` owners consulted where evidence crosses their boundaries.

**Technical scope:** Integration verification of the approved path:

`WhatsApp → Gateway → Inbox/Outbox → WSS → Desktop → ACK`

**Contracts:**

- `WSS-RUNTIME-V1`
- Inbox/Outbox contracts
- device authentication/enrollment contracts
- `Conversation` / `Message` terminology and relevant integration contracts
- Quality Gates v1.0

**Allowed paths:** test/evidence paths owned by QAOPS and approved integration-test locations.

**Dependencies:**

- P0-001 implemented and testable;
- relevant IA-03/IA-06 contracts available;
- Desktop integration harness available.

**Acceptance criteria:**

- end-to-end message path is demonstrated with traceable correlation IDs;
- authentication boundary is enforced;
- persistence/outbox semantics are observable;
- WSS ACK is correlated to the originating event/command;
- duplicate/retry behavior is deterministic;
- failure recovery is observable;
- no business-state mutation is performed by transport code outside approved boundaries.

**Required tests:**

- happy path;
- auth failure;
- malformed envelope;
- duplicate delivery;
- reconnect/resume;
- missing ACK;
- out-of-order/sequence violation;
- persistence failure;
- Gateway/WSS restart scenario.

**Evidence:**

- test report;
- logs/traces/correlation IDs;
- exact commit SHAs;
- known limitations;
- quality-gate verdict.

**Handoff:** human review before any `APPROVED` or `RELEASED` transition.

---

## Implementation gate

The first implementation wave is released only for P0-001 through P0-004 after the task owner confirms the required dependencies are present. P0-005 is a verification task and does not authorize implementation outside its test/evidence territory.

A task reaching `IMPLEMENTED` must immediately enter the Quality Gates workflow. No agent may self-promote to `APPROVED` or `RELEASED`.

**Canonical references:**

- `GOVERNANCE/PERMISSION_MATRIX.md`
- `GOVERNANCE/QUALITY_GATES.md`
- `docs/protocols/wss-runtime-contract-v1.md`
- `docs/ai/AI-V1-CONTRACTS.md`
- `docs/protocols/contract-registry.md`
- `ROADMAP/07_DECISION_LOG.md`
