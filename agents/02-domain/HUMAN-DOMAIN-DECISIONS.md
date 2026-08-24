# IA-02 — Human Domain Decisions

## EXECUTIVE_SUMMARY

Objetivo: permitir ao operador decidir somente o necessário para liberar o primeiro slice do Domain Runtime, sem reabrir toda a auditoria D1.

Estado atual:
- Canonical entity count: 28.
- Nenhum aggregate root está normativamente congelado.
- `Order` é o candidato mais forte, mas permanece `INFERENCE`.
- `DRAFT -> CONFIRMED` está documentado como direção de negócio, mas não possui matriz normativa completa.
- `order.confirmed` é documentado; `order.status_changed` continua em conflito sob `CONTRACT-002`.
- DomainOutbox continua ambíguo sob `CONTRACT-001`.
- O pacote atual não autoriza implementação.

Conclusão operacional: o primeiro slice proposto continua `Order + ConfirmOrder + DRAFT -> CONFIRMED`, porém está `BLOCKED` até quatro decisões mínimas: DREQ-001, DREQ-002, DREQ-005 e DREQ-006.

## DECISION_REQUIRED_NOW

### DREQ-001 — Aggregate Boundary

**DECISION_ID**: DREQ-001

**TITLE**: Autorizar o aggregate boundary do primeiro slice.

**PROBLEM**: O repositório documenta Order-centric commands, lifecycle, invariants e confirmação, mas não congela explicitamente o root nem a ownership boundary dos filhos.

**CURRENT_EVIDENCE**:
- `Order` possui o maior conjunto de regras determinísticas documentadas.
- `OrderItem`, `OrderItemModifier` e `OrderStatusHistory` são entidades documentadas relacionadas ao pedido.
- Não existe aggregate root explícito no contrato atual.

**WHY_THIS_DECISION_IS_NEEDED**: Define mutation boundary, invariant boundary e a unidade lógica do primeiro teste/runtime.

**OPTIONS**

**OPTION_A**: Autorizar `Order` como aggregate root do primeiro slice, contendo somente os filhos necessários para `ConfirmOrder`.

Proposta mínima de filhos: `OrderItem` e os dados necessários ao cálculo/estado do pedido. `OrderStatusHistory` pode permanecer fora da primeira implementação se não for necessário para o comportamento puro.

**OPTION_B**: Autorizar aggregate menor, limitado ao estado mínimo necessário para confirmação.

**OPTION_C**: Adiar aggregate runtime e continuar somente documentação.

**RECOMMENDED_OPTION**: OPTION_A.

**WHY_RECOMMENDED**: É a menor boundary coerente com o domínio já documentado, sem obrigar o primeiro slice a absorver toda a persistência ou todo o Order Engine.

**BENEFITS**: Boundary explícita; testes determinísticos; reduz risco de espalhar invariants entre IA-02 e IA-04.

**RISKS**: Uma boundary incorreta exigirá refatoração posterior de persistência, concorrência e eventos.

**AFFECTED_AGENTS**: IA-02, IA-04, IA-01, IA-03.

**AFFECTED_CONTRACTS**: Domain model, persistence boundary e event boundary.

**AFFECTED_FILES**: IA-02 `packages/domain/**`; possíveis consumidores em IA-04. Nenhum arquivo externo deve ser alterado por esta decisão nesta fase.

**BLOCKING_SCOPE**: BLOCKING_FOR_FIRST_SLICE.

**REVERSIBILITY**: MÉDIA — refatorável antes de congelamento de persistência, difícil depois que schema/events dependerem da boundary.

**IMPLEMENTATION_CONSEQUENCE**: O runtime poderá modelar `Order` como root e manter infrastructure/application fora do aggregate.

**MINIMUM_DECISION_REQUIRED**: Aprovar ou rejeitar `Order` como root para o primeiro slice e listar os filhos efetivamente incluídos.

**WHAT_DOES_NOT_NEED_TO_BE_DECIDED_YET**: Aggregate boundaries de Conversation, Store, Device ou outros domínios futuros.

---

### DREQ-002 — First Normative Order Transition

**DECISION_ID**: DREQ-002

**TITLE**: Congelar a primeira transição normativa.

**PROBLEM**: Os estados `DRAFT` e `CONFIRMED` existem, mas a regra completa de transição não está congelada.

**CURRENT_EVIDENCE**:
- `CONFIRMED` é o milestone operacional da venda.
- Invalid transitions must be rejected.
- Confirmation requires final summary and unequivocal confirmation.

