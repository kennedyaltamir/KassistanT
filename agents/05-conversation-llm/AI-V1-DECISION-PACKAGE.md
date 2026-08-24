# IA-05 — AI-V1 Decision Package

Status: **PROPOSAL PACKAGE / HOLD**

This document prepares decisions for the integration authority. It does not approve global architecture, does not change protected contracts, and does not implement runtime.

## 1. Decision model

- `FACT`: directly evidenced by repository or approved baseline.
- `INFERENCE`: consequence derived from facts; not normative.
- `PROPOSAL`: recommended closure candidate awaiting approval.
- `DECISION`: approved by an authoritative source. This package introduces no new `DECISION`.

Classification values are mutually exclusive per gap:

- `LOCAL_CLOSABLE`
- `CROSS_AGENT`
- `GLOBAL_DECISION_REQUIRED`
- `EXTERNAL_DECISION_REQUIRED`
- `NON_BLOCKING`
- `DEFERRED`
- `BLOCKED`

## 2. Executive conclusion

`AI-V1` is not implementation-ready. The current `LLMProvider` exposes only `chat(unknown)`, `healthCheck`, `discoverModels` and `selectModel`; the contract registry marks AI-V1 `PARTIAL / NOT_IMPLEMENTED / tests missing`. Conversation state vocabulary exists, but executable transition, persistence, AIExecution, tool authorization, prompt reproducibility and reliability semantics remain incomplete.

The decision package therefore recommends closing the **minimum contract necessary for a typed provider boundary and deterministic contract tests first**, while deferring non-essential capabilities such as streaming and detailed usage telemetry until explicitly required.

## 3. AI-V1 gap matrix

