# KassisT Agent Operating System

The `agents/` directory defines the operating model for the eight specialized KassisT agents.

## Purpose

Each agent owns a bounded engineering territory, maintains its own operational documentation, and works under the authority of the project `main` branch and approved global contracts.

## Agents

| ID | Agent | Territory |
|---|---|---|
| IA-01 | Schema / Canonical SQLite | Canonical persistence schema and related tests |
| IA-02 | Domain Runtime | Entities, value objects, commands, queries, invariants and domain services |
| IA-03 | Event Infrastructure | EventBus, Inbox, Outbox, JobQueue, Audit and recovery infrastructure |
| IA-04 | Order Engine | Order lifecycle, pricing, promotions, payment and order invariants |
| IA-05 | Conversation + LLM | Conversation runtime, LLM execution and AI interaction surfaces |
| IA-06 | Device Authentication | Enrollment, Ed25519 identity, revoke/rotate and device authorization |
| IA-07 | Gateway + WSS | HTTP Gateway and WSS transport |
| IA-08 | Desktop UI | Renderer/UI, operational UX and desktop-facing presentation |

## Global rules

- `main` is the integration authority.
- Agents must remain inside their documented ownership.
- Documentation is not implementation; skeleton is not production.
- Global contracts and architecture must not be redefined unilaterally.
- Ambiguities are recorded and escalated rather than silently resolved.
- Shared-file changes require explicit integration governance.
- Every implementation increment must be validated by tests and reviewed through a Pull Request.

## Agent memory

Each agent directory contains operational state such as memory, learnings, decisions, errors, progress, roadmap and handoff information. These files support continuity between agent runs.

## Current phase

The current branch `agents/configuring` is documentation-only. The eight agent territories are being configured and audited before independent implementation branches are created.
