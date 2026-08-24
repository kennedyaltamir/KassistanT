# Critical Path — Auditor 2

## C1 hard path

1. Freeze/confirm current C1 Definition of Done.
2. Materialize schema-critical human decisions.
3. Implement and verify canonical business schema.
4. Implement core domain runtime required for the C1 sales path.
5. Implement required durable intake/event infrastructure for actual external flows.
6. Implement Order Engine, Conversation/LLM, Device Auth and Gateway/WSS runtimes required by the C1 path, respecting their hard dependencies.
7. Implement real Desktop/Core integration and external WhatsApp path if confirmed as C1.
8. Run cross-system acceptance, security and CI verification on actual branches/merged state.

## Parallel tracks

- IA-01 schema decision consolidation.
- IA-06 DR-02A decision analysis (until implementation gate).
- IA-05 DR-001 decision analysis.
- IA-08 presentation foundation on branch.
- Shared test-harness repair.
- Cross-agent contract analysis that does not encode unresolved semantics.

## Non-blocking or conditional

- C2 release hardening.
- Comprehensive backup/restore implementation if not C1.
- Packaging/signing/update if production release is a separate C2 gate.
- Future SaaS/multi-tenant work.

## Important

The sequence above is dependency-driven, not a mandatory serial queue. EventBus V1 is currently CONFLICTED in repository truth; do not treat it as completed merely because the consensus plan says so.
