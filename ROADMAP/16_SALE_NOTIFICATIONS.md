# KassisT — 16. SALE AND ADMINISTRATOR NOTIFICATIONS

## Objetivo

Notificar o administrador quando uma venda for realmente consumada segundo o contrato comercial do KassisT.

## Evento de negócio

A notificação deve ser consequência de um evento de domínio/comercial confirmado, nunca da interpretação isolada da LLM.

```text
Order Draft
  -> ConfirmOrder
  -> Commercial Result
  -> order.confirmed / sale.completed
  -> DomainOutbox
  -> Notification Worker
  -> Administrator Channel
```

## Regra fundamental

A frase da LLM "venda realizada" não é suficiente para disparar notificação. O Core deve produzir a evidência de que o pedido atingiu o estado comercial definido como venda consumada.

## Conteúdo mínimo

```text
Venda confirmada
Pedido: <display number>
Cliente: <authorized display name>
Total: R$ <amount>
Canal: WhatsApp
Data/hora: <UTC/localized>
Itens: <summary>
``` 

Nenhum segredo ou dado excessivo deve ser enviado.

## Canais possíveis

Arquitetura extensível para:

```text
WHATSAPP_ADMIN
EMAIL
DESKTOP_NOTIFICATION
WEBHOOK
```

Somente canais realmente implementados devem aparecer como disponíveis.

## Preferências

O administrador poderá configurar:

- habilitado/desabilitado;
- canal;
- destinatário autorizado;
- resumo detalhado ou reduzido;
- eventos observados;
- janela de silêncio futura, se implementada.

## Idempotência

Uma mesma venda não pode gerar notificações duplicadas devido a retry do worker. Utilizar chave determinística baseada no evento comercial.

## Falha

Falha de notificação não pode desfazer a venda. O evento permanece no outbox para retry conforme política operacional.

## Critérios de aceitação

1. evento comercial real dispara job;
2. job é idempotente;
3. conteúdo é sanitizado;
4. canal é configurável;
5. retry não duplica notificação;
6. falha é observável;
7. venda permanece confirmada mesmo que notificação falhe;
8. auditoria registra envio e resultado.
