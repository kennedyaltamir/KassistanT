# KassisT — Identity, Customer, Conversation, Memory and LLMContext

**Natureza:** contrato normativo arquitetural e funcional  
**Status:** CONTRATO PROPOSTO / PENDENTE DE REVISÃO E APROVAÇÃO  
**Escopo:** Identity, Customer, Customer Identity Binding, Identity Observation, Conversation, Message, Memory Candidate, Memory, Conversation Summary, LLMContext e LLM Authorization.

> Este documento define contratos, invariantes, responsabilidades e restrições para futuras migrations, runtime e testes. Não constitui prova de implementação e não autoriza implementação antes de revisão/aprovação.

---

## 1. Purpose and Scope

Este contrato define a separação normativa entre:

```text
IDENTITY != CUSTOMER != CONVERSATION != MEMORY != CONTEXT
```

O objetivo é impedir que a futura LLM receba contexto semanticamente incorreto por mistura de identidade técnica, entidade de negócio, conversa, histórico, memória derivada e estado de execução.

Pipeline canônico:

```text
WhatsApp Event
→ Event Classification
→ Identity Extraction
→ Identity Resolution
→ Customer Resolution
→ Conversation Resolution
→ Message Normalization
→ Durable Persistence
→ Conversation State
→ Memory Candidate
→ Memory Policy
→ Context Assembly
→ LLM Authorization
→ LLM
→ Outbound Pipeline
```

Esta regra é documental. Não implementa nenhuma dessas etapas.

---

## 2. Normative Language

| Termo | Significado |
|---|---|
| MUST | obrigação normativa |
| MUST NOT | proibição normativa |
| SHOULD | recomendação forte; desvio exige justificativa |
| SHOULD NOT | recomendação de evitar; desvio exige justificativa |
| MAY | comportamento permitido, não obrigatório |
| UNKNOWN | informação não estabelecida por evidência suficiente |

`UNKNOWN` MUST NOT ser promovido silenciosamente a fato.

Os estados documentais utilizados são:

```text
EXISTENTE
PARCIAL
PROPOSTO
NÃO IMPLEMENTADO
UNKNOWN
GAP
DECISION_PENDING
FUTURE / CHANGE UNIT
```

Documentação não substitui evidência de implementação.

---

## 3. Canonical Concepts

### Identity

Identity é uma identidade técnica externa observada através de um canal.

Identity não é Customer.

**Status: PROPOSTO.**

### Customer

Customer é entidade de negócio pertencente a Store.

Customer é independente da identidade técnica do canal.

**Status: EXISTENTE como entidade persistida; modelagem de identidade externa não fechada.**

### Customer Identity Binding

É a relação verificável entre Identity e Customer.

O Binding deve preservar evidência, confidence e provenance.

**Status: NÃO IMPLEMENTADO.**

### Identity Observation

É a evidência temporal de uma Identity observada através do canal.

Observation representa evidência histórica, não resolução definitiva automática.

**Status: NÃO IMPLEMENTADO.**

### Conversation

Conversation é unidade conversacional interna pertencente a Customer dentro de Store.

Customer e Conversation são entidades distintas.

Um Customer pode possuir múltiplas Conversations.

**Status: EXISTENTE como entidade persistida; semântica completa ainda não fechada.**

### Message

Message é o evento conversacional persistido.

Message pertence a Conversation.

**Status: EXISTENTE.**

### Memory Candidate

É uma proposta de informação derivada de evento ou conversa que pode ser analisada pela Memory Policy.

Candidate não é Memory validada.

**Status: NÃO IMPLEMENTADO.**

### Memory

É informação persistente aceita segundo Memory Policy.

Memory não é History.

Memory não é Context.

**Status: NÃO IMPLEMENTADO.**

### Conversation Summary

É síntese derivada de Conversation para recuperação contextual.

Summary pode ficar stale e não substitui o estado atual.

**Status: NÃO IMPLEMENTADO.**

### LLMContext

