# KassisT — P0 Implementation Task Packets v1.1

**Status:** READY_FOR_IMPLEMENTATION  
**Baseline:** `MVP2`  
**Governance:** D-001 through D-010 recorded; Permission Matrix v1.0, Quality Gates v1.0 and Implementation Baseline v1.0 are canonical.  
**Rule:** These task packets authorize implementation only within the declared scope. They do not authorize merge, release, governance changes, or silent cross-territory ownership.

## Global execution rules

Every agent executing a task must follow:

- `GOVERNANCE/IMPLEMENTATION_BASELINE.md`
- `GOVERNANCE/PERMISSION_MATRIX.md`
- `GOVERNANCE/QUALITY_GATES.md`
- applicable frozen contracts
- `ROADMAP/07_DECISION_LOG.md`

Every implementation task must produce:

- task ID and owner;
- exact baseline ref and starting SHA;
- task branch;
- changed paths;
- dependency SHAs/branches when applicable;
- tests executed and results;
- build/typecheck/lint results when applicable;
- security checks when applicable;
- evidence package;
- handoff to QAOPS and the next dependent task.

`IMPLEMENTED` does not mean `TESTED`, `VERIFIED`, `READY_FOR_REVIEW`, `APPROVED` or `RELEASED`.

`main` is not an implementation baseline for this wave.

## P0-001A — Device Authentication Runtime

**Owner:** `AG-ENG-01` — operationally delegated per D-009  
**Technical territory:** `IA-06 — Device Authentication`  
**Parent:** `P0-001 — WSS Runtime Transport`  
**Issue:** `#54`

### Contracts

- `WSS-RUNTIME-V1`
- device authentication/enrollment contracts
- `GOVERNANCE/PERMISSION_MATRIX.md`
- `GOVERNANCE/QUALITY_GATES.md`

### Allowed paths

- IA-06-owned device-authentication/runtime paths only;
- IA-06 tests.

### Protected paths

- `gateway/src/device-auth/**` may only be changed according to the IA-06 task boundary; P0-001/IA-07 must not absorb this implementation;
- `packages/contracts/**`;
- frozen protocol documents;
- unrelated agent territories;
- root/shared configuration unless explicitly authorized.

### Dependencies

- WSS authentication boundary frozen;
- existing identity/enrollment contracts verified;
- baseline validated through `GOVERNANCE/IMPLEMENTATION_BASELINE.md`.

### Acceptance criteria

1. Enrollment/authentication lifecycle is deterministic and testable.
2. Successful authentication produces explicit authenticated identity/session context for WSS consumers.
3. Authentication failure is fail-closed and produces typed/explicit errors.
4. Business authorization remains outside authentication.
5. No secret material is hard-coded or logged.
6. IA-07 can consume the boundary without owning IA-06 internals.

### Required tests

- success path;
- invalid identity/credential;
- expired/invalid credential;
- replay/duplicate attempt;
- unauthorized device;
- error/timeout path;
- no-secret-leakage checks;
- consumer contract test for IA-07.

### Evidence

- starting SHA;
- changed paths;
- exact final SHA;
- test output;
- security checks;
- consumer contract evidence;
- unresolved limitations.

### Handoff

`P0-001A → AG-QAOPS-01` for verification and `P0-001` / `AG-ENG-01` for consumer integration.

### Gate

P0-001A must reach at least `READY_FOR_REVIEW` with evidence before it can satisfy a dependency of P0-001.

## P0-001B — Inbox/Outbox Runtime Integration

**Owner:** `AG-ENG-01` — operationally delegated per D-009  
**Technical territory:** `IA-03 — Inbox/Outbox / Event Integration`  
**Parent:** `P0-001 — WSS Runtime Transport`  
**Issue:** `#55`  
**Contract prerequisite:** `D-010` **APPROVED / CANONICAL** as of `2026-08-25 23:11:44 America/Sao_Paulo (UTC−03:00)`.

