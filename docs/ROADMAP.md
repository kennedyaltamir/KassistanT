# KassisT — Project Roadmap

> **Status:** Audited roadmap — documentation-only change
> **Audit date:** 2026-08-24
> **Main HEAD:** `cb9f278a22925f58ef26188e444a86d826cbe8e4`
> **Baseline:** `KassisT_Approved_Technical_Baseline_v1.0.1.md` — SHA `02830152099f58307912ce382c064a3c4075f505`

This roadmap records repository reality and separates implementation, documentation, planning, external dependencies and unresolved decisions. It is not a delivery schedule.

## 1. Executive Summary

KassisT has an approved baseline, monorepo/bootstrap foundation, CI/security/supply-chain foundation, the M5.1 SQLite/persistence foundation, and the API/backend/domain contract documentation layer merged into `main` through PR #3.

The product runtime remains largely unimplemented. The current repository contains a small SQLite bootstrap migration, domain foundation primitives, a secure Electron shell, a Gateway skeleton and the merged contractual documentation. Canonical business schema, full domain runtime, durable event infrastructure, order/conversation engines, device runtime, production WSS/Gateway runtime, provider adapters, complete desktop behavior, E2E, packaging, recovery and release operations remain future work.

The following remain intentionally unresolved:

- `CONTRACT-001` — DomainOutbox ownership/scope.
- `CONTRACT-002` — `order.status_changed` semantics.
- `GOV-001` — documentation version authority/history policy.

No architectural decision is introduced by this roadmap.

## 2. Current State

### Evidence vocabulary

- **FACT** — directly observed in GitHub/repository.
- **AUDITED** — independently checked against current GitHub state.
- **PLANNED** — specified but not implemented.
- **BLOCKED** — unsafe to implement until a stated dependency/decision closes.
- **EXTERNAL** — dependent on provider/infrastructure/approval outside the repository.
- **AMBIGUOUS** — conflicting normative material remains unresolved.
- **NOT_IMPLEMENTED** — no runtime evidence found.
- **NOT_VERIFIED** — available evidence is insufficient to claim the property.
- **SKELETON** — structural code exists but is not functional completion.

### Repository reality

`main` is `cb9f278a22925f58ef26188e444a86d826cbe8e4`, the merge commit for PR #3. PR #3 added documentation/contracts only; it did not implement the product runtime.

The Electron shell has `contextIsolation: true`, `nodeIntegration: false` and `sandbox: true`. This is a security foundation, not the finished desktop application.

The Gateway currently has minimal HTTP/main/config/WSS structure. There is no evidence that the contracted HTTP and WSS runtime is fully implemented.

The current SQLite bootstrap migration creates only `_schema_metadata`; canonical business tables are not present.

## 3. Executive Dashboard

| Area | Status | Evidence | Next step |
|---|---|---|---|
| Repository | AUDITED | `main` = `cb9f278a…` | Continue PR governance |
| Baseline | DONE / AUDITED | v1.0.1, SHA `0283015209…` | Preserve authority |
| Bootstrap | DONE / FOUNDATION | monorepo + apps/packages/gateway | Extend incrementally |
| CI | CONFIGURED | workflows exist | Verify every actual PR HEAD |
| Security | CONFIGURED | security workflow + baseline controls | Functional hardening later |
| Supply Chain | CONFIGURED | supply-chain + dependency review | Maintain controls |
| GitHub governance | NOT_VERIFIED | protection response is internally inconsistent | Verify rulesets |
| M5.1 | DONE / MERGED | PR #2 / `4de4c00f…` | M5.2 canonical schema |
| API Contract | MERGED / PRESENT IN MAIN | PR #3 / `cb9f278a…` | Maintain consistency |
| OpenAPI | MERGED / PRESENT IN MAIN | docs/protocols | Keep validated |
| Backend Documentation | MERGED / PRESENT IN MAIN | docs/backend | Keep synchronized |
| Domain | PARTIAL | primitives + contracts | Implement runtime |
| SQLite | PARTIAL FOUNDATION | metadata-only migration | M5.2 schema |
| Event Infrastructure | NOT_IMPLEMENTED | contracts exist, runtime absent | Implement after decision gates |
| Order Engine | NOT_STARTED | no runtime evidence | Implement after core/event layers |
| Conversation | NOT_STARTED | no runtime evidence | Implement after core/event layers |
| LLM | NOT_STARTED | Ollama is baseline direction only | Implement provider adapter |
| Device Auth | NOT_STARTED | contract present, runtime absent | Implement enrollment/auth |
| WSS | SKELETON | minimal Gateway WSS module | Implement protocol runtime |
| Gateway | SKELETON | minimal runtime structure | Implement contracted operations |
| WhatsApp | NOT_STARTED | no runtime adapter evidence | Implement after Gateway |
| Google | NOT_STARTED | no runtime adapter evidence | Implement after integration contract |
| Desktop | SKELETON / FOUNDATION | Electron shell + DB | Build operational desktop |
| Observability | PARTIAL / DOCUMENTED | baseline + backend docs | Implement runtime telemetry |
| Testing | PARTIAL | M5.1 + contract validation | Expand product test suite |
| Release Readiness | NOT_READY | no production evidence | Complete readiness gates |

