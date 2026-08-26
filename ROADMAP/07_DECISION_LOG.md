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

## 2026-08-25 — D-002: Canonical Knowledge Base

**Branch:** `MVP2`  
**Commit:** ver commit desta atualização  
**PR:** direto em `MVP2`

**Contexto:**

A Auditoria Mestre registrou `#kassist-knowledge` como não localizado em algumas execuções. A descoberta posterior confirmou o canal `#kassist-knowledge` (`C0BS8QXC9QF`) como **ACTIVE / CANÔNICO**. O próprio canal define a separação entre Base Global, Base Individual, Slack operacional, GitHub e artefatos oficiais.

**Problema:**

Existia risco de tratar o canal Slack como banco de conhecimento único, ou de interpretar uma falha de descoberta da integração como inexistência da base.

**Decisão:**

`#kassist-knowledge` permanece o **índice operacional canônico das bases permanentes**. Ele não é a única fonte de verdade do projeto. A autoridade normativa de conhecimento global permanece em artefatos versionados do GitHub: governança, decisões, roadmap, estado e especificações aprovadas. Slack permanece como camada operacional de tarefas, discussões, bloqueios e eventos.

**Alternativas consideradas:**

1. Criar um novo canal substituto — rejeitada, pois o canal canônico já existe.
2. Tratar Slack como única base de conhecimento — rejeitada por reduzir auditabilidade/versionamento.
3. Manter `#kassist-knowledge` como índice e o GitHub como fonte versionada — **aprovada**.
4. Migrar a base integralmente para outro artefato — desnecessário neste estágio.

**Motivo:**

Separar continuidade de conhecimento, operação e implementação, preservando versionamento e auditabilidade.

**Impacto:**

- `#kassist-knowledge` é o índice canônico de continuidade.
- GitHub permanece a fonte versionada para conhecimento normativo global.
- Canais individuais continuam especializados.
- Uma descoberta em Slack somente se torna conhecimento permanente quando reutilizável, validada ou explicitamente aprovada.

**Próxima validação:**

Manter o canal no protocolo de descoberta dos agentes e garantir que o índice aponte para as fontes canônicas existentes.

## 2026-08-25 — D-003: WSS Runtime as MVP Blocker

**Branch:** `MVP2`  
**Commit:** ver commit desta atualização  
**PR:** direto em `MVP2`

**Contexto:**

O dry run de Engenharia identificou `attachWssTransport() → not_implemented` no ponto de entrada do transporte WSS. A arquitetura oficial depende da ponte Gateway ↔ Desktop.

**Decisão:**

A ausência do transporte WSS runtime é tratada como **BLOQUEIO P0 do caminho MVP Desktop↔Gateway** enquanto esse caminho permanecer obrigatório na arquitetura aprovada.

O território técnico primário é `IA-07 — Gateway + WSS`. A implementação só pode começar contra contratos fechados de: transporte, autenticação/device identity, envelope e message types, ACK/correlation, lifecycle/reconnect, error semantics e integração Inbox/Outbox.

Dependências primárias: `IA-03` (Events/Inbox/Outbox), `IA-06` (Device Authentication) e integração com `IA-08` (Desktop UI). `AG-ENG-01` lidera a execução operacional de Engenharia; `AG-QAOPS-01` define e verifica os quality gates.

**Alternativas consideradas:**

1. Ignorar o WSS e declarar o MVP pronto — rejeitada por contradizer o caminho arquitetural aprovado.
2. Implementar WSS antes de fechar contratos — rejeitada por risco de retrabalho e divergência.
3. Tratar WSS como P0 e fechar contratos antes da implementação — **aprovada**.

**Motivo:**

Garantir que implementação de transporte não ultrapasse contratos de segurança, correlação, idempotência e integração.

**Impacto:**

WSS runtime passa a ser gate explícito do caminho de entrega do MVP. Uma implementação parcial não pode ser classificada como integração end-to-end.

**Próxima validação:**

Produzir/validar os contratos WSS e confirmar dependências antes de abrir a tarefa de implementação.

## 2026-08-25 — D-004: Canonical Permission Matrix

**Branch:** `MVP2`  
**Commit:** ver commit desta atualização  
**PR:** direto em `MVP2`

**Contexto:**

Os dry runs identificaram que a Permission Matrix normativa não estava recuperável de forma consistente.

**Decisão:**

A fonte canônica da Permission Matrix passa a ser **`GOVERNANCE/PERMISSION_MATRIX.md`** no GitHub. O documento define, no mínimo: agente operacional, ação, território técnico, nível de permissão, pré-condição, aprovação necessária e evidência esperada.

Slack mantém o índice e o estado operacional; não é a fonte normativa da matriz.

**Regras:**

- agentes só escrevem dentro de territórios explicitamente autorizados;
- ações que alterem governança, segurança, ownership, contratos globais ou release exigem decisão/aprovação humana;
- `read`, `analyze`, `propose`, `implement`, `merge`, `release` são capacidades distintas;
- ausência de uma permissão explícita deve ser tratada como ausência de autorização.

**Alternativas consideradas:**

1. Manter a matriz somente no Slack — rejeitada por versionamento e auditoria insuficientes.
2. Espalhar permissões em cada AGENT-BASE — rejeitada como fonte normativa única.
3. Documento versionado no GitHub + referência operacional no Slack — **aprovada**.

