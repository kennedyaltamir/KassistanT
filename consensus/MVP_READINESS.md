# MVP Readiness — C1 First Real User

## CURRENT_STATE

`MVP_BRANCH_READY = TRUE`

`MVP_IMPLEMENTATION_AUTHORIZATION = PENDING_PER_SLICE`

`C1_FIRST_REAL_USER = NOT_STARTED`

This branch is an execution track based exactly on `main @ 86387b02ed55ef3af3b24f1591b3e0b0ff436a30`. It does not replace `main` or promote any branch-progress into integrated product state.

## BASE

`BASE_BRANCH = main`

`BASE_SHA = 86387b02ed55ef3af3b24f1591b3e0b0ff436a30`

`MVP_BRANCH = MVP`

## WHAT_IS_ALREADY_IN_MAIN

- approved technical baseline;
- monorepo/bootstrap foundation;
- SQLite/M5.1 persistence foundation;
- merged governance and consensus artifacts present in the source history as of the base state;
- IA-02 D2 domain slice: `Order`, `OrderItem`, `OrderItemModifier`, `ConfirmOrder`, `DRAFT → CONFIRMED`, `order.confirmed`, and approved D2 error semantics;
- existing Electron/Desktop foundation and security boundaries;
- CI/test/build infrastructure foundation.

The D2 merge record explicitly states that persistence, EventBus, Inbox, Outbox, Gateway, WSS and full Order lifecycle are excluded from D2. These remain future C1 questions only where the real-user flow proves they are required.

## WHAT_IS_AVAILABLE_IN_OTHER_BRANCHES

Branch progress must remain classified as `BRANCH_PROGRESS` until separately promoted through the normal gates. Relevant work reported by agents includes:

- IA-08 frontend foundation work in its agent branch;
- IA-04 Money test/slice work;
- IA-06 Device Authentication contract work;
- IA-05 AI-V1 decision package;
- IA-03 event infrastructure work;
- IA-01 schema decision package.

No branch-only work is counted here as integrated MVP functionality.

## WHAT_IS_REALLY_NEEDED_FOR_C1

The smallest verified target is the real-user flow:

`install → start → real WhatsApp → receive message → identify conversation → display conversation → manual response → register product → create order → add products → calculate total → register payment condition → minimal delivery information when applicable → confirm order → persist → restart → recover → real sale`

A capability enters C1 only when its absence would prevent that real operation.

## REQUIRED_DECISIONS

The first readiness gate is not to decide the entire commercial product. Decisions should be limited to those required by the next C1 slice. Current candidates include:

1. `C1 Definition of Done` and the exact first-real-user acceptance gate.
2. Minimal WhatsApp real integration path.
3. Minimal persistence/recovery semantics required for restart/recovery.
4. Minimal Order/Product semantics required for a real sale.
5. Minimum secure authentication boundary for the controlled installation.
6. Minimal operational Desktop scope.
7. IA-06 `DR-02A.1..4` only if the selected secure authentication path requires those decisions.
8. Schema decisions only where the selected C1 persistence slice actually requires them.

No pending decision is approved by this readiness document.

## READY_SLICES

No production slice is globally authorized solely by creation of this branch.

Potential low-risk/locally reviewable slices must first be checked against the current decision and authorization state. The strongest candidates for immediate analysis are:

- local persistence minimum / schema readiness (IA-01);
- minimum Order runtime required by C1 (IA-02);
- operational Desktop foundation (IA-08);
- shared test-harness path;
- minimum secure authentication path (IA-06), after its required contract decisions are actually materialized.

## BLOCKED_SLICES

- Any slice requiring unresolved normative crypto decisions: `DR-02A.1..4` remain open unless explicitly materialized and approved.
- Any slice that requires a schema/migration not yet deterministic and authorized.
- Any real WhatsApp integration path until its actual transport/provider contract and necessary external configuration are identified.
- Any full LLM runtime not justified by C1.
- Any commercial-scale payment, delivery, analytics, multi-user, SaaS or advanced hardening work not required by the first-real-user flow.

## PARALLEL_SLICES

When individually authorized, the following may progress in parallel:

- IA-01 — minimum schema/persistence readiness;
- IA-02 — minimum Order/Core slice;
- IA-06 — minimum secure authentication contract/implementation once the required contract is materialized;
- IA-08 — operational Desktop foundation;
- Shared Test Harness — official test path;
- IA-05 — non-C1 foundation/documentation work, unless evidence shows C1 needs it.

IA-03 and IA-07 should be activated only for dependencies proven necessary for the real-user WhatsApp/persistence path, rather than because the full architecture specifies them.

## FIRST_IMPLEMENTATION_RECOMMENDATION

Before a large feature implementation, select the smallest C1 slice that is already contract-complete, authorization-ready, locally testable and capable of producing observable progress toward `LOCAL_END_TO_END`.

The recommended sequence is:

1. establish the minimal C1 persistence/product/order boundary;
2. implement and verify the smallest local end-to-end sale flow;
3. identify the exact real WhatsApp boundary needed to connect the local operational flow;
4. integrate the real WhatsApp path;
5. verify restart/recovery and complete a real sale.

This is an execution recommendation, not an implementation authorization.

## NOT_C1_BY_DEFAULT

Unless evidence shows otherwise, the following remain outside the first-real-user critical path:

- full LLM runtime;
- Widget;
- payment gateway;
- complete delivery engine;
- mandatory Google Contacts integration;
- multi-user/multi-tenant/SaaS;
- advanced analytics;
- scale hardening;
- advanced replay/reconciliation;
- commercial packaging/auto-update beyond what is needed to install the real-user build.

## SECURITY_MINIMUM

C1 may reduce lifecycle complexity, but it may not deliberately:

- disable authentication;
- bypass authorization;
- hardcode production credentials;
- weaken transport security;
- mishandle secrets.

The exact minimum secure mechanism must be evidence- and contract-driven.

## VERIFICATION_POLICY

Every slice must distinguish:

- direct tests;
- official suite;
- typecheck/lint/build;
- CI;
- local runtime validation;
- first-real-user validation.

`CI_GREEN` is necessary where applicable but does not replace local real-user validation.

## DONE_GATE

The C1 branch is not complete merely because the code builds or tests pass.

Final gate:

`FIRST_REAL_USER_VERIFIED`

must demonstrate a real operation equivalent to:

`WhatsApp → conversation → product → order → confirmation → persistence → restart/recovery → real sale`

## NEXT_ACTION

1. Confirm the C1 Decision Queue outside this branch.
2. Select one slice whose contract and authorization are sufficient.
3. Provide exact VSCode/local commands and expected results.
4. Implement only that slice.
5. Run tests and local validation.
6. Audit and promote through the normal merge gates.
