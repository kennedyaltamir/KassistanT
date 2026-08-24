# Customer / Conversation / Message — Decision Package

Status: **OPEN_DECISION_PENDING_FORMALIZATION**
Authority: `OPERATOR_PROJECT_GOVERNANCE`
Baseline: `MVP2` @ `0bea2a0ca7c52729cfd58bebc8cd568373222230`

## Customer Identity

### Current evidence
`docs/domain/entities.md` records `Customer(store_id, phone_normalized)` as a defined uniqueness rule. `agents/02-domain/CANONICAL-ENTITY-INVENTORY.md` confirms Customer is canonical. The detailed identity-resolution pipeline is not fully frozen in the current evidence set.

### Proposed contract — PENDING
Identity key: `(store_id, phone_normalized)`.

### Proposed invariant — PENDING
Same `store_id` + same normalized phone identifies the same canonical Customer.

### Proposed policy — PENDING
WhatsApp transport identity -> normalization -> identity resolution -> canonical Customer.

### Decision alternatives
A. Approve the proposed identity key/invariant/policy as the normative Customer identity contract.
B. Approve the uniqueness key but require an explicit identity-resolution contract before freeze.
C. Reject and define a different canonical identity model.

No option is selected by IA-01.

## Conversation

### Current evidence
`docs/domain/entities.md` records `Conversation(store_id, external_thread_id)` uniqueness. The entity is canonical. The evidence does not independently establish a frozen cross-channel identity graph or a formal Conversation aggregate cardinality.

### Proposed contract — PENDING
`Customer 1 -> N Conversation`.

`Conversation.id != external_thread_id`.

### Proposed uniqueness — PENDING
`UNIQUE(store_id, external_thread_id)`.

### Explicit non-scope for this decision
Cross-channel conversation merge, automatic conversation stitching and multi-channel identity graph remain non-scope unless separately approved.

### Decision alternatives
A. Approve the proposed `1:N` cardinality and identity separation.
B. Approve uniqueness and identity separation but defer cardinality to a separate domain decision.
C. Reject and define another conversation identity/cardinality model.

No option is selected by IA-01.

## Message

### Current evidence
`docs/domain/entities.md` records `Message(store_id, external_message_id)` uniqueness and identifies Message as canonical.

### Proposed contract — PENDING
External message identity is scoped by store.

### Proposed uniqueness — PENDING
`UNIQUE(store_id, external_message_id)` to prevent logical duplicate inbound messages.

### Decision alternatives
A. Approve the proposed uniqueness as the normative message identity invariant.
B. Approve uniqueness only for inbound provider messages and define outbound separately.
C. Reject and define another identity scope.

No option is selected by IA-01.

## Cross-entity invariants

1. Transport identifiers are not canonical business identities by default.
2. Store scoping must remain explicit.
3. No implementation may freeze a proposed contract by inference.
4. Cross-channel identity stitching is not authorized by this package.

## Decision State

All three contracts remain **PENDING** until Operator approval and explicit contract closure.
