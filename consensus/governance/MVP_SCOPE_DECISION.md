# MVP_SCOPE_DECISION — MVP2

Status: **APPROVED**
Authority: `OPERATOR_PROJECT_GOVERNANCE`
Effective from: `2026-08-24T19:52:00-03:00`
Decision record: `consensus/governance/OPERATOR-DECISIONS-2026-08-24.xml`

## Decision

**APPROVE_TEXT_FIRST_REAL_COMMERCIAL_OPERATION**.

The normative MVP includes:

- Customer
- Conversation
- Message
- Inbox / InboundInbox
- AI / Conversation + LLM
- Product
- Order
- Inventory
- Pricing
- Freight
- Sale
- DomainOutbox
- Recovery
- WhatsApp
- Human Handoff
- Windows Runtime

## Invariants

1. Approved scope does not retroactively authorize implementation already present.
2. Approved scope does not authorize migration execution, schema mutation, merge or production release.
3. Frozen contracts govern implementation; implementation does not freeze contracts by inference.
4. Every approved scope item remains subject to its semantic and physical contract.

## Policies

- Operator decisions are authoritative.
- AI recommendations are non-authoritative.
- Historical artifacts remain historical unless explicitly promoted.
- IA-01 must reconcile approved scope with existing documentation and schema.

## Explicit Non-Scope

Image; Audio; PDF Import; Campaign; Advanced Attribution; Advanced KPI; Multi-provider LLM; cross-channel identity stitching; complex promotion engine; complex freight integrations; SaaS billing; automatic migration authorization; merge; production release.

## Legacy Reconciliation

`docs/domain/entities.md` remains a derived/normative candidate and must be reconciled with the now-frozen Customer, Conversation and Message contracts. Existing implementation remains non-authoritative wherever it conflicts with these decisions.

## Superseded Requirements

No historical requirement is marked superseded solely by this scope approval. Explicit supersession requires evidence of an actual replacement relationship.

## Requirement / Contract Boundary

This decision defines **what** belongs to the MVP. It does not itself define all field-level schema details or runtime mechanics. Those remain governed by the approved contracts and IA-01 reconciliation.

## Release Consequence

`MVP_SCOPE_DECISION = APPROVED`, but `READY_FOR_IA02` remains false until the remaining contract/schema reconciliation gate is complete.
