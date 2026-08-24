# Nullability / Defaults Matrix

Status: **PARTIALLY CLOSED — DEPENDENT ON SEMANTIC OWNERS**

| Area | Result | Rule |
|---|---|---|
| Identity fields | CLOSED | `id` and required identity keys are `NOT NULL` by entity identity semantics. |
| Store scoping | CLOSED where explicit | Explicitly store-scoped entities require `store_id NOT NULL`. |
| Product availability | CLOSED | `available INTEGER NOT NULL`, values `0/1`, no SQL default. |
| Money amounts | CLOSED where required by contract | Integer cents; absence is not represented by a sentinel. |
| Currency | SEMANTICALLY CLOSED | BRL is the approved currency convention; SQL `DEFAULT 'BRL'` is not inferred. |
| Order child optionality | BLOCKED | Depends on IA-04 semantic ownership and parent-key contracts. |
| OrderStatusHistory | BLOCKED | Depends on IA-04 + IA-02 lifecycle/history semantics. |
| Customer optional fields | PARTIALLY CLOSED | Requiredness is determined by the canonical Customer contract; unspecified optional fields remain explicit nullable candidates only where absence is semantically valid. |
| Conversation state fields | PARTIALLY CLOSED | State values are frozen semantically; physical defaults require the state machine owner/contract. |
| Message fields | PARTIALLY CLOSED | Direction/type/lifecycle semantics are frozen; nullability of optional transport/reference fields remains contract-dependent. |

## Default rule

No SQL default is introduced unless the semantic contract explicitly defines a default state. A missing value is never represented by a magic sentinel.

## Authority boundary

The remaining child/support field semantics cannot be closed by IA-01 alone where the Schema Authority Matrix assigns ownership to IA-04 or other semantic owners.
