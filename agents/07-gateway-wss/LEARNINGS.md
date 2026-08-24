# IA-07 — Learnings

## Auditoria inicial

- O território Gateway tem código mínimo; a maior parte do comportamento de HTTP/WSS está documentada em contratos, não implementada. FACT.
- A fronteira de transporte deve permanecer separada das regras determinísticas do Core. FACT.
- Durabilidade e ACK dependem da fronteira Inbox; o Gateway não deve tratar recebimento de rede como processamento concluído. FACT.
- Idempotência endpoint-specific não pode ser inventada enquanto as regras permanecerem ausentes. FACT.
- A camada de autenticação de dispositivo é deliberadamente separada de IA-07. FACT conforme ownership do registry.

## Auditoria HTTP/WSS — 2026-08-24

- `GET /health` possui implementação funcional e determinística; detalhes adicionais do contrato de resposta ainda são parcialmente especificados. FACT / PARTIAL.
- `GET /ready` possui implementação funcional com checks injetáveis, mas as predicates canônicas de readiness ainda são PARTIAL. FACT / PARTIAL.
- `GET /webhooks/whatsapp` e `POST /webhooks/whatsapp` permanecem PARTIAL/EXTERNAL: verificação Meta, payload, headers, assinatura, retry e idempotência endpoint-specific não estão completos. FACT.
- Os seis endpoints de dispositivo dependem da IA-06 e continuam PARTIAL/MISSING quanto a request/response, status, autorização e idempotência. FACT.
- `WSS v1` define versão, tipos de mensagem, envelope, ACK e parte da sequência/heartbeat; retenção, state-sync payload, jitter exato e limites de backpressure permanecem parciais ou ausentes. FACT.
- A implementação WSS de transporte continua NOT_IMPLEMENTED. FACT.
- A validação estrutural do envelope WSS v1 pode ser implementada sem abrir socket, executar autenticação, persistir Inbox/Outbox ou decidir semântica de negócio. INFERENCE suportada pelos contratos existentes.
- O incremento WSS implementado valida somente campos explicitamente definidos: versão 1.0, `message_id`, tipo normativo, `device_id`, `timestamp_utc`, `payload`, campos correlacionados opcionais e `ACK.event_id`. FACT.
- O contrato atual não estabelece formato específico de IDs, ISO estrito para timestamp, limites positivos de `sequence`, política para campos desconhecidos ou negociação de versão. Esses pontos permanecem PARTIAL/UNKNOWN e não devem ser inventados pelo runtime. FACT.

## Limites epistemológicos

- Detalhes não comprovados no runtime devem permanecer `NOT_VERIFIED`/`UNKNOWN`.
- A documentação de protocolo não prova que exista uma implementação funcional correspondente.
- Códigos de erro adicionais não devem ser tratados como normativos enquanto o catálogo completo permanecer MISSING/PARTIAL.