### Contract closure

D-010 closes the former P0-001B `CONTRACT_DEPENDENCY_GAP`.

- `INBOX-V1` = `FROZEN`;
- `OUTBOX-V1` = `FROZEN`;
- `CONTRACT-001` = `RESOLVED`;
- IA-01 owns SQLite schema and migrations;
- IA-03 owns event/runtime semantics;
- IA-03 ↔ IA-01 interface is explicit, versioned and independent of SQLite;
- no physical DLQ is created in this task;
- Outbox terminal failure state is `FAILED_TERMINAL`.

### Contracts

- `WSS-RUNTIME-V1`
- `INBOX-V1`
- `OUTBOX-V1`
- D-010 IA-03 ↔ IA-01 persistence boundary
- persistence/core contracts;
- message/conversation terminology and outbox semantics;
- `GOVERNANCE/PERMISSION_MATRIX.md`
- `GOVERNANCE/QUALITY_GATES.md`

### Allowed paths

- IA-03-owned Inbox/Outbox/runtime integration paths only;
- IA-03 tests.

### Protected paths

- `gateway/**` outside the explicit IA-03 integration boundary;
- `packages/contracts/**`;
- frozen protocol documents;
- unrelated agent territories;
- shared configuration unless explicitly authorized;
- IA-01 schema/migration paths except through a separately authorized integration boundary.

### Canonical boundary

IA-03 owns event/runtime semantics. IA-01 owns SQLite schema and migrations. The boundary must not expose SQL, table names, SQLite internals, migration numbers or physical storage details.

Canonical semantic operations:

`accept_inbound`, `deduplicate`, `retrieve_pending`, `stage_outbound`, `mark_processing`, `mark_delivered`, `record_retry`, `record_failure`, `recover_pending`.

### Inbox semantics

- logical identity: `(provider, external_event_id)`;
- durable acceptance before processing;
- idempotent acceptance;
- deterministic lifecycle/state;
- correlation and causation preserved;
- restart recovery;
- ACK only after the durability required by the contract.

### Outbox semantics

- logical identity: `idempotency_key`;
- represents an external effect committed after the corresponding internal operation is accepted;
- canonical states: `PENDING`, `PROCESSING`, `DELIVERED`, `RETRY_WAIT`, `FAILED_TERMINAL`;
- deterministic state transitions;
- same logical identity cannot produce a second logical effect;
- business semantics remain in Core/Domain;
- no physical DLQ in P0-001B.

### Retry / recovery

Retry and recovery semantics belong to IA-03. Persistence stores attempts, state, timestamps and failure metadata. Implement retryable-failure classification, terminal-failure classification, deterministic backoff, bounded retry and restart recovery.

### Acceptance criteria

1. Inbound events can be durably accepted before downstream processing where required.
2. Outbound commands/events are durably staged before transport dispatch where required.
3. Idempotency/deduplication behavior is deterministic.
4. Correlation/causation metadata is preserved.
5. Retry/failure semantics are explicit and do not create uncontrolled duplicate business effects.
6. Transport code does not become business-state authority.
7. IA-07 can consume the boundary without owning IA-03 internals.
8. Implementation does not depend on SQL, physical table names or SQLite internals.

### Required tests

- inbound persistence;
- outbound persistence;
- duplicate/idempotency;
- correlation/causation;
- retry/failure;
- persistence failure;
- crash/restart recovery where supported;
- deterministic state-transition coverage;
- IA-07 consumer contract test;
- no-business-authority-in-transport check.

### Evidence

- D-010 contract traceability;
- starting baseline SHA;
- task branch;
- changed paths;
- exact final SHA;
- unit/integration test outputs;
- persistence/recovery evidence;
- negative-path evidence;
- consumer contract evidence;
- unresolved limitations.

### Handoff

`P0-001B → AG-QAOPS-01` for verification and `P0-001` / `AG-ENG-01` for consumer integration.

### Gate

