# IA-08 Roadmap

Aligned with global roadmap; no product work is initiated here.

1. FOUNDATION — preserve secure Electron boundary; confirm renderer bootstrap and UI package boundaries.
2. CONTRACT CONSUMPTION — integrate only stable outputs from IA-01/02/03/04/05/06/07.
3. OPERATIONAL SURFACES — Dashboard, conversations/atendimentos, orders, catalog/customers, reports/settings, diagnostics/health, widget/tray and human takeover.
4. UX HARDENING — loading/error/empty/recovery states, accessibility and operator workflows.
5. TESTING — component, integration and end-to-end evidence.
6. DESKTOP OPERATIONS — packaging/update/signing/release readiness with required external platform approvals.

## Cross-agent dependencies
- IA-01: canonical persisted models consumed by UI-facing read models.
- IA-02: domain commands, queries, invariants and errors.
- IA-03: event/queue/audit/recovery status.
- IA-04: order lifecycle and actions; CONTRACT-002 impact.
- IA-05: conversation and LLM interaction state.
- IA-06: enrollment/session/auth state.
- IA-07: WSS/Gateway connectivity and transport health.

Blockers: unresolved contracts where presentation would encode semantics; missing stable runtime outputs; external packaging/signing configuration.
