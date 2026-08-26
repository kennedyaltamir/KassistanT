# KassisT AI-V1 Contracts

**Status:** FROZEN_FOR_IMPLEMENTATION  
**Contract ID:** AI-V1  
**Technical territory:** IA-05 (`agents/05-conversation-llm/`)  
**Operational agent:** AG-AI-01  
**Decision gate:** D-001

## 1. Authority and boundaries

`AG-AI-01` is the operational identity responsible for IA, LLMs & Automação. `IA-05` is the technical territory for Conversation + LLM. They are not equivalent identifiers; the formal relationship is `AG-AI-01 → operational responsibility → IA-05`.

IA-05 owns the conversation/LLM runtime and provider abstraction. It does not own domain authority, canonical persistence, event infrastructure, order lifecycle, device authentication, Gateway/WSS, or Desktop UI.

## 2. Core principle

**A IA conversa. O sistema decide.**

LLM output is untrusted input. The model cannot directly mutate canonical business state, authorize tools, bypass domain rules, or select policy outside approved configuration.

## 3. LLMProvider contract

The provider boundary exposes a deterministic adapter contract:

```ts
interface LLMProvider {
  chat(input: LLMRequest): Promise<LLMResponse>;
  health?(): Promise<LLMHealth>;
}
```

Provider-specific SDKs, model APIs and transport details remain behind this boundary.

### LLMRequest

Required fields:

- `request_id`
- `messages`
- `model_profile`
- `context`
- `response_format`
- `timeout_ms`

Optional fields may include provider-neutral generation controls. Provider-specific fields MUST NOT leak into the domain contract.

### LLMResponse

Required fields:

- `request_id`
- `provider`
- `model`
- `content` or structured result
- `finish_reason`
- `usage` when available
- `raw_provider_metadata` only in a non-authoritative diagnostic field

Provider metadata is observational, not business state.

## 4. AIExecution contract

AI execution is an orchestration boundary between application intent and model inference.

Required stages:

`CONTEXT_ASSEMBLY → PROMPT_RESOLUTION → MODEL_SELECTION → INFERENCE → OUTPUT_VALIDATION → TOOL_INTERPRETATION → AUTHORIZATION_GATE → EFFECT_APPLY`

No model output may skip `OUTPUT_VALIDATION` or `AUTHORIZATION_GATE`.

AIExecution returns a structured execution result containing:

- `execution_id`
- `request_id`
- `status`
- `assistant_output`
- `tool_intents`
- `provenance`
- `errors`

## 5. Structured output

Structured model responses are validated against the expected schema before use.

Invalid structured output is a controlled failure. It is not silently coerced into business state.

The system distinguishes:

- syntactically invalid output;
- semantically invalid output;
- unsupported intent;
- unauthorized tool request;
- provider failure;
- timeout;
- cancellation.

## 6. Tool interpretation vs authorization

The LLM may interpret a user request and propose a tool intent.

The LLM does not authorize the tool.

Authorization is deterministic and enforced by the application/security boundary using:

`agent/user/device identity + action + territory + policy + current state`

Absence of explicit authorization means **DENY**.

A tool execution record must preserve:

- execution/request ID;
- actor identity;
- proposed tool/action;
- authorization decision;
- policy/version used;
- execution result;
- error if denied or failed.

## 7. Prompt provenance and versioning

Every production AI execution must identify the prompt artifact used.

Minimum provenance:

- prompt identifier;
- prompt version;
- effective configuration version;
- model profile identifier;
- timestamp;
- source/context version where applicable.

Prompts are versioned artifacts, not mutable hidden state.

## 8. Model selection

The runtime selects a **model profile**, not an arbitrary provider model string from model output.

A model profile resolves:

- provider;
- model identifier;
- capability requirements;
- allowed use case;
- operational limits;
- fallback policy.

Model selection is configuration/policy, not an LLM decision.

## 9. Context assembly

Context is assembled before inference from authoritative sources only.

The context assembler must preserve source provenance and distinguish:

- canonical project state;
- operational context;
- user content;
- retrieved knowledge;
- transient tool results.

Untrusted user/retrieved content never becomes a system-level instruction merely by inclusion in context.

## 10. Persistence and events

IA-05 does not own canonical persistence schema or event infrastructure.

AI runtime may emit domain/application events and persistence requests through explicit contracts, but:

- IA-01 owns canonical SQLite schema;
- IA-03 owns event/inbox/outbox/job/audit infrastructure;
- IA-02 owns domain authority.

AI output must never directly write canonical business state.

## 11. Fallback and recovery

Provider failures, malformed outputs and timeouts must result in deterministic statuses.

Fallback may switch only among models/profiles explicitly allowed by policy.

The runtime must preserve the original execution/provenance chain across retries and fallback attempts.

Retries must be bounded and idempotency-aware.

## 12. Security requirements

The runtime must treat model output, retrieved documents, user content and tool results as untrusted data.

Mandatory controls include:

- prompt-injection resistance at context boundaries;
- output schema validation;
- deterministic authorization;
- secret/token isolation;
- bounded tool execution;
- auditability of authorization decisions;
- no direct model access to privileged infrastructure.

## 13. Acceptance criteria

AI-V1 is implementation-ready only when tests demonstrate:

1. provider isolation behind `LLMProvider`;
2. deterministic AIExecution lifecycle;
3. invalid structured output is rejected safely;
4. tool intents cannot bypass authorization;
5. prompt/model provenance is preserved;
6. model selection is policy-driven;
7. context provenance is preserved;
8. persistence/events cross only explicit contracts;
9. retries/fallback are bounded and traceable;
10. prompt injection and untrusted output do not gain authority.

## 14. Forbidden shortcuts

IA-05 MUST NOT:

- mutate domain state directly from an LLM response;
- implement order logic because it is convenient to complete a conversation flow;
- own canonical persistence or event infrastructure;
- allow the model to choose authorization policy;
- hard-code a production model as an implicit business rule;
- treat prompt text as an authorization boundary;
- bypass provenance/versioning for production prompts.

## 15. Gate

**CONTRACT STATUS: FROZEN_FOR_IMPLEMENTATION**

This contract authorizes implementation of the AI runtime inside IA-05's ownership boundary. Shared contract files and cross-agent ownership remain subject to the integration-authority process.
