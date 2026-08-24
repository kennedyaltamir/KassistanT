# Contract Registry Reconciliation — Operator 2026-08-24

Status: **RECONCILED**

Source of normative authority: `consensus/governance/OPERATOR-DECISIONS-2026-08-24.xml`

| Contract | Normative state | Reconciled rule | Remaining implementation detail |
|---|---|---|---|
| MVP scope | APPROVED | TEXT-FIRST REAL COMMERCIAL OPERATION | Feature-specific contracts remain owned by downstream agents |
| Customer | FORMALLY_FROZEN | `(store_id, phone_normalized)` uniquely identifies Customer | Field completeness/nullability/FK physical encoding |
| Conversation | FORMALLY_FROZEN | Customer 1:N; internal id distinct from `external_thread_id`; unique `(store_id, external_thread_id)` | Lifecycle/ownership physical encoding |
| Message | FORMALLY_FROZEN | Inbound provider idempotency via unique `(store_id, external_message_id)` | Outbound identity requires explicit future contract |
| DomainOutbox | RESOLVED | Domain defines event intent; IA-03 owns durable mechanics/worker; durable intent precedes provider call | Physical storage and worker implementation |
| Migration 0002 | NON-AUTHORITATIVE HISTORICAL | Existing file is evidence only, not schema authority | Separate physical migration decision/implementation |

## Cross-contract invariants

1. Physical existence never implies normative approval.
2. Store scoping remains explicit for the approved Customer/Conversation/Message keys.
3. Cross-channel identity stitching remains out of scope.
4. Business state and outbox intent share an atomic transaction boundary where they belong to the same persistent operation.
5. Provider calls do not bypass durable outbox intent when the effect is Outbox-governed.

## Remaining gaps

The registry is contractually reconciled, but schema-level determinism is still incomplete for unrelated physical questions such as nullability/defaults, FK actions and unresolved child parent-key fields. These are implementation/schema-owner gates, not contradictions of the Operator decisions.
