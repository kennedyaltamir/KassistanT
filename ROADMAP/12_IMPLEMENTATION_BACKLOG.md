# KassisT — Implementation Backlog v1.1

**Status:** P0 IMPLEMENTATION READY  
**Source:** D-001 through D-007 + Master Audit v1.0 + frozen P0 contract set  
**Task packets:** `ROADMAP/13_P0_IMPLEMENTATION_TASKS.md`  
**Rule:** no implementation task may bypass unresolved contract or governance blockers.

## 1. Execution sequence

`DECISIONS → CONTRACTS → IMPLEMENTATION → TESTS → EVIDENCE → AUDIT → RELEASE`

## 2. P0 implementation wave

The first implementation wave is authorized only for the task packets in `ROADMAP/13_P0_IMPLEMENTATION_TASKS.md`.

### P0-001 — WSS Runtime Transport
**Owner:** `AG-ENG-01`  
**Territory:** `IA-07 — Gateway + WSS`  
**Dependencies:** `IA-06` device authentication contract; `IA-03` Inbox/Outbox/event integration; `IA-08` Desktop integration support.  
**Status:** READY_FOR_IMPLEMENTATION

### P0-002 — AI Provider Contract Implementation
**Owner:** `AG-AI-01`  
**Territory:** `IA-05 — Conversation + LLM`  
**Dependencies:** frozen `AI-V1`; provider isolation; model profile/provenance boundary.  
**Status:** READY_FOR_IMPLEMENTATION

### P0-003 — AI Execution + Structured Output + Tool Authorization
**Owner:** `AG-AI-01`  
**Territory:** `IA-05 — Conversation + LLM`  
**Depends on:** P0-002.  
**Status:** READY_AFTER_P0_002

### P0-004 — Quality Gate Automation Baseline
**Owner:** `AG-QAOPS-01`  
**Territory:** QA/release operations.  
**Shared configuration:** `.github/**` only with explicit integration authority.  
**Status:** READY_FOR_IMPLEMENTATION

### P0-005 — Cross-Territory WSS Integration Verification
**Owner:** `AG-QAOPS-01`  
**Supporting agents:** `AG-ENG-01`, with IA-03/IA-06/IA-08 owner collaboration as required.  
**Depends on:** P0-001 + required dependency contracts.  
**Status:** READY_AFTER_P0_001

## 3. Deferred work packages

### UX / terminology
`AG-UX-01` may implement D-006 terminology tasks only after the canonical terminology artifact is frozen and the change is explicitly scoped. These tasks are not part of the first P0 runtime wave.

### Growth
`AG-GROWTH-01` receives implementation work only when an approved product/roadmap task is explicitly assigned. Growth does not redefine product scope, architecture or governance.

## 4. Standard implementation task contract

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

The complete P0 packets are the canonical task definitions.

## 5. Start gate

Implementation may begin only when:

1. required human decisions are recorded;
2. technical territory is known;
3. required contracts are frozen;
4. Permission Matrix permits the intended action;
5. acceptance criteria exist;
6. test/evidence requirements exist;
7. dependencies are not unresolved blockers.

## 6. Current P0 status

- D-001 through D-007: recorded.
- Permission Matrix: canonical/active.
- Quality Gates: canonical/active.
- WSS Runtime Contract: frozen for implementation.
- AI-V1 Contract: frozen for implementation.
- P0 task packets: created.
- Code implementation: not yet started by this backlog update.

## 7. Human governance rule

Agents may implement only tasks explicitly authorized by the current roadmap, contracts and Permission Matrix. A recommendation is not an authorization. A dry run is not an implementation instruction. `APPROVED` and `RELEASED` remain human-only states.