**Motivo:**

Criar uma autoridade normativa única, auditável e versionada.

**Impacto:**

As futuras tasks de implementação deverão referenciar a Permission Matrix e declarar explicitamente o território e as ações autorizadas.

**Próxima validação:**

Criar a matriz inicial e validá-la contra os cinco agentes e os oito territórios técnicos existentes.

## 2026-08-25 — D-005: CI and Release Evidence Gates

**Branch:** `MVP2`  
**Commit:** ver commit desta atualização  
**PR:** direto em `MVP2`

**Decisão:**

O projeto adotará o seguinte quality gate mínimo para qualquer claim de prontidão técnica ou release:

`lint → typecheck → unit tests → integration tests → build → security checks → CI green → evidence package → human approval`

Os estados são distintos e não intercambiáveis:

`IMPLEMENTED → TESTED → VERIFIED → READY_FOR_REVIEW → APPROVED → RELEASED`

Um agente não pode promover sozinho um estado para `APPROVED` ou `RELEASED`.

**Responsabilidade:**

`AG-QAOPS-01` é o owner operacional de qualidade/release evidence. Cada território técnico continua responsável por produzir testes pertinentes ao próprio código. Aprovação final permanece humana.

**Alternativas consideradas:**

1. Considerar código implementado como pronto — rejeitada.
2. Usar somente CI green — rejeitada porque CI não substitui evidência de escopo e validação.
3. Gate composto + pacote de evidências + aprovação humana — **aprovada**.

**Motivo:**

Separar implementação, verificação e autorização de release.

**Impacto:**

Claims de readiness precisarão ser rastreáveis a evidências reproduzíveis.

**Próxima validação:**

Publicar `GOVERNANCE/QUALITY_GATES.md` e integrar os critérios aos próximos implementation tasks.

## 2026-08-25 — D-006: WhatsApp vs Conversas

**Decisão:**

`Conversas` é nomenclatura de navegação/UI para a experiência de mensagens. `WhatsApp` é um canal/provedor de transporte e integração.

O domínio deve preferir conceitos neutros (`Conversation`, `Message`, `Contact`, `Channel/Provider`) e manter detalhes específicos do provedor atrás da integração. O uso de `WhatsApp` na UI pode existir quando o contexto for especificamente o canal, mas não deve definir o modelo de domínio inteiro.

**Alternativas consideradas:**

1. Renomear toda a experiência para `WhatsApp` — rejeitada por acoplamento excessivo ao provedor.
2. Eliminar `WhatsApp` de toda a UI — rejeitada porque o usuário precisa reconhecer o canal real quando isso for relevante.
3. `Conversas` como experiência/UI + `WhatsApp` como canal/provedor — **aprovada**.

**Motivo:**

Preservar neutralidade do domínio e flexibilidade para outros canais sem esconder a integração WhatsApp.

**Impacto:**

UX, IA e Engenharia devem compartilhar a mesma semântica de `Conversation`/`Message`; adaptadores de canal encapsulam WhatsApp.

**Próxima validação:**

Registrar o vocabulário no artefato canônico de terminologia e aplicar a nomenclatura aos próximos contratos.

## 2026-08-26 — D-008: P0 Implementation Wave Authorization

**Branch:** `MVP2`  
**Commit:** ver commit desta atualização  
**PR:** direto em `MVP2`

**Contexto:**

D-001 through D-007 were recorded; the Permission Matrix, Quality Gates, WSS Runtime Contract and AI-V1 Contract are canonical. The P0 task packet has been created and the first implementation wave must now be bounded by explicit ownership, paths, dependencies, acceptance criteria, tests and evidence.

**Decisão:**

Authorize the first P0 implementation wave only through the task packets in `ROADMAP/13_P0_IMPLEMENTATION_TASKS.md`:

- P0-001 WSS Runtime Transport — `AG-ENG-01` / `IA-07`.
- P0-002 LLMProvider — `AG-AI-01` / `IA-05`.
- P0-003 AIExecution + Structured Output + Tool Authorization — `AG-AI-01` / `IA-05`, after P0-002.
- P0-004 Quality Gate Automation Baseline — `AG-QAOPS-01`.
- P0-005 Cross-Territory WSS Integration Verification — `AG-QAOPS-01`, after P0-001.
- P0-006 Canonical Conversation/Message terminology — `AG-UX-01`.

The task packets are the implementation authority for this wave, subject to the Permission Matrix and frozen contracts.

No task grants merge, release, governance, ownership or policy authority.

**Required state progression:** `IMPLEMENTED → TESTED → VERIFIED → READY_FOR_REVIEW`; only humans may transition to `APPROVED → RELEASED`.

**Impact:**

The KassisT project moves from contract-first preparation to controlled P0 implementation. Cross-territory changes remain explicit; missing dependencies remain blockers.

**Next validation:**

Owners execute their assigned P0 packets and return evidence packages. `AG-QAOPS-01` verifies quality gates; P0-005 verifies WSS end-to-end after P0-001.

## Regra

Uma decisão deve refletir evidência verificável. Hipóteses devem ser identificadas como hipóteses. Decisões humanas registradas neste arquivo não devem ser reinterpretadas unilateralmente por agentes; mudanças posteriores exigem nova decisão explícita.
