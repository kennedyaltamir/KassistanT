# IA-03 — EventBus Error Matrix

| Error point | Current evidence | Owner boundary | Propagation | Retry | Audit | Observability | Status |
|---|---|---|---|---|---|---|---|
| Event input invalid | Domain/event contract validation exists conceptually; exact EventBus validation API is not specified | Publisher / contract boundary | UNKNOWN | No automatic EventBus retry | Not implied | Correlate when metadata exists | OPEN |
| Subscriber throws | No normative isolation/aggregation behavior documented | EventBus implementation contract | UNKNOWN | NOT EventBus-owned | Not automatic | Must expose dispatch failure | OPEN |
| Subscriber rejects async work | Async handler semantics are not documented | EventBus implementation contract | UNKNOWN | JobQueue may own durable retry when applicable | Not automatic | Correlation/causation preserved if present | OPEN |
| Multiple subscriber failure | No all-or-nothing guarantee documented | EventBus | UNKNOWN | NOT EventBus-owned | Not automatic | Must identify affected dispatch | OPEN |
| Publish before commit | Current documentation requires post-commit local consumers | Publisher/transaction boundary | Must not be used as documented normal path | N/A | N/A | Implementation/test gate | DEFINED NEGATIVE |
| Publish after commit but handler fails | Post-commit dispatch is documented; recovery is not | EventBus + consumer boundary | UNKNOWN | Durable retry belongs outside EventBus | Business/security audit only where separately required | Required for operational diagnosis | OPEN |
| Handler timeout | Timeout policy not documented | EventBus/consumer contract | UNKNOWN | No automatic EventBus retry | Not automatic | Required when timeout exists | UNKNOWN |
| Correlation/causation missing | Source event contract may omit them; broader docs describe them | Source contract | Preserve if present; do not fabricate | N/A | N/A | Use available identifiers | DEFINED |

## Rules

1. EventBus must not convert a subscriber failure into a business decision.
2. EventBus must not create durable retry semantics that belong to JobQueue.
3. EventBus must not imply exactly-once delivery.
4. Until subscriber failure propagation is finalized, production implementation is not fully closed.
