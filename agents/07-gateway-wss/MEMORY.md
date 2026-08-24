# IA-07 — Memory

Fatos permanentes confirmados:

1. O Gateway é fronteira pública de transporte/integração; não executa pricing, order, stock ou regras conversacionais.
2. O Desktop Core é responsável por regras determinísticas e SQLite.
3. O MVP não usa Event Sourcing/Event Store.
4. InboundInbox, DomainOutbox, JobQueue, EventBus e AuditLog são fronteiras de confiabilidade distintas.
5. InboundInbox deve ser durável antes do processamento; ACK ocorre após commit bem-sucedido.
6. O escopo de DomainOutbox entre Core local e Gateway é ambíguo sob CONTRACT-001.
7. A idempotência de operações críticas é obrigatória, mas regras endpoint-specific de `Idempotency-Key` ainda estão ausentes onde não definidas expressamente.
8. Os eventos de domínio atualmente declarados incluem `order.created`, `order.confirmed`, `order.status_changed` e `order.cancelled`.
9. O runtime HTTP atual possui `/health` e `/ready`; o restante da API HTTP continua não implementado.
10. O runtime WSS de transporte continua não implementado.
11. `gateway/src/device-auth/**` não pertence a IA-07.

## Memória operacional — 2026-08-24

- A auditoria HTTP confirmou dez operações normativas; somente `/health` está implementado com segurança suficiente para esta fase. `/ready` é funcional, porém as predicates canônicas de readiness permanecem parciais.
- Webhooks WhatsApp permanecem externos/parciais e não devem receber parâmetros de verificação Meta inventados.
- Endpoints de Device Enrollment/Auth/Revoke/Rotate/Status permanecem dependentes da IA-06 e de contratos incompletos.
- WSS v1 possui envelope estrutural suficiente para validação pura, mas não para ativar o transporte completo.
- Foi implementado `gateway/src/wss-envelope.mjs` como validador estrutural puro do contrato WSS v1, acompanhado de testes determinísticos.
- O validador não implementa handshake, autenticação, replay, resume, resync, heartbeat, backpressure ou persistência.
- O catálogo público de erros permanece PARTIAL/MISSING; códigos adicionais não devem ser tratados como normativos sem aprovação.
