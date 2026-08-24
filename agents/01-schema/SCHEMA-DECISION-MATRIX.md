# IA-01 — Schema Decision Matrix

Status: **DECISION PACKAGE / REVIEW REQUIRED**

This matrix separates implementation decisions that belong to IA-01 from cross-agent and global decisions. `PROPOSAL` does not mean approved.

| Decision ID | Blocker | Question | Current State | Evidence | Proposed Resolution | Authority | Affected Agents | Affected Files | Blocks 0002 | Blocks Runtime | Blocks Other Agents | Risk | Classification | Approval Required |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| SD-001 | TABLE-NAMING | Physical SQL naming convention | entity names frozen; physical names not frozen | Baseline §23; Phase 2 audit | Adopt `lower_snake_case` table/column naming consistently | IA-01 local implementation authority | All schema consumers indirectly | future migrations | YES | NO | NO | Medium | LOCAL_DECISION / PROPOSAL | YES — operator |
| SD-002 | PHYSICAL-TYPE-GAPS | UUIDv7 physical representation | logical UUIDv7 required; SQL encoding unspecified | Baseline §23; M5.1 UUIDv7 helper | Canonical UUID string in SQLite `TEXT` | IA-01 local physical authority | IA-02–IA-07 | future schema migrations | YES | NO | NO | Medium | LOCAL_DECISION / PROPOSAL | YES — operator |
| SD-003 | PHYSICAL-TYPE-GAPS | UTC timestamp representation | UTC required; SQL encoding unspecified | Baseline §23; M5.1 UTC helper | Canonical UTC RFC3339/ISO-8601 `TEXT` | IA-01 local physical authority | IA-02–IA-07 | future schema migrations | YES | NO | NO | Medium | LOCAL_DECISION / PROPOSAL | YES — operator |
| SD-004 | PHYSICAL-TYPE-GAPS | Boolean representation | boolean-like fields documented; encoding unspecified | Baseline §23 | SQLite `INTEGER` constrained to 0/1 | IA-01 local physical authority | IA-02–IA-08 | future schema migrations | YES | NO | NO | Low | LOCAL_DECISION / PROPOSAL | YES — operator |
| SD-005 | PHYSICAL-TYPE-GAPS | JSON-like payload representation | payload/metadata concepts lack encoding | persistence/backend/AI docs | Canonical JSON in `TEXT` only where the contract actually defines JSON; otherwise relational decomposition | IA-01 physical authority within contract | IA-03–IA-07 | future migrations | CONDITIONAL | NO | NO | Medium | LOCAL_DECISION / PROPOSAL | YES — operator |
| SD-006 | ENUM-PHYSICAL-GAPS | Status/lifecycle SQL encoding | semantic sets known; physical encoding unspecified | state-machines + domain exports | Freeze semantic catalog with owning agent; IA-01 then selects physical encoding | IA-02 + relevant semantic owner; IA-01 physical | IA-02, IA-04, IA-05 | future migrations | YES affected tables | YES | YES | Medium | CROSS_AGENT / PROPOSAL | YES |
| SD-007 | NULLABILITY-DEFAULT-GAPS | Domain-required vs optional fields | mostly unspecified | baseline/domain docs | Semantic owner classifies required/optional/nullable/default; IA-01 materializes | IA-02; IA-04/05/06 as relevant | IA-02–IA-06 | future migrations/contracts | YES affected tables | YES | YES | High | CROSS_AGENT | YES |
| SD-008 | CHILD-KEY-GAPS | OrderItem parent key | not explicitly named | baseline §23/76 | IA-04 defines canonical parent relation/key semantics | IA-04 | IA-01, IA-02, IA-03 | order schema + migration | YES | YES | YES | High | CROSS_AGENT | YES — IA-04 |
| SD-009 | CHILD-KEY-GAPS | OrderItemModifier parent keys | not explicitly named | baseline §76 | IA-04 defines parent key(s), ownership, ordering and uniqueness | IA-04 | IA-01, IA-02 | order schema + migration | YES | YES | YES | High | CROSS_AGENT | YES — IA-04 |
| SD-010 | CHILD-KEY-GAPS | OrderStatusHistory parent key | not explicitly named | baseline §74 | IA-04 defines order reference/history identity; IA-02 supports actor semantics | IA-04 + IA-02 | IA-01, IA-02, IA-04 | order/domain schema + migration | YES | YES | YES | High | CROSS_AGENT | YES — IA-04/IA-02 |
| SD-011 | FK-ACTION-GAPS | ON DELETE / ON UPDATE policy | not specified | Phase 2 audit | Semantic owner defines lifecycle action; IA-01 materializes; no convention fallback | Relevant semantic owner; global if architecture-wide | affected consumers | migrations | YES affected FKs | YES | YES | High | CROSS_AGENT | YES |
| SD-012 | FIELD-GAPS | Settings physical field model | materially incomplete | baseline §20/23 | Product/domain authority closes canonical fields; IA-01 maps physically | IA-02 + global product authority | IA-02, IA-08 | protected schema + migration | YES | YES | YES | High | GLOBAL/CROSS_AGENT | YES |
| SD-013 | FIELD-GAPS | ProductCategory field model | incomplete | entity inventory | IA-02 defines category fields; IA-01 maps physically | IA-02 | IA-01, IA-04, IA-08 | protected domain + migration | YES | YES | YES | Medium | CROSS_AGENT | YES — IA-02 |
| SD-014 | FIELD-GAPS | CustomerAddress model | address components not frozen | baseline §23/order usage | IA-02 + IA-04 define address model/lifecycle | IA-02 + IA-04 | IA-01, IA-04, IA-05 | domain/order docs | YES | YES | YES | High | CROSS_AGENT | YES |
| SD-015 | FIELD-GAPS | PaymentMethod model | insufficient detail | baseline §23/75; ADR-016 | IA-04 + IA-02 define recorded method fields without payment processing | IA-04 + IA-02 | IA-01, IA-04 | domain/order docs | YES | YES | YES | High | CROSS_AGENT | YES |
| SD-016 | FIELD-GAPS | Integration model | state/config fields incomplete | integration/config docs | IA-02 + provider owners define identity/status/reference set | IA-02 + relevant provider owner | IA-05, IA-06, IA-07 | integration docs/contracts | YES | YES | YES | High | CROSS_AGENT | YES |
| SD-017 | FIELD-GAPS | IntegrationCredential model | secure reference incomplete | baseline §26/security | IA-06 defines secure boundary; provider owner defines metadata references | IA-06 + relevant provider owner | IA-05, IA-06, IA-07 | security/integration docs | YES | YES | YES | Critical | CROSS_AGENT | YES |
| SD-018 | FIELD-GAPS | KnowledgeItem model | field model incomplete | baseline §11/23 | IA-02 + IA-05 define identity/content/scope | IA-02 + IA-05 | IA-01, IA-05, IA-08 | domain/AI docs | YES | YES | YES | High | CROSS_AGENT | YES |
| SD-019 | CONTRACT-001 | DomainOutbox physical ownership | ambiguous Core/Gateway | contract registry/persistence docs | Resolve ownership/scope globally; IA-01 remains neutral until then | Global project authority | IA-01, IA-03, IA-07 | protected contracts + migration | YES DomainOutbox only | YES | YES | Critical | GLOBAL / BLOCKED | YES |
| SD-020 | CONTRACT-002 | `order.status_changed` schema impact | event ambiguity; lifecycle persists independently | domain events + baseline §74 | Treat as runtime event contract unless final decision adds physical persistence | IA-04 + IA-03; global only if catalog changes | IA-01, IA-03, IA-04, IA-07 | event contracts | NO current schema | NO | NO | Low | NON_BLOCKING / PROPOSAL | NO |
| SD-021 | GOV-001 | source authority on field conflict | history/version mismatch | registry/GOV-001 | Escalate only when conflict changes a schema-critical interpretation | Global project authority | All | protected docs | CONDITIONAL | NO | NO | Medium | GLOBAL / DEFERRED | YES only if conflict material |
| SD-022 | STORE-SCOPING | entities without explicit `store_id` | broad product Store boundary but field evidence incomplete | baseline §23/domain entities | Semantic owner confirms per-entity scope; IA-01 maps only approved scope | IA-02/domain owner; IA-06 for Device | IA-02, IA-04, IA-05, IA-06 | protected docs + migration | YES affected | YES | YES | High | CROSS_AGENT | YES |
| SD-023 | INDEX-SCOPE | performance-only indexes | no normative evidence | Phase 1/2 audit | Defer; add later when query/constraint evidence exists | IA-01 | consumers may request later | future migrations | NO | NO | NO | Low | NON_BLOCKING / DECISION | NO |
| SD-024 | IMMUTABILITY | immutable vs mutable columns | mostly unspecified | domain lifecycle docs | Semantic owner identifies immutable values; IA-01 enforces only explicit schema constraints | IA-02/IA-04 | IA-01, IA-04 | domain/order docs | YES affected | YES | YES | High | CROSS_AGENT | YES |
| SD-025 | IDEMPOTENCY | idempotency/deduplication fields | explicit unique keys cover part of scope | baseline §23.1/backend | Preserve explicit keys; extra fields require IA-03/owner evidence | IA-03 for infrastructure | IA-01, IA-03, IA-04, IA-05, IA-07 | backend/contracts | YES affected infra tables | YES | YES | Medium | CROSS_AGENT | YES |

## Request status

All cross-agent items above are now converted into targeted decision requests in `HUMAN-SCHEMA-REVIEW.md`. No response from another agent is assumed in this phase.

### Current request state

- IA-02: `REQUEST_READY`
- IA-03: `REQUEST_READY`
- IA-04: `REQUEST_READY — PRIORITY ORDER CHILD KEYS`
- IA-05: `REQUEST_READY`
- IA-06: `REQUEST_READY`
- IA-07: `REQUEST_READY — CONTRACT-001 BOUNDARY`
- IA-08: `NO_REQUEST_REQUIRED`
- Global authority: `REQUEST_READY — CONTRACT-001`

## Approval rule

A proposal becomes `DECISION` only after explicit approval from its authority. Until then, it remains `PROPOSAL` and cannot be used as an unreviewed basis for `0002`.
