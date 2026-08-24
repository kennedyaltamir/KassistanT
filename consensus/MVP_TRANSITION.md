# KassisT — MVP Transition Record

> **Status:** DRAFT — C1 execution track
> **Authority:** `main` remains the integrated-state authority.
> **Current operational phase:** `MVP2`
> **Current operational baseline:** `MVP2`
> **Current operational baseline SHA:** `0bea2a0ca7c52729cfd58bebc8cd568373222230`
> **Previous audited MVP2 reference:** `636f08a5d377879d80766cf017684f8a6f955376`
> **Integration target:** `main @ 86387b02ed55ef3af3b24f1591b3e0b0ff436a30`

## PURPOSE

Formalize the transition from planning-heavy execution to a controlled operational track focused on the first real user while preserving the historical C1 execution model and making the current MVP2 operational baseline explicit.

## HISTORICAL C1 BASE

The original C1 execution model was defined as:

```text
BASE_BRANCH = main
BASE_SHA = 86387b02ed55ef3af3b24f1591b3e0b0ff436a30
MVP_BRANCH = MVP
```

The `MVP` branch represented the historical C1 execution track based exactly on the then-authoritative `main` SHA. This historical model remains preserved for lineage and must not be rewritten as though it were the current MVP2 baseline.

## CURRENT OPERATIONAL MODEL

The current phase is governed by the following model:

```text
CURRENT_OPERATIONAL_PHASE = MVP2
CURRENT_OPERATIONAL_BASELINE = MVP2
CURRENT_OPERATIONAL_BASELINE_SHA = 0bea2a0ca7c52729cfd58bebc8cd568373222230
PREVIOUS_AUDITED_REFERENCE_SHA = 636f08a5d377879d80766cf017684f8a6f955376
INTEGRATION_TARGET = main
INTEGRATION_TARGET_SHA = 86387b02ed55ef3af3b24f1591b3e0b0ff436a30
```

`MVP2` is the current operational baseline by explicit governance decision. This status is not inferred from commit count, branch depth or implementation volume.

`main` remains the integrated-state authority and controlled integration target. Operational work based on `MVP2` does not become integrated product state until the normal contract, implementation, verification, audit and merge gates are satisfied.

The verified MVP2 head must be rechecked at the beginning of each operational cycle; a previously known SHA is not a permanent truth.

## LINEAGE

```text
main
  @ 86387b02...
      │
      ├── historical C1 execution model
      │       └── MVP
      │
      └── subsequent operational evolution
              └── MVP2
                  @ 0bea2a0c...
                      │
                      ├── previous audited reference
                      │      636f08a5...
                      │
                      └── CURRENT OPERATIONAL BASELINE
                              │
                              └── controlled convergence
                                      │
                                      └── main
```

Operational baseline and integration authority are intentionally separate:

```text
CURRENT_OPERATIONAL_BASELINE != INTEGRATION_AUTHORITY
MVP2 != main
```

## CURRENT OBJECTIVE

`C1_FIRST_REAL_USER`

The immediate objective is `RUNNING_REAL_SYSTEM`: a real installation for one real operator, able to receive and answer real WhatsApp conversations, register products, create and confirm orders, persist required data, restart, recover state and complete a real sale.

This is not a replacement for the approved technical baseline and does not redefine C2/C3.

## PRESERVED FOUNDATION

Preserve without deletion or historical rewriting:

- `main`;
- approved baseline;
- `consensus/` governance records;
- audit artifacts;
- master completion/decision/critical-path records;
- historical human decisions;
- roadmap;
- existing branches and branch progress;
- the historical `MVP` C1 execution model.

Branch progress remains `BRANCH_PROGRESS` until normal implementation, verification, audit, CI and merge gates are satisfied.

## C1 / C2 / C3

```text
C1 = FIRST_REAL_USER
C2 = COMMERCIAL_PRODUCT
C3 = SCALE / HARDENING / ADVANCED
```

C2/C3 work remains preserved, but does not block C1 unless a concrete hard dependency is demonstrated.

## C1 FIRST-REAL-USER FLOW

```text
install
→ start
→ connect real WhatsApp
→ receive real message
→ identify conversation
→ display conversation
→ manual response
→ register product
→ create order
→ add products
→ calculate total
→ register payment condition
→ register minimal delivery information when needed
→ confirm order
→ persist
→ restart
→ recover
→ complete real sale
```

A capability enters C1 only when its absence would prevent the first real sale or recovery of the minimum required operational state.

## C1 NON-GOALS

Unless a concrete C1 dependency is demonstrated, defer:

