# Decisions — IA-08

## Observed decisions
- DECISION/BASELINE: Desktop security boundary uses context isolation, no renderer Node integration and sandboxing.
- DECISION/ARCHITECTURE: Core is business authority; UI presents and invokes approved boundaries.

## Proposed, not approved
- PROPOSAL: future UI contracts should be consumed through narrow, typed boundaries rather than exposing database/filesystem/provider capabilities to the renderer.
- PROPOSAL: operational surfaces should remain replaceable and avoid duplicating domain state machines.

## Explicit non-decisions
IA-08 does not resolve DomainOutbox ownership (CONTRACT-001), `order.status_changed` semantics (CONTRACT-002), or documentation authority/history (GOV-001). Their impact is dependency and presentation uncertainty only.
