# KassisT Agent Registry

## Status model

Agents may be `CONFIGURING`, `READY`, `WORKING`, `BLOCKED`, `WAITING_HUMAN`, `READY_FOR_REVIEW`, `MERGED`, or `SUSPENDED`.

## Current registry

| ID | Name | Directory | Primary ownership | Configuration state |
|---|---|---|---|---|
| IA-01 | Schema / Canonical SQLite | `agents/01-schema/` | Canonical SQLite schema | CONFIGURED |
| IA-02 | Domain Runtime | `agents/02-domain/` | Domain model and business rules | CONFIGURED |
| IA-03 | Event Infrastructure | `agents/03-events/` | Events, Inbox/Outbox, jobs, audit | CONFIGURED |
| IA-04 | Order Engine | `agents/04-order/` | Order lifecycle | CONFIGURED |
| IA-05 | Conversation + LLM | `agents/05-conversation-llm/` | Conversations and LLM runtime | CONFIGURED |
| IA-06 | Device Authentication | `agents/06-device-auth/` | Device identity/authentication | CONFIGURED |
| IA-07 | Gateway + WSS | `agents/07-gateway-wss/` | HTTP/WSS transport | CONFIGURED |
| IA-08 | Desktop UI | `agents/08-desktop-ui/` | Desktop renderer/UI | CONFIGURED |

## Operational Agent Mapping

The Technical Registry and the operational Slack Agent Registry use different identifier namespaces and are not identity-equivalent by default.

| Operational Agent | Technical Territory | Relation | Notes |
|---|---|---|---|
| `AG-AI-01` | `IA-05` | `operational_owner` | `AG-AI-01` is the operational identity for IA, LLMs & Automação; `IA-05` is the technical territory `Conversation + LLM`. |

Rules established by D-001:

1. `AG-*` identifies operational agents responsible for tasks, context, handoff, execution and evidence.
2. `IA-*` identifies technical implementation territories and their ownership boundaries.
3. An operational agent may act across multiple technical territories.
4. A technical territory may require collaboration from multiple operational agents; future mappings should distinguish `primary_owner`, `contributor` and `reviewer` where needed.
5. `AG-AI-01` and `IA-05` are **not equivalent identifiers**. Their relationship is explicit and auditable: `AG-AI-01 → operational responsibility → IA-05`.

## Global governance

- Global contracts remain outside unilateral agent authority.
- Ownership boundaries are documented in each `OWNERSHIP.md`.
- Cross-agent dependencies are recorded in each agent's handoff and roadmap.
- The project owner/integration authority controls final contract decisions and merges.
- Operational Agent Registry mappings must remain explicitly traceable to the Decision Log and must not silently change technical ownership.

## Known open contracts

- `CONTRACT-001` — DomainOutbox ownership/semantics.
- `CONTRACT-002` — `order.status_changed` normative status.
- `GOV-001` — baseline/document authority and versioning.

These are registry items for visibility only. They are not resolved here.
