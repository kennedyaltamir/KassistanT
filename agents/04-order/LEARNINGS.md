# IA-04 — Learnings

Audit-derived, evidence-backed learnings. These are not new requirements.

1. The repository contract layer is intentionally conservative: executable schemas remain partial and documentation does not imply implementation.
2. The Order Engine is explicitly separated from Gateway transport and from the reliability infrastructure boundaries.
3. Order confirmation is the critical transactional boundary: order state, items, status history, confirmation event and durable external-effect record are specified to persist atomically, but DomainOutbox ownership remains CONTRACT-001.
4. Idempotency is a cross-cutting requirement, but endpoint/operation-specific replay, conflict and TTL semantics are not fully defined.
5. The event contract currently contains `order.status_changed`, while the baseline has contradictory treatment of that event; this is preserved as CONTRACT-002.
6. DomainOutbox is similarly affected by an unresolved ownership/scope ambiguity (CONTRACT-001).
7. Complete domain error codes and complete actor/permission rules are not yet available, so implementation cannot safely invent them.
8. M5.1 deliberately did not implement the Order Engine or full canonical schema.
9. The lifecycle documentation provides a state catalog and invalid-transition rule, but not a complete normative adjacency graph with actor/precondition/error/event semantics.
10. Pricing fields and core monetary invariants are explicit, but complete pricing execution remains blocked by promotion, delivery-fee and exact calculation-order semantics.
11. Promotion semantics are materially incomplete: eligibility, stacking/exclusivity, priority, usage limits and conflict resolution are not all contractually fixed.
12. Delivery and payment are represented as Order concerns, but complete executable command/state semantics are not established; payment is registration of a method, not a payment gateway.
13. The current TypeScript event contract is concrete repository evidence, but because `DOMAIN-EVENT-V1` remains AMBIGUOUS it cannot override the baseline contradiction.
14. The implemented Money primitive is a safe-isolated slice; it is not evidence that the Order pricing engine exists.
15. The readiness audit can support staged implementation later: Money arithmetic first, then contract-complete lifecycle/pricing/order command slices, rather than starting the complete Order Engine at once.
