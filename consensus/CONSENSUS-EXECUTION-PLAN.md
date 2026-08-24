# KassisT — Consensus Execution Plan

> **Status:** DRAFT — NÃO APLICADO
>
> **Purpose:** registro conjunto dos dois auditores para comparação, convergência e posterior aprovação humana.
>
> **Authority:** `main` continua sendo a autoridade de integração. Este documento não autoriza implementação, merge, alteração de contratos ou resolução automática de decisões.

## 1. Objetivo

Este documento consolida as posições dos dois auditores técnicos independentes e serve como artefato único para a diplomacia técnica entre Auditor 1, Auditor 2 e o Operador humano.

O objetivo é chegar a uma única estratégia operacional que maximize paralelismo seguro sem sacrificar evidência, ownership, contratos, segurança, testes, reversibilidade, governança e autoridade da `main`.

## 1.1. Current Operational Baseline and Historical Lineage

A governança atual distingue explicitamente o modelo histórico de C1 da baseline operacional da fase atual.

```text
HISTORICAL_C1_EXECUTION_MODEL
  branch = MVP
  base_branch = main
  base_sha = 86387b02ed55ef3af3b24f1591b3e0b0ff436a30

CURRENT_OPERATIONAL_BASELINE
  branch = MVP2
  status = CURRENT_OPERATIONAL_BASELINE

CURRENT_INTEGRATION_TARGET
  branch = main
  status = FUTURE_CONTROLLED_INTEGRATION_TARGET
```

`MVP` permanece identificável como trilha histórica de execução C1 quando essa for a semântica do artefato original. `MVP2` é a baseline operacional atual por decisão explícita de governança. `main` permanece como autoridade e target de integração.

Esta distinção não é inferida pela quantidade de commits ou pela posição de `MVP2` no histórico Git. É uma decisão normativa de governança e deve ser preservada como tal.

A designação de `MVP2` como baseline operacional não transforma `MVP2` em branch integrada, não autoriza merge e não altera a natureza normativa de `main` como autoridade de integração.

Lineage:

```text
main @ 86387b02...
    │
    ├── historical C1 execution model
    │       └── MVP
    │
    └── subsequent operational evolution
            └── MVP2
                │
                └── current operational baseline
                        │
                        └── controlled convergence → main
```

Novas implementações da fase atual devem utilizar feature branches baseadas no `MVP2` verificado, salvo decisão explícita em contrário. Nenhum documento de consenso concede autorização automática de implementação.

## 2. Estado comum confirmado

Os dois auditores convergem nos seguintes pontos:

1. `main` é a autoridade de integração.
2. Cada IA deve permanecer dentro de seu ownership.
3. `CONTRACT-001` continua `OPEN` e bloqueia somente os slices que codifiquem diretamente sua semântica.
4. `CONTRACT-002` continua `OPEN` e possui impacto condicionado aos slices que dependam da semântica contestada.
5. `GOV-001` é um **`CONDITIONAL_GOVERNANCE_GATE`**, não um hard blocker global.
6. O projeto não deve ser classificado como `GLOBAL GREEN`.
7. Documentação não constitui evidência de implementação.
8. Implementação não constitui evidência de testes.
9. Teste local não constitui evidência de CI verde.
10. Ausência de checks não constitui `GREEN`.
11. Contrato aprovado não implica autorização automática de implementação.
12. Slices tecnicamente independentes podem avançar em paralelo quando seus gates estiverem satisfeitos.

## 3. Modelo operacional consensual

### Parallel Controlled Tracks

O projeto não deve seguir uma fila linear por número de agente.

O próximo trabalho deve ser determinado pela combinação de:

- independência técnica;
- especificação suficiente;
- decisão humana quando necessária;
- autorização explícita de implementação;
- ownership inequívoco;
- testabilidade;
- reversibilidade;
- baixo risco de integração.

## 4. Estados que devem permanecer separados

Nunca inferir um estado a partir de outro.

```text
HUMAN_DECISION
    !=
IMPLEMENTATION_AUTHORIZATION
    !=
IMPLEMENTATION
    !=
VERIFICATION
    !=
IMPLEMENTATION_READINESS
    !=
INTEGRATION
    !=
MERGE_READINESS
    !=
MERGE
```

Regra explícita:

```text
IMPLEMENTATION_READINESS != MERGE_READINESS
```