`CONTRACT_FROZEN → IMPLEMENTED → TESTED → VERIFIED → READY_FOR_REVIEW`.

`READY_FOR_REVIEW` does not mean `APPROVED` or `RELEASED`.

## P0-001 — WSS Runtime Transport

**Owner:** `AG-ENG-01`  
**Primary technical territory:** `IA-07 — Gateway + WSS`

**Supporting territories:** `IA-06` for device authentication; `IA-03` for Inbox/Outbox/event integration; `IA-08` for Desktop integration tests.

**Dependencies:**

1. `P0-001A` at least `READY_FOR_REVIEW` with evidence.
2. `P0-001B` at least `READY_FOR_REVIEW` with evidence.
3. `WSS-V1` and `WSS-RUNTIME-V1` frozen.
4. Current Gateway entry points verified.

**Contracts:**

- `WSS-V1`
- `WSS-RUNTIME-V1`
- device authentication/enrollment contracts
- Inbox/Outbox contracts frozen by D-010
- relevant baseline architecture rules

**Allowed paths:**

- `gateway/**`
- tests directly associated with Gateway/WSS in the IA-07 territory

**Protected paths:**

- `packages/contracts/**`
- `docs/protocols/**`
- `docs/domain/**`
- IA-03/IA-06 owned implementation paths
- `.github/**`
- root/shared configuration

### Acceptance criteria

- `attachWssTransport()` no longer returns `not_implemented`.
- WSS runtime binds to the approved Gateway lifecycle without bypassing Core authority.
- Handshake/auth boundary follows the frozen contract.
- Envelope/message types are validated against WSS-V1.
- ACK/correlation/causation behavior is deterministic.
- reconnect/resume and duplicate delivery behavior follow the frozen runtime contract.
- protocol errors are explicit and do not mutate business state directly.
- ownership boundaries remain intact.

### Required tests

- WSS unit tests;
- handshake/auth boundary tests;
- envelope validation tests;
- ACK/correlation tests;
- reconnect/resume tests;
- duplicate/idempotency tests;
- integration test covering Gateway ↔ WSS boundary;
- failure-path tests.

### Handoff

`P0-001 → AG-QAOPS-01` for quality gate verification and `P0-005` once testable.

## P0-002 — AI Provider Contract Implementation

**Owner:** `AG-AI-01`

**Technical territory:** `IA-05 — Conversation + LLM`

**Contracts:** `AI-V1`, `LLMProvider`, model profile/selection, prompt provenance/version.

**Allowed paths:**

- `apps/desktop/electron/conversation/**`
- `apps/desktop/electron/providers/llm/**`
- IA-05 tests.

**Dependencies:** `AI-V1` frozen and provider abstraction behind `LLMProvider`.

### Acceptance criteria

- typed deterministic `LLMProvider`;
- provider-specific behavior behind abstraction;
- explicit model profile metadata;
- auditable prompt provenance/version;
- deterministic provider error/fallback semantics;
- provider output treated as untrusted data;
- no direct business-state mutation.

### Required tests

- provider contract;
- mock provider;
- failure/timeout;
- provenance/version;
- model profile selection;
- conversation regression.

### Handoff

`P0-002 → P0-003` and `AG-QAOPS-01`.

## P0-003 — AI Execution + Structured Output + Tool Authorization Boundary

**Owner:** `AG-AI-01`

**Technical territory:** `IA-05 — Conversation + LLM`

**Dependencies:**

1. P0-002 implemented and test evidence available;
2. AI-V1 frozen;
3. Core/security authorization remains authoritative.

**Allowed paths:**

- `apps/desktop/electron/conversation/**`
- `apps/desktop/electron/providers/llm/**`
- IA-05 tests.

### Acceptance criteria

- explicit AIExecution boundaries;
- structured output validation before downstream use;
- fail-closed invalid output;
- separate tool interpretation from authorization;
- deterministic authorization before execution;
- no direct business-state persistence;
- context provenance retained;
- deterministic fallback/recovery.

