# KassisT — 15. BULK MESSAGING WITH CSV

## Objetivo

Criar uma aba para importar uma planilha CSV e preparar/envia mensagens de forma controlada, auditável e segura pelo canal WhatsApp suportado pelo Gateway.

## Importação

Campos mínimos esperados:

```text
recipient
name
message
```

Campos opcionais:

```text
customer_id
external_id
template_key
variables_json
scheduled_at
campaign_id
```

## Fluxo

```text
CSV Upload
  -> Parse
  -> Validate rows
  -> Deduplicate
  -> Preview
  -> Operator approval
  -> Queue
  -> Rate limit
  -> WhatsApp outbound
  -> Delivery status
  -> Audit log
```

## Segurança

- rejeitar fórmulas perigosas e conteúdo incompatível;
- limitar tamanho de arquivo e número de linhas;
- normalizar destinatários;
- não enviar automaticamente após upload;
- exigir confirmação explícita para início da campanha;
- não expor credenciais;
- respeitar política de opt-out/consentimento quando suportada;
- impedir reenvio duplicado por idempotency key.

## Estados de linha

```text
INVALID
READY
QUEUED
SENDING
SENT
FAILED
CANCELLED
DUPLICATE
SKIPPED
```

## Estados de campanha

```text
DRAFT
VALIDATING
READY
RUNNING
PAUSED
COMPLETED
FAILED
CANCELLED
```

## UI

A aba deverá apresentar:

- seletor de arquivo;
- resumo da importação;
- pré-visualização de linhas;
- erros por linha;
- filtro por estado;
- ação de validar;
- ação de iniciar envio;
- pausar/cancelar;
- relatório final;
- exportação de resultados.

## Regra de transporte

A aba não envia diretamente para WhatsApp. Ela cria jobs/itens de outbox e o Gateway permanece responsável pelo transporte.

## Critérios de aceitação

1. importar CSV;
2. validar e normalizar destinatários;
3. detectar duplicatas;
4. pré-visualizar;
5. exigir aprovação;
6. enfileirar de modo idempotente;
7. aplicar rate limiting;
8. registrar sucesso/erro;
9. permitir pausa/cancelamento;
10. produzir auditoria completa.