**WHY_THIS_DECISION_IS_NEEDED**: O runtime precisa de uma transição determinística que possa ser aceita ou rejeitada sem inferência.

**OPTIONS**

**OPTION_A**: Autorizar `DRAFT -> CONFIRMED` como primeira transição, com preconditions explícitas e nenhuma outra transição implementada no primeiro slice.

**OPTION_B**: Autorizar somente validações prévias sem mudança de lifecycle.

**OPTION_C**: Adiar runtime de lifecycle.

**RECOMMENDED_OPTION**: OPTION_A.

**WHY_RECOMMENDED**: É a única transição diretamente alinhada ao milestone operacional já aprovado e produz uma unidade de teste significativa.

**BENEFITS**: Slice pequeno; permite testar invariants e rejection deterministically.

**RISKS**: Sem actor/error/idempotency semantics completas, implementação seria incompleta.

**AFFECTED_AGENTS**: IA-02, IA-04, IA-03.

**AFFECTED_CONTRACTS**: Order lifecycle, command contract e domain events.

**AFFECTED_FILES**: `packages/domain/**` somente após aprovação.

**BLOCKING_SCOPE**: BLOCKING_FOR_FIRST_SLICE.

**REVERSIBILITY**: MÉDIA.

**IMPLEMENTATION_CONSEQUENCE**: Criar apenas a transição DRAFT→CONFIRMED; outras transições permanecem fora do slice.

**MINIMUM_DECISION_REQUIRED**: Aprovar a transição e confirmar que confirmação exige estado `DRAFT`, resumo final válido e confirmação inequívoca.

**WHAT_DOES_NOT_NEED_TO_BE_DECIDED_YET**: Produção, delivery, cancelamento e transições posteriores.

---

### DREQ-005 — Domain Error Semantic Contract

**DECISION_ID**: DREQ-005

**TITLE**: Definir o mínimo de semântica de erro para `ConfirmOrder`.

**PROBLEM**: Existem categorias de erro documentadas, mas não há catálogo global completo.

**CURRENT_EVIDENCE**:
- Invalid state transition.
- Duplicate operation.
- Incomplete confirmation data / validation failure.

**WHY_THIS_DECISION_IS_NEEDED**: O primeiro command precisa de resultados determinísticos e testes negativos sem depender de códigos globais ainda inexistentes.

**OPTIONS**

**OPTION_A**: Congelar apenas semântica local do primeiro slice e adiar códigos/mapping globais.

**OPTION_B**: Congelar semantic categories e stable codes globais agora.

**OPTION_C**: Adiar command runtime.

**RECOMMENDED_OPTION**: OPTION_A.

**WHY_RECOMMENDED**: Minimiza coupling e permite implementação posterior sem inventar um catálogo global prematuramente.

**BENEFITS**: Menor superfície de decisão; testes podem validar categoria/meaning.

**RISKS**: Mappings externos podem precisar de adaptação quando o catálogo global for aprovado.

**AFFECTED_AGENTS**: IA-02, IA-04, IA-03, IA-05.

**AFFECTED_CONTRACTS**: Command/error boundary.

**AFFECTED_FILES**: `packages/domain/**` após aprovação; mappings de IA-04 posteriormente.

**BLOCKING_SCOPE**: BLOCKING_FOR_FIRST_SLICE.

**REVERSIBILITY**: ALTA enquanto stable global codes não estiverem congelados.

**IMPLEMENTATION_CONSEQUENCE**: O primeiro slice pode retornar erros sem depender de um catálogo global final.

**MINIMUM_DECISION_REQUIRED**: Aprovar três semânticas mínimas: `INVALID_STATE`, `INVALID_CONFIRMATION` e `DUPLICATE_COMMAND`, sem exigir codes globais nesta etapa.

**WHAT_DOES_NOT_NEED_TO_BE_DECIDED_YET**: Catálogo completo de Product, Customer, Conversation, integration e transport errors.

---

### DREQ-006 — Actor / Authorization Boundary

**DECISION_ID**: DREQ-006

**TITLE**: Definir o boundary mínimo de actor para `ConfirmOrder`.

**PROBLEM**: A autorização completa do produto não está congelada e não deve ser inventada dentro do aggregate.

**CURRENT_EVIDENCE**:
- IA-04 executa Order behavior.
- IA-06 owns device identity/authentication.
- Gateway/UI do not own domain business rules.
- O domínio não possui matriz completa de permissões.

**WHY_THIS_DECISION_IS_NEEDED**: O primeiro command precisa deixar claro onde a autorização termina e onde o domínio começa.

**OPTIONS**

