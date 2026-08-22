# Transactions

Status: DEFINED.

Critical rule: persistence before external effect. Order confirmation atomically persists order state, items, status history, confirmation event and outbox record. Recovery uses durable pending work and idempotent retry/reconciliation.