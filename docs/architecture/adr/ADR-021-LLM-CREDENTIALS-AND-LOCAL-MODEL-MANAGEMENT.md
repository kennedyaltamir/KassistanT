# ADR-021 — LLM Credentials and Local Model Management

**Status:** Accepted for MVP2

## Context

The Desktop must expose operational settings for local language models and API credentials without placing secrets in renderer state or the existing local Ollama AI configuration file.

## Decision

1. Local model discovery and updates are owned by the Gateway through the currently supported Ollama runtime.
2. The Desktop renderer accesses these capabilities through loopback HTTP endpoints exposed by the Gateway.
3. API credentials are stored separately from `gateway/data/ai-config.json`.
4. On Windows, credential values are protected with the current user's Windows DPAPI before persistence.
5. Credential status endpoints return metadata only and never return plaintext values.
6. The UI keeps automatic model updates disabled by default and allows the user to enable a bounded periodic scheduler.
7. Automatic updates run sequentially through Ollama's pull operation and report failures per model.
8. Provider credential registration does not imply that provider inference APIs are already implemented. Provider runtime integration remains an independent contract.

## Consequences

- Renderer code cannot read persisted secrets directly.
- The existing Ollama configuration contract remains focused on local auto-reply behavior.
- The implementation is Windows-first for secure credential storage; non-Windows execution must fail closed rather than silently using plaintext storage.
- Updating large local models can consume substantial bandwidth and disk space, therefore opt-in scheduling is required.