- full LLM automation;
- widget implementation;
- online payment gateway;
- complete delivery engine;
- mandatory Google Contacts integration;
- multi-user / SaaS / multi-tenant behavior;
- advanced analytics and observability;
- advanced replay/reconciliation;
- scale hardening;
- advanced AI capabilities.

These remain C2/C3/deferred as applicable; they are not deleted.

## ACTIVE DECISIONS

The existence of this branch or the designation of MVP2 as current operational baseline does not approve pending contracts or implementation.

C1 decisions remain explicitly separated from authorization, including when applicable:

- minimum canonical schema/persistence decisions;
- remaining DR-02A details needed for the minimum secure device boundary;
- any contract decision proven necessary for WhatsApp/Gateway C1 integration;
- any persistence/recovery semantic decision proven necessary by the C1 flow.

Every decision must retain:

```text
EVIDENCE
OPTIONS
AUDITOR_RECOMMENDATION
OPERATOR_DECISION
```

`OPERATOR_DECISION` remains `PENDING` until explicitly approved.

## ACTIVE IMPLEMENTATION SLICES

Candidate C1 slices are intentionally small:

- minimum persistence/schema required by the real flow;
- minimum Order/Product behavior required for a sale;
- minimum secure Device Authentication for one controlled installation;
- minimum real WhatsApp/Gateway path;
- operational Desktop UI;
- shared verification path.

Current MVP2 baseline status does not grant global implementation authorization. Each slice requires its own contract, scope and authorization gates.

## AUTHORIZATION MODEL

The execution state machine remains:

```text
decision
→ document
→ human authorization
→ implementation
→ test
→ local run
→ audit
→ CI
→ merge decision
```

`MVP_PROGRESS` is not `IN_MAIN`.

## FEATURE-BRANCH POLICY

New implementation work for the current MVP2 phase should normally be performed in feature branches based on the verified current `MVP2` head.

The `MVP2` baseline itself should remain stable for comparison and audit. No direct feature implementation should be used to bypass the review and integration gates.

The target branch for controlled convergence is `main`.

A merge to `main` requires the applicable:

- contract/decision gates;
- implementation evidence;
- tests;
- official suite when applicable;
- CI when applicable;
- security/architecture review when applicable;
- audit/review;
- human merge authorization;
- post-merge verification.

## SECURITY MINIMUM

C1 may reduce scope and lifecycle complexity, but may not deliberately remove foundational security boundaries.

Forbidden shortcuts:

- disable authentication;
- bypass authorization;
- hardcode production credentials;
- disable transport security;
- introduce insecure secret handling.

Advanced enrollment, rotation, replay, multi-device and related hardening may be deferred only when the controlled single-installation C1 path does not require them.

## DATA PERSISTENCE MINIMUM

C1 must preserve at minimum the products, conversations and orders necessary to operate the first real sale.

The smallest implementation satisfying that requirement is preferred. Do not implement infrastructure only because the broader roadmap names it.

## RECOVERY MINIMUM

Before declaring C1 verified, demonstrate:

- restart does not destroy required state;
- essential orders remain recoverable;
- basic failure does not silently corrupt required operational state;
- a minimum backup/recovery path exists.

## LOCAL VALIDATION POLICY

For each C1 slice, provide:

- exact command;
- prerequisites;
- environment/credentials;
- expected result;
- local tests;
- smoke test;
- failure interpretation.

CI is necessary where applicable, but it does not substitute for local first-real-user validation.

## MERGE POLICY

Work based on `MVP2` remains isolated from the integrated product until the normal gates are satisfied:

```text
scope verified
→ tests
→ official suite when applicable
→ CI when applicable
→ audit/review
→ human merge authorization
→ merge
→ post-merge verification
```

No automatic merge follows from this transition.

## EXIT CRITERIA

The current operational track is adequately established when:

```text
CURRENT_OPERATIONAL_BASELINE = MVP2
INTEGRATION_TARGET = main
DOCUMENTATION_ALIGNMENT = RECONCILED
```

The final operational gate is:

```text
C1_FIRST_REAL_USER = VERIFIED
```

only after the complete real-world flow has been executed and evidenced:

```text
WhatsApp
→ conversation
→ product
→ order
→ confirmation
→ persistence
→ restart/recovery
→ real sale
```

## GOVERNANCE NOTE

This transition changes operational priority and scope classification. It does not erase the historical C1 model, redefine `main` as something other than the integration authority, or grant global implementation authorization.

The current MVP2 baseline is a governance designation for operational work in the present phase. The historical `MVP` model remains preserved as C1 lineage.