Um slice pode estar corretamente implementado e testado localmente e ainda não estar `MERGE_READY` por ausência de CI, revisão, integração oficial ou outro gate aplicável.

O fato de um agente reportar `READY` não substitui os demais gates.

## 5. EventBus V1

`EventBus V1` é considerado `CLOSED_FOR_CURRENT_SCOPE`, `IMPLEMENTED`, `TESTED` e `BASELINE_FOR_DOWNSTREAM_INTEGRATION`.

Não deve retornar à fila de decisões sem evidência contraditória nova.

O próximo avanço de IA-03 está condicionado às dependências reais, especialmente persistência suficiente para `InboundInbox`.

## 6. Decisões humanas candidatas ao fechamento imediato

### IA-01 — Schema

`SD-001` a `SD-005`.

Objetivo: fechar somente as decisões físicas locais necessárias ao schema.

### IA-02 — Domain

`DREQ-001`, `DREQ-002`, `DREQ-005`, `DREQ-006`.

Objetivo: liberar o primeiro slice `Order + ConfirmOrder + DRAFT -> CONFIRMED + order.confirmed`, sem persistência, Outbox ou EventBus como requisito.

### IA-05 — Conversation / LLM

`DR-001`.

Objetivo: fechar o contrato tipado mínimo de `LLMProvider`, mantendo separada a autorização de implementação e sem transferir ownership de `packages/domain/**` para IA-05.

### IA-06 — Device Authentication

`DR-02A`.

Objetivo: fechar o boundary mínimo de verificação de assinatura Ed25519. `DR-02B` permanece aberto.

## 7. Trabalho paralelo elegível

### IA-02

Após aprovação das quatro decisões e autorização explícita, pode implementar somente o primeiro slice `Order + ConfirmOrder`.

Não pode inventar persistência, Outbox, EventBus durável ou schema.

### IA-05

Após `DR-001` aprovado e com autorização de implementação, pode iniciar exclusivamente o contrato/runtime delimitado pelo decision package e dentro do ownership efetivo definido para a tarefa.

**Aprovação de `DR-001` não concede ownership de `packages/domain/**` à IA-05.** Alterações nesse território permanecem sob IA-02 e coordenação da autoridade de integração.

Não iniciar automaticamente Conversation Engine completo, Tool Runtime, seleção de modelo ou persistence runtime.

### IA-06

Após `DR-02A` aprovado e autorizado, pode implementar apenas o `Signature Verification Boundary`.

Não precisa esperar sessão, enrollment completo, replay, rotation, Gateway ou runtime de Secure Storage para esse slice isolado, desde que o próprio contrato aprovado mantenha essas fronteiras fora do slice.

### IA-08

Pode avançar, mediante autorização explícita, com `AppShell Visual Foundation` estritamente local/visual.

Permitido: React bootstrap, layout, navegação, estados locais honestos e componentes visuais.

Proibido neste slice: APIs fictícias, IPC novo, SQLite, Gateway, regras de negócio e simulação de backend real.

### IA-04

O `Money slice` não deve ser tratado como workstream ativo do Order Engine. Ele permanece como pendência de verificação da infraestrutura transversal de testes e não é automaticamente um candidato a implementação/merge.

### IA-01

Continua consolidando respostas cross-agent e recalculando `TABLE-READINESS-MATRIX`. Não criar `0002` enquanto o schema não estiver determinístico.

### IA-03

EventBus V1 fechado para o escopo atual. Aguardará persistência suficiente para o próximo slice `InboundInbox`.

### IA-07

Permanece em `CONTROLLED_STANDBY`. O próximo trigger é a disponibilidade de artefatos executáveis verificáveis de IA-03 e/ou IA-06.

Não realizar deep audit amplo agora apenas como prevenção. Quando houver implementação concreta ou candidato real de integração, aplicar os acceptance gates e executar o deep runtime/security audit correspondente.

## 8. Shared Test Harness

O shared test harness é classificado como:

```text
TRANSVERSAL_PRIORITY
NOT_GLOBAL_IMPLEMENTATION_BLOCKER
```

Deve possuir owner explícito e ser corrigido em paralelo, com escopo mínimo e revisão apropriada.

Estado verificável do harness:

```text
OWNER_ASSIGNED
    ->
CHANGE_PROPOSED
    ->
CHANGE_IMPLEMENTED
    ->
OFFICIAL_SUITE_VERIFIED
    ->
CI_VERIFIED
```

A ausência de um estágio não deve ser mascarada por inferência. A pendência deixa de ser apenas uma prioridade administrativa quando a sua resolução for necessária para satisfazer o `MERGE_READINESS` de um slice específico.

Distinguir sempre:

```text
DIRECT_TEST
OFFICIAL_SUITE
CI
```

### Official Suite applicability

```text
OFFICIAL_SUITE_REQUIRED = TRUE
```
quando existir um caminho oficial de execução que cubra o tipo de teste/artefato do slice.

```text
OFFICIAL_SUITE_NOT_AVAILABLE
```
quando não existir caminho oficial aplicável.

```text
OFFICIAL_SUITE_NOT_REGISTERED
```
quando o teste existir, mas ainda não estiver incluído no caminho oficial.

Quando `OFFICIAL_SUITE_REQUIRED = TRUE`, a sua ausência pode impedir `MERGE_READY` para o slice afetado, mas não deve bloquear automaticamente trabalho independente que não dependa dessa cobertura.

## 9. IA-07 e segurança

Não executar agora um deep audit amplo como requisito preliminar absoluto.

IA-07 já possui acceptance gates. Quando IA-03 ou IA-06 fornecerem artefatos executáveis reais, aplicar acceptance gate e, se houver candidato real de integração, executar deep runtime/security audit.

Enquanto isso, IA-07 permanece em standby controlado.

## 10. Global Contracts and Conditional Gates

### CONTRACT-001

`DomainOutbox` ownership/scope/transaction semantics.

Classificação:

```text
GLOBAL_CONTRACT_OPEN
LOCALIZED_RUNTIME_BLOCKER
```

Impacto localizado aos slices que codifiquem diretamente essas semânticas.

### CONTRACT-002

`order.status_changed`.

Classificação:

```text
GLOBAL_CONTRACT_OPEN
CONDITIONAL_RUNTIME_BLOCKER
```

Impacto localizado aos slices que dependam da semântica contestada.

### GOV-001

Authority/versioning.

Classificação:

```text
CONDITIONAL_GOVERNANCE_GATE
```

Escalar apenas quando uma divergência documental mudar uma decisão técnica ou quando uma promoção normativa exigir autoridade explícita.

`GOV-001` não deve ser tratado como `HARD_BLOCKER` genérico.

## 11. Schema / Migration 0002

O schema não deve ser tratado como bloco indivisível.

Processo:

```text
SD-001..SD-005
    ->
owner responses
    ->
conflict detection
    ->
TABLE-READINESS-MATRIX
    ->
subconjunto determinístico
    ->
human approval
    ->
implementation authorization
    ->
ONLY THEN migration
```

A readiness parcial das tabelas não implica autorização automática para migration parcial.

Antes de qualquer DDL, verificar se a política de migrations permite aplicação parcial e qual é a unidade correta de versionamento.

`0002` permanece `NOT_AUTHORIZED`.

## 12. Primeiro merge

Não existe um agente numericamente obrigatório para o primeiro merge.

A seleção deve obedecer a:

```text
FIRST_MERGE_SELECTION =
EVIDENCE_BASED
NOT_TIME_BASED
NOT_AGENT_NUMBER_BASED
NOT_CODE_VOLUME_BASED
```

O primeiro candidato que atingir todos os gates relevantes torna-se elegível:

1. decisão/contrato aprovado, quando aplicável;
2. autorização explícita de implementação;
3. ownership/scope limpo;
4. testes diretos verificados;
5. suíte oficial verificada quando aplicável;
6. CI verificado quando aplicável;
7. revisão de segurança/arquitetura quando aplicável;
8. aprovação humana;
9. post-merge verification.

Candidatos atuais: IA-06 Signature Verification Boundary, IA-02 ConfirmOrder e IA-08 AppShell Visual Foundation.

O primeiro merge não é selecionado por preferência de processo nem por quem terminou primeiro; ele é selecionado pela primeira evidência suficiente de `MERGE_READINESS`.

## 13. Estratégia de merge

Cada merge deve representar uma unidade pequena e verificável.

