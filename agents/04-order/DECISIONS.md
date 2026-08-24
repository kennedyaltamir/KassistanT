# IA-04 — Decisions

## Approved / existing project decisions

| ID | Status | Decision |
|---|---|---|
| ADR-004 | DECISION | Business Rules are separated from the LLM. |
| ADR-016 | DECISION | Payment is a registered method in the MVP; it is not a payment gateway. |
| ADR-018 | DECISION | `CONFIRMED` is the operational milestone of the sale. |
| ADR-020 | DECISION | Architectural changes require ADR + versioning. |
| ORDER-STATE-V1 | DECISION | The documented order lifecycle is defined and invalid transitions must be rejected. |
| MONEY-V1 | DECISION | Money uses integer cents/BRL and totals are deterministic. |

## Open / unresolved decisions affecting IA-04

### CONTRACT-001 — DomainOutbox

Status: OPEN / AMBIGUOUS.

The repository explicitly preserves ambiguity around DomainOutbox ownership and scope across local Core and Gateway. IA-04 must not define a local interpretation as authoritative.

### CONTRACT-002 — `order.status_changed`

Status: OPEN / AMBIGUOUS.

The baseline and current TypeScript event contract disagree on the normative status of this event. IA-04 must not choose whether it is a required domain event.

### Domain error catalogue

Status: NOT_DEFINED_COMPLETELY.

The repository states that deterministic rejection is required for invalid transitions, unavailable products/modifiers, insufficient delivery data, invalid quantities, promotion violations and duplicate operations, but the canonical error-code catalogue is missing.

### Actor/permission rules

Status: PARTIAL.

The state-machine contract states that actor permission details remain partial.

## Proposals

No proposal is promoted to project decision by this file. Future implementation proposals must be explicitly labelled `PROPOSAL` and must not alter protected contracts without authority review.
