# Inbox / Outbox

Status: **FROZEN / D-010 APPROVED**.

Approval authority: **Kennedy Altamir + Esdras Ribeiro**. Effective: **2026-08-25 23:11:44 America/Sao_Paulo (UTC−03:00)**.

## Inbox

`InboundInbox` represents durable acceptance of an external event before processing. The canonical logical identity is `(provider, external_event_id)`. Acceptance is idempotent and must be durable before the processing acknowledgment required by the transport contract. ACK follows successful durable persistence.

Required semantics: deterministic state, correlation, causation, duplicate-safe acceptance and restart recovery.

## Outbox

`DomainOutbox` represents an externally visible effect that the system has committed to produce after the corresponding internal operation is accepted. The canonical logical identity is `idempotency_key`.

Canonical states:

- `PENDING`
- `PROCESSING`
- `DELIVERED`
- `RETRY_WAIT`
- `FAILED_TERMINAL`

State transitions must be deterministic and versioned in the consuming contract. Reprocessing the same logical identity must not create a second logical effect.

## Persistence boundary

D-010 resolves `CONTRACT-001`: `DomainOutbox` is a logical boundary between Core/Domain semantics and external effects. It is not a Gateway transport mechanism, an arbitrary physical table definition, or a business authority.

`IA-01` owns SQLite schema and migrations. `IA-03` owns event/runtime semantics and consumes persistence through an explicit, versioned interface independent of SQLite. The interface must not expose SQL, table names, SQLite internals, migration numbers or other physical-storage details.

Canonical semantic operations exposed by the boundary are:

`accept_inbound`, `deduplicate`, `retrieve_pending`, `stage_outbound`, `mark_processing`, `mark_delivered`, `record_retry`, `record_failure`, `recover_pending`.

Retry and recovery semantics belong to IA-03. Persistence stores attempts, state, timestamps and failure metadata but does not independently decide business retry policy.

No physical DLQ is introduced by D-010. `FAILED_TERMINAL` is the terminal failure state; a physical DLQ requires a future authorized decision.

Business authority remains in Core/Domain. Transport remains transport. Persistence remains persistence.
