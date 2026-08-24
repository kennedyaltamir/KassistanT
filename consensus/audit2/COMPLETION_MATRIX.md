# Completion Matrix — Auditor 2

Status: INDEPENDENT / NOT AN AUTHORIZATION

| ID | AREA | WORK_ITEM | TYPE | C1_C2_C3 | OWNER | CURRENT_STATE | EVIDENCE | EVIDENCE_CONFIDENCE | DEPENDS_ON | BLOCKING | PARALLELIZABLE | REQUIRED_HUMAN_DECISION | NEXT_ACTION |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| DOD-01 | Governance | Current MVP DoD freeze | HUMAN_DECISION_REQUIRED | C1 | Operator | PARTIAL/NEEDS_FREEZE | Baseline + audit | PARTIALLY_VERIFIED | Baseline/consensus | YES | YES | YES | Ratify C1 DoD |
| IA01-01 | IA-01 | Schema-critical field/constraint decisions | HUMAN_DECISION_REQUIRED | C1 | IA-01/Operator | OPEN/PARTIAL | IA-01 decisions/progress | VERIFIED | Baseline/domain docs | YES | YES | YES | Resolve only C1-critical fields |
| IA01-02 | IA-01 | Canonical business schema implementation | IMPLEMENTATION_REQUIRED | C1 | IA-01 | NOT_IMPLEMENTED | IA-01 PROGRESS | VERIFIED | IA01-01; CONTRACT-001/002 as applicable | YES | LIMITED | AFTER_DECISIONS | Implement deterministic schema |
| IA01-03 | IA-01 | Schema validation suite | VERIFICATION_REQUIRED | C1 | IA-01 | NOT_STARTED | IA-01 ROADMAP | VERIFIED | IA01-02 | YES | NO | NO | Add schema/constraint/migration tests |
| IA01-04 | IA-01 | Migration 0002 / canonical migration | AUTHORIZATION_REQUIRED + IMPLEMENTATION_REQUIRED | C1 | IA-01/Operator | NOT_AUTHORIZED | Consensus + IA-01 docs | VERIFIED | deterministic schema + strategy | YES | NO | YES | Authorize only after schema gate |
| IA02-01 | IA-02 | Versioned materialization of DREQ-001/002/005/006 | DOCUMENTATION_REQUIRED | C1 | IA-02 | CONFLICTED | Main DECISIONS still lists older open state | VERIFIED | Human decision | YES | YES | YES | Reconcile versioned decision record |
| IA02-02 | IA-02 | Order/ConfirmOrder first runtime slice | IMPLEMENTATION_REQUIRED | C1 | IA-02 | NOT_IMPLEMENTED_IN_MAIN | IA-02 PROGRESS | VERIFIED | IA02-01; applicable schema/domain gates | YES | YES | YES | Authorize after cross-audit |
| IA02-03 | IA-02 | Domain integration/verification | INTEGRATION_REQUIRED + VERIFICATION_REQUIRED | C1 | IA-02/IA01/IA03/IA04 | NOT_STARTED | Agent roadmaps | PARTIALLY_VERIFIED | IA02-02 + dependencies | YES | NO | NO | Cross-agent integration test |
| IA03-01 | IA-03 | EventBus V1 runtime in main | IMPLEMENTATION_REQUIRED | C1* | IA-03 | CONFLICTED; main agent records say NOT_IMPLEMENTED | IA-03 PROGRESS/ROADMAP | VERIFIED | IA01/IA02 contracts | CONDITIONAL | YES | NO | Reconcile claimed historical implementation vs main |
| IA03-02 | IA-03 | InboundInbox runtime | IMPLEMENTATION_REQUIRED | C1 | IA-03 | NOT_IMPLEMENTED | IA-03 ROADMAP | VERIFIED | IA01 schema + domain event intake | YES | YES | NO | Implement after persistence gate |
| IA03-03 | IA-03 | DomainOutbox | IMPLEMENTATION_REQUIRED | C1 | IA-03 | BLOCKED | CONTRACT-001 | VERIFIED | CONTRACT-001 | YES | NO | YES | Resolve contract first |
| IA03-04 | IA-03 | JobQueue/AuditLog/reliability | IMPLEMENTATION_REQUIRED | C1/C2 | IA-03 | NOT_IMPLEMENTED | IA-03 ROADMAP | VERIFIED | persistence + contracts | CONDITIONAL | YES | NO | Map exact C1 use first |
| IA04-01 | IA-04 | Money verification/harness registration | VERIFICATION_REQUIRED | C1 support | IA-04/Shared Harness | BRANCH_PROGRESS / NOT_IN_MAIN | IA-04 history + harness | VERIFIED | harness owner | NO_GLOBAL | YES | NO | Register test then verify |
| IA04-02 | IA-04 | Full Order Engine | IMPLEMENTATION_REQUIRED | C1 | IA-04 | NOT_IMPLEMENTED | IA-04 PROGRESS/DECISIONS | VERIFIED | IA01/IA02/IA03/CONTRACT-002 | YES | LIMITED | YES | Define incremental slices |
| IA05-01 | IA-05 | DR-001 typed LLMProvider contract materialization | HUMAN_DECISION_REQUIRED + DOCUMENTATION_REQUIRED | C1 | IA-05/Operator | OPEN | IA-05 DECISIONS | VERIFIED | Operator decision | YES | YES | YES | Close contract |
| IA05-02 | IA-05 | AI-V1 provider runtime | IMPLEMENTATION_REQUIRED | C1 | IA-05 | NOT_IMPLEMENTED | IA-05 PROGRESS | VERIFIED | IA05-01 | YES | YES | YES | Implement after contract |
| IA05-03 | IA-05 | Conversation runtime | IMPLEMENTATION_REQUIRED | C1 | IA-05 | NOT_IMPLEMENTED | IA-05 PROGRESS | VERIFIED | IA02/IA03/IA05-01 | YES | YES | NO | Implement conversation lifecycle |
| IA05-04 | IA-05 | Model selection/external provider decision | HUMAN_DECISION_REQUIRED | C1 or C2 depending MVP | Operator/IA05 | OPEN/EXTERNAL | IA-05 DECISIONS | VERIFIED | benchmark/external | CONDITIONAL | YES | YES | Determine MVP requirement |
| IA06-01 | IA-06 | DR-02A.1 signed context elements | HUMAN_DECISION_REQUIRED | C1 | Operator/IA06 | PENDING | IA-06 current response | VERIFIED | prior decision | YES | YES | YES | Decide explicitly |
| IA06-02 | IA-06 | DR-02A.2 signed-byte derivation | HUMAN_DECISION_REQUIRED | C1 | Operator/IA06 | PENDING | IA-06 current response | VERIFIED | IA06-01 | YES | NO | YES | Decide after 02A.1 |
| IA06-03 | IA-06 | DR-02A.3 public key representation | HUMAN_DECISION_REQUIRED | C1 | Operator/IA06 | PENDING | IA-06 current response | VERIFIED | IA06-01 | YES | YES | YES | Decide |
| IA06-04 | IA-06 | DR-02A.4 signature representation | HUMAN_DECISION_REQUIRED | C1 | Operator/IA06 | PENDING | IA-06 current response | VERIFIED | IA06-01 | YES | YES | YES | Decide |
| IA06-05 | IA-06 | Signature Verification Boundary | IMPLEMENTATION_REQUIRED | C1 | IA-06 | BLOCKED | IA-06 response | VERIFIED | IA06-01..04 + authz | YES | YES | YES | Materialize contract then authorize |
| IA06-06 | IA-06 | Full device auth runtime (enrollment/session/replay/rotation/revocation) | IMPLEMENTATION_REQUIRED | C1 | IA-06 | NOT_IMPLEMENTED | IA-06 PROGRESS | VERIFIED | DR-02B + schema + IA07 | YES | NO | YES | Close required subcontracts, then implement |
| IA07-01 | IA-07 | WSS lifecycle runtime | IMPLEMENTATION_REQUIRED | C1 | IA-07 | NOT_IMPLEMENTED | IA-07 PROGRESS | VERIFIED | IA06 + IA03 intake/ack | YES | NO | NO | Implement after dependency gates |
| IA07-02 | IA-07 | Gateway HTTP runtime | IMPLEMENTATION_REQUIRED | C1 | IA-07 | SKELETON | IA-07 ROADMAP | VERIFIED | contracts + intake | YES | YES | NO | Implement required endpoints |
| IA08-01 | IA-08 | Frontend Foundation | IMPLEMENTATION_REQUIRED | C1 support | IA-08 | BRANCH_PROGRESS / NOT_IN_MAIN | IA-08 branch evidence; main lacks files | VERIFIED | none for presentation layer | NO | YES | YES | Merge only after tests/CI |
| IA08-02 | IA-08 | Functional frontend integration | IMPLEMENTATION_REQUIRED + INTEGRATION_REQUIRED | C1 | IA-08 | NOT_IN_MAIN | main src tree only skeleton | VERIFIED | IA01/02/03/04/05/06/07 outputs | YES | NO | YES | Build real adapters/flows |
| SH-01 | Shared Test Harness | Add missing TypeScript test discovery | IMPLEMENTATION_REQUIRED | C1 verification | Shared owner | NOT_REGISTERED | `scripts/test-desktop.mjs` explicit list | VERIFIED | tests exist in branches | CONDITIONAL | YES | YES | Assign owner + register tests |
| INT-01 | Integration | Domain↔SQLite | INTEGRATION_REQUIRED | C1 | IA01/IA02 | NOT_STARTED | Roadmaps | VERIFIED | IA01 schema + IA02 runtime | YES | NO | NO | Integrate repositories/UoW |
| INT-02 | Integration | Domain↔Event infrastructure | INTEGRATION_REQUIRED | C1 | IA02/IA03 | NOT_STARTED | Agent decisions | VERIFIED | event contracts/persistence | YES | LIMITED | NO | Integrate after IA03 gate |
| INT-03 | Integration | Device Auth↔Gateway/WSS | INTEGRATION_REQUIRED | C1 | IA06/IA07 | NOT_STARTED | IA07/IA06 docs | VERIFIED | auth/session + WSS | YES | NO | NO | Cross-agent acceptance |
| INT-04 | Integration | Gateway↔WhatsApp | INTEGRATION_REQUIRED | C1 | IA07/external | NOT_STARTED | Baseline | VERIFIED | external platform | YES | YES | YES | External setup + adapter |
| INT-05 | Integration | Desktop↔Core/Application | INTEGRATION_REQUIRED | C1 | IA08/Core | NOT_STARTED | baseline + IA08 scope | VERIFIED | stable application boundaries | YES | NO | NO | Connect real UI |
| INT-06 | Integration | Conversation↔Domain/LLM | INTEGRATION_REQUIRED | C1 | IA05/IA02 | NOT_STARTED | baseline | VERIFIED | AI-V1 + domain | YES | YES | NO | Integrate validated actions |
| VER-01 | Testing | Official suite coverage | VERIFICATION_REQUIRED | C1 | Shared owner | PARTIAL | runner excludes new TS tests | VERIFIED | SH-01 | YES for affected merges | YES | NO | Register and execute |
| VER-02 | Testing | CI on actual implementation heads | VERIFICATION_REQUIRED | C1 | Agent/CI | NOT_VERIFIED | ci.yml defines gates | VERIFIED | PRs/branches | YES at merge | YES | NO | Run actual CI |
| VER-03 | Testing | Cross-system integration/E2E | VERIFICATION_REQUIRED | C1 | QA/agents | NOT_STARTED | Roadmap baseline | VERIFIED | integrated runtime | YES | NO | NO | Define C1 acceptance vectors |
| VER-04 | Testing | Security verification of auth/WSS/desktop | VERIFICATION_REQUIRED | C1 | Auditors/agents | NOT_STARTED | security baseline | PARTIALLY_VERIFIED | implementations | YES | NO | NO | Audit concrete runtime |
| EXT-01 | External | WhatsApp application/configuration | EXTERNAL_ACTION_REQUIRED | C1 | Operator | EXTERNAL/UNKNOWN | Baseline states professional WhatsApp direction | PARTIALLY_VERIFIED | provider account/config | CONDITIONAL | YES | YES | Confirm required account/config |
| REL-01 | Release | Packaging/signing/update | EXTERNAL_ACTION_REQUIRED + VERIFICATION_REQUIRED | C2 | Release owner | NOT_STARTED | Baseline + roadmap | VERIFIED | functional desktop | NO_C1 | YES | YES | Plan production readiness separately |
| REL-02 | Recovery | Backup/restore/recovery | IMPLEMENTATION_REQUIRED + VERIFICATION_REQUIRED | C2 | IA01/ops | NOT_STARTED | Baseline/roadmap | VERIFIED | stable persistence | NO_C1 | YES | YES | Define production-readiness gate |

### Matrix interpretation

`* IA03 EventBus status is CONFLICTED because the consensus plan describes V1 as implemented/tested, while the current main IA-03 progress/roadmap and absence of a corresponding main event-bus directory indicate NOT_IMPLEMENTED on main. This must be reconciled by evidence, not assumed either way.`

This matrix intentionally does not count every UI screen, field, test case or file as a separate work item.