É projeção temporária, sanitizada e específica para uma execução da LLM.

LLMContext não é armazenamento permanente e não é evento bruto.

**Status: NÃO IMPLEMENTADO.**

---

## 4. Identity Model

A relação canônica é:

```text
WhatsApp Event
→ Identity Observation
→ Identity Resolution
→ Customer Identity Binding
→ Customer
```

Regra:

> LID e JID são identidades técnicas do canal e nunca identificam Customer diretamente.

A seguinte simplificação é proibida:

```text
LID/JID → Customer
```

O sistema deve manter a separação entre:

```text
identity type
identity value
observation
resolution
binding
customer
```

Durante diagnóstico controlado foi observado:

```text
remoteJid    = 246973638648023@lid
remoteJidAlt = 553798353530@s.whatsapp.net
```

Esse exemplo demonstra por que `remoteJid` isolado não deve ser tratado como chave semântica definitiva de Customer.

`remoteJidAlt` é evidência observada experimentalmente e não é considerado neste documento um contrato público existente do Gateway.

**Status: resolução pública LID/JID = UNKNOWN / GAP.**

---

## 5. Identity Observation

Identity Observation MUST representar temporalmente a evidência.

Mínimo conceitual:

```text
identity_type
identity_value
source
observed_at
source_message_id
resolution_status
confidence
```

Quando aplicável:

```text
source_event_reference
first_observed_at
last_observed_at
channel
```

O sistema deve conseguir responder:

```text
Por que esta Identity foi associada desta forma?
```

Uma nova Observation não deve apagar silenciosamente a anterior.

**Status: PROPOSTO.**

---

## 6. Identity Resolution

Níveis:

```text
CONFIRMED
OBSERVED
INFERRED
UNKNOWN
```

Precedência:

```text
CONFIRMED > OBSERVED > INFERRED > UNKNOWN
```

### CONFIRMED

Existe evidência suficiente segundo a policy vigente.

### OBSERVED

A relação foi efetivamente observada, sem autorização para extrapolação além da evidência.

### INFERRED

A relação resulta de inferência, correlação ou heurística.

### UNKNOWN

Não há evidência suficiente.

Regras:

```text
INFERRED não vira CONFIRMED silenciosamente.

Dois Customers não podem ser fundidos somente por inferência.

Conflito de identidade não pode ser resolvido por fusão silenciosa.

LLM não resolve Identity por autoridade própria.
```

**Status: PROPOSTO.**

---

## 7. Customer Model

Customer representa a entidade de negócio.

Customer é independente da identidade técnica do WhatsApp.

Customer não deve exigir exatamente um LID ou exatamente um JID.

Customer pode possuir múltiplas identidades.

Customer pode possuir múltiplas Conversations.

A identidade técnica e sua provenance devem ser representadas fora da autoridade primária do Customer.

**Status: Customer EXISTENTE; separação de identidade externa NÃO IMPLEMENTADA.**

---

## 8. Customer Identity Binding

Binding representa:

```text
Identity ↔ Customer
```

O Binding deve preservar:

```text
customer
identity
binding_status
confidence
provenance
created_at
updated_at
verified_at
```

Estados mínimos:

```text
CONFIRMED
OBSERVED
INFERRED
UNKNOWN
CONFLICTED
```

Promoção de INFERRED para CONFIRMED exige nova evidência válida.

Desassociação deve ser auditável.

Alterações devem preservar histórico suficiente para explicar a transição.

Binding deve ser idempotente.

**Status: NÃO IMPLEMENTADO.**

---

## 9. Conversation Model

Conversation é independente de Customer.

Cardinalidade normativa:

```text
Customer 1 → N Conversation
```

Uma Conversation possui Customer e Store.

Conversation não é simplesmente um JID.

### external_thread_id

Só possui autoridade quando sua semântica externa estiver comprovada.

A implementação atual usa `message.jid` como `external_thread_id`.

Isso é:

```text
IMPLEMENTAÇÃO EXISTENTE
+
GAP SEMÂNTICO
```

Não deve ser tratado como contrato externo comprovado sem evidência.

**Status: PARCIAL.**

---

## 10. Conversation Lifecycle

Conversation deve possuir estado operacional explícito.

Conceitualmente:

```text
lifecycle_state
ownership
ai_state
ai_enabled
ai_paused_reason
last_human_interaction_at
```

O schema atual possui:

```text
lifecycle_state = OPEN | CLOSED
ownership = AI | HUMAN
ai_state = ACTIVE | PAUSED | UNAVAILABLE
```

Esses estados são EXISTENTES.

A semântica completa de transição ainda é PARCIAL.

Nova mensagem pode:

```text
atualizar Conversation;
reabrir Conversation;
criar nova Conversation;
```

A decisão deve ser determinística e auditável.

Atividade conversacional não implica autorização da IA:

```text
message received ≠ AI authorized
```

---

## 11. Message Relationship

Message permanece a fonte canônica dos eventos persistidos.

Campos já existentes incluem:

```text
external_message_id
direction
message_type
text
raw_event_reference
correlation_id
causation_id
lifecycle_state
```

A implementação atual possui unicidade por:

```text
(store_id, external_message_id)
```

Essa idempotência deve ser preservada.

Não criar segunda fonte de verdade para Message apenas para resolver Identity.

Relação normativa:

```text
Message
→ Conversation
→ Customer
→ Customer Identity Binding
→ Identity
```

---

## 12. Memory Architecture

Separações obrigatórias:

```text
HISTORY != MEMORY CANDIDATE != MEMORY != SUMMARY != CONTEXT
```

Fluxo:

```text
Message
→ Memory Candidate
→ Memory Policy
→ Memory
→ Retrieval
→ LLMContext
```

History é fonte cronológica dos eventos.

Memory Candidate é proposta derivada.

Memory é informação aceita pela policy.

Summary é síntese derivada.

Context é projeção de execução.

Inference é informação não confirmada.

Inference MUST NOT virar Fact silenciosamente.

Memory MUST NOT substituir History.

Context MUST NOT substituir Memory.

**Status: NÃO IMPLEMENTADO.**

---

## 13. Memory Types

Categorias normativas:

```text
FACT
PREFERENCE
PROFILE
INSTRUCTION
TRANSACTION
INFERENCE
```

### FACT

Informação explicitamente informada ou confirmada.

### PREFERENCE

Preferência suportada por evidência suficiente.

### PROFILE

Informação de perfil.

### INSTRUCTION

Orientação autorizada.

### TRANSACTION

Informação ligada a estado de negócio ou transação.

### INFERENCE

Conclusão derivada sem confirmação suficiente.

`INFERENCE` não pode ser tratada como `FACT` automaticamente.

Persistência automática por categoria depende da Memory Policy.

Ausência de policy significa:

```text
UNKNOWN
```

**Status: PROPOSTO.**

---

## 14. Memory Authority

A autoridade é separada:

```text
LLM
  → pode propor

Memory Policy
  → pode validar

Persistence
  → pode persistir somente quando autorizado pela policy

Authorized Human/Product Action
  → pode confirmar, corrigir, invalidar ou excluir
```

LLM não é autoridade final sobre Memory.

LLM não pode:

```text
fundir Customers;
alterar Identity Binding;
alterar lifecycle;
alterar permissões;
alterar credenciais;
persistir fato fora da policy.
```

Memory deve suportar conceitualmente:

```text
confirm
update
invalidate
expire
delete
reconfirm
```

**Status: NÃO IMPLEMENTADO.**

---

## 15. Conflict Resolution

Precedência mínima:

```text
1. instrução operacional do sistema
2. estado transacional atual
3. informação explicitamente fornecida na interação atual
4. dados confirmados do Customer
5. memória confirmada
6. resumo da Conversation
7. inferência
```

Quando fontes conflitam:

