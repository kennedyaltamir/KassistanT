# IA-03 — JobQueue and Reliability Matrix

Status: READINESS / NO RUNTIME IMPLEMENTATION

## JobQueue component matrix

| Attribute | Finding |
|---|---|
| Responsibility | Recoverable asynchronous execution boundary for WhatsApp work, Google sync, notifications, backup and diagnostics. |
| Input | Approved job payload/type plus idempotency context. Exact executable interface is not yet defined. |
| Output | Job state transition and execution result/failure evidence. |
| Persistence | Canonical `Job` storage required; current schema is not available. |
| Transaction boundary | Job state mutations must be durable and consistent; exact lease/attempt transaction is not fully specified. |
| Idempotency | Required. Exact key derivation is workload-specific and must be contract-driven. |
| Retry | Required. Job contract explicitly requires retry/attempt state, but exact retryable error catalogue and maximum attempts are not fully normative. |
| Backoff | Required concept; exact local algorithm/limits are UNKNOWN. WSS reconnect backoff is transport-owned and must not be copied into JobQueue without approval. |
| Ordering | UNKNOWN. Do not assume FIFO unless a job type explicitly requires it. |
| Deduplication | Required where jobs represent repeatable external effects; exact uniqueness key is workload-specific. |
| Failure mode | Retryable failure, permanent failure, cancellation and process interruption must remain distinguishable once state model is finalized. |
| Recovery | Restart must recover durable non-terminal jobs/leases according to finalized state semantics. |
| Audit | Significant job actions/failures should be traceable; exact audit event mapping remains to be defined. |
| Observability | Queue depth, attempt state, timing, failures and correlation should be diagnosable. Exact telemetry schema is UNKNOWN. |
| Consumers | External provider adapters, notification/backup/diagnostic services, future Gateway/transport consumers. |
| Producers | Core/domain/application services that enqueue asynchronous work. |
| Dependencies | IA-01 persistence, IA-02 semantics where job results are domain-significant, provider contracts, relevant agents. |
| Evidence | `docs/backend/jobs.md`, `docs/backend/idempotency.md`, contract registry. |
| Evidence strength | STRONG for required capabilities; PARTIAL for policies. |
| Implementation state | NOT_STARTED |
| Blocker | Canonical `Job` schema and deterministic retry/locking semantics. |
| Readiness | WAITING_FOR_PERSISTENCE + POLICY COMPLETION |

## Reliability mechanism matrix

| Mechanism | Trigger | Owner | Persistence | Max attempts | Retryable errors | Non-retryable errors | Observability | Audit | State | Blocker |
|---|---|---|---|---|---|---|---|---|---|---|
| Retry | Failed operation classified retryable | IA-03 runtime using approved error taxonomy | Job/event state | UNKNOWN | Must be contract-classified | Must be contract-classified | Required | When action is audit-worthy | PARTIAL | Error taxonomy/policy |
| Backoff | Retry scheduled | IA-03 | Schedule/attempt state | UNKNOWN | Same as retry | Same as retry | Required | Usually operational | PARTIAL | Exact policy undefined |
| Timeout | Execution exceeds operation limit | Owning operation + IA-03 execution boundary | Job state/result | N/A | UNKNOWN | UNKNOWN | Required | When security/business significant | UNKNOWN | Per-operation limits absent |
| Deduplication | Same logical operation/event received again | IA-03 at durable boundary | Unique key/state | N/A | N/A | Duplicate logical effect must not occur | Required | Optional unless policy says otherwise | PARTIAL | Exact key/schema |
| Replay | Resume/gap/recovery requires redelivery | IA-03 + IA-07 where WSS is involved | Inbox/event state | UNKNOWN | Recoverable pending events | Expired/invalid records | Required | Recovery actions may be auditable | PLANNED | Retention/resume details |
| Reconciliation | State mismatch detected | IA-03 with relevant consumer | Durable state + evidence | UNKNOWN | UNKNOWN | UNKNOWN | Required | Should be auditable | PLANNED | Algorithm absent |
| Dead Letter | Retry exhausted or permanently rejected work | IA-03 | Durable terminal state | UNKNOWN | N/A | Permanent failure or exhausted retry | Required | Failure should remain traceable | PLANNED | State model absent |
| Recovery | Process restart/storage recovery | IA-03 + persistence | Durable state | N/A | Pending/retryable work | Corrupt/invalid state | Required | Recovery may be auditable | PLANNED | Persistence and state semantics |

## Job state readiness

The repository requires attempt state, retry, backoff, locking and observability, but it does not provide a complete normative state machine. Therefore names such as `PENDING`, `RUNNING`, `SUCCEEDED`, `FAILED`, `CANCELLED` or `DEAD_LETTER` are **implementation candidates only**, not approved contract values.

## Locking / leasing

`docs/backend/jobs.md` requires locking conceptually through the broader contract registry/roadmap, but exact lease duration, ownership token, renewal and recovery behavior are not specified. These values remain `UNKNOWN` and must not be invented.
