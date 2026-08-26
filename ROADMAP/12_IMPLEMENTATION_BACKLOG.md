# KassisT — Implementation Backlog v1.0

**Status:** PRE-IMPLEMENTATION / CONTRACT-FIRST  
**Source:** D-001 through D-006 + Master Audit v1.0  
**Rule:** no implementation task may bypass unresolved contract or governance blockers.

## 1. Execution sequence

`DECISIONS → CONTRACTS → IMPLEMENTATION → TESTS → EVIDENCE → AUDIT → RELEASE`

## 2. Work package WP-01 — Governance synchronization

### TASK-GOV-001 — Permission Matrix rollout
**Owner:** `AG-QAOPS-01`  
**Territory:** governance/release process  
**Inputs:** `GOVERNANCE/PERMISSION_MATRIX.md`  
**Deliverables:** per-agent capability mapping; task authorization template; conflict/escalation rule.  
**Forbidden:** silently changing governance policy.

### TASK-GOV-002 — Agent/territory mappings
**Owner:** Governance / human administrators  
**Inputs:** `agents/REGISTRY.md`, D-001  
**Deliverables:** explicit operational-to-technical mapping where evidence exists.  
**Forbidden:** inventing ownership mappings.

## 3. Work package WP-02 — WSS / Gateway contracts

### TASK-WSS-001 — Freeze WSS contract set
**Owner:** `AG-ENG-01`  
**Primary technical territory:** `IA-07`  
**Dependencies:** `IA-03`, `IA-06`, `IA-08`  
**Required contracts:** transport lifecycle, authentication/device identity, envelope, message types, correlation, ACK, error semantics, reconnect/idempotency, Inbox/Outbox integration.  
**Deliverable:** versioned WSS contract documents and acceptance criteria.  
**Forbidden:** implementing runtime before contracts are accepted.

### TASK-WSS-002 — Implement WSS transport
**Owner:** `AG-ENG-01`  
**Territory:** `agents/07-gateway-wss/`  
**Depends on:** TASK-WSS-001  
**Quality gate:** contract tests + integration tests + end-to-end evidence.

### TASK-WSS-003 — WSS verification
**Owner:** `AG-QAOPS-01`  
**Depends on:** TASK-WSS-002  
**Scope:** protocol correctness, auth boundary, correlation, reconnect/idempotency, failure behavior and evidence package.

## 4. Work package WP-03 — AI contracts

### TASK-AI-001 — LLMProvider contract
**Owner:** `AG-AI-01`  
**Technical territory:** `IA-05`  
**Required:** typed input/output boundary, provider isolation, error semantics, model profile, provenance.  
**Forbidden:** provider-specific logic leaking into domain/core.

### TASK-AI-002 — AIExecution contract
**Owner:** `AG-AI-01`  
**Dependencies:** TASK-AI-001  
**Required:** execution lifecycle, structured output, context assembly, persistence/event boundaries, fallback/recovery.  
**Rule:** model output remains untrusted input and cannot mutate business state directly.

### TASK-AI-003 — Tool Authorization
**Owner:** `AG-AI-01` + security review by `AG-QAOPS-01`  
**Required:** separate interpretation from authorization; deterministic policy boundary; auditable denial/fallback semantics.

## 5. Work package WP-04 — UX / terminology

### TASK-UX-001 — Apply D-006 terminology
**Owner:** `AG-UX-01`  
**Inputs:** `GOVERNANCE/TERMINOLOGY.md`  
**Scope:** navigation, renderer labels, product documentation vocabulary.  
**Forbidden:** changing domain contracts without a linked contract task.

### TASK-UX-002 — Validate provider-neutral conversation model in UI
**Owner:** `AG-UX-01` with `AG-AI-01` and `AG-ENG-01` collaboration where contracts cross boundaries  
**Acceptance:** UI terminology matches canonical domain terminology and provider-specific labels remain contextual.

## 6. Work package WP-05 — QA / Release

### TASK-QA-001 — CI/release gate adoption
**Owner:** `AG-QAOPS-01`  
**Inputs:** `GOVERNANCE/QUALITY_GATES.md`  
**Deliverables:** executable checklist, evidence template, release verdict format.  
**Forbidden:** approving own release unilaterally.

### TASK-QA-002 — Baseline verification
**Owner:** `AG-QAOPS-01`  
**Scope:** branch/SHA, lint, typecheck, unit, integration, build, security, CI status, evidence.  
**Output states:** `TESTED`, `VERIFIED`, `READY_FOR_REVIEW`.

## 7. Work package WP-06 — Growth

### TASK-GROWTH-001 — Scope-aligned growth work
**Owner:** `AG-GROWTH-01`  
**Rule:** only tasks explicitly present in approved product scope and roadmap may enter implementation. Growth output must not redefine product scope, architecture or governance.

## 8. Standard implementation task contract

Every implementation task must declare:

- `TASK_ID`
- `OWNER`
- `TECHNICAL_TERRITORY`
- `OPERATIONAL_AGENT`
- `INPUT_CONTRACTS`
- `ALLOWED_PATHS`
- `FORBIDDEN_AREAS`
- `DEPENDENCIES`
- `ACCEPTANCE_CRITERIA`
- `TEST_REQUIREMENTS`
- `EVIDENCE_REQUIREMENTS`
- `HANDOFF`
- `APPROVAL_GATE`

## 9. Start gate

Implementation may begin only when:

1. required human decisions are recorded;
2. technical territory is known;
3. required contracts are frozen;
4. Permission Matrix permits the intended action;
5. acceptance criteria exist;
6. test/evidence requirements exist;
7. dependencies are not unresolved blockers.

## 10. Current blockers

- WSS runtime: P0 until contract set is frozen and implementation completed.
- Permission Matrix rollout: required before broad write delegation.
- CI/release evidence: required before readiness/release claims.

## 11. Human governance rule

Agents may implement only tasks explicitly authorized by the current roadmap, contracts and Permission Matrix. A recommendation is not an authorization. A dry run is not an implementation instruction.
