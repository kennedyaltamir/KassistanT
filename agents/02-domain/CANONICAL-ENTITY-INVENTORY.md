# IA-02 — Canonical Entity Inventory Reconciliation

## Reconciliation result

**Canonical entity count: 28.**

The canonical inventory is the 28-entity list explicitly recorded by `docs/domain/entities.md`, whose source is identified there as baseline §23. The prior D1 report stating **29 entities** was an inventory-counting error; no 29th canonical entity exists in the audited source set.

### Why the 29th count occurred

The D1 `DOMAIN-READINESS.md` table contains exactly 28 entity rows. The repository evidence inspected for D1 contains the same 28 names. Therefore the statement "29-entity inventory" was inconsistent with the actual table and source inventory. There is no additional entity to classify as canonical, auxiliary, value object, projection or historical artifact.

`CANONICAL_ENTITY_COUNT = 28`
`BASELINE_ENTITY_COUNT = 28`
`EXTRA_ENTITY_COUNT = 1` only as a **reporting/counting error**, not as a repository entity.

## Cross-reference

| Entity | Official in Baseline | Present in Domain Docs | Present in Contracts | Present in Runtime | Canonical Status |
|---|---|---|---|---|---|
| Store | YES | YES | NO executable entity | NO | CANONICAL |
| Device | YES | YES | NO executable entity | NO | CANONICAL |
| Settings | YES | YES | NO executable entity | NO | CANONICAL |
| ProductCategory | YES | YES | NO executable entity | NO | CANONICAL |
| Product | YES | YES | NO executable entity | NO | CANONICAL |
| ProductModifier | YES | YES | NO executable entity | NO | CANONICAL |
| ProductImage | YES | YES | NO executable entity | NO | CANONICAL |
| Promotion | YES | YES | NO executable entity | NO | CANONICAL |
| Customer | YES | YES | NO executable entity | NO | CANONICAL |
| CustomerAddress | YES | YES | NO executable entity | NO | CANONICAL |
| Conversation | YES | YES | NO executable entity | NO | CANONICAL |
| Message | YES | YES | NO executable entity | NO | CANONICAL |
| Order | YES | YES | NO executable entity | NO | CANONICAL |
| OrderItem | YES | YES | NO executable entity | NO | CANONICAL |
| OrderItemModifier | YES | YES | NO executable entity | NO | CANONICAL |
| OrderStatusHistory | YES | YES | NO executable entity | NO | CANONICAL |
| PaymentMethod | YES | YES | NO executable entity | NO | CANONICAL |
| Notification | YES | YES | NO executable entity | NO | CANONICAL |
| Integration | YES | YES | NO executable entity | NO | CANONICAL |
| IntegrationCredential | YES | YES | NO executable entity | NO | CANONICAL |
| InboundInbox | YES | YES | NO executable entity | NO | CANONICAL |
| DomainOutbox | YES | YES | Partial boundary only | NO | CANONICAL |
| Job | YES | YES | NO executable entity | NO | CANONICAL |
| AuditLog | YES | YES | NO executable entity | NO | CANONICAL |
| Log | YES | YES | NO executable entity | NO | CANONICAL |
| AIProfile | YES | YES | NO executable entity | NO | CANONICAL |
| AIExecution | YES | YES | NO executable entity | NO | CANONICAL |
| KnowledgeItem | YES | YES | NO executable entity | NO | CANONICAL |

## Evidence

1. `docs/domain/entities.md` explicitly lists 28 canonical entities and states its source is baseline §23.
2. The IA-02 D1 readiness table contains the same 28 rows.
3. `packages/contracts/**` contains transport/event contracts, not a second canonical entity registry.
4. `packages/domain/**` contains only foundation primitives; no executable entity definitions are present.
5. `agents/01-schema/CANONICAL_SCHEMA_AUDIT.md` was requested by the reconciliation protocol but does not exist at the audited branch ref; this absence is recorded as a documentation gap, not evidence for a 29th entity.

## Confidence

**EXPLICIT / HIGH.**

## Reconciliation rule

Do not create or introduce a 29th entity unless a future approved normative source explicitly adds one. The baseline itself must not be edited to compensate for an agent-reporting count error.
