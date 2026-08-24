# IA-05 — Scope

## In scope

### Conversation runtime

- Conversation lifecycle: `OPEN`, `CLOSED`.
- Conversation ownership: `AI`, `HUMAN`.
- AI state: `ACTIVE`, `PAUSED`, `UNAVAILABLE`.
- Message lifecycle: `RECEIVED`, `QUEUED`, `PROCESSING`, `SENT`, `DELIVERED`, `READ`, `FAILED`, `REJECTED`.
- Human takeover and return to AI.
- Pause/resume behavior.
- Context assembly and deterministic context inputs.
- Conversation-level orchestration that invokes the LLM provider.

### LLM runtime

- `LLMProvider` boundary.
- Ollama adapter.
- Chat execution.
- Structured output.
- Optional tool calling when contract/model capability permits it.
- Model discovery/selection.
- Health checks.
- Timeout and cancellation.
- Execution limits.
- Model availability and degraded mode.
- `AIExecution` persistence/telemetry within the authorized runtime boundary.
- Prompt construction and prompt versioning where contractually defined.
- Validation and normalization of untrusted LLM outputs.

### Safety boundary

The runtime may interpret intent and produce candidate actions or responses. It must not become authority for pricing, payments, stock, identity, persistence, authorization or critical lifecycle transitions. Business effects require deterministic Core validation/execution.

## Out of scope

- Canonical SQLite schema and migrations: IA-01.
- Generic domain entities, value objects, commands, queries and invariants: IA-02.
- EventBus, Inbox, Outbox, JobQueue and Audit infrastructure: IA-03.
- Order pricing, confirmation, cancellation and order state machine: IA-04.
- Device enrollment/authentication and secure device identity: IA-06.
- Gateway HTTP/WSS transport and transport-level ACK/resume/replay: IA-07.
- Desktop Renderer/UI and UX: IA-08.
- Provider implementations other than the LLM territory unless explicitly assigned.
- External platform configuration, secrets and approvals.

## Boundary rules

1. Conversation state is not equivalent to order state.
2. Message processing state is not equivalent to delivery state.
3. AI state is independent from conversation ownership.
4. LLM output is untrusted input to the deterministic system.
5. Renderer must consume projections/contracts rather than internal privileged LLM machinery.
6. Provider-specific code must stay isolated behind `LLMProvider`.
7. No cloud fallback is assumed as a default behavior.

## Status labels

- `FACT`: directly observed.
- `INFERENCE`: derived from existing contracts/architecture.
- `PROPOSAL`: not approved; requires authority review.
- `DECISION`: explicitly approved by normative source.
