# Contract Registry

**Status:** CURRENT registry snapshot on `docs/api-backend-contracts-v1`.
**Baseline:** `KassisT_Approved_Technical_Baseline_v1.0.1.md` SHA `02830152099f58307912ce382c064a3c4075f505`.

| Contract ID | Type | Name | Version | Source | Status | Implementation | Tests | Last reviewed |
|---|---|---|---|---|---|---|---|---|
| HTTP-GW-V1 | HTTP | Gateway HTTP API | v1 | baseline §70 | PARTIAL | NOT_IMPLEMENTED | PARTIAL | 2026-08-22 |
| WSS-V1 | protocol | KassisT WSS | 1.0 | baseline §67-68 + contracts | DEFINED / PARTIAL | NOT_IMPLEMENTED | PARTIAL | 2026-08-22 |
| DEV-ENROLL-V1 | HTTP/domain | Device Enrollment | v1 | baseline §65 + device-enrollment.md | DEFINED / PARTIAL | NOT_IMPLEMENTED | MISSING | 2026-08-22 |
| DEV-AUTH-V1 | security/protocol | Device Authentication | v1 | baseline §66 + device-authentication.md | DEFINED / PARTIAL | NOT_IMPLEMENTED | MISSING | 2026-08-22 |
| DOMAIN-ENTITY-V1 | domain | Canonical entities | MVP | baseline §23 | PARTIAL | NOT_IMPLEMENTED | MISSING | 2026-08-22 |
| DOMAIN-EVENT-V1 | domain | Domain events | MVP | baseline §24 + packages/contracts | AMBIGUOUS | PARTIAL | PARTIAL | 2026-08-22 |
| ORDER-STATE-V1 | state machine | Order lifecycle | MVP | baseline §9/74 | DEFINED | NOT_IMPLEMENTED | MISSING | 2026-08-22 |
| MONEY-V1 | domain | Money contract | MVP | baseline §15/75 | DEFINED | NOT_IMPLEMENTED | MISSING | 2026-08-22 |
| INBOX-V1 | persistence | InboundInbox | MVP | baseline §23/73/85 | DEFINED | NOT_IMPLEMENTED | MISSING | 2026-08-22 |
| OUTBOX-V1 | persistence | DomainOutbox | MVP | baseline §16/23/24/69/73 | RESOLVED_SEMANTICALLY | NOT_IMPLEMENTED | MISSING | 2026-08-24 |
| STOCK-MODEL-MVP-001 | domain/schema | MVP stock model | MVP | consensus/governance/STOCK-MODEL-MVP-001-DECISION.xml | APPROVED_OPTION_A / BINARY_AVAILABILITY | NOT_IMPLEMENTED | MISSING | 2026-08-24 |
| JOB-V1 | persistence | JobQueue/Job | MVP | baseline §25/73 | PARTIAL | NOT_IMPLEMENTED | MISSING | 2026-08-22 |
| AI-V1 | provider/domain | LLMProvider + AI contracts | MVP | baseline §10-12/77-80 | PARTIAL | NOT_IMPLEMENTED | MISSING | 2026-08-22 |
| WA-V1 | provider | MetaCloudWhatsAppProvider | MVP | baseline §13 | PARTIAL / EXTERNAL | NOT_IMPLEMENTED | MISSING | 2026-08-22 |
| GOOGLE-V1 | provider | GoogleContactsSyncAdapter | MVP | baseline §14/81 | PARTIAL / EXTERNAL | NOT_IMPLEMENTED | MISSING | 2026-08-22 |
| NOTIFY-V1 | provider | NotificationProvider | MVP | baseline §18 | PARTIAL / EXTERNAL | NOT_IMPLEMENTED | MISSING | 2026-08-22 |
| AUTHZ-V1 | security | Authorization model | MVP | baseline §65-66/97 | MISSING / PARTIAL | NOT_IMPLEMENTED | MISSING | 2026-08-22 |
| ERROR-V1 | cross-cutting | Error model | MVP | baseline §70 + operational rules | PARTIAL | NOT_IMPLEMENTED | MISSING | 2026-08-22 |

## Known ambiguities

### CONTRACT-002 — order.status_changed
The baseline states that `order.status_changed` is not part of the catalogue and later refers to it as a possible lifecycle event. The current TypeScript contract also includes it. This is intentionally preserved as AMBIGUOUS.

**Impact:** Domain events, EventBus, WSS, registry and tests.

**Required decision:** determine normative status of the event.

### GOV-001 — baseline version references
The repository has an approved file named `KassisT_Approved_Technical_Baseline_v1.0.1.md`, while the document itself contains internal `v1.0.0` references and `docs/product` contains an older specification copy. This branch does not rewrite those sources.

### STOCK-MODEL-MVP-001 — resolved
The MVP stock-model conflict is resolved by `APPROVED_OPTION_A / BINARY_AVAILABILITY`. `ADR-015` is retained as the authoritative MVP stock decision; quantitative inventory is post-MVP. This decision does not authorize migration or runtime implementation.

## Implementation rule
`IMPLEMENTED` is used only where repository evidence demonstrates executable implementation. Skeletons are not treated as implementation.

## Validation state
OpenAPI route/path/operationId checks have passed locally. Full OpenAPI schema validation remains pending the hosted documentation CI validator; see `openapi-validation-note.md`.
