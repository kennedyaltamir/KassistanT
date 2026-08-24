# Order Status History Semantics

Status: **CLOSED — SEMANTIC CONTRACT**

Implementation point: `MVP2 @ 0e1897cae007530cbe8aed20b97e04a25340cc87`.

## Ownership and cardinality

- Every `OrderStatusHistory` row belongs to exactly one `Order`.
- Parent relation is mandatory; physical key candidate: `order_id`.
- Cardinality is `Order 1:N OrderStatusHistory`.

## Status semantics

The history row records an accepted transition of the authoritative Order lifecycle.

- `from_state` is the prior authoritative Order state.
- `to_state` is the newly accepted authoritative Order state.
- The value set is the already approved Order status catalog; this closure does not expand it.
- The current `Order` row remains the operational source of truth.
- The history row is evidentiary and must not become a competing current-state source.

## Transition ordering and timestamps

- Each accepted transition creates at most one corresponding history record.
- History records are append-only.
- Persisted timestamps are UTC under the existing project time contract.
- Ordering is by persisted transition timestamp.
- UUIDv7 identity is the deterministic tie-breaker when timestamps are equal.
- A newly created `DRAFT` Order does not require a history row; history begins with an actual lifecycle transition.

## Immutability

After persistence, a history row is immutable during normal business operation.
There is no supported update-in-place semantic for changing the meaning of an already recorded transition.

## Deletion and update

- `ON DELETE RESTRICT` from Order to OrderStatusHistory.
- `ON UPDATE RESTRICT` for the parent identity relationship.
- An Order must not be removed while its historical evidence remains attached.

## Audit interpretation

History is evidence of what transition was accepted, not an authorization mechanism for future transitions. Any contradiction between current Order state and historical evidence is an integrity/recovery defect, not permission to infer a new state.

## Boundary

No SQL, table definition, migration or runtime behavior is defined here.
