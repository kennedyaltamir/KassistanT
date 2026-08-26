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

## Nota de cronologia

As decisões abaixo devem ser interpretadas segundo a data em que foram efetivamente registradas. Uma decisão posterior não possui efeito retroativo sobre uma task ou execução iniciada antes de sua data.

A entrada D-008 está registrada em **2026-08-26** e, portanto, é considerada uma decisão posterior aos dry runs e execuções documentadas em 2026-08-25. Ela não deve ser usada como autoridade retroativa para justificar ações anteriores à sua data.

A entrada D-009 abaixo registra uma delegação operacional feita em **2026-08-25**. Essa delegação não altera ownership técnico: IA-03 e IA-06 continuam sendo territórios técnicos independentes.

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

## 2026-08-25 — D-009: P0-001A/P0-001B Operational Delegation

**Branch:** `MVP2`
**Commit:** `6c693bfba75754e17da86ffa9042eb255114e145`
**PR:** direto em `MVP2`

**Contexto:**

P0-001 exige dependências técnicas em IA-06 (Device Authentication) e IA-03 (Inbox/Outbox). O Agent Registry operacional não possui agentes separados para esses dois territórios técnicos.

**Problema:**

Era necessário atribuir execução operacional para que P0-001A e P0-001B pudessem começar sem transferir ownership técnico para IA-07.

**Evidências:**

- P0-001-DEPENDENCY-GRAPH.md define P0-001A e P0-001B como tarefas independentes e exige handoff formal para P0-001.
- Issues #54 e #55 definem IA-06 e IA-03 como territórios técnicos independentes e indicam handoff para AG-ENG-01.
- D-003 mantém IA-03, IA-06 e IA-07 como territórios distintos.

**Decisão:**

`AG-ENG-01` recebe **responsabilidade operacional delegada** para executar e coordenar P0-001A e P0-001B.

Isso **não** redefine os namespaces técnicos:

`AG-ENG-01 ≠ IA-06`

`AG-ENG-01 ≠ IA-03`

Os caminhos e permissões de IA-06 e IA-03 permanecem independentes e devem ser respeitados conforme a Permission Matrix.

**Regras:**

1. O agente pode atuar em múltiplos territórios quando houver delegação operacional explícita.
2. A delegação não autoriza edição fora dos caminhos permitidos da task.
3. Dependências cruzadas devem ser documentadas por handoff e evidência.
4. Uma dependência só desbloqueia P0-001 após atingir pelo menos `READY_FOR_REVIEW` com evidências.

**Impacto:**

P0-001A e P0-001B passam a ter owner operacional verificável sem alterar ownership técnico.

**Próxima validação:**

AG-ENG-01 executar as tasks de dependência em branches próprias e fornecer evidências para AG-QAOPS-01 e P0-001.

## 2026-08-26 — D-008: P0 Implementation Wave Authorization

**Temporalidade:** decisão posterior aos dry runs e às execuções iniciadas em 2026-08-25. Não retroativa.

**Branch:** `MVP2`  
**Commit:** ver commit desta atualização  
**PR:** direto em `MVP2`

**Contexto:**

D-001 through D-007 were recorded; the Permission Matrix, Quality Gates, WSS Runtime Contract and AI-V1 Contract are canonical. The P0 task packet has been created and the first implementation wave must now be bounded by explicit ownership, paths, dependencies, acceptance criteria, tests and evidence.

**Decisão:**

Authorize the first P0 implementation wave only through the task packets in `ROADMAP/13_P0_IMPLEMENTATION_TASKS.md`.

**Impacto:**

The KassisT project moves from contract-first preparation to controlled P0 implementation. Cross-territory changes remain explicit; missing dependencies remain blockers.

**Próxima validação:**

Owners execute their assigned P0 packets and return evidence packages. `AG-QAOPS-01` verifies quality gates; P0-005 verifies WSS end-to-end after P0-001.

## 2026-08-25 — D-010: Inbox / Outbox Persistence Boundary

**Authority:** `Kennedy Altamir + Esdras Ribeiro`  
**Effective:** `2026-08-25 23:11:44 America/Sao_Paulo (UTC−03:00)`  
**Decision:** **APPROVED — Option C**

**Contexto:**

P0-001B was blocked by an unresolved persistence/event boundary between IA-03 and IA-01. The canonical sources identified `INBOX-V1` as defined, `OUTBOX-V1` as ambiguous, and `CONTRACT-001` as unresolved.

**Evidências:**

