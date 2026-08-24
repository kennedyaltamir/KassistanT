# IA-07 — Memory

Fatos permanentes confirmados:

1. O Gateway é fronteira pública de transporte/integração; não executa pricing, order, stock ou regras conversacionais. fileciteturn56file0L2-L2
2. O Desktop Core é responsável por regras determinísticas e SQLite. fileciteturn56file0L2-L2
3. O MVP não usa Event Sourcing/Event Store. fileciteturn56file0L2-L2
4. InboundInbox, DomainOutbox, JobQueue, EventBus e AuditLog são fronteiras de confiabilidade distintas. fileciteturn56file0L2-L2
5. InboundInbox deve ser durável antes do processamento; ACK ocorre após commit bem-sucedido. fileciteturn55file0L2-L2
6. O escopo de DomainOutbox entre Core local e Gateway é ambíguo sob CONTRACT-001. fileciteturn55file0L2-L2
7. A idempotência de operações críticas é obrigatória, mas regras endpoint-specific de `Idempotency-Key` ainda estão ausentes onde não definidas expressamente. fileciteturn57file0L2-L2
8. Os eventos de domínio atualmente declarados incluem `order.created`, `order.confirmed`, `order.status_changed` e `order.cancelled`. fileciteturn58file0L2-L2
9. O runtime HTTP atual é skeleton e responde 404. fileciteturn51file0L2-L2
10. O runtime WSS atual não está implementado. fileciteturn53file0L2-L2
11. `gateway/src/device-auth/**` não pertence a IA-07.
