# Learnings — IA-08 Audit

1. FACT: Desktop structure contains Electron, database and a two-file renderer entry, but no implemented application surfaces.
2. FACT: Security defaults are intentionally restrictive; future UI work must preserve the process boundary and use narrow IPC.
3. FACT: `main.tsx` exists but current static HTML does not demonstrate a running React application; runtime integration is NOT_VERIFIED.
4. FACT: No routing/state-management implementation was observed in the audited renderer structure.
5. FACT: `packages/ui` is structurally present but effectively skeletal.
6. INFERENCE: UI sequencing depends heavily on stable schema/domain/event/device/Gateway outputs; parallel UI shell work must avoid encoding unsettled semantics.
7. SECURITY: filesystem, database, secrets and environment values must not be exposed to renderer merely for convenience.
8. EXTERNAL: production packaging, updates and code-signing require later platform/infrastructure configuration; none is configured by IA-08 here.
