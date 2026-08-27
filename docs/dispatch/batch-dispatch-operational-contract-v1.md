# KassisT — Batch Dispatch Operational Contract v1

**Task:** P0-012B  
**Owner:** AG-ENG-01  
**Territory:** Dispatch / Messaging Runtime Contract  
**Baseline:** MVP2 @ `35df2fe5f924d3147a5346b716ca1dd2e96cfb3b`  
**Status:** PARTIALLY_CLOSED / PROVIDER_DEPENDENCY  

## 1. Scope and relationship to P0-012A

P0-012B closes the operational contract after CSV ingestion, normalization, preview and explicit human confirmation.

The upstream P0-012A semantic package is treated as authoritative for:

- batch lifecycle;
- human confirmation boundary;
- canonical recipient identity;
- idempotency principles;
- duplicate semantics;
- correlation / causation;
- audit principles;
- batch state-machine intent.

The existing CSV ingestion implementation remains outside this task. No parser, provider, endpoint, SQL, migration or physical schema is introduced by P0-012B.

## 2. Canonical flow

`CSV -> normalized recipient set -> preview -> human confirmation -> batch creation -> recipient effects -> provider outcome -> final batch state`

Human confirmation is mandatory and is bound to the preview fingerprint. A retry never creates a new batch identity or a new recipient identity.

## 3. Batch state machine

Canonical batch states:

`PREVIEW -> CONFIRMED -> QUEUED -> PROCESSING -> COMPLETED`

Terminal alternatives:

`PROCESSING -> PARTIAL_FAILURE`
`PROCESSING -> FAILED`
`PROCESSING -> CANCELLED`

Rules:

- `PREVIEW`: immutable preview exists; no external effect may start.
- `CONFIRMED`: explicit human confirmation is recorded against the exact preview fingerprint.
- `QUEUED`: batch accepted for dispatch but no recipient effect is currently executing.
- `PROCESSING`: at least one recipient effect is eligible or executing.
- `COMPLETED`: every recipient has reached provider-compatible success semantics.
- `PARTIAL_FAILURE`: at least one recipient reached success semantics and at least one recipient reached `FAILED_TERMINAL`.
- `FAILED`: no recipient reached success semantics and the batch terminalized through failure.
- `CANCELLED`: dispatch was explicitly cancelled and no remaining recipient work may start. Recipient-level outcomes already produced remain authoritative; `CANCELLED` does not imply that no external effect occurred.

A single recipient failure MUST NOT directly imply batch `FAILED` when other recipients can still execute or when any recipient has already succeeded.

There is no implicit `RUNNING`, `UNKNOWN`, `DEGRADED`, `DLQ` or provider-specific batch state in v1.

## 4. Recipient Effect state machine

Canonical recipient states:

`PENDING -> PROCESSING -> SUCCESS`

Failure/retry paths:

`PROCESSING -> RETRY_WAIT -> PROCESSING`
`PROCESSING -> FAILED_TERMINAL`

Cancellation path:

`PENDING -> CANCELLED`
`RETRY_WAIT -> CANCELLED`

Rules:

- Recipient state is independent from aggregate batch state.
- `SUCCESS` is terminal and cannot be retried.
- `FAILED_TERMINAL` is terminal and cannot be retried unless a new batch is created.
- `CANCELLED` means this recipient was prevented from producing any further dispatch attempt; prior attempts/effects remain auditable.
- Recipient identity and confirmed context are immutable across retries/restarts.

## 5. Recipient identity and context

For v1:

`recipient_identity = canonical normalized phone number`

The following are not identities:

- contact name;
- CSV line number;
- row position;
- context;
- file fingerprint.

After `CONFIRMED`, recipient context is immutable. Changing context requires a new batch and a new human confirmation.

Two different batches may contain the same recipient identity. Same recipient set does not imply the same batch or the same user intent.

## 6. Effect boundary

The provider effect boundary distinguishes, at minimum:

`REQUEST_CONSTRUCTED -> REQUEST_SENT -> PROVIDER_ACCEPTED -> DELIVERY_CONFIRMED -> READ_CONFIRMED`

Not every provider exposes every transition.

`REQUEST_CONSTRUCTED` means a provider request representation exists locally.  
`REQUEST_SENT` means the runtime transmitted the request.  
`PROVIDER_ACCEPTED` means the provider explicitly acknowledged acceptance according to its contract.  
`DELIVERY_CONFIRMED` requires an explicit delivery receipt or equivalent provider confirmation.  
`READ_CONFIRMED` requires an explicit read receipt when the provider supports it.

