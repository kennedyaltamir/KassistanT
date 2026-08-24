# Decision Queue — Auditor 2

Only HUMAN_DECISION_REQUIRED items. No approval is inferred.

| ID | Question | Current Evidence | Recommendation | Depends On | Blocking | Parallelizable | Operator Decision |
|---|---|---|---|---|---|---|---|
| DOD-01 | What exact C1 MVP path is mandatory? | Baseline + current audit | Freeze minimal C1 DoD explicitly | none | YES | YES | PENDING |
| IA01-SCHEMA | Which schema-critical fields/constraints are authoritative for C1? | IA-01 says field detail partial | Resolve only fields necessary for current C1 | DOD-01 | YES | YES | PENDING |
| IA05-DR001 | What is the approved typed LLMProvider envelope? | IA-05 DECISIONS says AI-V1 partial | Close only minimum C1 contract | DOD-01 | YES for IA05 runtime | YES | PENDING |
| IA05-MODEL | Is concrete model selection C1 or deferred? | Explicitly OPEN/EXTERNAL | Decide whether MVP can use provider-neutral direction or requires concrete model | DOD-01/benchmark | CONDITIONAL | YES | PENDING |
| IA06-02A1 | Which signed-context elements are normative? | Current IA-06 says candidates remain pending | Analyze evidence; choose explicitly | none | YES | YES | PENDING |
| IA06-02A2 | How are approved context elements transformed into signed bytes? | No versioned rule | Decide exact derivation | IA06-02A1 | YES | NO | PENDING |
| IA06-02A3 | Public key representation? | Unresolved | Decide | IA06-02A1 | YES | YES | PENDING |
| IA06-02A4 | Signature representation? | Unresolved | Decide | IA06-02A1 | YES | YES | PENDING |
| CONTRACT-001 | Is/when DomainOutbox needed for C1, and exact ownership? | OPEN/AMBIGUOUS | Resolve only when a C1 slice encodes it | impacted slice | CONDITIONAL | YES | PENDING |
| CONTRACT-002 | What is normative `order.status_changed` behavior? | OPEN/AMBIGUOUS | Resolve before a slice depends on it | impacted order/event slices | CONDITIONAL | YES | PENDING |
| GOV-001 | What is authoritative document/version policy when conflicts arise? | OPEN | Resolve when normative promotion is needed | none | CONDITIONAL | YES | PENDING |
| RELEASE-01 | Is C1 completion separate from production release? | Baseline + consensus imply separate | Keep C1/C2 distinct; formalize release gate later | DOD-01 | NO for C1 | YES | PENDING |

## Note

This queue intentionally does not include decisions already approved by the operator. It also does not include implementation tasks masquerading as decisions.
