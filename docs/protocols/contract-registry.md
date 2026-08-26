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
| INBOX-V1 | persistence | InboundInbox | MVP | baseline §23/73/85 | DEFINED | NOT_IMPLEMENTED | MISSING | 2026-08-22 |
| OUTBOX-V1 | persistence | DomainOutbox | MVP | baseline §16/23/24/69/73 | AMBIGUOUS | NOT_IMPLEMENTED | MISSING | 2026-08-22 |
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

## Known ambiguities

### CONTRACT-001 — DomainOutbox
The baseline uses `DomainOutbox` both in the local domain transaction flow and in the Gateway architecture without fully specifying whether these are one logical contract or separately owned persistence concerns. No resolution is made here.

**Impact:** persistence, external delivery, Gateway, JobQueue, transaction boundaries and recovery.

**Required decision:** explicitly define ownership and scope before calling the contract unambiguous.

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
