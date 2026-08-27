# IA-05 — Implementation Gates

Runtime implementation remains **BLOCKED** until every required gate is satisfied.

## G0 — Integration authority

- [ ] All global decision requests affecting shared contracts are approved.
- [ ] No proposal is treated as a decision.
- [ ] `CONTRACT-001`, `CONTRACT-002` and `GOV-001` are resolved or explicitly proven irrelevant to the next slice.

## G1 — Typed AI-V1 provider contract

- [ ] Typed request/result contract approved.
- [ ] Provider error taxonomy stable.
- [ ] Structured-output envelope testable.
- [ ] Capability/model descriptor semantics stable.

## G2 — AIExecution logical contract

- [ ] Request/context/model/provider/prompt reference semantics defined.
- [ ] Execution outcome semantics defined.
- [ ] Error/timeout/cancellation/retry semantics defined.
- [ ] Persistence mapping approved by IA-01.

## G3 — Tool boundary

- [ ] Tool proposal is untrusted data.
- [ ] Authorization is deterministic and independent from LLM interpretation.
- [ ] Execution ownership is explicit.
- [ ] Result validation and audit ownership are explicit.
- [ ] Confirmation/security semantics are normative before tools are enabled.

## G4 — Prompt contract

- [ ] Prompt identity/version semantics defined.
- [ ] Context provenance defined.
- [ ] Structured result schema reference defined.
- [ ] Execution reproducibility is demonstrable from persisted references.

## G5 — Conversation semantics

- [ ] IA-02 publishes executable transition rules.
- [ ] Ownership/AIState semantics are executable.
- [ ] Human takeover and return-to-AI semantics are defined.
- [ ] Message ordering/deduplication semantics are sufficient.

## G6 — Persistence

- [ ] IA-01 schema/runtime available for Conversation, Message, AIProfile, AIExecution and KnowledgeItem.
- [ ] Durable write/recovery semantics proven.

## G7 — Domain/Event dependencies

- [ ] IA-02 domain runtime available where consumed.
- [ ] IA-03 durable event infrastructure available.
- [ ] Relevant global event ambiguity is resolved before encoding assumptions.

## G8 — Deterministic contract tests

- [ ] Typed provider request/result fixtures exist.
- [ ] Negative result-validation tests exist.
- [ ] Provider failure/model unavailable/timeout/cancellation are distinguishable.
- [ ] Tool proposals cannot imply authorization.
- [ ] Tests run against the actual branch/PR HEAD.

## G9 — Security

- [ ] Secrets cannot enter prompts, renderer or model output.
- [ ] Tool arguments remain untrusted.
- [ ] Authorization is deterministic.
- [ ] Logs/telemetry satisfy data minimization.
- [ ] Provider failure cannot silently create business effects.

## First-slice gate

The proposed first slice is **contract tests around a typed provider request/result/error envelope**. It may begin only after the shared contract change it tests is globally approved. Until then, this branch remains documentation-only.

Failure of any mandatory gate => `HOLD`; no runtime implementation.