```text
informação nova e explicitamente confirmada
>
memória anterior
>
summary
>
inference
```

Inferência conflitante não invalida fato confirmado.

Nova informação confirmada pode invalidar memória antiga.

A invalidação deve ser rastreável.

**Status: PROPOSTO.**

---

## 16. LLMContext

LLMContext é projeção temporária e sanitizada.

Estrutura mínima:

```text
customer
conversation
current_state
recent_messages
relevant_memories
active_order
business_context
user_message
```

Cada componente deve vir de fonte autorizada.

O contexto deve conter apenas informação relevante à execução.

Histórico completo não deve ser enviado automaticamente.

Memória completa não deve ser enviada automaticamente.

**Status: NÃO IMPLEMENTADO.**

---

## 17. LLM Context Security Boundary

Nunca incluir em LLMContext:

```text
creds
private keys
signal keys
authentication tokens
raw authentication state
Baileys auth state
raw WhatsApp event
database credentials
internal transport secrets
```

Elementos como:

```text
raw_event_reference
correlation_id
causation_id
external_message_id
```

pertencem à camada operacional e não são automaticamente conteúdo semântico da LLM.

A existência de `raw_event_reference` na persistência não autoriza exposição do evento bruto à LLM.

**Status: PROPOSTO.**

---

## 18. LLM Authorization

Fluxo normativo:

```text
Context Assembly
→ AI Policy / Authorization
→ LLM
→ Outbound Pipeline
```

A autorização deve ser decidida pelo Runtime/Policy.

Pode considerar:

```text
ai_enabled
ai_state
ownership
human handoff
blocked customer
business policy
operational restrictions
unsupported intent
```

LLM não decide sozinha se pode responder.

LLM não é autoridade sobre:

```text
identity
customer binding
conversation lifecycle
persistence
permissions
credentials
message delivery
tool authorization
```

**Status: PARCIAL.**

---

## 19. Idempotency

Idempotência deve existir para:

```text
identity observation
identity resolution
customer resolution
customer identity binding
conversation resolution
message persistence
memory persistence
context assembly
```

Reprocessamento do mesmo evento deve ser determinístico enquanto as evidências relevantes permanecerem iguais.

A Message já possui base de idempotência via `external_message_id`.

As demais camadas são requisitos futuros.

**Status: Message EXISTENTE; demais camadas PROPOSTAS.**

---

## 20. Provenance

Toda associação crítica deve permitir responder:

```text
Por que o sistema acredita nisso?
```

Mínimo conceitual:

```text
source
source_message_id
source_event_reference
observed_at
verified_at
resolution_status
confidence
```

Provenance deve acompanhar pelo menos:

```text
Identity Observation
Customer Identity Binding
Memory Candidate
Memory
Summary-derived assertions
```

**Status: PROPOSTO.**

---

## 21. Authority Matrix

| Camada | Identity | Customer | Binding | Observation | Conversation | Message | Memory Candidate | Memory | Context | Authorization |
|---|---|---|---|---|---|---|---|---|---|---|
| WhatsApp/Baileys | produz evento | não | não | evidência | não | produz evento | não | não | não | não |
| Gateway | extrai/resolutiona conforme contrato | resolve conforme policy | respeita/solicita | registra | resolve | normaliza | pode propor | não é autoridade final | não | fornece estado |
| Persistence | persiste | persiste | persiste | persiste | persiste | persiste | conforme contrato futuro | conforme policy | não | não |
| Memory Policy | lê | lê | lê | lê | lê | lê | valida | valida/invalida | não | não |
| Context Assembly | lê | lê | lê | lê | lê | lê | não | recupera | cria | não |
| LLM | consome | consome | consome | consome quando projetado | consome | consome | propõe | propõe | consome | não |
| Authorized Human/Product | confirma/corrige | confirma/corrige | confirma/corrige | audita | opera | opera | revisa | confirma/corrige/invalida | não | autoriza conforme produto |

Nenhuma camada recebe autoridade implícita apenas por possuir acesso técnico.

