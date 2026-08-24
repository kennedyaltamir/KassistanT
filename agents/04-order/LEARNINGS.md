# IA-04 — Learnings

Audit-derived, evidence-backed learnings. These are not new requirements.

1. The repository contract layer is intentionally conservative: executable schemas remain partial and documentation does not imply implementation.
2. The Order Engine is explicitly separated from Gateway transport and from the reliability infrastructure boundaries.
3. Order confirmation is the critical transactional boundary: order state, items, status history, confirmation event and outbox effect are specified to persist atomically.
4. Idempotency is a cross-cutting requirement, but endpoint-specific replay/TTL semantics are not yet fully defined.
5. The event contract currently contains `order.status_changed`, while the baseline has contradictory treatment of that event; this is preserved as CONTRACT-002.
6. DomainOutbox is similarly affected by an unresolved ownership/scope ambiguity (CONTRACT-001).
7. Complete domain error codes and complete actor/permission rules are not yet available, so implementation cannot safely invent them.
8. M5.1 deliberately did not implement the Order Engine or full canonical schema.
