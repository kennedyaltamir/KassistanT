# Documentation Cross-Consistency Audit

**Status:** CURRENT audit snapshot
**Branch:** `docs/api-backend-contracts-v1`
**Baseline:** `KassisT_Approved_Technical_Baseline_v1.0.1.md` SHA `02830152099f58307912ce382c064a3c4075f505`

## Results

| Check | Result | Evidence / gap |
|---|---|---|
| HTTP route ↔ OpenAPI | PASS | All 10 explicitly defined HTTP routes are represented with matching method/path. |
| OpenAPI operationId uniqueness | PASS | Operation IDs are unique in this branch. |
| HTTP errors ↔ backend errors | PARTIAL | Canonical envelope exists, but complete error catalog/status mapping is missing. |
| Domain events ↔ EventBus | PARTIAL | Baseline catalogue is documented; runtime EventBus is not implemented. |
| Domain events ↔ WSS | PARTIAL | WSS transports events but exact event-to-message mapping is not fully defined. |
| InboundInbox ↔ ACK | PASS | ACK documented only after durable Inbox commit. |
| DomainOutbox ↔ external effects | AMBIGUOUS | CONTRACT-001 remains unresolved. |
| JobQueue ↔ asynchronous operations | PASS/PARTIAL | Worker classes and retryable-work boundary are defined; runtime implementation is not. |
| Provider contracts ↔ adapters | PARTIAL | Adapter boundaries documented; concrete integrations are not implemented. |
| Device Auth ↔ enrollment | PASS/PARTIAL | Enrollment establishes Ed25519 identity; exact HTTP schemas remain partial. |
| Authorization ↔ endpoint access | MISSING/PARTIAL | Provisioning authority is documented, but endpoint-level authorization is incomplete. |
| Idempotency consistency | PARTIAL | Critical operations are covered conceptually; route-specific semantics remain incomplete. |
| Audit requirements | PARTIAL | Critical audit events are defined; detailed schemas/retention remain partial. |

## Known contradictions

### CONTRACT-001 — DomainOutbox
Ownership and scope remain ambiguous across the baseline. No unilateral resolution is made.

### CONTRACT-002 — order.status_changed
The baseline contains contradictory statements and the existing TypeScript catalogue includes the event. The branch records, rather than resolves, the discrepancy.

### GOV-001 — baseline version references
The approved baseline filename/version is `v1.0.1`, while internal and historical documentation references include `v1.0.0` and an older specification copy. No source is modified by this branch.

## Scope conclusion
This audit confirms that the documentation layer is internally consistent about what is known versus unknown, but the overall KassisT backend contract set remains PARTIAL and contains the three documented ambiguities above.
