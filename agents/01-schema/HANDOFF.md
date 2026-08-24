# IA-01 — HANDOFF

## Purpose

Este documento permite que outra IA assuma o território de IA-01 sem depender de memória conversacional.

## Identity

- Agent: **IA-01 — Schema / Canonical SQLite**
- Territory: Canonical SQLite Schema e Persistence Schema Foundation
- Configuration branch: `agents/configuring`
- Integration authority: `main`

## Current verified state

1. KassisT é um Desktop Windows local-first com Core determinístico e SQLite local; Gateway é a fronteira de transporte/integração.
2. O baseline aprovado é `KassisT_Approved_Technical_Baseline_v1.0.1.md`.
3. M5.1 já implementou a fundação SQLite.
4. A migration atual `0001_bootstrap.sql` cria apenas `_schema_metadata`.
5. O schema canônico das entidades de negócio ainda não existe.
6. O inventário canônico de entidades deve ser tratado exatamente conforme o contrato protegido; não inferir, expandir ou reduzir a lista.
7. Detailed field schemas remain partial for several entities.
8. `CONTRACT-001`, `CONTRACT-002` and `GOV-001` remain unresolved in the current contract registry.

## Canonical entity inventory

Use the exact protected inventory:

`Store`, `Device`, `Settings`, `ProductCategory`, `Product`, `ProductModifier`, `ProductImage`, `Promotion`, `Customer`, `CustomerAddress`, `Conversation`, `Message`, `Order`, `OrderItem`, `OrderItemModifier`, `OrderStatusHistory`, `PaymentMethod`, `Notification`, `Integration`, `IntegrationCredential`, `InboundInbox`, `DomainOutbox`, `Job`, `AuditLog`, `Log`, `AIProfile`, `AIExecution`, `KnowledgeItem`.

## Existing M5.1 evidence

Relevant existing runtime foundation files are adjacent to the ownership boundary and should be treated as dependencies rather than owned files:

- `apps/desktop/electron/database/sqlite-database.ts`
- `apps/desktop/electron/database/migration-runner.ts`
- `apps/desktop/electron/database/migrations.ts`
- `apps/desktop/electron/database/errors.ts`
- `apps/desktop/electron/database/database.test.ts`

Owned implementation paths remain:

- `apps/desktop/database/migrations/**`
- `apps/desktop/electron/database/schema/**`
- schema-specific tests.

## Downstream dependencies

### IA-02 — Domain Runtime

Consumes canonical entity/persistence structure, but business rules remain outside schema.

### IA-03 — Event Infrastructure

Depends on durable structures for `InboundInbox`, `DomainOutbox`, `Job` and `AuditLog`. `CONTRACT-001` must be resolved before schema choices encode cross-boundary outbox ownership.

### IA-04 — Order Engine

Depends on product/catalog/customer/address/order/payment structures and their integrity constraints. `CONTRACT-002` must not be silently encoded through schema changes.

### IA-05 — Conversation + LLM

Depends on conversation/message/customer and AI-related persistence structures.

### IA-06 — Device Authentication

Depends on Store/Device identity and any contractually defined credential references. Secrets themselves must not be placed in insecure schema fields.

### IA-07 — Gateway + WSS

Gateway persistence is outside IA-01. Cross-boundary semantics must follow the protected contracts rather than local SQLite assumptions.

### IA-08 — Desktop UI

UI should consume application-level services/contracts and must not gain direct database privileges merely because a table exists.

## Open blockers

- `CONTRACT-001` — DomainOutbox ownership/scope.
- Partial field-level entity contracts.
- `GOV-001` — documentation authority/history, when a normative source conflict affects schema interpretation.

`CONTRACT-002` is an event-contract blocker only where schema design would depend on its unresolved semantics.

## External configuration dependencies

No external platform configuration is required to initialize the IA-01 territory documentation.

Future release work may depend on infrastructure/Windows operational policies, but those are not schema implementation prerequisites unless an approved contract says otherwise.

## Critical handoff rules

- Never infer a missing column from a consumer's presumed implementation.
- Never modify `packages/contracts/**` or protected docs to make the schema fit.
- Never claim canonical schema implementation until executable tables/migrations and tests exist.
- Verify current `main` before treating this handoff as current.
- Preserve migration checksums and M5.1 compatibility.
