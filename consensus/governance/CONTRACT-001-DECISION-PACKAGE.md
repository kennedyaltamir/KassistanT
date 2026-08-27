# CONTRACT-001 — DomainOutbox Decision Package

Status: **RESOLVED**
Authority: `OPERATOR_PROJECT_GOVERNANCE`
Effective from: `2026-08-24T19:52:00-03:00`
Decision record: `consensus/governance/OPERATOR-DECISIONS-2026-08-24.xml`

## Decision

**OPTION A — DOMAIN EVENT INTENT + IA-03 DURABLE OUTBOX MECHANICS**.

Domain owns business event intent. IA-03 owns durable Outbox mechanics and delivery worker. IA-01 owns the physical schema representation only after semantic closure and reconciliation.

## Normative Semantics

`business transaction + outbox intent -> database commit -> worker -> provider`

When business state and outbox intent belong to the same persistent operation, they must be committed atomically in the same transaction boundary.

Provider invocation is prohibited until durable outbox intent exists.

Delivery must be idempotent or deduplicated according to the delivery contract.

Recovery must be deterministic and auditable.

Ownership is singular at each semantic layer; hidden bypass paths are prohibited.

## Impact

### Requirements

Durable external delivery, atomic intent publication, idempotency, deterministic recovery and auditability.

### Contracts

Domain event semantics; DomainOutbox; IA-03 durable delivery worker; provider boundary.

### Schema

`domain_outbox` physical structure remains subject to IA-01 schema reconciliation. This decision does not authorize schema mutation or migration execution.

### Implementation

Future implementation must not use `persist business -> direct provider call` as the delivery pattern when the provider effect is represented by DomainOutbox.

## Explicit Non-Scope

No schema alteration; no migration execution; no provider integration change; no merge; no production release.

## Evidence

- `agents/02-domain/DOMAIN-GLOBAL-DECISIONS.md` DREQ-004.
- Existing `consensus/governance/CONTRACT-001-DECISION-PACKAGE.md` candidate semantics.
- Operator mandate requiring business transaction + outbox intent -> commit -> worker -> provider.

## Consequence

`CONTRACT-001 = RESOLVED`.
IA-01 must reconcile physical schema and documentation to this ownership and transaction boundary.
