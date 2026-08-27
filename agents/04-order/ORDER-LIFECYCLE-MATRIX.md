# IA-04 — Order Lifecycle Matrix

Status: AUDIT / PARTIAL / NOT IMPLEMENTED

## Evidence rule

The repository currently provides a lifecycle catalog and a rule that invalid transitions are rejected. It does **not** provide a complete normative transition graph with entry/exit conditions, actor matrix and canonical error codes. Therefore missing transitions are not inferred.

## State matrix

| State | Entry condition | Exit condition | Allowed transitions | Forbidden transitions | Trigger | Preconditions | Invariants | Domain event | Error | Audit | Idempotency | Evidence | Status |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| DRAFT | Order creation / draft state | Explicit confirmation or cancellation | `CONFIRMED`, `CANCELLED` are documented as lifecycle endpoints, but exact transition triggers are only partially specified | Any unlisted transition | Order commands | Valid order context; quantities/items must satisfy command rules | Recalculable; totals deterministic | `order.created` is catalogued; confirmation event is defined | Canonical codes missing | Creation/cancellation requirements only partially explicit | Duplicate commands must be safe | Baseline §15-16; `docs/domain/*` | STATE_CATALOG_PLUS_PARTIAL_RULES |
| CONFIRMED | Successful confirmation transaction | Production/readiness/delivery lifecycle continuation or cancellation according to future approved graph | Downstream states are documented, exact adjacency is not fully specified by contract | Terminal reopen; implicit arbitrary transitions | `ConfirmOrder` | Final summary + unequivocal confirmation; current order valid | Price frozen; sale milestone | `order.confirmed` | Error catalog missing | Confirmation is business-critical; cancellation/status audit policy incomplete | Duplicate confirmation must not create duplicate sale | `docs/domain/invariants.md`, baseline §16/74 | PARTIAL |
| IN_PRODUCTION | State transition from confirmed lifecycle | Next operational state | Next state is catalogued; exact command/preconditions not fully specified | Reopen to DRAFT; arbitrary jumps | NOT_DEFINED | NOT_DEFINED | Invalid transitions rejected | Potential status event unresolved | Canonical codes missing | Status change audit semantics incomplete | Retry must not duplicate transition | `docs/domain/state-machines.md` | STATE_CATALOG_ONLY |
| READY | State transition from production lifecycle | Delivery/dispatch completion path or cancellation subject to final rules | Next lifecycle state catalogued; adjacency details absent | Arbitrary jumps/reopen | NOT_DEFINED | NOT_DEFINED | Invalid transitions rejected | Potential status event unresolved | Canonical codes missing | Partial | Duplicate transition must be safe | `docs/domain/state-machines.md` | STATE_CATALOG_ONLY |
| OUT_FOR_DELIVERY | Dispatch/fulfillment transition | Delivered or cancellation according to final policy | `DELIVERED` is catalogued; exact dispatch preconditions absent | Reopen; arbitrary jumps | NOT_DEFINED | NOT_DEFINED | Invalid transitions rejected | Potential status event unresolved | Canonical codes missing | Delivery audit detail absent | Duplicate dispatch must be safe | baseline §15/74; domain state catalog | STATE_CATALOG_ONLY |
| DELIVERED | Completion transition | Terminal | No reopening is allowed | All transitions that reopen terminal state | NOT_DEFINED | NOT_DEFINED | Terminal states do not reopen | Potential status event unresolved | Canonical codes missing | Completion audit not fully defined | Duplicate completion must be harmless | `docs/domain/invariants.md`, baseline §74 | PARTIAL |
| CANCELLED | Valid cancellation transition | Terminal | None specified after cancellation | Reopen to any non-terminal state | `CancelOrder` exists; exact cancellation policy by lifecycle state is incomplete | Actor/state rules incomplete | Terminal state does not reopen | `order.cancelled` | Canonical codes missing | Cancellation is explicitly critical | Duplicate cancellation must not duplicate effects | `docs/domain/errors.md`, `docs/domain/events.md`, baseline §74 | PARTIAL |

## Normative facts

- Lifecycle states are explicitly catalogued.
- `CONFIRMED` is explicitly the operational sale milestone.
- Invalid transitions must be rejected.
- Terminal states do not reopen.
- The exact full transition adjacency matrix is not currently specified.
- Actor permission rules are partial.
- `order.status_changed` remains CONTRACT-002 and cannot be selected as normative here.

## Readiness consequence

The lifecycle is **not implementation-ready as a complete state machine**. A future implementation may only encode the minimum transitions once the missing adjacency, actor, error and event semantics are explicit for the chosen slice.
