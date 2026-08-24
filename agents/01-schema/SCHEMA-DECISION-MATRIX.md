# IA-01 — Schema Decision Matrix

Status: **DECISION PACKAGE / REVIEW REQUIRED**

This document separates implementation decisions that belong to IA-01 from cross-agent and global decisions. `PROPOSAL` does not mean approved.

| Decision ID | Blocker | Question | Current State | Evidence | Proposed Resolution | Authority | Affected Agents | Affected Files | Blocks 0002 | Blocks Runtime | Blocks Other Agents | Risk | Classification | Approval Required |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| SD-001 | TABLE-NAMING | Physical SQL naming convention | entity names frozen; physical names not frozen | Baseline §23; Phase 2 audit | Adopt `lower_snake_case` table/column naming consistently | IA-01 local implementation authority | All schema consumers indirectly | `agents/01-schema/**`; future migrations | YES | NO | NO | Medium | LOCAL_DECISION / PROPOSAL | YES — operator/authority confirmation |
| SD-002 | PHYSICAL-TYPE-GAPS | UUIDv7 physical representation | logical UUIDv7 required; SQL encoding unspecified | Baseline §23; M5.1 UUIDv7 helper | Store UUIDs as canonical textual UUID values (`TEXT`) | IA-01 local physical decision, constrained by contract | IA-02–IA-07 consumers | future schema migrations | YES | NO | NO | Medium | LOCAL_DECISION / PROPOSAL | YES |
| SD-003 | PHYSICAL-TYPE-GAPS | UTC timestamp representation | UTC required; SQL encoding unspecified | Baseline §23; M5.1 UTC helper | Store UTC timestamps as canonical RFC3339/ISO-8601 text (`TEXT`) | IA-01 local physical decision | IA-02–IA-07 | future schema migrations | YES | NO | NO | Medium | LOCAL_DECISION / PROPOSAL | YES |
| SD-004 | PHYSICAL-TYPE-GAPS | Boolean representation | boolean-like fields documented; encoding unspecified | Baseline §23 | Store booleans as SQLite `INTEGER` constrained to `0/1` | IA-01 local physical decision | IA-02–IA-08 | future schema migrations | YES | NO | NO | Low | LOCAL_DECISION / PROPOSAL | YES |
| SD-005 | PHYSICAL-TYPE-GAPS | JSON-like payload representation | several payload/metadata concepts lack encoding | Protocol/backend docs | Use `TEXT` containing canonical JSON only where the contract identifies a JSON payload/reference and no relational fields are required | IA-01 local physical decision; schema-specific | IA-03–IA-07 | future schema migrations | Conditional | NO | NO | Medium | LOCAL_DECISION / PROPOSAL | YES |
| SD-006 | ENUM-PHYSICAL-GAPS | Status/lifecycle SQL encoding | logical value sets known for Conversation/AI/Message/Order; physical encoding unspecified | `docs/domain/state-machines.md`; domain exports | Prefer `TEXT` + explicit `CHECK` only after canonical value set is owned/frozen; otherwise retain schema-level status as `TEXT` without invented values | IA-02 for semantic catalog; IA-01 for physical encoding | IA-02, IA-04, IA-05 | future migrations | YES for affected tables | YES | YES | Medium | CROSS_AGENT_DECISION / PROPOSAL | YES — IA-02 + relevant owner |
| SD-007 | NULLABILITY-DEFAULT-GAPS | Domain-required vs optional fields | many fields have names but no null/default contract | baseline §23; domain docs | IA-01 cannot infer; require field-level semantic owner to classify required/optional, then IA-01 materializes it | IA-02; IA-04/05/06 as relevant | IA-02–IA-06 | protected contracts + IA-01 docs | YES for affected tables | YES | YES | High | CROSS_AGENT_DECISION | YES |
| SD-008 | CHILD-KEY-GAPS | `OrderItem` parent key | not explicitly named | baseline §23/76; Phase 2 gap | IA-04 must define canonical parent reference; IA-01 materializes FK | IA-04 | IA-01, IA-02, IA-03 | protected order contract + future migration | YES | YES | YES | High | CROSS_AGENT_DECISION | YES — IA-04 |
| SD-009 | CHILD-KEY-GAPS | `OrderItemModifier` parent keys | not explicitly named | baseline §76; Phase 2 gap | IA-04 must define parent key(s), ownership and ordering | IA-04 | IA-01, IA-02 | protected order contract + future migration | YES | YES | YES | High | CROSS_AGENT_DECISION | YES — IA-04 |
| SD-010 | CHILD-KEY-GAPS | `OrderStatusHistory` parent key | not explicitly named | baseline §74; Phase 2 gap | IA-04 must define order reference and actor/history semantics | IA-04 + IA-02 where actor/domain semantics cross | IA-01, IA-02, IA-04 | protected order/domain docs + future migration | YES | YES | YES | High | CROSS_AGENT_DECISION | YES — IA-04/IA-02 |
| SD-011 | FK-ACTION-GAPS | ON DELETE / ON UPDATE policy | not specified | Phase 2 audit | Do not encode action until domain ownership/lifecycle semantics are explicitly approved; default to no action in decision package, not as DDL | Relevant domain owner; global if shared invariant | IA-02–IA-06 | future migrations | YES for affected FKs | YES | YES | High | CROSS_AGENT_DECISION | YES |
| SD-012 | FIELD-GAPS | `Settings` physical field model | materially incomplete | baseline §20/23 | Obtain authoritative setting field inventory from product/domain authority; IA-01 owns only physical mapping | IA-02 / global product authority | IA-02, IA-08 | protected docs + future migration | YES | YES | YES | High | GLOBAL_DECISION / BLOCKED | YES |
| SD-013 | FIELD-GAPS | `ProductCategory` field model | materially incomplete | entity inventory only | Define category fields in domain contract, then map to SQLite | IA-02 | IA-01, IA-04, IA-08 | protected domain docs + migration | YES | YES | YES | Medium | CROSS_AGENT_DECISION / BLOCKED | YES — IA-02 |
| SD-014 | FIELD-GAPS | `CustomerAddress` model | address components not frozen | baseline §23; order address usage | Define address fields and lifecycle in domain/order contract | IA-02 + IA-04 | IA-01, IA-04, IA-05 | protected domain/order docs | YES | YES | YES | High | CROSS_AGENT_DECISION / BLOCKED | YES — IA-02/IA-04 |
| SD-015 | FIELD-GAPS | `PaymentMethod` model | insufficient detail | baseline §23/75; ADR-016 | Define persisted method identity/fields without payment-processing semantics | IA-04 + IA-02 | IA-01, IA-04 | protected order/domain docs | YES | YES | YES | High | CROSS_AGENT_DECISION / BLOCKED | YES — IA-04/IA-02 |
| SD-016 | FIELD-GAPS | `Integration` model | state/config fields incomplete | baseline integrations/configuration | Define integration identity, provider, status and non-secret references | IA-02 with provider owners; global only if contract changes | IA-05, IA-06, IA-07 | protected integration docs/contracts | YES | YES | YES | High | CROSS_AGENT_DECISION / BLOCKED | YES |
| SD-017 | FIELD-GAPS | `IntegrationCredential` model | secure reference semantics incomplete | baseline §26; device/Google security | Persist references/metadata only; exact fields and secret boundary require integration/security owners | IA-06 for secure device refs; relevant provider owner | IA-05, IA-06, IA-07 | protected security/integration contracts | YES | YES | YES | Critical | CROSS_AGENT_DECISION / BLOCKED | YES |
| SD-018 | FIELD-GAPS | `KnowledgeItem` model | field model incomplete | baseline §11/23 | Define structured knowledge fields and scope through domain/AI contract | IA-02 + IA-05 | IA-01, IA-05, IA-08 | protected domain/AI docs | YES | YES | YES | High | CROSS_AGENT_DECISION / BLOCKED | YES — IA-02/IA-05 |
| SD-019 | CONTRACT-001 | DomainOutbox physical ownership | ambiguous local vs Gateway semantics | contract registry; persistence docs | Keep local schema neutral and limit physical fields to unambiguous local transaction semantics until global decision closes ownership boundary | Global project authority | IA-01, IA-03, IA-07 | protected contracts + future migration | YES for DomainOutbox only | YES | YES | Critical | GLOBAL_DECISION / BLOCKED | YES |
| SD-020 | CONTRACT-002 | `order.status_changed` schema impact | event contradiction; order lifecycle itself is defined | domain events; baseline §74 | Treat as runtime event contract only unless final decision explicitly requires schema/history change | IA-04 + IA-03; global only for normative event catalog | IA-01, IA-03, IA-04, IA-07 | protected event contracts | NO unless physical impact introduced | NO | NO | Low | NON_BLOCKING / PROPOSAL | NO for current schema |
| SD-021 | GOV-001 | Which document governs field conflict | version/history mismatch | registry/GOV-001 | Use current GitHub protected source and escalate actual normative conflict; do not alter global docs from IA-01 | Global project authority | All | protected docs | CONDITIONAL | NO | NO | Medium | GLOBAL_DECISION / DEFERRED | YES only when conflict affects schema |
| SD-022 | STORE-SCOPING | Which tables explicitly carry `store_id` | concept is broad but field-by-field scope is incomplete | baseline §23; domain entity docs | Add `store_id` only where explicit or approved by semantic owner; do not blanket-add | IA-02/domain owner; IA-06 for Device semantics; IA-01 physical mapping | IA-02, IA-04, IA-05, IA-06 | protected domain docs + migration | YES for affected tables | YES | YES | High | CROSS_AGENT_DECISION | YES |
| SD-023 | INDEX-SCOPE | Performance-only indexes | no normative evidence | Phase 1/2 audit | Defer all non-contract performance indexes; add only when query/constraint evidence exists | IA-01 local | IA-03–IA-08 consumers may request later | future migrations | NO | NO | NO | Low | NON_BLOCKING / DECISION | NO |
| SD-024 | IMMUTABILITY | immutable vs mutable columns | mostly not specified | domain lifecycle docs | Semantic owner must identify immutable snapshots/status history before DDL; IA-01 enforces only explicit constraints | IA-02/IA-04 | IA-01, IA-04 | protected domain/order docs | YES for affected tables | YES | YES | High | CROSS_AGENT_DECISION | YES |
| SD-025 | IDEMPOTENCY | idempotency/deduplication fields | seven unique keys partially cover infrastructure | baseline §23.1; backend persistence | Preserve explicitly named idempotency keys; additional dedup fields require IA-03/owner evidence | IA-03 for infrastructure | IA-01, IA-03, IA-04, IA-05, IA-07 | protected backend/contracts | YES for affected infra tables | YES | YES | Medium | CROSS_AGENT_DECISION | YES |

## Approval summary

### IA-01 may decide locally

- physical SQLite representation of already-frozen logical primitives, subject to consistency and later human review;
- deferral of non-contract performance indexes;
- physical mapping of approved fields once semantic ownership is closed.

### Cross-agent decisions required

- domain-required/nullability/defaults;
- child parent keys;
- order/address/payment semantics;
- conversation/AI semantic state catalogs;
- integration/credential persistence semantics;
- per-entity store scoping where not explicit;
- FK delete/update semantics.

### Global decisions required

- DomainOutbox ownership/scope (`CONTRACT-001`);
- actual source-of-truth conflict when `GOV-001` materially changes a schema interpretation;
- any architecture-wide naming rule if physical names become a repository-wide convention rather than an IA-01 implementation detail.
