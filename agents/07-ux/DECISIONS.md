# IA-07 — Decisions

## D1 — Renderer-only first-sale UX

**Decision:** implement the first-sale UX as a renderer presentation layer using static HTML/CSS/JavaScript in `apps/desktop/src`.

**Reason:** the current desktop shell already loads `apps/desktop/src/index.html`; the mandate forbids changes to Electron main/preload and IPC architecture.

**Boundary:** no commercial authority, persistence, schema or external provider behavior is encoded here.

## D2 — No mock commercial truth

**Decision:** screens that require Core data show explicit empty/blocked states instead of fabricated products, prices, availability, payment methods or order results.

**Reason:** mock data is explicitly forbidden as product evidence.
