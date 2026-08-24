# Sale — Canonical Contract

Status: **BLOCKED / SEMANTIC CONTRACT INCOMPLETE**

## Evidence already fixed

- `CONFIRMED` is the operational milestone of the sale.
- Monetary values are deterministic integer cents / BRL.
- Financial metrics are derived from Order totals, not LLM output.

## Not yet frozen

The current repository does not provide sufficient normative evidence for a separate `Sale` persistence entity defining:

- canonical identity;
- Order to Sale cardinality;
- whether Sale can exist without Order;
- uniqueness;
- persisted monetary snapshot semantics;
- customer relationship ownership;
- lifecycle/state model;
- required timestamps beyond generic entity conventions.

The mandate's candidate `UNIQUE(store_id, order_id)` therefore remains a proposal and is not promoted to schema authority.

## Consequence

IA-01 must not invent a Sale table merely because `CONFIRMED` represents the operational sale milestone. A separate Sale persistence contract requires explicit semantic authority first.
