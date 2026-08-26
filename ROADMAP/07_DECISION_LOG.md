# 07 — DECISION LOG

## Objetivo

Registrar decisões técnicas, arquiteturais e operacionais relevantes.

## Formato obrigatório

### YYYY-MM-DD — título

**Branch:**
**Commit:**
**PR:**

**Contexto:**

**Problema:**

**Evidências:**

**Decisão:**

**Alternativas consideradas:**

**Motivo:**

**Impacto:**

**Próxima validação:**

## 2026-08-25 — D-001: AG-AI-01 ↔ IA-05

**Branch:** `MVP2`  
**Commit:** `ccbd108409770f1a5527f3e04a091f9295a24c65`  
**PR:** direto em `MVP2`

**Contexto:**

O Agent Registry operacional do Slack identifica `AG-AI-01` como o agente de IA, LLMs & Automação. O Technical Registry do GitHub identifica `IA-05` como o território técnico `Conversation + LLM` em `agents/05-conversation-llm/`.

**Problema:**

Não havia relação formal entre os dois namespaces. Tratar os identificadores como equivalentes ou como entidades totalmente independentes criava ambiguidade de ownership e auditoria.

**Evidências:**

- Registry operacional Slack: `AG-AI-01` — IA, LLMs & Automação.
- Technical Registry GitHub: `IA-05` — Conversation + LLM — `agents/05-conversation-llm/`.
- A Auditoria Mestre KassisT v1.0 classificou o relacionamento como decisão humana necessária.

**Decisão:**

`AG-AI-01` e `IA-05` **não são identificadores equivalentes**.

`AG-AI-01` é a identidade operacional do agente de IA, LLMs & Automação.

`IA-05` é o território técnico de implementação `Conversation + LLM`.

A relação formal é:

`AG-AI-01 → operational responsibility → IA-05`

O Agent Registry e o Technical Registry permanecem independentes, porém com mapeamento explícito e auditável.

**Alternativas consideradas:**

1. `AG-AI-01 ≡ IA-05` — rejeitada por acoplar identidade operacional e território técnico.
2. `AG-AI-01` e `IA-05` sem relação — rejeitada por deixar ownership e rastreabilidade ambíguos.
3. Mapeamento operacional → território técnico — **aprovada**.
4. Modelo relacional mais amplo (`primary_owner`, `contributor`, `reviewer`) — reservado para evolução futura quando necessário.

**Motivo:**

Preservar a separação entre governança operacional e ownership técnico, mantendo rastreabilidade sem criar uma relação 1:1 obrigatória.

**Impacto:**

- `AG-*` passa a representar agentes operacionais.
- `IA-*` passa a representar territórios técnicos.
- Um agente pode atuar sobre múltiplos territórios.
- Um território pode receber colaboração de múltiplos agentes.
- O mapeamento entre namespaces deve permanecer explícito e auditável.

**Próxima validação:**

Atualizar referências canônicas que ainda tratem `AG-AI-01` e `IA-05` como equivalentes; verificar `agents/05-conversation-llm/OWNERSHIP.md` e documentos de governança relacionados antes de qualquer alteração adicional de ownership.

## Regra

Uma decisão deve refletir evidência verificável. Hipóteses devem ser identificadas como hipóteses.
