# 04 — ARCHITECTURE AND RUNTIME

## Fluxo de referência

WhatsApp inbound → Gateway → Inbox/dedup → Core application service → Customer → Conversation → Message → Product → Order Draft → Address → Payment → Availability → Pricing → Confirm → Commercial Result → DomainOutbox → Gateway worker → WhatsApp outbound

## Regra

Este fluxo é referência arquitetural. Não prova que cada etapa está implementada.

A auditoria deve distinguir:

- contrato;
- implementação real;
- integração real;
- mock/stub/skeleton;
- código não conectado;
- código morto.

## Responsabilidades

Domínio, persistência e transporte devem permanecer claramente separados.

O Gateway não deve assumir autoridade indevida sobre regras de negócio.

O Electron deve ser tratado como aplicação de interface e infraestrutura local quando aplicável.

SQLite deve ser analisado pelo caminho de inicialização real, pelo migration runner e pelos repositórios efetivamente conectados.