```text
branch
  ->
contract/decision gate
  ->
authorization
  ->
implementation
  ->
direct tests
  ->
official suite when applicable
  ->
CI when applicable
  ->
security/architecture review when applicable
  ->
human approval
  ->
merge
  ->
post-merge audit
```

Regras:

```text
mergeable != correct
local test pass != CI green
contract approved != implementation authorized
implementation readiness != merge readiness
```

## 14. Consenso entre os dois auditores

### Agreements

- `Parallel Controlled Tracks`.
- EventBus V1 fechado no escopo atual.
- IA-02 pode avançar sem esperar schema quando o slice for puro.
- IA-05 e IA-06 podem ter decisões em paralelo.
- IA-08 pode avançar em UI local mediante autorização.
- IA-07 deve permanecer em standby controlado.
- IA-01 deve continuar schema consolidation em paralelo.
- Shared test harness é prioridade transversal, não blocker global.
- `0002` não está autorizada.
- CONTRACT-001 e CONTRACT-002 permanecem abertos e localizados.
- `GOV-001` é um gate de governança condicional, não um hard blocker geral.
- Implementation readiness e merge readiness são estados independentes.

### Divergences to resolve

Nenhuma divergência estrutural relevante entre os dois auditores sobre a estratégia geral após as correções acima.

Qualquer divergência futura deve ser registrada com:

```text
ITEM
POSITION_A
POSITION_B
EVIDENCE
IMPACT
RECOMMENDED_RESOLUTION
```

## 15. Estados de consenso

```text
CONSENSUS_STRUCTURE = ACCEPTED
CONSENSUS_EXECUTION_PLAN = DRAFT
PRODUCT_DECISIONS = NONE_APPLIED_BY_THIS_DOCUMENT
IMPLEMENTATION_AUTHORIZATION = NONE_BY_THIS_DOCUMENT
MERGE_AUTHORIZATION = NONE
```

Este documento não resolve nenhuma decisão humana pendente.

## 16. Shared Work / Ownership Rule

Uma decisão aprovada não transfere automaticamente ownership entre agentes.

Exemplos:

```text
DR-001 APPROVED
    !=
IA-05 OWNS packages/domain/**
```

Ownership permanece definido pelo registry e por autorizações explícitas da autoridade de integração.

Qualquer necessidade de alteração cross-agent deve ser registrada como dependência e autorizada antes da mudança.

## 17. Critério de saída do Shared Test Harness

O harness deve possuir owner explícito.

Para um slice que dependa do caminho oficial de testes, o estado esperado é:

```text
OWNER_ASSIGNED
CHANGE_PROPOSED
CHANGE_IMPLEMENTED
OFFICIAL_SUITE_VERIFIED
CI_VERIFIED
```

Para slices que não dependam da suíte oficial, a pendência do harness pode permanecer em paralelo sem impedir implementação, desde que o gate de merge desse slice seja satisfeito por sua estratégia de verificação aplicável.

## 18. Próximo ciclo proposto

### Agora

1. Operador revisa as opções dos decision packages.
2. Operador decide as decisões mínimas necessárias.
3. Owners registram as decisões aprovadas.

### Em paralelo

1. Shared test harness owner trabalha na correção mínima.
2. IA-08 pode ser autorizada para AppShell visual.
3. IA-01 continua consolidando schema readiness.
4. IA-07 permanece em standby.

### Após aprovação dos respectivos gates

1. Implementar slices independentes autorizados.
2. Testar diretamente.
3. Passar pelo runner oficial quando aplicável.
4. Executar CI quando aplicável.
5. Auditar.
6. Preparar PR.
7. Revisar e fazer merge somente após `MERGE_READINESS`.

## 19. Critério para considerar o plano FINAL

O plano só deve sair de `DRAFT` quando:

1. Auditor 1 registrar concordância final;
2. Auditor 2 registrar concordância final;
3. nenhuma divergência estrutural permanecer sem resolução;
4. o operador aprovar explicitamente o plano;
5. o documento for atualizado para `CONSENSUS_APPROVED / NOT_APPLIED`.

Somente depois disso o plano poderá ser usado como referência operacional do próximo ciclo.

## 20. Nota de governança

Este documento é uma ponte entre auditoria e execução.

Ele não substitui baseline, contratos, decision packages, branch governance, PR review, CI, security checks ou aprovação humana.

O objetivo é reduzir ambiguidade de processo sem criar autoridade técnica implícita.
