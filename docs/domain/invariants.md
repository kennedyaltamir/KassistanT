# Domain Invariants

Status: DEFINED.

Quantity is a positive integer. Money uses integer cents and BRL. Totals are deterministic; LLM cannot set totals authoritatively. Confirmed orders freeze price state. Terminal states do not reopen. Confirmation requires final summary plus unequivocal confirmation. `order.confirmed` is persisted in the same transaction as the order and outbox effect.