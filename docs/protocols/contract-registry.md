# Contract Registry

**Status:** CURRENT registry snapshot on `MVP2`.  
**Baseline:** `KassisT_Approved_Technical_Baseline_v1.0.1.md` SHA `02830152099f58307912ce382c064a3c4075f505`.

| Contract ID | Type | Name | Version | Source | Status | Implementation | Tests | Last reviewed |
|---|---|---|---|---|---|---|---|---|
| HTTP-GW-V1 | HTTP | Gateway HTTP API | v1 | baseline §70 | PARTIAL | NOT_IMPLEMENTED | PARTIAL | 2026-08-22 |
| WSS-V1 | protocol | KassisT WSS wire contract | 1.0 | baseline §67-68 + packages/contracts/src/wss.ts | FROZEN_FOR_IMPLEMENTATION | NOT_IMPLEMENTED | PARTIAL | 2026-08-25 |
| WSS-RUNTIME-V1 | runtime/protocol | Gateway ↔ Desktop WSS runtime | v1 | docs/protocols/wss-runtime-contract-v1.md | FROZEN_FOR_IMPLEMENTATION | NOT_IMPLEMENTED | MISSING | 2026-08-25 |
| DEV-ENROLL-V1 | HTTP/domain | Device Enrollment | v1 | baseline §65 + device-enrollment.md | DEFINED / PARTIAL | NOT_IMPLEMENTED | MISSING | 2026-08-22 |
| DEV-AUTH-V1 | security/protocol | Device Authentication | v1 | baseline §66 + device-authentication.md | DEFINED / PARTIAL | NOT_IMPLEMENTED | MISSING | 2026-08-22 |
| DOMAIN-ENTITY-V1 | domain | Canonical entities | MVP | baseline §23 | PARTIAL | NOT_IMPLEMENTED | MISSING | 2026-08-22 |
| DOMAIN-EVENT-V1 | domain | Domain events | MVP | baseline §24 + packages/contracts | AMBIGUOUS | PARTIAL | PARTIAL | 2026-08-22 |
| ORDER-STATE-V1 | state machine | Order lifecycle | MVP | baseline §9/74 | DEFINED | NOT_IMPLEMENTED | MISSING | 2026-08-22 |
| MONEY-V1 | domain | Money contract | MVP | baseline §15/75 | DEFINED | NOT_IMPLEMENTED | MISSING | 2026-08-22 |
| INBOX-V1 | persistence | InboundInbox | MVP | baseline §23/73/85 + D-010.1 | FROZEN | NOT_IMPLEMENTED | MISSING | 2026-08-25 |
| OUTBOX-V1 | persistence | DomainOutbox | MVP | baseline §16/23/24/69/73 + D-010.2/D-010.3 | FROZEN | NOT_IMPLEMENTED | MISSING | 2026-08-25 |
| JOB-V1 | persistence | JobQueue/Job | MVP | baseline §25/73 | PARTIAL | NOT_IMPLEMENTED | MISSING | 2026-08-22 |
| AI-V1 | provider/domain | LLMProvider + AI contracts | MVP | baseline §10-12/77-80 + docs/ai/AI-V1-CONTRACTS.md | FROZEN_FOR_IMPLEMENTATION | NOT_IMPLEMENTED | MISSING | 2026-08-25 |
| WA-V1 | provider | MetaCloudWhatsAppProvider | MVP | baseline §13 | PARTIAL / EXTERNAL | NOT_IMPLEMENTED | MISSING | 2026-08-22 |
| GOOGLE-V1 | provider | GoogleContactsSyncAdapter | MVP | baseline §14/81 | PARTIAL / EXTERNAL | NOT_IMPLEMENTED | MISSING | 2026-08-22 |
| NOTIFY-V1 | provider | NotificationProvider | MVP | baseline §18 | PARTIAL / EXTERNAL | NOT_IMPLEMENTED | MISSING | 2026-08-22 |
| AUTHZ-V1 | security | Authorization model | MVP | baseline §65-66/97 + GOVERNANCE/PERMISSION_MATRIX.md | DEFINED / FROZEN_POLICY | NOT_IMPLEMENTED | MISSING | 2026-08-25 |
| ERROR-V1 | cross-cutting | Error model | MVP | baseline §70 + operational rules | PARTIAL | NOT_IMPLEMENTED | MISSING | 2026-08-22 |

