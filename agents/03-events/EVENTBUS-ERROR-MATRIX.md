# IA-03 — EventBus Error Matrix

## Status

`RUNTIME GATE / BLOCKED`

| Error point | Current evidence | Owner boundary | Propagation | Retry | Audit | Observability | Gate |
|---|---|---|---|---|---|---|---|
| Event input invalid | Domain/event contract exists; EventBus validation API is undefined | Publisher / contract boundary | UNKNOWN | No automatic EventBus retry | Not implied | Correlate when available | OPEN |
| Subscriber throws | No normative propagation behavior | EventBus runtime contract | UNKNOWN | NOT EventBus-owned | Not automatic | Dispatch failure must be diagnosable | BLOCKING |
| Multiple subscriber failure | No fail-fast, isolate, aggregate, or continue rule | EventBus | UNKNOWN | NOT EventBus-owned | Not automatic | Affected dispatch must be diagnosable | BLOCKING |
| Async subscriber rejects | Async handler semantics not defined | EventBus / consumer boundary | UNKNOWN | Durable retry may belong to JobQueue when applicable | Not automatic | Preserve available correlation/causation | BLOCKING |
| Publish before commit | Backend documentation requires post-commit local consumers | Transaction boundary | Invalid normal path | N/A | N/A | Testable negative invariant | CLOSED |
| Publish after commit, handler fails | Post-commit is documented; recovery is external to EventBus | EventBus + consumer boundary | UNKNOWN | No automatic EventBus retry | Business/security audit only where separately required | Required | BLOCKING |
| Handler timeout | No EventBus timeout contract | EventBus / consumer contract | UNKNOWN | No automatic EventBus retry | Not automatic | UNKNOWN | BLOCKING |
| Cancellation requested | No EventBus cancellation contract | EventBus / subscription contract | UNKNOWN | No automatic retry | Not automatic | UNKNOWN | BLOCKING |
| Correlation/causation available | Event/domain contracts may supply identifiers | Source contract | Preserve unchanged | N/A | N/A | Preserve unchanged | CLOSED |
| Correlation/causation absent | No permission to synthesize identifiers | Source contract | Preserve absence | N/A | N/A | Use available context only | CLOSED |

## Rules

1. EventBus must not convert subscriber failure into a business decision.
2. EventBus must not create durable retry semantics that belong to JobQueue.
3. EventBus must not imply exactly-once delivery.
4. Ordering is explicitly `NO_ORDERING_GUARANTEE` at EventBus scope.
5. Production runtime remains blocked until subscriber failure propagation, isolation, scheduling, cancellation, timeout and completion semantics are explicit.
