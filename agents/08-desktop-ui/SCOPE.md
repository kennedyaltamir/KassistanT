# Scope — IA-08 Desktop UI

## In scope
Renderer composition, React bootstrap, navigation/routing, state presentation, UX for Dashboard, Atendimentos/Conversas, Pedidos, Produtos, Clientes, Relatórios, Configurações, Diagnostics, Widget, Tray-facing UX, Human Takeover, Health and operational surfaces; shared visual components in `packages/ui/**`.

## Out of scope
Canonical SQLite schema (IA-01), domain rules (IA-02), event durability (IA-03), order decisions (IA-04), conversation/LLM semantics (IA-05), device authentication authority (IA-06), Gateway/WSS runtime (IA-07), provider adapters and global contracts.

## Current audit
All named operational surfaces: NOT_STARTED unless separately documented; current renderer evidence is static bootstrap only. Navigation, routing and application state management are NOT_IMPLEMENTED/NOT_VERIFIED.

## Boundary
IA-08 consumes stable contracts and presents state/actions; it does not become business-rule authority.
