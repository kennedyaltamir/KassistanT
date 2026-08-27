# IA-04 — Order Error Matrix

Status: AUDIT / PARTIAL / BLOCKED

The canonical domain error-code catalogue is explicitly missing. This matrix therefore records semantics without inventing stable codes.

| Error category | Trigger | Meaning | Retryability | Mapping | Evidence | Status |
|---|---|---|---|---|---|---|
| Invalid quantity | Zero, negative or otherwise invalid quantity | Order item quantity violates invariant | NON_RETRYABLE until corrected | Domain error required | `docs/domain/errors.md`, baseline §15 | PARTIAL |
| Product unavailable | Product/modifier unavailable | Requested catalog item cannot be added/retained | NON_RETRYABLE until catalog/order changes | Domain error required | `docs/domain/errors.md`, baseline §41-42 | PARTIAL |
| Invalid state transition | Command attempts forbidden lifecycle transition | Current lifecycle does not permit operation | NON_RETRYABLE unless stale/concurrent state is refreshed | Domain error required | `docs/domain/errors.md`, `state-machines.md` | PARTIAL |
| Insufficient delivery data | Delivery confirmation lacks required fields | Order cannot satisfy delivery contract | NON_RETRYABLE until corrected | Domain error required | `docs/domain/errors.md`, baseline §15 | PARTIAL |
| Invalid promotion | Promotion not eligible or violates rule | Promotion cannot be applied | NON_RETRYABLE until inputs/rules change | Domain error required | `docs/domain/errors.md`, baseline §15/75 | BLOCKED |
| Duplicate operation | Same critical operation replayed | Operation already accepted/processed or conflicting duplicate | Depends on operation; duplicate confirmation should be safe | Idempotency contract required | `docs/backend/idempotency.md` | PARTIAL |
| Concurrency conflict | Stale order state or simultaneous mutation | Operation conflicts with newer state | RETRYABLE after reload/revalidation where applicable | Canonical code + version strategy missing | Baseline edge cases; no executable contract | BLOCKED |
| Order not found | Target order absent | Referenced order cannot be loaded | NON_RETRYABLE unless caller used stale identity/context | Canonical code missing | Strongly implied by domain boundary; not catalogued | UNKNOWN |
| Actor/permission violation | Actor not permitted to perform operation | Operation denied by authorization policy | NON_RETRYABLE unless authorization state changes | Canonical code missing | `agents/04-order`, backend authorization is partial | BLOCKED |
| Payment invalid | Unsupported/invalid registered payment method | Order payment selection violates contract | NON_RETRYABLE until corrected | Canonical code missing | Baseline §16, §75; actor/payment details partial | BLOCKED |
| Delivery transition invalid | Dispatch/delivery state operation violates lifecycle | Fulfillment transition not currently allowed | NON_RETRYABLE unless valid later state | Canonical code missing | Lifecycle state catalog only | BLOCKED |
| Persistence failure | Database transaction cannot commit | Order operation cannot become authoritative | RETRYABLE according to infrastructure/recovery contract | Infrastructure error boundary | `docs/backend/database.md`, baseline §85 | PARTIAL |
| Durable-effect failure | External effect cannot be durably recorded | Confirmation must not claim external delivery without durable effect | Retry/recovery | CONTRACT-001 affects final boundary | `docs/domain/invariants.md`, `docs/backend/inbox-outbox.md` | BLOCKED |

## Error requirements

Future canonical error records must define at minimum:

- stable code/name;
- deterministic trigger;
- safe user-facing meaning where applicable;
- retryability;
- conflict/duplicate semantics;
- correlation information at application/infrastructure boundaries;
- mapping to command failure without leaking stack traces or secrets.

The repository currently provides the principles but not the complete catalogue.
