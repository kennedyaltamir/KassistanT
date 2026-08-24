# Implementation Remaining — Auditor 2

| Slice | Current state | Remaining | Dependencies | C1/C2/C3 |
|---|---|---|---|---|
| IA-01 canonical schema | foundation only | business tables + constraints + migration + tests | schema decisions, migration gate | C1 |
| IA-02 domain | foundation only | Order aggregate/commands/events/runtime + tests | domain decisions, schema only where required | C1 |
| IA-03 event infrastructure | not implemented on main per current IA-03 docs | EventBus, Inbox, Outbox, Queue, AuditLog as required | persistence + contract gates | C1/C2 by usage |
| IA-04 order engine | not started | pricing/order orchestration required by MVP + integration tests | domain/schema/events + open contracts where impacted | C1 |
| IA-05 AI-V1 | partial contract, no runtime | provider adapter, conversation engine, prompt/runtime, validated action path | DR-001 + domain/events | C1 |
| IA-06 device auth | runtime not started | materialize crypto contract, verifier, enrollment/session/replay/rotation/revocation as C1 requires | DR-02A, DR-02B, schema, Gateway/WSS | C1 |
| IA-07 Gateway/WSS | skeleton | WSS lifecycle, authenticated transport, intake/ACK, HTTP runtime needed by MVP | IA03 + IA06 | C1 |
| IA-08 desktop | presentation foundation exists only on branch, not main | merge foundation, then real functional adapters/screens | stable backend boundaries | C1 |
| Shared harness | explicit discovery gap | register relevant TS tests and verify official suite | owner authorization | C1 verification |
| Final integration | absent | connect domain, persistence, events, auth, gateway, LLM, UI, WhatsApp | all relevant runtime slices | C1 |