## 4. Current Git State

### Main

- Default branch: `main`
- HEAD: `cb9f278a22925f58ef26188e444a86d826cbe8e4`
- HEAD message: `Merge pull request #3 from kennedyaltamir/docs/api-backend-contracts-v1`
- PR #3 is therefore part of current `main` history.

### Relevant branches

Current repository discovery includes `main`, `docs/project-roadmap`, `docs/api-backend-contracts-v1` and historical/bootstrap validation branches. Historical branches are not deleted by this task.

### PRs

**PR #2 — M5.1:** merged. Database lifecycle, deterministic migrations/checksums, transactions, database errors, UUIDv7/UTC/Money primitives and tests. Full canonical schema, DomainOutbox behavior, Order Engine, providers and production WSS/Gateway were explicitly excluded.

**PR #3 — API/backend/domain contracts:** merged into `main`. HTTP API, OpenAPI 3.1, WSS, enrollment, domain, provider and backend documentation, registry and cross-consistency validation are now present in `main`. `CONTRACT-001`, `CONTRACT-002` and `GOV-001` remain open.

**PR #4 — roadmap:** open, documentation-only.

## 5. Baseline and Governance

The approved baseline is present in `main` with SHA `02830152099f58307912ce382c064a3c4075f505` and declared version **1.0.1**. It is not modified by this roadmap.

GitHub reports `main` as protected while the returned protection object reports `enabled: false` and no required contexts. This remains **NOT_VERIFIED**, not GREEN.

## 6. Architecture Status

Intended topology:

`WhatsApp → Gateway HTTPS/Webhook → transport durability → WSS → Desktop Core → SQLite/LLM/Integrations/UI`

Observed foundation:

- Electron shell exists.
- SQLite foundation exists.
- Gateway skeleton exists.
- Domain foundation package exists.
- API/backend/domain contracts are present in `main`.
- Full Core business runtime does not yet exist.
- Full transport implementation does not yet exist.
- Provider adapters do not yet exist in `main`.

Architectural invariants:

- LLM interprets; Core decides.
- Database persists authoritative state.
- Inbox receives durably/idempotently.
- Outbox/queue govern external effects and recovery under the final contract.
- Gateway transports/integrates; it is not business-rule authority.
- Adapters isolate providers.
- Audit proves; observability explains.

## 7. Implementation Matrix

