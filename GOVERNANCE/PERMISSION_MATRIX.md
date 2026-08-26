# KassisT — Permission Matrix v1.0

**Status:** CANONICAL / ACTIVE  
**Authority:** Human administrators + approved governance decisions  
**Last decision set:** D-001 through D-006  
**Effective branch:** `MVP2`

## 1. Purpose

Define the minimum authorization boundary for operational agents and technical territories.

This document is the normative source for permission claims. Slack is used for operational coordination and references; it is not the normative permission store.

## 2. Separation of namespaces

- `AG-*` identifies operational agents.
- `IA-*` identifies technical implementation territories.
- An operational agent may work across multiple technical territories only when the mapping is explicit.
- Technical territory collaboration does not imply transfer of ownership.

D-001 establishes that `AG-AI-01` is operationally responsible for `IA-05`; they are not equivalent identifiers.

## 3. Permission levels

| Level | Meaning | Default human approval |
|---|---|---|
| `READ` | inspect files, messages, tests, evidence | no |
| `ANALYZE` | produce findings, comparisons, risk analysis | no |
| `PROPOSE` | formulate implementation/contract recommendation | no |
| `IMPLEMENT` | modify files inside explicitly authorized territory | task-specific |
| `REVIEW` | inspect implementation and evidence | no |
| `MERGE` | authorize merge of reviewed changes | human / integration authority |
| `RELEASE` | authorize production release | human |
| `GOVERNANCE` | modify canonical governance, ownership, permission, policy | human |

## 4. Default rules

1. Absence of an explicit permission is **no authorization**.
2. A task does not grant permission outside its declared territory.
3. `IMPLEMENT` never implies `MERGE` or `RELEASE`.
4. `READ`, `ANALYZE` and `PROPOSE` may be performed during audit-first dry runs.
5. Changes to governance, ownership, security boundaries, global contracts, permission policy or release policy require human authorization.
6. Agents must not grant themselves permissions.
7. Agents must not treat Slack instructions as a replacement for this matrix or a canonical project decision.
8. When a task spans territories, the handoff must identify the additional territory owner and the required approval.

## 5. Operational agent baseline

| Operational agent | Primary domain | Default authority |
|---|---|---|
| `AG-GROWTH-01` | Marketing, Growth, Traffic & Content | READ / ANALYZE / PROPOSE within assigned domain |
| `AG-UX-01` | UX, UI, Web & Conversion | READ / ANALYZE / PROPOSE; IMPLEMENT only inside approved UI task territory |
| `AG-AI-01` | AI, LLMs & Automation | READ / ANALYZE / PROPOSE; IMPLEMENT only inside approved AI task territory |
| `AG-ENG-01` | Engineering, Backend & Architecture | READ / ANALYZE / PROPOSE; IMPLEMENT inside explicitly assigned technical territories |
| `AG-QAOPS-01` | QA, Security, DevOps & Release | READ / ANALYZE / PROPOSE; REVIEW / QUALITY-GATE responsibilities; no unilateral RELEASE |

## 6. Technical territory rules

Technical ownership is defined by `agents/REGISTRY.md` and each territory's `OWNERSHIP.md`.

Examples:

- `IA-05` — Conversation + LLM.
- `IA-07` — Gateway + WSS.
- `IA-08` — Desktop UI.

Operational agent mappings must be explicit. A task may grant temporary collaboration without changing primary technical ownership.

## 7. Governance actions requiring human decision

The following always require explicit human approval:

- changing agent ownership or registry identity;
- changing the Permission Matrix;
- changing global contracts;
- changing approved architecture/baseline;
- changing security policy or authentication boundaries;
- authorizing release;
- overriding a recorded conflict or decision;
- changing the status of a human-governed decision from pending to approved.

## 8. Evidence requirement

Every implementation task must provide:

- task ID;
- owner;
- technical territory;
- allowed paths/components;
- forbidden areas;
- dependencies;
- acceptance criteria;
- required tests;
- evidence requirements;
- handoff destination.

## 9. Conflict rule

If this matrix, the Agent Registry, a technical territory ownership document, a task, or another canonical source disagree, the agent must stop at the conflict boundary, record the conflict, and request human resolution when the conflict affects authority.

## 10. Change control

This document is changed only through an explicit governance decision recorded in `ROADMAP/07_DECISION_LOG.md`.