---

## 22. Invariants

```text
Identity não é Customer.

Customer não é Conversation.

Conversation não é Message.

Memory não é History.

Memory não é Context.

Summary não é fonte de verdade superior ao estado atual.

Inference não é Confirmed Fact.

LID/JID não identifica Customer diretamente.

Identidades não são fundidas somente por inferência.

Toda associação crítica possui provenance.

Toda resolução crítica possui confidence/status.

Message não chega à LLM sem vínculo contextual válido.

LLMContext não contém autenticação técnica.

Raw WhatsApp event não entra diretamente no LLMContext.

LLM não é autoridade de sistema.

Atividade conversacional não implica autorização da IA.

Customer pode possuir múltiplas identities.

Customer pode possuir múltiplas Conversations.

Reprocessamento idempotente não cria entidades semânticas duplicadas.

UNKNOWN não pode ser apresentado como fato confirmado.

Conflitos de identidade não são resolvidos por fusão silenciosa.

Contexto não vira memória automaticamente.
```

---

## 23. Failure Modes

### Identity desconhecida

Manter `UNKNOWN`. Não fabricar Customer.

### Conflito LID/JID

Registrar conflito e impedir fusão automática quando a evidência for insuficiente.

### Customer ambíguo

Não associar arbitrariamente.

### Conversation ambígua

Não escolher Conversation silenciosamente.

### Memory conflitante

Aplicar precedência, provenance e temporalidade.

### Contexto incompleto

Marcar a ausência ou negar autorização quando a informação faltante for necessária.

### Authorization negada

Bloquear execução dependente da autorização.

### Dados inconsistentes

Falhar fechando a operação crítica ou registrar inconsistência explícita.

**Status: PROPOSTO.**

---

## 24. Privacy and Data Minimization

LLMContext deve conter somente dados relevantes para a tarefa.

Authentication state permanece fora do contexto.

Raw event permanece fora do contexto.

Dados técnicos sem utilidade semântica não devem ser enviados à LLM.

Preferir:

```text
projeção relevante
>
histórico bruto
```

**Status: PROPOSTO.**

---

## 25. Lifecycle and Temporal Semantics

Identity Observation deve possuir temporalidade:

```text
observed_at
first_observed_at
last_observed_at
```

Binding deve possuir temporalidade e histórico.

Memory deve suportar, conforme necessidade:

```text
valid_from
valid_until
last_confirmed_at
invalidated_at
```

Summary é potencialmente stale.

Conversation lifecycle é independente de Memory lifecycle.

Informação mais nova e explicitamente confirmada deve prevalecer sobre memória antiga conflitante.

**Status: PROPOSTO.**

---

## 26. Future Migration Constraints

Toda migration futura derivada deste contrato deve:

1. separar Identity de Customer;
2. representar Customer Identity Binding;
3. representar Identity Observation;
4. permitir múltiplas identities por Customer;
5. preservar provenance;
6. preservar confidence/status;
7. preservar idempotência;
8. manter Customer e Conversation distintos;
9. manter Message como fonte canônica;
10. preservar `external_message_id`;
11. não criar segunda fonte de verdade para mensagens;
12. não introduzir autenticação em LLMContext.

A migration futura deve reconciliar o uso atual de `message.jid` para `phone_normalized`.

Esta regra não cria migration.

**Status: FUTURE / CHANGE UNIT.**

---

## 27. Future Runtime Constraints

Runtime futuro deve respeitar:

```text
WhatsApp Event
→ Event Classification
→ Identity Extraction
→ Identity Resolution
→ Customer Resolution
→ Conversation Resolution
→ Message Normalization
→ Durable Persistence
→ Conversation State
→ Memory Candidate
→ Memory Policy
→ Context Assembly
→ LLM Authorization
→ LLM
→ Outbound Pipeline
```

Identity resolution ocorre antes da LLM.

Customer resolution não é delegada à LLM.

