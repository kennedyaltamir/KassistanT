# IA-03 — Changelog

## Initial configuration
- Initialized the Event Infrastructure agent operating documentation.
- Audited the current repository state and recorded EventBus, InboundInbox, DomainOutbox, JobQueue, and AuditLog as not yet implemented runtime components.
- Documented ownership, dependencies, risks, blockers, and future validation requirements.
- Preserved CONTRACT-001, CONTRACT-002, and GOV-001 as open decisions; no unilateral resolution was introduced.
- Completed and persisted the IA-03 roadmap and handoff documentation.

## 2026-08-24 — Readiness audit
- Added Event Infrastructure readiness matrices and implementation gates.
- Added EventBus contract, error, test and runtime-readiness documentation.
- Updated IA-03 decisions, memory, learnings, errors, progress, roadmap and handoff.
- No application code, contracts, schema, migrations, workflows, package configuration or main branch were modified.

## 2026-08-24 — EventBus local decision closure
- Added `HUMAN-EVENTBUS-DECISIONS.md` containing the nine decision gates and explicit local-policy recommendations.
- Classified the remaining EventBus choices as local runtime policy, deferred/non-blocking, cross-agent dependency or global/external.
- Proposed isolated subscriber failure handling, aggregate failure reporting, async publication, opaque subscription identity, idempotent unsubscribe, unsubscribe-only cancellation, no V1 timeout, publish-time subscriber snapshots and all-selected-handlers-settled completion.
- Updated `EVENTBUS-RUNTIME-CONTRACT.md`, `EVENTBUS-TEST-MATRIX.md` and `EVENTBUS-IMPLEMENTATION-GATE.md`.
- Updated IA-03 memory, learnings, errors, progress, roadmap and handoff.
- No new global decision was recorded in `DECISIONS.md` because all new choices remain proposals pending human approval.
- No EventBus runtime or runtime tests were implemented.