## P0 contract closure

### WSS Runtime — WSS-RUNTIME-V1

Frozen in `docs/protocols/wss-runtime-contract-v1.md`.

The contract closes the runtime boundary for lifecycle, handshake/authentication handoff, envelope validation, ACK, correlation/causation, sequence/deduplication, reconnect/resume, state synchronization and transport errors. IA-07 owns implementation; IA-06 owns device authentication decisions; business authorization remains outside transport.

### AI-V1 — LLMProvider + AIExecution

Frozen in `docs/ai/AI-V1-CONTRACTS.md`.

The contract closes provider abstraction, AIExecution stages, structured-output validation, tool interpretation vs authorization, prompt provenance, model profiles, context provenance, persistence/event boundaries, fallback/recovery and security invariants. IA-05 owns the implementation territory; AG-AI-01 is its operational owner under D-001.

### D-010 — Inbox / Outbox Persistence Boundary

Approved by **Kennedy Altamir + Esdras Ribeiro** on **2026-08-25 23:11:44 America/Sao_Paulo (UTC−03:00)**.

D-010 freezes `INBOX-V1` and `OUTBOX-V1` and resolves `CONTRACT-001` as a logical persistence/event boundary:

- `InboundInbox` represents durable acceptance of an external event before processing.
- Inbox identity is `(provider, external_event_id)` and acceptance is idempotent.
- ACK follows the durable persistence required by the contract.
- `DomainOutbox` represents an externally visible effect committed after the corresponding internal operation is accepted.
- Outbox identity is `idempotency_key`.
- Canonical states are `PENDING`, `PROCESSING`, `DELIVERED`, `RETRY_WAIT`, `FAILED_TERMINAL`.
- Business semantics remain in Core/Domain; persistence remains persistence; transport remains transport.
- IA-01 owns the SQLite schema and schema migrations.
- IA-03 owns event/runtime semantics and consumes persistence through an explicit, versioned interface independent of SQLite internals.
- The interface must not expose SQL, table names, SQLite internals, migration numbers or physical storage details.
- Required semantic operations are: `accept_inbound`, `deduplicate`, `retrieve_pending`, `stage_outbound`, `mark_processing`, `mark_delivered`, `record_retry`, `record_failure`, `recover_pending`.
- Retry/recovery semantics belong to IA-03; persistence stores attempts, state, timestamps and failure metadata.
- No physical DLQ is introduced by D-010. `FAILED_TERMINAL` is the terminal failure state; a physical DLQ requires a future authorized decision.

`CONTRACT-001` is therefore **RESOLVED** for P0-001B. The physical schema remains owned by IA-01 and must be implemented only through IA-01-controlled schema/migration work.

## Known ambiguities

### CONTRACT-002 — order.status_changed
The baseline states that `order.status_changed` is not part of the catalogue and later refers to it as a possible lifecycle event. The current TypeScript contract also includes it. This is intentionally preserved as AMBIGUOUS.

**Impact:** Domain events, EventBus, WSS, registry and tests.

**Required decision:** determine normative status of the event.

### GOV-001 — baseline version references
The repository has an approved file named `KassisT_Approved_Technical_Baseline_v1.0.1.md`, while the document itself contains internal `v1.0.0` references and `docs/product` contains an older specification copy. This branch does not rewrite those sources.

## Implementation rule
`IMPLEMENTED` is used only where repository evidence demonstrates executable implementation. Skeletons are not treated as implementation.

## Validation state
OpenAPI route/path/operationId checks have passed locally. Full OpenAPI schema validation remains pending the hosted documentation CI validator; see `openapi-validation-note.md`.