### Required tests

- valid/invalid structured output;
- prompt-injection/tool-confusion;
- unauthorized tools;
- malformed output;
- timeout/fallback;
- context provenance;
- persistence/event boundaries.

## P0-004 — Quality Gate Automation Baseline

**Owner:** `AG-QAOPS-01`

**Technical territory:** QA/Release operations.

**Contracts/policies:** `GOVERNANCE/QUALITY_GATES.md`, Permission Matrix, repository CI policy.

**Allowed paths:** QA/release docs, dedicated quality scripts/tests, and `.github/**` only where explicitly authorized.

### Acceptance criteria

- required quality stages executable or their absence explicitly recorded;
- lint/typecheck/unit/integration/build/security outcomes reported where applicable;
- evidence tied to exact commit;
- `READY_FOR_REVIEW` requires evidence package;
- `APPROVED` and `RELEASED` remain human-only;
- exceptions documented and reviewed.

### Required tests

- gate dry-run;
- failure injection;
- evidence/commit correlation;
- silent-gate-weakening regression.

## P0-005 — Cross-Territory WSS Integration Verification

**Owner:** `AG-QAOPS-01`

**Scope:** test/evidence only for `WhatsApp → Gateway → Inbox/Outbox → WSS → Desktop → ACK`.

**Dependencies:** P0-001 testable; IA-03/IA-06 contracts available; Desktop integration harness available.

### Required tests

- happy path;
- auth failure;
- malformed envelope;
- duplicate delivery;
- reconnect/resume;
- missing ACK;
- sequence violation;
- persistence failure;
- Gateway/WSS restart.

## P0-006 — Canonical Conversation/Message Terminology

**Owner:** `AG-UX-01`

**Technical territory:** UX/UI/Web.

**Issue:** `#48`.

**Decision basis:** D-006.

### Canonical vocabulary

- `Conversas` → UI/navigation experience;
- `Conversation` → domain concept;
- `Message` → domain concept;
- `Contact` → domain concept;
- `Channel/Provider` → integration concept;
- `WhatsApp` → concrete channel/provider.

### Dependencies

- D-006 recorded;
- `GOVERNANCE/TERMINOLOGY.md` available;
- UI surface verified on `MVP2`.

### Allowed paths

- explicitly authorized UX/UI paths;
- associated UX tests.

### Protected paths

- domain contracts;
- IA-05, IA-07, IA-03, IA-06 and other agent territories;
- governance and frozen contracts unless explicitly authorized.

### Acceptance criteria

- `Conversas` is the navigation/UI label where the generic message experience is presented;
- provider-specific `WhatsApp` remains available when the channel context is specifically relevant;
- no silent domain contract renaming;
- terminology remains consistent with `GOVERNANCE/TERMINOLOGY.md`;
- no unrelated product behavior is changed.

### Required evidence

- changed paths;
- screenshots/runtime evidence where a UI surface exists;
- regression tests where applicable;
- exact branch and SHA;
- limitations.

## Implementation gate

Only tasks with a valid `MVP2` baseline, explicit task packet, authorized territory, satisfied dependencies and required evidence may proceed.

P0-005 is verification-only and does not authorize implementation outside QA/test/evidence paths.

A task reaching `IMPLEMENTED` must immediately enter the Quality Gates workflow.

No agent may self-promote to `APPROVED` or `RELEASED`.

**Canonical references:**

- `GOVERNANCE/IMPLEMENTATION_BASELINE.md`
- `GOVERNANCE/PERMISSION_MATRIX.md`
- `GOVERNANCE/QUALITY_GATES.md`
- `docs/protocols/wss-runtime-contract-v1.md`
- `docs/ai/AI-V1-CONTRACTS.md`
- `docs/protocols/contract-registry.md`
- `ROADMAP/07_DECISION_LOG.md`
- `ROADMAP/P0-001-DEPENDENCY-GRAPH.md`