Memory Policy ocorre antes de Context Assembly.

Authorization ocorre antes da LLM.

Renderer não assume autoridade sobre Identity, auth state ou Baileys.

**Status: FUTURE / CHANGE UNIT.**

---

## 28. Acceptance Criteria

```text
[ ] Identity está separada de Customer.
[ ] Customer Identity Binding está definido.
[ ] Identity Observation está definido.
[ ] Identity Resolution está definido.
[ ] CONFIRMED, OBSERVED, INFERRED e UNKNOWN estão definidos.
[ ] Precedência de resolução está definida.
[ ] Fusão por inferência está proibida.
[ ] Provenance está definida.
[ ] Confidence está definida.
[ ] Customer é independente da identidade técnica.
[ ] Customer pode possuir múltiplas identities.
[ ] Customer pode possuir múltiplas Conversations.
[ ] Conversation é entidade independente.
[ ] external_thread_id só tem autoridade com semântica comprovada.
[ ] Message continua como fonte canônica.
[ ] external_message_id continua idempotente.
[ ] Memory Candidate está separado de Memory.
[ ] Memory está separado de History.
[ ] Summary está separado de Memory.
[ ] LLMContext está separado de Memory.
[ ] Memory Policy está definida.
[ ] Memory Authority está definida.
[ ] Precedência de conflito está definida.
[ ] Temporal semantics estão definidas.
[ ] LLM Authorization está definida.
[ ] Authentication state está fora do LLMContext.
[ ] Raw WhatsApp event está fora do LLMContext.
[ ] Failure modes estão definidos.
[ ] Gaps estão explícitos.
[ ] Decisions Pending estão explícitas.
[ ] Future migration constraints estão registradas.
[ ] Future runtime constraints estão registradas.
```

---

## 29. Known Gaps and Decisions Pending

### GAP-001

Não existe entidade canônica explícita de Identity.

### GAP-002

Não existe Identity Observation persistida.

### GAP-003

Não existe Customer Identity Binding explícito.

### GAP-004

A resolução LID/JID não constitui contrato público atual.

### GAP-005

A persistência atual deriva `phone_normalized` de `message.jid`.

### GAP-006

Semântica completa de Conversation lifecycle ainda não está fechada.

### GAP-007

Memory Candidate, Memory e Memory Policy não estão implementados.

### GAP-008

Conversation Summary não está implementado.

### GAP-009

LLMContext não possui implementação canônica.

### GAP-010

LLM Authorization completa ainda não está implementada.

### DECISION_PENDING-001

Critérios objetivos para promover OBSERVED/INFERRED a CONFIRMED.

### DECISION_PENDING-002

Semântica definitiva de `external_thread_id`.

### DECISION_PENDING-003

Categorias de Memory auto-persistíveis.

### DECISION_PENDING-004

Quais memórias exigem confirmação humana.

### DECISION_PENDING-005

Reconciliação de Customers históricos com Identity Bindings.

---

## 30. Implementation Prohibition Before Approval

Até revisão e aprovação formal:

```text
NÃO criar migration.
NÃO alterar schema.
NÃO alterar runtime.
NÃO alterar Baileys.
NÃO alterar Renderer.
NÃO implementar Memory runtime.
NÃO implementar LLMContext runtime.
NÃO implementar LLM Authorization runtime.
NÃO alterar testes para acomodar este contrato.
NÃO criar segunda fonte de verdade para Message.
```

Qualquer implementação posterior deve ocorrer por Change Unit explicitamente autorizada.

---

## Existing Contract Relationship

Este documento complementa:

```text
REGRAS/README.md
REGRAS/abas/configuracoes/whatsapp.md
```

A regra de WhatsApp continua sendo autoridade sobre:

```text
Gateway ownership
Baileys
session
auth state
credentials
connection
QR
```

Este documento define a camada posterior de:

```text
Identity
Customer
Conversation
Memory
Context
LLM Authorization
```

Não substitui contratos existentes sem Change Unit.
