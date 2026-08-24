# Idempotency

Status: DEFINED / PARTIAL.

Critical operations must tolerate duplicate processing. Baseline defines uniqueness for external event identifiers and DomainOutbox idempotency keys. Endpoint-specific Idempotency-Key replay/TTL rules remain MISSING unless expressly defined.