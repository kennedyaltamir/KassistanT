# Human Decisions Remaining — Auditor 2

## Decisions with current evidence

### IA-06 DR-02A.1..4
Current state: PENDING in versioned IA-06 documentation. Primitive Ed25519 is approved by baseline, but signed context, byte derivation, public-key representation and signature representation are not materially approved in versioned records. This is a hard C1 blocker for the verifier.

### IA-01 schema-critical decisions
IA-01 explicitly reports partial field detail and prohibits inventing unresolved fields. The exact list of SD-001..SD-005 must be revalidated against main; current documentation still shows the schema phase blocked until required field details are closed.

### IA-05 DR-001
AI-V1 is partial and LLMProvider runtime is absent. A typed minimum provider contract requires explicit human promotion before implementation.

### CONTRACT-001
Open and conditional. Must be resolved only if the C1 path requires DomainOutbox semantics.

### CONTRACT-002
Open and conditional. Must be resolved before a C1 slice encodes the disputed `order.status_changed` semantics.

### GOV-001
Open and conditional. A normative authority conflict must be settled if contradictory documents must be promoted into a single authoritative contract.

### C1 DoD
The baseline defines a broad MVP but current governance records do not show a separately frozen minimal completion list. The operator should confirm the minimal C1 path before counting all baseline surfaces as mandatory.

## No automatic approvals

`OPERATOR_DECISION = PENDING` for every item above.
