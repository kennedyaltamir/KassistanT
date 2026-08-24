# IA-01 — SCOPE

## Purpose

Definir exatamente o território funcional e técnico de IA-01 para evitar sobreposição durante a implementação paralela.

## In scope

### 1. Canonical SQLite schema

IA-01 é responsável pela representação persistente canônica, em SQLite local do Desktop Core, das entidades atribuídas:

- Store
- Device
- Settings
- ProductCategory
- Product
- ProductModifier
- ProductImage
- Promotion
- Customer
- CustomerAddress
- Conversation
- Message
- Order
- OrderItem
- OrderItemModifier
- OrderStatusHistory
- PaymentMethod
- Notification
- Integration
- IntegrationCredential
- InboundInbox
- DomainOutbox
- Job
- AuditLog
- Log
- AIProfile
- AIExecution
- KnowledgeItem

### 2. Schema constraints

Inclui apenas constraints e estruturas persistentes que estejam suportadas pelos contratos aprovados, tais como:

- primary keys;
- foreign keys;
- required/nullability rules;
- uniqueness;
- check constraints quando normativamente definidos;
- indexes necessários ao contrato e à integridade operacional;
- store scoping;
- temporal fields persisted in UTC;
- integer money fields in BRL cents.

### 3. Migrations

Inclui:

- canonical schema migrations;
- migration ordering;
- migration metadata compatibility;
- deterministic migration content;
- checksum-compatible migration behavior;
- schema upgrade tests directly associated with owned migrations.

### 4. Schema-level validation

Inclui testes que demonstrem, por exemplo:

- required tables exist;
- required columns/constraints exist;
- uniqueness is enforced;
- foreign keys behave as contracted;
- monetary fields use integer representation;
- UTC persistence conventions are respected where testable at schema boundary;
- migrations are deterministic and compatible with existing M5.1 runner behavior.

## Out of scope

### Domain behavior

Não pertence à IA-01:

- business rules;
- aggregate behavior;
- commands or queries as application behavior;
- state transition logic;
- pricing calculations;
- promotion evaluation;
- order confirmation/cancellation behavior;
- conversation orchestration;
- LLM/tool execution.

Esses itens pertencem principalmente à IA-02, IA-04 ou IA-05.

### Persistence runtime

Não pertence à IA-01:

- repositories;
- Unit of Work implementation;
- transaction orchestration outside schema/migration semantics;
- EventBus runtime;
- Inbox processors;
- Outbox dispatchers;
- Job workers;
- Audit runtime services.

A presença de uma tabela no schema não transfere a implementação de seu runtime para IA-01.

### External/Gateway persistence

IA-01 não é responsável pelo banco do Gateway cloud nem por PostgreSQL do Gateway.

### UI and IPC

Não pertence à IA-01:

- React UI;
- Zustand/UI state;
- Electron Renderer;
- IPC channels;
- widget;
- tray;
- dashboard.

### Providers and external services

Não pertence à IA-01:

- Meta/WhatsApp provider;
- Google People API;
- Ollama;
- notification providers;
- OAuth flows;
- WSS transport;
- TLS/DNS/hosting.

## Contract boundary

IA-01 pode implementar somente aquilo que os contratos permitem afirmar.

`CONTRACT-001` (DomainOutbox ownership/scope) permanece aberto e não pode ser resolvido pelo schema isoladamente.

`CONTRACT-002` (`order.status_changed`) é principalmente um contrato de eventos, mas qualquer alteração de schema motivada por sua semântica deve aguardar a decisão normativa.

`GOV-001` afeta autoridade/versionamento documental e não deve ser resolvido por IA-01.

## Shared-file rule

Mesmo quando um arquivo externo ao território parecer necessário, IA-01 não deve editá-lo sem autorização explícita da autoridade de integração.

Especialmente protegidos:

- `packages/contracts/**`
- `docs/protocols/**`
- `docs/domain/**`
- `docs/backend/**`
- `docs/ROADMAP.md`
- root configuration files
- CI workflows

## Boundary principle

> IA-01 define como o estado canônico é persistido; não decide o significado de negócio que não esteja aprovado no contrato.