| Gap | Area | Current State | Evidence | Impact | Owner | Dependency | Classification | Blocking Level | Local? | Proposed Resolution | Required Approval | Affected Files | Implementation Consequence |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Untyped request/result | LLMProvider | `unknown` I/O | `packages/domain/src/llm-provider.ts` | Runtime cannot validate provider boundary deterministically | Integration authority + IA-05 proposal | IA-05 + shared domain contract | GLOBAL_DECISION_REQUIRED | BLOCKING | No | Approve typed request/result envelope behind provider boundary | Global contract approval | `packages/domain/**` | Enables contract tests and adapter implementation |
| Provider error taxonomy | LLMProvider | Generic/untyped | `ERROR-V1` partial | Conversation cannot classify provider failure safely | IA-05 + shared error authority | IA-02 / global ERROR-V1 | CROSS_AGENT | BLOCKING | No | Define stable AI/provider error classes and retryability without provider-specific leakage | Cross-agent contract approval | `packages/domain/**`, error contract | Enables deterministic error handling |
| Model descriptor | LLMProvider | Model names only | `discoverModels(): string[]` | Capability mismatch cannot be validated explicitly | IA-05 | Model-selection decision | CROSS_AGENT | BLOCKING | No | Define logical model identity + capability metadata; exact model remains external | Cross-agent approval | `packages/domain/**` | Allows capability checks |
| AIExecution logical contract | AIExecution | Entity only / partial | Domain entity registry + AI readiness | No auditable execution lifecycle | IA-05 + IA-01 | IA-01 persistence, IA-03 audit | CROSS_AGENT | BLOCKING | No | Approve logical request/context/model/status/result/error/retry/cancel/timeout metadata | Cross-agent approval | `agents/**`, IA-01 schema later | Provides stable runtime/persistence target |
| Conversation transition semantics | Conversation | States known, transitions partial | Domain state machine docs | Runtime could invent illegal transitions | IA-02 authority + IA-05 consumer | IA-02 | CROSS_AGENT | BLOCKING | No | IA-02 publishes executable transition rules; IA-05 consumes them | IA-02/integration approval | `packages/domain/**` later | Conversation engine remains consumer-only |
| Message schema | Message | Lifecycle known, fields partial | Domain entity docs | Context and persistence cannot be deterministic | IA-01/IA-02 | IA-01 schema + IA-02 semantics | CROSS_AGENT | BLOCKING | No | Close logical field contract before runtime message processing | IA-01/02 approval | `packages/domain/**`, schema later | Enables deterministic context assembly |
| AIProfile semantics | AIProfile | Entity named, behavior partial | Domain entities + AI docs | Active profile/model/prompt cannot be resolved deterministically | IA-01/IA-02 + external model decision | persistence + model selection | CROSS_AGENT | BLOCKING | No | Define logical profile identity/version/activation relationship; leave model value external | Cross-agent approval | `packages/domain/**` / schema later | Runtime can resolve active profile safely |
| Tool authorization | Security | Incomplete | AUTHZ-V1 missing/partial + AI docs | Model could become implicit authority | Integration/security authority | IA-02, IA-04, IA-06, IA-07 | GLOBAL_DECISION_REQUIRED | BLOCKING | No | Define separate authorize→execute boundary and typed request/result envelope; no permission values invented | Global security decision | contracts + ownership boundaries | Tool runtime cannot start before gate |
| Prompt versioning | Prompt | Partial | Prompt matrix + baseline concept | Execution configuration cannot be reproduced reliably | IA-05 | AIExecution + profile | CROSS_AGENT | BLOCKING | Partially | Approve logical prompt identity/version/source/provenance references | Cross-agent approval | AI contract docs + later shared contract if needed | Enables reproducible execution records |
| Model selection | Model | Open/external | Baseline leaves default open | Hard-coding model would exceed authority | External benchmark/owner | Ollama/local runtime | EXTERNAL_DECISION_REQUIRED | BLOCKING | No | Select model outside IA-05; runtime records selected identity and rejects unsupported capability | External decision | Configuration/runtime later | Prevents normative model invention |
| Context assembly | Context | Conceptual/partial | KB and state contracts | Uncontrolled context can leak authority or stale state | IA-05 + source owners | IA-01/02/04 + integrations | CROSS_AGENT | BLOCKING | No | Define allowlisted source categories, provenance and authorization; no hidden Renderer state | Cross-agent approval | AI docs; later runtime | Deterministic prompt input |
| Retry/idempotency | Reliability | Generic provider retry mention | Provider contract + backend idempotency docs | Duplicate execution risk | IA-05 + IA-03 | IA-03, persistence | CROSS_AGENT | BLOCKING | No | Define whether an AI execution attempt is retryable and how duplicate logical execution is prevented; do not choose counts/backoff | Cross-agent approval | AI contract + event/persistence later | Safe recovery required |
| Timeout | Reliability | Mentioned, not typed | Ollama/AI contract | Hanging provider can block processing | IA-05 | AIExecution/event boundary | CROSS_AGENT | BLOCKING | Partially | Define timeout as execution outcome with owner and observable terminal result; leave numeric value external/configurable | Cross-agent approval | AI contract | Deterministic failure path |
| Cancellation | Reliability | Unknown | No executable contract | Shutdown/takeover cannot safely stop execution | IA-05 + IA-08/IA-03 | UI/event/runtime boundaries | CROSS_AGENT | BLOCKING | No | Define cancellation request/signal and terminal outcome without inventing implementation mechanism | Cross-agent approval | AI contract | Safe takeover/recovery |
| Audit | Audit | Partial | AuditLog canonical | AIExecution evidence mapping absent | IA-03 | AIExecution + event envelope | CROSS_AGENT | NON_BLOCKING | No | Define minimum audit references and correlation/causation requirements | IA-03 approval | IA-05 docs; IA-03 later | Required before production completion |
| Observability | Observability | Partial | General observability requirement | Runtime failures hard to diagnose | IA-05 + IA-03/08 | audit/event/UI | CROSS_AGENT | NON_BLOCKING | No | Define minimum safe correlation/status/latency/provider outcome telemetry | Cross-agent approval | IA-05 docs; later runtime | Operational diagnostics |
| Persistence | Persistence | Canonical entities only | DOMAIN-ENTITY-V1 partial | Runtime cannot persist authoritative execution | IA-01 | IA-01 schema/runtime | CROSS_AGENT | BLOCKING | No | Close minimum persistence contract for Conversation/Message/AIProfile/AIExecution/KnowledgeItem | IA-01/integration approval | IA-01 territory | Enables production runtime |
| `CONTRACT-001` | Global | Ambiguous | Contract registry | Affects durable effects/recovery | Integration authority | IA-03 and others | GLOBAL_DECISION_REQUIRED | BLOCKING | No | Resolve globally; IA-05 must not encode assumption | Global decision | Protected/global docs | Unblocks durable event integration |
| `CONTRACT-002` | Global | Ambiguous | Domain events + TS contracts | Event consumers cannot assume normative event set | Integration authority | IA-03/IA-04/IA-07 | GLOBAL_DECISION_REQUIRED | BLOCKING | No | Resolve normative status of `order.status_changed` | Global decision | Protected/global docs | Affects tool/event integration |
| `GOV-001` | Governance | Ambiguous | Contract registry | Source authority history can cause conflicting contract interpretation | Integration authority | All agents | GLOBAL_DECISION_REQUIRED | NON_BLOCKING for local AI contract proposal | No | Establish authoritative version/reference policy | Global governance decision | Protected/global docs | Prevents source drift |

## 4. Minimum V1 closure

The minimum implementation-enabling contract is:

1. typed provider request/result;
2. stable provider error classification;
3. model identity + capability descriptor;
4. AIExecution logical lifecycle and outcome model;
5. conversation/message logical semantics consumed from IA-02/IA-01;
6. tool authorization boundary independent from LLM interpretation;
7. prompt identity/version/provenance;
8. timeout + cancellation outcomes;
9. retry/idempotency semantics sufficient to prevent duplicate logical execution;
10. deterministic contract-test fixtures.

Streaming and detailed usage/token reporting are not required for the first slice unless a normative product requirement or external integration requires them.

## 5. Ownership decision

IA-05 can prepare the logical contracts and tests inside its documentation territory, but cannot change the shared executable interfaces in `packages/domain/**` or `packages/contracts/**`. Those changes are global/cross-agent decisions.

## 6. Safety position

The package does not authorize any tool. It does not grant permissions, define roles, choose confirmation policy, choose model defaults, or define numeric retries/timeouts/backoff. Those remain decisions to be approved elsewhere.
