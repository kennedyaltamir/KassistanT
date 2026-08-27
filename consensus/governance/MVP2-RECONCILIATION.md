# Governance Reconciliation — MVP2

Date: 2026-08-24
Verified branch: `MVP2`
Current decision-cycle HEAD: `e2d8807a6e797b0fb35e6a4658f8c4aabec7535a`
Normative decision record: `consensus/governance/OPERATOR-DECISIONS-2026-08-24.xml`

## Repository point

The current `MVP2` HEAD is the factual governance point for this decision cycle. `main` remains `86387b02ed55ef3af3b24f1591b3e0b0ff436a30`. Prior implementation point was `330308ad10f7f27e19c706963d3fad32f9d4464f`.

## Normative decisions now recorded

| Decision | State | Result |
|---|---|---|
| `MVP_SCOPE_DECISION` | APPROVED | TEXT-FIRST_REAL_COMMERCIAL_OPERATION |
| `GOV-DRIFT-0002` | RESOLVED | OPTION B; existing 0002 is non-authoritative |
| `CUSTOMER-IDENTITY` | FORMALLY_FROZEN | `(store_id, phone_normalized)` |
| `CONVERSATION-CONTRACT` | FORMALLY_FROZEN | `Customer 1:N Conversation`, separate internal/external IDs |
| `MESSAGE-CONTRACT` | FORMALLY_FROZEN | inbound provider uniqueness scoped by store |
| `CONTRACT-001` | RESOLVED | Domain intent + IA-03 durable Outbox mechanics |

## Artifact classification after Operator decisions

### Migration 0002
The physical file `apps/desktop/database/migrations/0002_c1_product_order.sql` remains present but is now explicitly classified as **NON-AUTHORITATIVE / HISTORICAL-UNAPPROVED**. This classification resolves the governance drift without altering the file.

### Entity documentation
`docs/domain/entities.md` must be reconciled so its Customer, Conversation and Message wording matches the frozen contracts and does not imply broader identity semantics.

### DomainOutbox
Any artifact assigning definitive ownership must match CONTRACT-001. Domain defines event intent; IA-03 owns durable delivery mechanics; IA-01 reconciles physical persistence.

## Schema reconciliation status

**READY_FOR_POST-DECISION_RECONCILIATION**.

IA-01 now has normative decisions to reconcile against the physical schema and documentation. This status does not authorize schema mutation. A separate implementation/change step is required for any physical modification.

## Remaining gate

`READY_FOR_IA02` remains **FALSE** until IA-01 completes the post-decision schema/contract reconciliation and produces the required handoff. IA-03 remains blocked behind IA-02 and its subsequent readiness gate.

## Explicit prohibition

No decision in this document or the Operator decision record authorizes migration execution, schema mutation, merge, production release, or independent audit acceptance.
