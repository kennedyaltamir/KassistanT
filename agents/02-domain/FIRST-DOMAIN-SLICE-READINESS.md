# IA-02 — First Domain Slice Readiness

## Candidate

**Order-focused domain slice** — PROPOSAL ONLY.

## Readiness gate

A slice is READY only when all of the following are explicit:

1. aggregate root;
2. complete command;
3. normative state transition;
4. invariants;
5. domain errors;
6. event semantics;
7. persistence dependency;
8. deterministic test strategy.

## Current assessment

| Requirement | Current evidence | Status |
|---|---|---|
| Aggregate root | `Order` is only STRONG_INFERENCE | BLOCKED |
| Complete command | Order commands documented only partially | BLOCKED |
| State transition | State catalog exists; full transition matrix absent | BLOCKED |
| Invariants | Core Order invariants are documented | PARTIAL |
| Domain errors | Conceptual errors exist; canonical codes/mapping incomplete | BLOCKED |
| Event semantics | `order.confirmed` documented; `order.status_changed` ambiguous | BLOCKED |
| Persistence dependency | SQLite boundary known; DomainOutbox remains ambiguous | BLOCKED |
| Test strategy | Unit testing direction is clear, exact cases depend on frozen semantics | PARTIAL |

## Verdict

**FIRST_SLICE_STATUS = BLOCKED**

`Order` must not be promoted from proposal to decision and must not be implemented during D1 reconciliation.

## Minimum contract lock required before D2

- explicit `Order` aggregate boundary;
- explicit child ownership/mutation rules for OrderItem, OrderItemModifier and OrderStatusHistory;
- one complete command contract, preferably one that does not depend on unresolved `CONTRACT-002`;
- complete normative transition for the selected command;
- stable error semantics;
- stable event semantics;
- persistence transaction boundary aligned with IA-01;
- event/external-effect boundary aligned with IA-03;
- deterministic unit-test cases for success, invalid state, validation and duplicate/idempotent invocation.

## Non-goals

This document does not create an aggregate decision, command, transition or event contract. It is a readiness gate only.