HTTP status, local queue enqueue, successful serialization, or successful socket write MUST NOT be interpreted as delivery confirmation.

### Provider dependency

Provider-specific confirmation strength, delivery receipts, read receipts and provider idempotency mechanism are **OPEN / PROVIDER_DEPENDENCY** until the future provider contract is frozen.

## 7. Success semantics

The semantic contract does not authorize a universal provider-specific success claim.

The minimum safe rule is:

- recipient `SUCCESS` may be assigned only from a provider outcome that the provider contract explicitly defines as sufficient for dispatch success;
- local request construction, local enqueue, `REQUEST_SENT`, or generic HTTP success are not sufficient by themselves;
- where the provider exposes delivery confirmation, the future provider contract SHOULD use `DELIVERY_CONFIRMED` as recipient success;
- where the provider exposes only provider acceptance and does not expose delivery confirmation, the future provider contract MAY define `PROVIDER_ACCEPTED` as success, but that limitation MUST be explicit in the provider contract and audit trail.

Therefore `SUCCESS_SEMANTICS = OPEN / PROVIDER_DEPENDENCY` for the concrete provider implementation, while the safety invariant is CLOSED: no delivery claim without compatible provider evidence.

## 8. Retry / failure taxonomy

Failures are classified semantically as:

`RETRYABLE` or `TERMINAL`.

Retryable examples, subject to provider contract:

- transient provider unavailability;
- eligible rate limiting/throttling responses;
- transport timeout where the effect is not conclusively terminal;
- transient network failure;
- temporary service-unavailable conditions.

Terminal examples, subject to provider contract:

- malformed/canonical recipient rejected as invalid;
- unauthorized provider request;
- unsupported operation;
- permanently rejected recipient;
- invalid provider configuration that cannot succeed without operator action.

No anti-ban behavior, rate-limit bypass, evasion or abusive-volume mechanism is part of this contract.

Provider-specific error codes and exact retry classification are **OPEN / PROVIDER_DEPENDENCY**.

## 9. Max attempts

The batch dispatch contract adopts the already-established bounded retry policy used by the current Inbox/Outbox runtime semantics:

- maximum attempts: **5 total effect attempts per recipient**;
- attempt 1 is the initial effect attempt;
- attempts 2-5 are retries when the failure is retryable;
- reaching attempt 5 with another retryable failure transitions to `FAILED_TERMINAL`.

This is a semantic ceiling, not a request to copy physical persistence details from IA-03.

## 10. Backoff

Backoff is deterministic and eligible after a retryable outcome:

- retry 1: 30 seconds;
- retry 2: 60 seconds;
- retry 3: 120 seconds;
- retry 4: 240 seconds.

A recipient is eligible for a retry only when its retry timestamp has been reached and the batch has not been cancelled.

Backoff state survives process restart through durable retry metadata; no in-memory timer is a source of truth.

No jitter, anti-ban tuning or provider-specific bypass is defined here.

## 11. Processing timeout

The existing recovery policy is adopted:

- a recipient left in `PROCESSING` without terminal provider outcome is considered abandoned after **5 minutes**;
- timeout recovery MUST preserve the original batch identity, recipient identity, attempt number and correlation/causation history;
- timeout alone MUST NOT be translated into `SUCCESS` or `FAILED_TERMINAL`.

The five-minute value is a recovery threshold, not proof that the provider did not receive the effect.

## 12. Restart / indeterminate effect

Critical case:

`PROCESSING -> process restart -> provider effect outcome unknown`

The runtime MUST NOT infer either:

- "not sent";
- "delivered".

The canonical recovery rule is:

1. preserve the same batch id and recipient identity;
2. preserve the attempt identity and causal history;
3. mark the effect outcome as indeterminate in the semantic evidence for that attempt;
4. do not silently create a second logical effect;
5. resume only through either provider reconciliation or a provider contract that guarantees safe idempotent retry for the same logical effect identity.

The concrete reconciliation mechanism and provider idempotency key are **OPEN / PROVIDER_DEPENDENCY**.

Until that dependency is frozen, automatic blind retry after an indeterminate effect is NOT authorized.

## 13. Idempotency

`batch_id` remains stable for the entire batch lifecycle.

`recipient_identity` remains stable for the entire batch lifecycle.

`correlation_id` and `causation_id` are tracing/causal identifiers and MUST NOT be used as idempotency keys.

The future provider/runtime contract MUST define a stable logical effect identity for each recipient effect. The provider-specific mapping of that identity to a provider idempotency mechanism is **OPEN / PROVIDER_DEPENDENCY**.

