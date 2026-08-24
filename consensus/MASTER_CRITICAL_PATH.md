# KassisT — Master Critical Path

## Authority

`main` at `86387b02ed55ef3af3b24f1591b3e0b0ff436a30` is the product-state authority for this consolidation.

## HARD_DEPENDENCY_PATH

```text
C1 Definition of Done ratification
        ↓
C1-critical human decisions
        ↓
Deterministic canonical schema
        ↓
Required persistence/repository boundaries
        ↓
Domain runtime required by MVP path
        ↓
Required durable intake/effects
        ↓
Order / Device Auth / AI / WSS / Gateway runtime
        ↓
Real Desktop integration + required WhatsApp path
        ↓
Cross-system acceptance + security verification
        ↓
CI / review / merge / post-merge verification
```

This is a dependency graph, not a serial agent schedule.

## HARD_DEPENDENCIES

1. Canonical schema before persistence-dependent runtime.
2. Domain semantics before consumers that depend on those semantics.
3. IA-06 cryptographic contract before Signature Verification implementation.
4. IA-06 authenticated session semantics plus IA-03 durable intake before production-complete WSS lifecycle.
5. Real Core/application boundaries before functional Desktop integration.
6. Real Gateway path plus required external provider setup before the production WhatsApp flow.
7. Integrated runtime before cross-system acceptance/E2E.

## CONDITIONAL_DEPENDENCIES

- `CONTRACT-001` only for flows encoding DomainOutbox semantics.
- `CONTRACT-002` only for flows that require normative `order.status_changed` behavior.
- `GOV-001` only when authority/version conflicts alter a normative technical decision.
- External provider/application approval only when the current C1 DoD requires that integration.

## PARALLEL_TRACKS

- IA-01 schema decision preparation and readiness analysis.
- IA-05 DR-001 decision analysis.
- IA-06 DR-02A.1 analysis and later subdecisions.
- IA-08 presentation foundation on its own branch, without backend contract invention.
- Shared test-harness remediation.
- Documentation reconciliation and stale-head cleanup.
- IA-02 D2 verification, because the merged D2 explicitly excludes persistence, EventBus, Outbox and WSS.

## NON_BLOCKING_WORK

- C2 production-hardening that is not required by the current C1 DoD.
- Future SaaS/multi-tenant work.
- ERP/accounting/industrial stock features excluded by the baseline.
- UI work that remains purely presentational and does not create backend contracts.

## CRITICAL_PATH_RISK

The largest current risk is not one single missing implementation; it is allowing stale documentation or unresolved decision materialization to become implicit contracts. Therefore the shortest safe path is decision closure only where it reaches a real hard dependency, followed by small auditable slices.

## FIRST_MERGE_RULE

The first merge target is evidence-based. It must not be selected by agent number, code volume or elapsed time. A slice becomes eligible only after its relevant decision/authorization, scope, verification, CI/review and human gates are satisfied.
