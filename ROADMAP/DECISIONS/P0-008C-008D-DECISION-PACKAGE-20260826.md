# P0-008C / P0-008D — Decision Package

**Baseline:** `MVP2 @ 35df2fe5f924d3147a5346b716ca1dd2e96cfb3`

## Inbox

- Canonical states: `PENDING`, `PROCESSING`, `RETRY_WAIT`, `PROCESSED`, `FAILED_TERMINAL`.
- New records start at `PENDING`.
- `attempts` starts at `0`, increments only for a real processing attempt, never decreases.
- A `PROCESSING` record is stale after **5 minutes** without durable progress.
- Recovery moves stale `PROCESSING` to `RETRY_WAIT`; the next real processing attempt increments `attempts`.
- Maximum automatic processing attempts: **5**. After the fifth failed attempt, state becomes `FAILED_TERMINAL`.
- Retry backoff: **1m, 5m, 15m, 30m, 60m** between attempts.
- Failure codes: `INVALID_PAYLOAD`, `CONTRACT_VIOLATION`, `PROVIDER_ERROR`, `DEPENDENCY_UNAVAILABLE`, `PROCESSING_TIMEOUT`, `INTERNAL_ERROR`.
- Failure metadata remains diagnostic and does not define business state independently.
- No DLQ.

## Outbox

- Canonical states remain `PENDING`, `PROCESSING`, `DELIVERED`, `RETRY_WAIT`, `FAILED_TERMINAL`.
- `idempotency_key` is the logical delivery identity.
- `event_id` is stable across retries.
- `event_type` remains an explicit first-class event classification field.
- `aggregate_id` remains an explicit nullable aggregate reference; never substitute correlation or causation.
- `occurred_at_utc` means domain event occurrence time, not row creation time.
- `created_at` means persistence creation time.
- `processed_at` maps to `DELIVERED` only when the legacy contract confirms that it represents successful outbound processing/delivery.
- `processed_at IS NULL` is ambiguous for legacy data and must fail precheck rather than be guessed into a state.
- `failure_metadata` uses `failure_code`, `failure_message`, and `failed_at`; Inbox failure codes are reused for transport failures unless an explicit provider contract requires an extension.
- `correlation_id` and `causation_id` are independently nullable and stable across retries.
- No DLQ table.

## Historical data

- Preserve surrogate physical IDs while maintaining canonical semantic identities through unique constraints.
- `Conversation.unread_count` is formally dropped from the new projection and must not influence lifecycle, ownership, or ai_state.
- `Message.text` is canonical optional content and is preserved losslessly.
- `Message.raw_event_reference` maps to `inbox_reference` only when semantic equivalence is proven; otherwise migration aborts.
- Historical absence of `google_contact_id`, `media`, `reply_reference`, `provider_status`, or `provider_error` maps to `NULL` when no legitimate source exists.

## Migration policy

Use `CREATE NEW TABLE -> COPY -> VALIDATE -> SWAP`; never edit historical migrations.

Abort on FK violations, canonical uniqueness violations, required-field NULLs, unknown enum values, malformed required payloads, or ambiguous legacy state mappings. No automatic repair, invented default, surrogate-ID replacement, or silent data loss.

## Authority

This package closes the minimum semantic decisions needed for P0-008C/P0-008D and IA-01 migration planning. It does not authorize merge, release, or approval.
