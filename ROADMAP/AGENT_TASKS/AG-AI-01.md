# AG-AI-01 — Implementation Task Packet v1.0

**Agent:** `AG-AI-01`
**Technical territory:** `IA-05 — Conversation + LLM`
**Operational role:** IA, LLMs & Automação
**Implementation state:** AUTHORIZED for listed P0 tasks only
**Canonical sources:** D-001, AI-V1, Permission Matrix, Quality Gates, P0 task packet

## Mission
Implement the approved AI runtime contracts without allowing provider/model output to acquire business authority.

## Authorized tasks

### P0-002 — LLMProvider contract implementation
**Primary owner:** AG-AI-01

**Allowed paths**
- `apps/desktop/electron/conversation/**`
- `apps/desktop/electron/providers/llm/**`
- tests directly owned by IA-05

**Protected paths**
- `packages/contracts/**`
- `docs/**`
- other IA territories
- shared/root configuration

**Dependencies**
- `AI-V1` frozen
- model profile/selection contract
- prompt provenance/version contract

**Acceptance**
- typed deterministic provider boundary
- provider-specific behavior remains behind `LLMProvider`
- model profile is explicit and auditable
- prompt provenance/version is explicit
- failure/timeout behavior follows AI-V1
- provider output remains untrusted data
- no direct business-state mutation

**Required tests**
- contract tests
- mock provider tests
- timeout/failure tests
- model-profile tests
- prompt provenance/version tests
- regression tests for existing conversation behavior

**Evidence**
- starting branch/SHA
- changed paths
- test results
- exact commit SHA
- limitations

### P0-003 — AIExecution + structured output + tool authorization
**Depends on:** P0-002

**Acceptance**
- explicit execution boundary
- fail-closed structured output validation
- interpretation separated from authorization
- deterministic authorization boundary
- no direct business-state mutation
- auditable context provenance
- deterministic fallback/recovery

**Required security tests**
- malformed output
- prompt-injection/tool-confusion
- unauthorized tool
- timeout/fallback
- provenance integrity

## Mandatory execution rules

1. Do not change architecture or governance.
2. Do not select a concrete model as a normative product decision.
3. Do not bypass Core/security authorization.
4. Do not modify protected paths without explicit cross-territory authorization.
5. Do not merge or release.
6. End state is `IMPLEMENTED → TESTED → READY_FOR_REVIEW`.

## Handoff
After each task, publish evidence and hand off to `AG-QAOPS-01` and the next dependent task.

## Forbidden
- direct business-state mutation from model/provider output
- silent contract changes
- provider-specific assumptions leaking into domain/core
- undocumented shared-path edits
- release approval