| Component | Code | Contract | Tests | State |
|---|---|---|---|---|
| Desktop | SKELETON | DEFINED | LIMITED | PARTIAL |
| Gateway | SKELETON | DEFINED | LIMITED | PARTIAL |
| HTTP API | NOT_IMPLEMENTED | DEFINED / PARTIAL | CONTRACT VALIDATION | NOT_STARTED |
| WSS | SKELETON | DEFINED | NOT_IMPLEMENTED | NOT_STARTED |
| SQLite | FOUNDATION IMPLEMENTED | DEFINED | M5.1 TESTS | DONE FOUNDATION |
| Migrations | FOUNDATION IMPLEMENTED | DEFINED | M5.1 TESTS | DONE FOUNDATION |
| Persistence | PARTIAL | DEFINED | PARTIAL | PARTIAL |
| Domain | FOUNDATION PRIMITIVES | PARTIAL | FOUNDATION TESTS | PARTIAL |
| EventBus | NOT_IMPLEMENTED | DEFINED | NOT_IMPLEMENTED | NOT_STARTED |
| InboundInbox | NOT_IMPLEMENTED | DEFINED | NOT_IMPLEMENTED | NOT_STARTED |
| DomainOutbox | NOT_IMPLEMENTED | AMBIGUOUS | NOT_IMPLEMENTED | BLOCKED |
| JobQueue | NOT_IMPLEMENTED | DEFINED | NOT_IMPLEMENTED | NOT_STARTED |
| AuditLog | NOT_IMPLEMENTED | DEFINED | NOT_IMPLEMENTED | NOT_STARTED |
| Order Engine | NOT_IMPLEMENTED | DEFINED / PARTIAL | NOT_IMPLEMENTED | BLOCKED_BY_CORE |
| Conversation Engine | NOT_IMPLEMENTED | PARTIAL | NOT_IMPLEMENTED | NOT_STARTED |
| LLM Provider | NOT_IMPLEMENTED | DEFINED / EXTERNAL | NOT_IMPLEMENTED | EXTERNAL_DEPENDENCY |
| WhatsApp | NOT_IMPLEMENTED | DEFINED | NOT_IMPLEMENTED | NOT_STARTED |
| Google | NOT_IMPLEMENTED | DEFINED | NOT_IMPLEMENTED | EXTERNAL |
| Notifications | NOT_IMPLEMENTED | DEFINED | NOT_IMPLEMENTED | NOT_STARTED |
| Observability | PARTIAL / FOUNDATION | DEFINED | LIMITED | PARTIAL |

## 8. Documentation and Contract Status

The API/backend/domain documentation is **MERGED / PRESENT IN MAIN** through PR #3.

Merged content includes HTTP API, OpenAPI 3.1, WSS, device enrollment/authentication, domain entities/commands/queries/events/invariants/errors, provider contracts, backend runtime/persistence/security/health/recovery/testing documentation, contract registry and cross-consistency audit.

Documentation presence is never treated as runtime implementation evidence.

### Unresolved contracts

**CONTRACT-001:** OPEN — DomainOutbox ownership/scope.

**CONTRACT-002:** OPEN — `order.status_changed` normative semantics.

**GOV-001:** OPEN — version authority/history policy.

This roadmap intentionally does not resolve them.

## 9. Completed Phases

### P0 — Governance / Baseline / Repository Foundation

DONE / AUDITED, with ruleset enforcement NOT_VERIFIED.

### P1 — Bootstrap Monorepo

DONE / FOUNDATION.

### P2 — CI / Security / Supply Chain

FOUNDATION DONE. Controls exist; future claims require evidence for the actual PR HEAD.

### P3 — API / Backend / Domain Documentation

DONE / MERGED / PRESENT IN MAIN. PR #3 is merged and the documentation layer is present in `main`; open contract ambiguities remain intentionally preserved.

### P4 — M5.1 SQLite + Persistence Foundation

DONE / MERGED. Foundation and primitives exist; canonical business schema/runtime remain future work.

## 10. Active Work and Blockers

The documentation foundation is complete in `main`. The next technical implementation gate is **P5 — Canonical SQLite Schema**.

Blocking decisions:

- `CONTRACT-001` blocks runtime choices that would encode DomainOutbox ownership/scope.
- `CONTRACT-002` blocks runtime choices that would encode conflicting order event semantics.
- `GOV-001` blocks normative version-authority assumptions where relevant.

These do not block unrelated tooling or work that does not encode the unresolved decisions.

## 11. Roadmap