## 14. Partial cancellation

Cancellation is allowed while the batch is active, before the corresponding recipient has crossed an irreversible effect boundary.

Cancellation rules:

- `PENDING` recipients may transition directly to `CANCELLED`.
- `RETRY_WAIT` recipients may transition directly to `CANCELLED` when no retry has started.
- A `PROCESSING` recipient may not be treated as cancelled merely because cancellation was requested; its current effect attempt must first resolve or remain indeterminate under the restart/recovery policy.
- Recipients that already produced provider effects remain recorded with their actual outcomes.
- A batch may finish as `CANCELLED` after explicit cancellation prevents all remaining work, but `CANCELLED` MUST NOT be interpreted as "zero effects occurred".

The exact race handling between cancellation and provider transmission is **OPEN / PROVIDER_DEPENDENCY**.

## 15. Cross-batch duplicates

The same normalized recipient may occur in multiple batches.

The following are independent concepts:

`same recipient set != same batch != same intent`

No cross-batch deduplication is performed by v1 unless a separate explicit product policy is introduced.

A new human confirmation can represent a new legitimate intent and therefore may create a new batch containing previously used recipients.

## 16. Correlation and causation

`correlation_id` follows the complete batch flow.

`causation_id` identifies the immediate event or command that caused a transition/effect attempt.

Each retry preserves the original batch correlation context while assigning its own immediate causal linkage. Retry MUST NOT erase historical causality.

## 17. Audit requirements

The future implementation MUST be able to audit, without requiring a specific physical schema in P0-012B:

- CSV provenance;
- normalized recipient set;
- deduplication result;
- preview identity/fingerprint;
- human confirmation;
- batch creation;
- queueing;
- recipient attempts;
- provider effect attempt boundary;
- provider outcomes;
- retry scheduling and execution;
- cancellation;
- restart/recovery;
- final recipient states;
- final batch state;
- correlation and causation lineage.

Audit evidence MUST distinguish local observation from provider-confirmed outcome.

## 18. Future IA-01 physical projection handoff

IA-01 must not create physical persistence from this document alone. A later physical projection may be prepared only after runtime/provider ownership freezes the remaining provider-dependent fields.

Semantic information that future persistence must be able to represent includes:

- stable batch identity;
- immutable confirmed preview identity/fingerprint;
- recipient identity;
- confirmed recipient context;
- recipient state;
- attempt ordinal;
- logical effect identity;
- retry eligibility timestamp;
- retry classification;
- processing start/abandonment timestamps;
- provider effect phase/outcome;
- provider evidence/reference where allowed;
- correlation/causation identifiers;
- cancellation/recovery evidence;
- terminal timestamps and final state.

No SQL, table name, migration number or storage technology is prescribed by P0-012B.

## 19. Explicit open decisions

The following remain intentionally open because they require a concrete provider contract:

1. provider-specific success threshold (`PROVIDER_ACCEPTED` vs `DELIVERY_CONFIRMED`);
2. exact provider retryable/terminal error vocabulary;
3. provider idempotency mechanism and mapping from logical effect identity;
4. provider delivery/read receipt availability and semantics;
5. reconciliation API/operation for indeterminate effects;
6. exact cancellation-vs-send race behavior;
7. concrete endpoint/payload/authentication;
8. physical audit storage.

No inference is permitted across these items.

## 20. State promotion

`IMPLEMENTED`: semantic contract document created.

`TESTED`: semantic consistency review against P0-012A and existing retry/recovery policy completed; no executable runtime is introduced by this task.

`VERIFIED`: NOT CLAIMED by P0-012B alone. Independent contract/evidence review remains required.

`READY_FOR_REVIEW`: appropriate for human/QA contract review once the open provider dependencies are acknowledged.

`APPROVED`: NO.

`MERGE`: NO.

`RELEASE`: NO.

## 21. Future runtime handoff

**INPUT**

`P0-012A + P0-012B`

**EXPECTED OUTPUT**

A runtime implementation that:

- consumes the normalized recipient set and confirmation boundary without reimplementing CSV ingestion;
- preserves batch/recipient identities across retries and restart;
- implements the bounded retry and recovery policy;
- does not fabricate provider success;
- implements provider-specific effect and idempotency behavior only after the provider contract is explicitly frozen;
- preserves auditability and correlation/causation.

**Next objective task:** future provider/runtime contract integration for batch dispatch, constrained to the provider-specific open decisions listed above.
