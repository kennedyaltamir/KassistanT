# IA-05 — Decisions

## Approved decisions

| ID / Source | Decision | Status | IA-05 implication |
|---|---|---|---|
| ADR-003 | Ollama is the initial local LLM layer | APPROVED | Implement through provider abstraction |
| ADR-004 | Business rules are separated from the LLM | APPROVED | LLM cannot be business authority |
| Baseline §9 | Conversation state machines are independent | APPROVED | Do not collapse lifecycle, ownership and AI state |
| Baseline §10 | AI interprets intent/context but cannot perform critical business authority functions | APPROVED | Validate all candidate actions in Core |
| Baseline §11 | Structured Knowledge Base is operational truth | APPROVED | Assemble context from authoritative data |
| Baseline §12 | LLMProvider abstraction isolates Ollama | APPROVED | Provider-specific code stays isolated |
| Baseline §12 | No automatic cloud fallback by default in MVP | APPROVED | Use controlled unavailable/human path |
| ADR-020 | Architectural changes require ADR + versioning | APPROVED | No unilateral architecture change |

## Open decisions affecting IA-05

### AI-V1 completeness

Status: PARTIAL. The repository contains a minimal `LLMProvider` interface and documentation, but the complete executable AI contract is not yet implemented.

### Model selection

Status: OPEN / EXTERNAL. The baseline explicitly leaves default model selection to benchmark/external decision. IA-05 must not promote a specific model into an approved architectural default without authority.

### Tool authorization semantics

Status: OPEN / NOT_FULLY_SPECIFIED. The baseline permits optional tool calling where supported, but the exact typed tool registry, authorization matrix and execution envelope are not fully represented by the current executable contract.

### Prompt/version contract

Status: PARTIAL. Prompt construction is required conceptually, but the current repository does not expose a complete versioned prompt contract.

## Global ambiguities that IA-05 must not resolve

- `CONTRACT-001` — DomainOutbox ownership/scope.
- `CONTRACT-002` — `order.status_changed` semantics.
- `GOV-001` — baseline/document authority history policy.

These remain global governance matters.