| Phase | Objective | Dependencies | Suggested branch | Status |
|---|---|---|---|---|
| P0 | Governance / baseline | none | `docs/governance-*` | DONE |
| P1 | Bootstrap monorepo | P0 | `feat/bootstrap-*` | DONE |
| P2 | CI/security/supply chain | P1 | `ci/*` | PARTIAL |
| P3 | API/backend/domain documentation | P0/P1 | `docs/api-backend-contracts-*` | DONE |
| P4 | M5.1 persistence foundation | P1/P2 | `feat/m5-1-sqlite-foundation` | DONE |
| P5 | Canonical SQLite schema | P3/P4 | `feat/m5-2-canonical-schema` | READY |
| P6 | Domain runtime | P3/P5 | `feat/domain-runtime-*` | NOT_STARTED |
| P7 | EventBus/Inbox/Outbox/Queue/Audit | P3/P5/P6 + CONTRACT-001 | `feat/event-infrastructure-*` | BLOCKED |
| P8 | Order Engine | P5/P6/P7 + CONTRACT-002 | `feat/order-engine-*` | BLOCKED |
| P9 | Conversation Engine | P5/P6/P7 | `feat/conversation-engine-*` | NOT_STARTED |
| P10 | LLM provider runtime | P9 + provider contract | `feat/llm-provider-*` | NOT_STARTED |
| P11 | Device enrollment/auth | P3/P6 | `feat/device-auth-*` | NOT_STARTED |
| P12 | WSS runtime | P3/P7/P11 | `feat/wss-runtime-*` | NOT_STARTED |
| P13 | Gateway HTTP runtime | P3/P7/P11/P12 | `feat/gateway-runtime-*` | NOT_STARTED |
| P14 | WhatsApp | P13 + provider contract | `feat/integration-whatsapp-*` | EXTERNAL / NOT_STARTED |
| P15 | Google | P6/P13 + contract | `feat/integration-google-*` | EXTERNAL / NOT_STARTED |
| P16 | Notifications | P7/P13 | `feat/notifications-*` | NOT_STARTED |
| P17 | Desktop runtime | P5–P13 | `feat/desktop-runtime-*` | NOT_STARTED |
| P18 | Observability | P7/P13/P17 | `feat/observability-*` | PARTIAL |
| P19 | Reliability/recovery | P5–P18 | `feat/reliability-*` | NOT_STARTED |
| P20 | Security hardening | P11–P19 | `security/hardening-*` | NOT_STARTED |
| P21 | E2E / acceptance | P13–P20 | `test/e2e-*` | NOT_STARTED |
| P22 | Packaging / distribution | P17/P20/P21 | `release/windows-packaging-*` | NOT_STARTED |
| P23 | Backup / restore | P5/P17/P19 | `feat/backup-recovery-*` | NOT_STARTED |
| P24 | Production readiness | P18–P23 | `release/readiness-*` | NOT_STARTED |
| P25 | Release | P24 | `release/v*` | NOT_STARTED |

## 12. Dependency Graph

```text
P3 Contracts
   ↓
Open decisions
   ↓
P5 Schema
   ↓
P6 Domain
   ↓
P7 EventBus/Inbox/Outbox/Queue/Audit
   ├──→ P8 Order Engine
   ├──→ P9 Conversation → P10 LLM
   └──→ P11 Device Auth → P12 WSS → P13 Gateway
                                      ├──→ P14 WhatsApp
                                      ├──→ P15 Google
                                      └──→ P16 Notifications
                                               ↓
                                          P17 Desktop
                                               ↓
                                      P18 Observability
                                               ↓
                                      P19 Recovery
                                               ↓
                                      P20 Security
                                               ↓
                                          P21 E2E/UAT
                                            ↙       ↘
                                   P22 Packaging  P23 Backup
                                            \       /
                                           P24
                                            ↓
                                           P25
```

This is a dependency model, not a requirement for strictly serial execution. CI/tooling, documentation maintenance and selected adapter preparation may proceed in parallel where they do not encode unfinished decisions.

## 13. Parallel Workstreams

**Documentation / Contracts:** maintain merged contract layer and resolve explicit decisions.

**Core / Persistence:** M5.2 schema → repositories/UoW → domain runtime.

