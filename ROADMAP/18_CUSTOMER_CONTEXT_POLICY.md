# KassisT — 18. CUSTOMER CONTEXT POLICY

## Objetivo

Formalizar o controle sobre quais dados persistidos do cliente podem entrar no contexto de atendimento.

## Categorias

```text
NAME
PHONE
WHATSAPP_ID
PREFERENCES
RELEVANT_HISTORY
ORDER_HISTORY
RELATIONSHIP_INFO
ADDRESS
EMAIL
```

Cada categoria deve ter política:

```text
ALLOWED
DENIED
CONDITIONAL
```

## Boundary

```text
SQLite
  -> Customer/Conversation repositories
  -> Context Policy
  -> Context Builder
  -> redacted/reduced context
  -> LLM
```

A LLM não recebe conexão direta com banco, SQL, repository ou arquivo de persistência.

## Minimização

O Context Builder deve enviar somente os campos necessários à tarefa atual. Histórico completo, quando existente, não deve ser despejado integralmente no prompt.

## Privacidade operacional

- mascarar dados quando desnecessários;
- não enviar secrets;
- não confundir identificador técnico com nome apresentado;
- manter rastreabilidade da política aplicada;
- permitir revisão das categorias habilitadas pelo operador.

## Critérios de aceitação

1. política persistida;
2. seleção por categoria;
3. contexto construído pelo backend;
4. testes que provem exclusão de categorias proibidas;
5. histórico limitado por janela/relevância;
6. ausência de acesso direto da LLM ao banco.
