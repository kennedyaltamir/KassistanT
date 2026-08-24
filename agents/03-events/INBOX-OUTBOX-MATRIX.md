# IA-03 — Inbox / Outbox Matrix

Status: READINESS / NO RUNTIME IMPLEMENTATION

## InboundInbox

| Attribute | Current evidence / readiness |
|---|---|
| Responsibility | Durable local intake of inbound events before business processing. |
| Input | WSS `EVENT`/inbound event envelope. Contract fields include `message_id`, `event_id` when applicable, `device_id`, `correlation_id`, `causation_id`, `timestamp_utc`, and payload. |
| Output | Persisted Inbox record; only after successful durable commit may WSS ACK be emitted. |
| Persistence | Canonical `InboundInbox` table is required. Current SQLite contains only metadata, so persistence is not available. |
| Transaction boundary | Receive → durable Inbox insert/commit → ACK. Processing is a separate boundary. Exact transaction composition with later business commands remains implementation-specific. |
| Idempotency | Duplicate logical delivery must not produce duplicate processing. Memory records a uniqueness concept around `(provider, external_event_id)`; exact canonical column mapping remains schema-dependent. |
| Retry | Processing retry is separate from durable intake. Exact retry owner/policy is not fully specified. |
| Backoff | UNKNOWN for Inbox processing. WSS reconnect has documented backoff, but that is transport-owned. |
| Ordering | WSS sequence is monotonic per `(store_id, device_id)`. Inbox processing ordering guarantee is not otherwise fully specified. |
| Deduplication | Required at durable intake boundary; exact key must follow canonical schema/contract. |
| Failure mode | Database failure means no ACK. Duplicate delivery must be acknowledged only according to finalized persistence behavior. |
| Recovery | Pending Inbox records must remain recoverable; exact replay/reprocessing state machine is not yet complete. |
| Audit | Security/business events may require audit; not every raw transport receipt is automatically an audit event. |
| Observability | Correlation/causation, persistence result and processing state must be diagnosable without leaking customer data. |
| Consumers | Core processing, Conversation, Device/Gateway consumers and other approved runtime handlers. |
| Producers | Gateway/WSS transport delivers inbound events. |
| Dependencies | IA-01 schema/persistence, IA-07 WSS, IA-02 domain semantics. |
| Evidence | `docs/protocols/wss-v1.md`, `packages/contracts/src/wss.ts`, `docs/backend/inbox-outbox.md`, contract registry. |
| Evidence strength | STRONG for ACK boundary; PARTIAL for storage fields and recovery policy. |
| Implementation state | BLOCKED / NOT_STARTED |
| Blocker | IA-01 canonical schema and persistence boundary. |
| Readiness | WAITING_FOR_SCHEMA |

### Required event identity fields

- `event_id`: required when the inbound message carries an event identity.
- `message_id`: WSS envelope identity.
- `device_id`: WSS device identity.
- `correlation_id`: optional in envelope but preserved when present.
- `causation_id`: optional in envelope but preserved when present.
- `received_at` / `persisted_at`: useful lifecycle timestamps, but exact canonical column names are not approved by the current evidence.
- `processing_state`: required concept for recovery, exact state catalogue is not yet normative.
- `deduplication_key`: required concept; exact schema key must come from IA-01/contracts.

Do not turn these conceptual requirements into migrations during this phase.

## DomainOutbox

| Attribute | Current evidence / readiness |
|---|---|
| Responsibility | Drives external effects from durable domain state under the documented model. |
| Input | Domain transaction side effect intent / external-effect record. |
| Output | Durable pending effect for an external transport/adapter/job boundary. |
| Persistence | Canonical `DomainOutbox` persistence is planned but absent. |
| Transaction boundary | **BLOCKED by `CONTRACT-001`**. The repository contains conflicting descriptions of ownership/scope. |
| Idempotency | DomainOutbox idempotency keys are documented, but exact uniqueness and processing semantics remain contract-dependent. |
| Retry | Expected for external effects, but exact owner/policy is not finalized. |
| Backoff | UNKNOWN exact algorithm/policy. |
| Ordering | UNKNOWN beyond whatever the finalized contract states. |
| Deduplication | Required for safe external effects, exact key/state model depends on final contract. |
| Failure mode | Pending/retryable/permanent failure concepts are implied; exact lifecycle is not normative. |
| Recovery | Must support restart/retry without duplicating logical external effects. Exact design is blocked. |
| Audit | External effects with business/security significance require traceable evidence. Exact audit linkage depends on final contract. |
| Observability | Correlation/causation and effect state must be observable; exact metric schema not finalized. |
| Consumers | Job/transport/external provider boundaries. |
| Producers | Domain/application transaction boundary. |
| Dependencies | IA-01, IA-02, IA-04, IA-05, IA-07 and `CONTRACT-001`. |
| Evidence | `docs/backend/inbox-outbox.md`, contract registry, IA-03 decisions/roadmap. |
| Evidence strength | STRONG for ambiguity; PARTIAL for final semantics. |
| Implementation state | BLOCKED |
| Blocker | `CONTRACT-001` plus canonical schema. |
| Readiness | NOT_READY |

## Explicit non-resolution of CONTRACT-001

The readiness audit does not choose between one logical outbox spanning concerns and separately owned outbox boundaries. It records that the repository references DomainOutbox both in the local domain transaction flow and in Gateway-oriented architecture. Any implementation encoding either ownership model is prohibited until the decision is approved.
