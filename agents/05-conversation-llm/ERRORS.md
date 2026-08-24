# IA-05 — Errors and Risks

## Known issues

### E05-001 — Conversation runtime absent

Status: NOT_IMPLEMENTED.

There is no executable `apps/desktop/electron/conversation/**` runtime in the observed repository. Documentation defines the model, but runtime completion cannot be claimed.

### E05-002 — LLM runtime absent

Status: NOT_IMPLEMENTED.

No executable `apps/desktop/electron/providers/llm/**` adapter was observed. `LLMProvider` exists as a minimal interface only.

### E05-003 — AI contract incomplete

Status: PARTIAL.

The contract registry marks `AI-V1` partial, runtime not implemented and tests missing. The current provider interface is too small to establish the full execution/structured-output/tool/error contract by itself.

### E05-004 — Tool authorization boundary incomplete

Status: NOT_VERIFIED / PARTIAL.

The baseline permits optional tool calling, but the current repository does not provide a complete executable authorization model for tool invocation. Tool use must not be treated as direct business authority.

### E05-005 — Prompt contract incomplete

Status: NOT_VERIFIED / PARTIAL.

Prompt construction is required by the product specification, but no complete versioned executable prompt contract was observed.

### E05-006 — Model choice intentionally unresolved

Status: OPEN / EXTERNAL.

The baseline intentionally leaves model selection to benchmark/external decision. Hard-coding a model as normative would exceed IA-05 authority.

### E05-007 — Conversation depends on unfinished foundations

Status: BLOCKED_BY_DEPENDENCIES.

Meaningful production Conversation runtime depends on canonical persistence, domain semantics and durable event infrastructure owned by other agents.

### E05-008 — Human takeover is a cross-boundary state concern

Status: RISK.

Conversation ownership and AI state are domain-defined separately. Any implementation that models human takeover only as a prompt instruction would risk violating the state model.

## Global blockers

- `CONTRACT-001` can affect durable external-effect semantics.
- `CONTRACT-002` can affect event semantics consumed downstream by conversation-related infrastructure.
- `GOV-001` affects document/source authority and must remain globally governed.

## Security risks

- Treat all model output as untrusted.
- Never expose runtime credentials to prompts, Renderer or LLM output.
- Never allow generated text or tool arguments to bypass deterministic authorization/validation.
- Never persist sensitive diagnostic content outside approved policy.
