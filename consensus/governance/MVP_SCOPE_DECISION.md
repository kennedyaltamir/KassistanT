# MVP_SCOPE_DECISION — MVP2

Status: **PROPOSED / PENDING_APPROVAL**
Authority: `OPERATOR_PROJECT_GOVERNANCE`
Baseline verified: `MVP2` @ `0bea2a0ca7c52729cfd58bebc8cd568373222230`
Decision state: **NOT APPROVED**

## Purpose

Formalizar o escopo candidato do MVP2 sem promovê-lo a requisito normativo. Este documento substitui inferência por estado explícito: tudo abaixo permanece proposta até decisão do Operator.

## Requirement

Proposta de MVP: **TEXT-FIRST REAL COMMERCIAL OPERATION**.

Candidate in-scope:
- Customer
- Conversation
- Message
- Inbox / InboundInbox
- AI / Conversation + LLM
- Product
- Order
- Inventory
- Pricing
- Freight
- Sale
- DomainOutbox
- Recovery
- WhatsApp
- Human Handoff
- Windows Runtime

Candidate post-MVP:
- Image
- Audio
- PDF Import
- Campaign
- Advanced Attribution
- Advanced KPI
- Multi-provider LLM
- Cross-channel identity stitching
- Complex promotion engine
- Complex freight integrations
- SaaS billing

## Contract

Nenhum item acima se torna implementação autorizada, contrato normativo ou critério de release por este documento.

O documento apenas estabelece um pacote de decisão para o Operator.

## Invariants

1. `Candidate != Normative` até aprovação formal.
2. Nenhuma decisão de escopo pode retroativamente validar implementação já existente.
3. Escopo aprovado não implica automaticamente autorização de migration, merge ou produção.
4. Cada item aprovado deve ser reconciliado com os contratos existentes e com requisitos legados.

## Policies

- Scope decisions are human-authoritative.
- AI recommendations are non-authoritative.
- Historical documents remain historical unless explicitly promoted.
- Implementation must consume frozen contracts; it must not freeze them by inference.

## Explicit Non-Scope

Fora do primeiro escopo normativo, salvo decisão explícita em contrário, permanecem os itens candidate post-MVP acima.

Também permanecem fora de autorização automática: migration execution, schema change, provider change, merge e production release.

## Legacy Requirement Reconciliation

`docs/domain/entities.md` registra como “Normative rules” unicidades para Customer, Conversation e Message, porém `agents/01-schema/DECISIONS.md` e `agents/01-schema/HUMAN-SCHEMA-REVIEW.md` preservam decisões físicas e semânticas como propostas/pending. Essa divergência é classificada neste ciclo como **GOVERNANCE_DRIFT** e não é resolvida unilateralmente.

`agents/02-domain/HUMAN-DOMAIN-DECISIONS.md` também demonstra que propostas de Domain Runtime permanecem explicitamente não autorizadas.

## Superseded Requirements

Nenhum requisito é marcado como superseded neste ciclo sem evidência explícita de autoridade humana que o substitua.

## Authority

`OPERATOR_PROJECT_GOVERNANCE`.

## Decision State

`PENDING_APPROVAL`.

## Release Consequence

`MVP_SCOPE_DECISION != APPROVED` mantém o gate documental fechado. `READY_FOR_IA02` não pode ser emitido com base apenas neste pacote.
