# KassisT — Master Human Decision Queue

> Consolidated from Auditor 1 and Auditor 2. No decision is taken here.
> `OPERATOR_DECISION = PENDING` for every row.

| DECISION_ID | QUESTION | AUDITOR_1_RECOMMENDATION | AUDITOR_2_RECOMMENDATION | AGREEMENT_OR_DISAGREEMENT | SECURITY_IMPACT | CROSS_AGENT_IMPACT | REVERSIBILITY | DEPENDENCIES | BLOCKING_SCOPE | OPERATOR_DECISION |
|---|---|---|---|---|---|---|---|---|---|---|
| DOD-C1 | What exact minimum scope constitutes current MVP completion? | Freeze a small verifiable C1 path | Explicitly ratify baseline-derived C1 DoD | AGREEMENT | Medium | Global | Medium | Baseline + external scope | Global C1 scope | PENDING |
| SD-001 | Physical schema naming convention | lower_snake_case | lower_snake_case | AGREEMENT | Low | IA-01 consumers | High | none | C1 schema | PENDING |
| SD-002 | UUIDv7 physical representation | TEXT | TEXT unless contrary evidence | AGREEMENT | Low | IA-01/02/03 | High | SQLite foundation | C1 schema | PENDING |
| SD-003 | UTC timestamp physical encoding | Canonical UTC TEXT with precision frozen | Freeze canonical UTC representation before DDL | AGREEMENT | Medium | persistence/domain | High | UTC invariant | C1 schema | PENDING |
| SD-004 | Boolean encoding in SQLite | INTEGER 0/1 + CHECK | INTEGER 0/1 + CHECK | AGREEMENT | Low | persistence | High | SQLite rules | C1 schema | PENDING |
| SD-005 | JSON/relational modeling policy | JSON TEXT only for explicit non-relational payloads | Resolve only where schema needs it | AGREEMENT | Medium | schema consumers | Medium | field classifications | C1 schema | PENDING |
| DR-001 | What is the minimum typed AI-V1 provider contract? | Close before AI runtime; do not transfer domain ownership | Close provider contract; keep model/tool/prompt decisions distinct | AGREEMENT | Medium | IA-02/05 | Medium | current AI evidence | AI runtime | PENDING |
| DR-02A.1 | Which elements belong to signed cryptographic context? | Dedicated IA-06 decision | Explicit human materialization required | AGREEMENT | HIGH | IA-06/07 | LOW after deployment | Ed25519 primitive | Auth verifier | PENDING |
| DR-02A.2 | How are exact signed bytes deterministically derived? | Dedicated IA-06 decision | Explicit human materialization required | AGREEMENT | HIGH | IA-06/07 | LOW | DR-02A.1 | Auth verifier | PENDING |
| DR-02A.3 | Public-key representation | Dedicated IA-06 decision | Explicit human materialization required | AGREEMENT | HIGH | IA-06/07 | Medium | DR-02A.1 | Auth verifier | PENDING |
| DR-02A.4 | Signature representation / verification result semantics | Dedicated IA-06 decision | Explicit human materialization required | AGREEMENT | HIGH | IA-06/07 | Medium | DR-02A.1 | Auth verifier | PENDING |
| CONTRACT-001 | DomainOutbox ownership/scope/transaction semantics | Resolve only when C1 path encodes Outbox | Same localized/conditional treatment | AGREEMENT | High | IA-01/03/04/07 | Low | concrete Outbox requirement | Affected runtime only | PENDING |
| CONTRACT-002 | `order.status_changed` normative semantics | Resolve when required by C1 flow | Same localized/conditional treatment | AGREEMENT | Medium | IA-02/03/04/08 | Medium | concrete affected flow | Affected runtime only | PENDING |
| GOV-001 | Normative document authority/history | Conditional gate only when conflict affects a decision | Same | AGREEMENT | Low | Global governance | High | real authority conflict | Conditional | PENDING |
| AI-MODEL-001 | Is a specific default LLM/model an MVP requirement? | Open/external unless benchmarked and approved | Conditional C1/C2 classification required | AGREEMENT | Medium | IA-05 | High | external benchmark/provider constraints | Only if promoted to C1 | PENDING |

## Rule

A recommendation is not approval. Approval is not implementation authorization. These decisions must be materialized in the authoritative project record before they can be treated as normative.