**OPTION_A**: Authorization remains application/boundary responsibility; domain receives only an already-authorized invocation/context and does not implement permission policy.

**OPTION_B**: Aggregate validates authorization internally.

**OPTION_C**: Defer actor-sensitive runtime.

**RECOMMENDED_OPTION**: OPTION_A.

**WHY_RECOMMENDED**: Preserva separação entre business rules e security/application policy e evita acoplamento com IA-06/07.

**BENEFITS**: Menor acoplamento; domínio permanece deterministicamente testável.

**RISKS**: A camada de aplicação precisa ser explicitamente responsável por autorização antes da chamada.

**AFFECTED_AGENTS**: IA-02, IA-04, IA-06, IA-07.

**AFFECTED_CONTRACTS**: Authorization boundary.

**AFFECTED_FILES**: Nenhuma mudança externa nesta fase.

**BLOCKING_SCOPE**: BLOCKING_FOR_FIRST_SLICE somente porque `ConfirmOrder` precisa de uma boundary explícita; não requer uma permission matrix global.

**REVERSIBILITY**: MÉDIA.

**IMPLEMENTATION_CONSEQUENCE**: `packages/domain` não consulta Gateway, device identity, UI ou permission store para executar a regra.

**MINIMUM_DECISION_REQUIRED**: Aprovar que o domínio não decide permissões; a aplicação chama o domínio somente após autorização externa estar satisfeita.

**WHAT_DOES_NOT_NEED_TO_BE_DECIDED_YET**: Matriz completa de roles/permissions, sessão de dispositivo e autorização do Gateway.

---

## DECISION_CAN_WAIT

### DREQ-003 — `order.status_changed`

**STATUS**: NON_BLOCKING_FOR_FIRST_SLICE.

O primeiro slice pode usar exclusivamente `order.confirmed`, já documentado, e não depender de `order.status_changed`. A existência normativa e eventual payload de `order.status_changed` deve ser resolvida antes de qualquer slice que o emita ou consuma.

**Minimum later decision**: definir se o evento é canônico, compatível/transicional ou removido do contrato normativo.

### DREQ-004 — DomainOutbox Ownership

**STATUS**: DEFERRED / NON_BLOCKING_FOR_PURE_SLICE.

O primeiro slice pode permanecer puramente in-memory e separado da persistência/delivery. A decisão de ownership torna-se obrigatória quando houver publicação durável, transaction boundary ou Gateway integration.

A recomendação arquitetural atual é manter domain event intent separado de durable delivery mechanics, mas isso continua PROPOSAL até decisão global.

## DECISION_NOT_REQUIRED

Não é necessário decidir agora:
- aggregate boundaries de Conversation, Store ou Device;
- lifecycle completo pós-CONFIRMED;
- schema completo de SQLite;
- Outbox/Inbox implementation;
- EventBus/JobQueue/Audit runtime;
- Gateway/WSS transport behavior;
- UI command projection;
- catálogo global completo de erros.

## BLOCKERS_FOR_FIRST_SLICE

1. DREQ-001 — aggregate boundary.
2. DREQ-002 — `DRAFT -> CONFIRMED`.
3. DREQ-005 — minimum command error semantics.
4. DREQ-006 — actor/authorization boundary.

DREQ-003 e DREQ-004 não bloqueiam este slice se o design aprovado explicitamente não depender deles.

## PROPOSED_FIRST_SLICE

**Aggregate**: `Order` — somente se DREQ-001 for aprovado.

**Command**: `ConfirmOrder`.

**Transition**: `DRAFT -> CONFIRMED`.

**Events**: `order.confirmed` somente; `order.status_changed` explicitamente fora do slice até DREQ-003.

**Persistence**: none in the pure domain implementation.

**Outbox**: none in the pure domain implementation.

**Authorization**: external/application boundary according to DREQ-006.

**Errors**: `INVALID_STATE`, `INVALID_CONFIRMATION`, `DUPLICATE_COMMAND` as semantic categories only, subject to DREQ-005 approval.

**Current readiness**: `READY_AFTER_FOUR_DECISIONS`.

## Operator Answer Sheet

O operador somente precisa responder:

- DREQ-001: A / B / C
- DREQ-002: A / B / C
- DREQ-005: A / B / C
- DREQ-006: A / B / C

DREQ-003: pode ser adiado.
DREQ-004: pode ser adiado.

A resposta destas quatro decisões não autoriza, por si só, merge ou implementação automática; após o recebimento, IA-02 deverá reauditar o slice e confirmar que nenhum requisito oculto permanece.