**CI / Tooling:** continuous independent maintenance with evidence tied to actual PR heads.

**Integration Adapters:** prepare against existing contracts; credentials and approval remain external gates.

**Desktop:** renderer/Main/UI work may proceed where unfinished business rules are not encoded.

**Security / Operations:** observability, recovery, threat modeling and release controls can progress without claiming runtime completion.

## 14. Security and Governance Gates

Applicable implementation PRs should satisfy:

1. feature branch from current `main`;
2. lint/typecheck/tests;
3. CI;
4. Security;
5. Supply Chain / Dependency Review;
6. contract consistency when applicable;
7. human review;
8. authorized approval/merge;
9. post-merge audit.

The LLM must not approve its own PR or bypass governance.

## 15. Definition of Done

A phase is DONE only when applicable evidence shows implementation, documentation/contracts, tests, security checks, required CI on the actual PR HEAD, human review, approved merge and post-merge audit.

A configured workflow is not proof of GREEN. Documentation is not proof of implementation. Historical checks are not proof for a changed HEAD.

## 16. Risks

| ID | Risk | Impact | Probability | State |
|---|---|---|---|---|
| R-001 | Contract ambiguity | High | Not rated | OPEN |
| R-002 | Documentation drift | High | Not rated | ACTIVE |
| R-003 | Implementation drift | High | Not rated | ACTIVE |
| R-004 | Provider dependency | High | Not rated | ACTIVE |
| R-005 | Migration risk | High | Not rated | ACTIVE |
| R-006 | Desktop security | High | Not rated | ACTIVE |
| R-007 | Supply chain | High | Not rated | ACTIVE |
| R-008 | WSS reliability | High | Not rated | NOT_IMPLEMENTED |
| R-009 | Idempotency failure | High | Not rated | NOT_IMPLEMENTED |
| R-010 | Observability gaps | Medium/High | Not rated | PARTIAL |
| R-011 | Recovery gaps | High | Not rated | NOT_IMPLEMENTED |
| R-012 | Release packaging | High | Not rated | NOT_IMPLEMENTED |

## 17. Release Readiness

Release requires evidence for canonical schema/migrations, deterministic domain runtime, durable event/inbox/outbox/queue/audit, order correctness, conversation/LLM safety, device auth/WSS, Gateway runtime, providers, complete Desktop runtime, observability, recovery, security hardening, E2E/UAT, signed Windows packaging, backup/restore, operational documentation and owner acceptance of remaining risks.

No release date is asserted.

## 18. Open Work

```text
Preserve merged contracts
        ↓
Resolve CONTRACT-001 / CONTRACT-002 / GOV-001
        ↓
M5.2 Schema
        ↓
Domain Runtime
        ↓
Event Infrastructure
        ↓
Order / Conversation / LLM
        ↓
Device Auth / WSS / Gateway
        ↓
Providers / Desktop
        ↓
Observability / Recovery / Security
        ↓
E2E / Packaging / Backup
        ↓
Production Readiness
        ↓
Release
```

## 19. Audit Evidence

Primary evidence:

- repository `kennedyaltamir/KassistanT`;
- `main` HEAD `cb9f278a22925f58ef26188e444a86d826cbe8e4`;
- baseline SHA `02830152099f58307912ce382c064a3c4075f505`;
- M5.1 PR #2;
- contract PR #3 and merge commit `cb9f278a…`;
- SQLite bootstrap migration;
- Electron Main/Preload;
- Gateway source;
- domain package;
- current GitHub workflow results for the updated roadmap HEAD.

Evidence limitation: the GitHub branch response reports `main` protected while the returned protection object reports `enabled=false`; ruleset enforcement remains NOT_VERIFIED.

## 20. Last Audited

**2026-08-24.**

This roadmap reflects the repository state after PR #3 merged. Subsequent merges, PRs, branch movement, workflow results, baseline revisions or contract decisions require a new audit/update.

---

## Maintenance Rule

Update this roadmap only from verifiable repository evidence. When a phase changes state, update status, evidence, dependencies and Definition of Done rather than merely changing a status marker.
