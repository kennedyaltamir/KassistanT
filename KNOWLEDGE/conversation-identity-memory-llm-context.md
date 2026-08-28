# KassisT Knowledge — Identity, Customer, Conversation, Memory and LLMContext

source_document: REGRAS/conversation-identity-memory-llm-context.md
source_status: PROPOSED
knowledge_status: PROPOSED
implementation_evidence: false

## Canonical separation

```text
IDENTITY != CUSTOMER != CONVERSATION != MEMORY != CONTEXT
```

## Identity

Identity é identidade técnica do canal.

LID/JID não são Customer.

A relação normativa é:

```text
Identity
→ Identity Observation
→ Identity Resolution
→ Customer Identity Binding
→ Customer
```

## Resolution

```text
CONFIRMED > OBSERVED > INFERRED > UNKNOWN
```

Inference não pode ser promovida silenciosamente a confirmação.

Dois Customers não podem ser fundidos somente por inferência.

## Customer

Customer é entidade de negócio pertencente a Store.

Customer pode possuir múltiplas identities e múltiplas Conversations.

## Conversation

Conversation é entidade independente de Customer e Message.

Customer 1:N Conversation.

A semântica de `external_thread_id` permanece pendente enquanto não houver comprovação suficiente.

## Message

Message permanece como fonte canônica dos eventos persistidos.

A idempotência existente baseada em `external_message_id` deve ser preservada.

## Memory

Memory não é History.

Memory não é Summary.

Memory não é Context.

Fluxo:

```text
Message
→ Memory Candidate
→ Memory Policy
→ Memory
→ Retrieval
→ LLMContext
```

Categorias:

```text
FACT
PREFERENCE
PROFILE
INSTRUCTION
TRANSACTION
INFERENCE
```

Inference nunca deve ser automaticamente tratada como Fact.

## Provenance

Associações críticas devem responder:

```text
Por que o sistema acredita nisso?
```

Provenance considera:

```text
source
source_message_id
source_event_reference
observed_at
verified_at
resolution_status
confidence
```

## LLMContext

LLMContext é projeção temporária e sanitizada:

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

Nunca incluir:

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

## LLM Authority

Arquitetura:

```text
Context Assembly
→ AI Policy / Authorization
→ LLM
→ Outbound Pipeline
```

LLM consome contexto.

LLM não é autoridade sobre identity, binding, lifecycle, persistence, credentials ou system permissions.

## Existing implementation and gaps

O sistema atual possui:

```text
store
customer
conversation
message
inbound_inbox
domain_outbox
```

A Message possui `external_message_id` e uma base de idempotência.

A persistência atual usa `message.jid` para derivar `phone_normalized`, o que é uma implementação existente e um GAP em relação ao modelo canônico de Identity.

`remoteJidAlt` foi observado experimentalmente e não constitui contrato público atual.

## Status

Este conhecimento é PROPOSTO.

Não constitui prova de implementação e não autoriza migration, schema change, runtime change ou LLM implementation.
