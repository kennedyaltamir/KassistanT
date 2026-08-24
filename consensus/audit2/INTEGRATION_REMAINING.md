# Integration Remaining — Auditor 2

| Integration | Dependency | Current state | C1 impact |
|---|---|---|---|
| Domain ↔ SQLite | HARD_DEPENDENCY | Not implemented | C1 |
| Domain ↔ Event Infrastructure | HARD/CROSS-AGENT | Not implemented | C1 where events are used |
| Order Engine ↔ Domain | HARD_DEPENDENCY | Not implemented | C1 |
| Conversation ↔ Domain/LLM | HARD_DEPENDENCY | Not implemented | C1 |
| Device Auth ↔ Gateway/WSS | HARD/CROSS-AGENT | Not implemented | C1 |
| InboundInbox ↔ WSS | HARD/CROSS-AGENT | Not implemented | C1 transport path |
| Gateway ↔ WhatsApp | HARD/external | Not implemented | C1 if WhatsApp path is part of MVP |
| Desktop ↔ Core/Application | HARD_DEPENDENCY | Not implemented in main | C1 |
| Backup/Restore ↔ SQLite | C2 candidate | Not implemented | Production readiness, not automatically C1 |
| External provider ↔ Application | CONDITIONAL | Not implemented | Depends on provider scope |

No dependency is inferred merely because components are architecturally adjacent.
