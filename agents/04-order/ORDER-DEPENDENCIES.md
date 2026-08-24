# IA-04 — Order Engine Dependencies

Status: AUDIT / CROSS-AGENT READINESS

| Dependency | IA-04 consumes | IA-04 produces | Contract/interface | Required files | Blocker | Integration order |
|---|---|---|---|---|---|---|
| IA-01 Schema | Canonical Order-related persistence shape and constraints | Persistable order records/fields | `DOMAIN-ENTITY-V1`, SQLite contract | `apps/desktop/database/**`, `apps/desktop/electron/database/**` | Canonical business schema is not implemented and several fields remain partial | 1 |
| IA-02 Domain | Domain primitives, invariants and shared semantics | Order-specific application behavior within IA-04 boundary | `docs/domain/**` | `packages/domain/**` | General domain runtime is NOT_STARTED; Order errors/semantics are partial | 2 |
| IA-03 Events | EventBus, durable effect/outbox interface, audit integration | Order events and audit intents | `DOMAIN-EVENT-V1`, `OUTBOX-V1`, audit contract | `apps/desktop/electron/infrastructure/**` | DomainOutbox scope is CONTRACT-001; event runtime absent | 3 |
| IA-05 Conversation/LLM | Structured intent / confirmation request input | Consumes order results and confirmation state | AI contracts | `apps/desktop/electron/conversation/**` | No direct dependency for pure order core; integration depends on command contracts | 4+ parallel |
| IA-06 Device Auth | Trusted device/actor identity at boundary | Order commands may carry actor context | Device auth contracts | `apps/desktop/electron/auth/**` | Actor semantics are not complete inside Order contract | 4+ parallel |
| IA-07 Gateway/WSS | Transport only | Order-related events/command results indirectly transported | WSS/HTTP contracts | `gateway/**`, contracts | No direct business authority dependency; transport not implemented | Downstream |
| IA-08 Desktop UI | Order query/result/status presentation | User-originated order commands | IPC/application interface not complete | `apps/desktop/src/**` | UI must not become business authority | Downstream |

## Integration invariants

- IA-04 must not own SQLite migrations or general persistence infrastructure.
- IA-04 must not duplicate IA-02 general domain authority.
- IA-04 must not implement EventBus/Outbox/Queue/Audit infrastructure.
- IA-04 must not use LLM output as authoritative business state.
- Gateway/WSS only transports order-related data; it does not decide order state.
- Renderer submits commands through an authorized boundary; it does not calculate authoritative totals.

## Required order of integration

The earliest complete Order Engine path depends on IA-01 + IA-02 + enough IA-03 interfaces. IA-05 and IA-08 can consume the resulting command contract once stable. IA-06 is required for final actor identity/authorization semantics where those commands require trusted actor context.

## External dependencies

The Order Engine itself has no direct external platform configuration requirement. WhatsApp, Google, notification delivery and transport are adapter/integration boundaries outside IA-04.
