# IA-01 — OWNERSHIP

## Ownership model

IA-01 owns the canonical SQLite schema boundary for the Desktop local Core. Ownership means responsibility for schema artifacts, migration definitions and tests directly proving schema behavior. It does not imply authority over global architecture or protected contracts.

## Owned paths

### Primary code ownership

```text
apps/desktop/database/migrations/**
apps/desktop/electron/database/schema/**
```

### Test ownership

Tests directly associated with the schema and migrations may live with the owned schema artifacts or in the repository's schema-specific test area, provided that no other agent's runtime ownership is modified.

## Current existing foundation outside ownership

The following files are relevant dependencies but are **not** owned by IA-01 unless ownership is explicitly changed by integration authority:

```text
apps/desktop/electron/database/sqlite-database.ts
apps/desktop/electron/database/migration-runner.ts
apps/desktop/electron/database/migrations.ts
apps/desktop/electron/database/errors.ts
```

These currently implement the M5.1 database foundation.

## Canonical entity ownership

Schema responsibility covers the persistence representation of:

`Store`
`Device`
`Settings`
`ProductCategory`
`Product`
`ProductModifier`
`ProductImage`
`Promotion`
`Customer`
`CustomerAddress`
`Conversation`
`Message`
`Order`
`OrderItem`
`OrderItemModifier`
`OrderStatusHistory`
`PaymentMethod`
`Notification`
`Integration`
`IntegrationCredential`
`InboundInbox`
`DomainOutbox`
`Job`
`AuditLog`
`Log`
`AIProfile`
`AIExecution`
`KnowledgeItem`

## Ownership exclusions

IA-01 does not own:

- domain entities as executable behavior;
- domain services;
- repositories or application services;
- Order Engine implementation;
- EventBus/Inbox/Outbox/Job runtime;
- conversation/LLM runtime;
- device authentication runtime;
- Gateway/WSS runtime;
- Desktop UI;
- provider adapters;
- protected contracts and global documentation.

## Shared ownership conflict rule

When another agent requires a schema change:

1. IA-01 remains responsible for the schema artifact.
2. The requesting agent supplies the domain/contract requirement.
3. IA-01 verifies the requirement against protected sources.
4. Open global decisions are not silently encoded.
5. The change is tested at schema level and coordinated through the normal PR process.

## Dependency consumers

Likely consumers, subject to contract confirmation:

- IA-02 — Domain Runtime: entity persistence mapping and aggregate storage boundaries.
- IA-03 — Event Infrastructure: `InboundInbox`, `DomainOutbox`, `Job`, `AuditLog` persistence structures.
- IA-04 — Order Engine: product, promotion, customer, address, order and payment-method structures.
- IA-05 — Conversation + LLM: conversation, message, customer context and AI execution/profile/knowledge structures.
- IA-06 — Device Authentication: Store/Device and secure credential references where applicable.
- IA-07 — Gateway + WSS: no direct ownership dependency on Desktop SQLite beyond protocol/domain contracts; Gateway persistence is outside IA-01.
- IA-08 — Desktop UI: consumes application-level data exposed by Core; UI does not receive direct database ownership.

## Authority boundary

Ownership is not authority. `main` remains the integration authority, and human review is required before changes become official project behavior.
