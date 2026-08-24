# IA-03 — Event Infrastructure Dependencies

Status: READINESS AUDIT / NO RUNTIME IMPLEMENTATION

## Dependency matrix

| Agent | IA-03 consumes | IA-03 provides | Dependency type | Current blocker | Integration order |
|---|---|---|---|---|---|
| IA-01 Schema / SQLite | Canonical tables, indexes, transaction/persistence APIs for Inbox, Outbox, Job, Audit and event metadata | Requirements for persistence representation; schema-level acceptance criteria | Upstream structural dependency | Canonical business schema not implemented | 1 |
| IA-02 Domain Runtime | Domain event types, invariants, producer semantics, domain errors | Technical dispatch/recovery infrastructure; no business rules | Upstream semantic dependency | Event contract partial; `CONTRACT-002` impacts order events | 2 |
| IA-04 Order Engine | Order event producers/consumers; idempotency expectations | Event dispatch and recovery mechanisms | Consumer/producer integration | `CONTRACT-002`; Outbox semantics | 5 |
| IA-05 Conversation + LLM | Conversation/AI async work requirements and correlation context | Job/event infrastructure for recoverable asynchronous work | Consumer/producer integration | LLM runtime not implemented; interface must stay contract-driven | 6 |
| IA-06 Device Auth | Device lifecycle/audit events; identity context | Audit and event traceability | Cross-boundary security integration | Device/auth runtime absent | 4 |
| IA-07 Gateway / WSS | WSS EVENT/ACK/RESUME semantics, durable Inbox ACK boundary | Durable intake, replay/recovery coordination | Transport integration | IA-01 persistence; WSS runtime absent | 3 |
| IA-08 Desktop UI | Operational event/status consumption requirements | Operationally safe event state/diagnostic projections | Downstream consumer | UI runtime absent | 7 |

## Integration invariants

1. IA-03 never becomes business-rule authority.
2. Durable local persistence precedes ACK where WSS contract requires it.
3. Duplicate delivery must not create duplicate logical effects.
4. Correlation and causation identifiers survive supported cross-boundary transitions.
5. Audit is evidence, not a source of business truth.
6. Retry must preserve idempotency.
7. Recovery semantics must be deterministic and testable.
8. Global contract changes require integration-authority governance.

## Cross-agent file boundaries

IA-03 owns only:

- `apps/desktop/electron/infrastructure/events/**`
- `apps/desktop/electron/infrastructure/inbox/**`
- `apps/desktop/electron/infrastructure/outbox/**`
- `apps/desktop/electron/infrastructure/jobs/**`
- `apps/desktop/electron/infrastructure/audit/**`
- directly associated tests.

Protected shared areas include contracts, global protocol/domain/backend documentation, baseline, roadmap, root package configuration, lockfiles and workflows.

## External dependencies

Future Event Infrastructure depends indirectly on Meta/WhatsApp, Google, Gateway hosting and device authentication, but IA-03 must consume their approved interfaces rather than configure those platforms as part of this territory.
