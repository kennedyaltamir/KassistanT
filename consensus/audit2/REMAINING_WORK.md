# Remaining Work — Auditor 2

## C1

1. Materialize/finalize C1 decisions (schema-critical, IA-05 DR-001 if required, IA-06 DR-02A.1..4, and only impacted global contracts).
2. Implement canonical business schema and validate it.
3. Implement domain runtime needed for the C1 sales path.
4. Implement required event/inbox/durable infrastructure for the C1 path.
5. Implement Order Engine beyond the first pure domain slice.
6. Implement Conversation/LLM runtime and validated Core action path.
7. Implement full device-auth runtime required by the transport path.
8. Implement WSS/Gateway runtime required by WhatsApp flow.
9. Implement WhatsApp adapter/configuration required by the MVP, including verified external prerequisites.
10. Integrate functional Desktop with real Core/application outputs.
11. Execute C1 integration/acceptance/security verification on actual merged heads.
12. Satisfy merge/release gates for the C1 implementation.

## C2 / production readiness

Packaging/signing/update, comprehensive recovery/restore, broader E2E/UAT, operational telemetry, release rehearsal and hardening remain C2 candidates unless the final release scope promotes them to C1.

## C3 / deferred

Future SaaS/multi-tenant, ERP/industrial scope, and other baseline Future items are not part of current C1.

## Immediate sequencing

Human decisions and contract materialization first where they are real hard dependencies. In parallel, schema consolidation, test harness repair and independent foundations may proceed. Do not serialize unrelated tracks.