- `docs/protocols/contract-registry.md`
- `docs/backend/inbox-outbox.md`
- `docs/backend/database.md`
- `agents/01-schema/AGENT.md`
- `agents/01-schema/CANONICAL-SCHEMA-SPEC.md`
- `ROADMAP/AGENT_TASKS/AG-ENG-01.md`
- `ROADMAP/13_P0_IMPLEMENTATION_TASKS.md`
- `ROADMAP/P0-001-DEPENDENCY-GRAPH.md`
- Issue `#55`
- human approval by Kennedy Altamir + Esdras Ribeiro

**Decisão:**

Close D-010 as APPROVED — Option C. `AG-ENG-01` retains operational responsibility for P0-001A/P0-001B, while IA-06, IA-03 and IA-01 remain distinct technical territories.

### D-010.1 — Canonical INBOX-V1 semantics

`InboundInbox` represents durable acceptance of an external event before processing. Canonical identity is `(provider, external_event_id)`. Acceptance is idempotent and deterministic, with correlation, causation and restart recovery. ACK occurs only after the durability required by the contract.

### D-010.2 — Canonical OUTBOX-V1 semantics

`DomainOutbox` represents an external effect the system committed to produce after the corresponding internal operation is accepted. Canonical identity is `idempotency_key`. Canonical states are `PENDING`, `PROCESSING`, `DELIVERED`, `RETRY_WAIT`, `FAILED_TERMINAL`. State transitions are deterministic and versioned in the contract.

### D-010.3 — CONTRACT-001 resolution

`DomainOutbox` is a logical boundary between Core/Domain and external effects. It is not a Gateway mechanism, arbitrary physical table, transport detail or business authority. Business semantics remain in Core/Domain; persistence remains persistence; transport remains transport.

### D-010.4 — SQLite schema ownership

`IA-01` is the canonical technical owner of the SQLite schema. `IA-03` must not create or alter SQLite schema unilaterally.

### D-010.5 — Migration ownership

`IA-01` owns SQLite schema migrations. `IA-03` does not create migrations as part of P0-001B.

### D-010.6 — IA-03 ↔ IA-01 interface

The boundary is explicit, versioned and independent of SQLite. It must not expose SQL, table names, SQLite internals, migration numbers or physical storage details. Canonical semantic operations are `accept_inbound`, `deduplicate`, `retrieve_pending`, `stage_outbound`, `mark_processing`, `mark_delivered`, `record_retry`, `record_failure`, `recover_pending`.

### D-010.7 — Idempotency model

Inbox identity is `(provider, external_event_id)`. Outbox identity is `idempotency_key`. Reprocessing the same logical identity must not produce a second logical effect.

### D-010.8 — Retry / recovery model

Retry and recovery semantics belong to IA-03. Persistence stores attempts, state, timestamps and failure metadata. The model requires retryable failure, terminal failure, deterministic backoff, bounded retry and restart recovery.

### D-010.9 — Dead-letter semantics

No physical DLQ is introduced in this phase. `FAILED_TERMINAL` is the terminal failure state. A physical DLQ requires a new authorized decision based on demonstrated operational need.

### D-010.10 — P0-001B gate

P0-001B follows:

`CONTRACT_FROZEN → IMPLEMENTED → TESTED → VERIFIED → READY_FOR_REVIEW`

The evidence package must include baseline, starting SHA, final SHA, changed paths, contract traceability, unit/integration tests, idempotency, retry, recovery, persistence-failure and correlation tests, build, typecheck, lint, security, CI and handoff. `READY_FOR_REVIEW` does not mean `APPROVED`; `APPROVED` and `RELEASED` remain human decisions.

**Impacto:**

`INBOX-V1 = FROZEN`; `OUTBOX-V1 = FROZEN`; `CONTRACT-001 = RESOLVED`; IA-01 schema/migration ownership is canonical; IA-03 ↔ IA-01 interface is frozen. The contract prerequisite of P0-001B is satisfied. No implementation authorization is implied beyond the task packet and quality gates.

**Próxima validação:**

Synchronize the Contract Registry, backend Inbox/Outbox and database documents, AG-ENG-01 task packet, P0 implementation task packet and dependency graph. After synchronization, P0-001B may enter its implementation gate; it must not be treated as implemented or verified until evidence exists.

## Regra

Uma decisão deve refletir evidência verificável. Hipóteses devem ser identificadas como hipóteses. Decisões humanas registradas neste arquivo não devem ser reinterpretadas unilateralmente por agentes; mudanças posteriores exigem nova decisão explícita.
