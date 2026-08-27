# IA-02 — State Transition Matrix

**Audit rule:** a state catalog is not a transition contract. Every row below is `UNKNOWN` unless the repository explicitly defines the transition.

## OrderLifecycle

Catalog: `DRAFT`, `CONFIRMED`, `IN_PRODUCTION`, `READY`, `OUT_FOR_DELIVERY`, `DELIVERED`, `CANCELLED`.

| From | To | Status | Evidence |
|---|---|---|---|
| DRAFT | CONFIRMED | DOCUMENTED / STRONG_INFERENCE | `ConfirmOrder`, confirmation invariant, milestone definition |
| DRAFT | CANCELLED | UNKNOWN | cancellation exists, exact precondition not fully specified |
| CONFIRMED | IN_PRODUCTION | UNKNOWN | state catalog only |
| IN_PRODUCTION | READY | UNKNOWN | state catalog only |
| READY | OUT_FOR_DELIVERY | UNKNOWN | state catalog only |
| OUT_FOR_DELIVERY | DELIVERED | UNKNOWN | state catalog only |
| any terminal | reopened state | FORBIDDEN | terminal states do not reopen |
| any other transition | ? | UNKNOWN | no normative matrix |

`order.status_changed` remains unresolved under `CONTRACT-002`.

## ConversationLifecycle

Catalog: `OPEN`, `CLOSED`.

| From | To | Status | Evidence |
|---|---|---|---|
| OPEN | CLOSED | UNKNOWN | lifecycle catalog only; product actions mention finalization |
| CLOSED | OPEN | UNKNOWN | product mentions reopen, but normative domain transition contract not found |
| OPEN | OPEN / CLOSED through AI/HUMAN ownership | SEPARATE STATE DIMENSION | ownership is independent of lifecycle |

## ConversationOwnership

Catalog: `AI`, `HUMAN`.

Ownership transitions such as takeover, pause/devolution are described at product level but lack a normative domain transition matrix. Status: `PARTIAL / UNKNOWN`.

## AIState

Catalog: `ACTIVE`, `PAUSED`, `UNAVAILABLE`.

Exact transition triggers and guards are not fully normative. Status: `STATE_CATALOG_ONLY`.

## MessageLifecycle

Catalog: `RECEIVED`, `QUEUED`, `PROCESSING`, `SENT`, `DELIVERED`, `READ`, `FAILED`, `REJECTED`.

No complete normative transition matrix was found. Status: `STATE_CATALOG_ONLY`.

## Consequence for implementation

Do not implement a generic state-transition graph from the ordering of enum values. Only `DRAFT -> CONFIRMED` has sufficient evidence to be treated as a documented business transition candidate, and even that requires its exact command/error/event contract before production implementation.