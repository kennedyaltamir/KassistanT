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

- A auditoria HTTP confirmou dez operações normativas; somente `/health` possui semântica suficientemente estável para implementação imediata. `/ready` é funcional, porém as predicates canônicas de readiness permanecem parciais.
- Webhooks WhatsApp permanecem externos/parciais e não devem receber parâmetros de verificação Meta inventados.
- Endpoints de Device Enrollment/Auth/Revoke/Rotate/Status permanecem dependentes da IA-06 e de contratos incompletos.
- WSS v1 possui definição estrutural suficiente para validação pura, mas não para ativar o transporte completo.
- `gateway/src/wss-envelope.mjs` implementa validação estrutural alinhada ao envelope explicitamente declarado em `packages/contracts/src/wss.ts` e `docs/protocols/wss-v1.md`.
- O envelope valida presença e tipo básico dos campos definidos, mas não pode assumir formato específico de IDs, formato ISO estrito de timestamp, limites positivos de `sequence`, política de campos desconhecidos ou negociação de versão, porque essas regras não estão explicitadas no contrato atual.
- ACK significa somente confirmação de persistência durável no `InboundInbox`; não significa conclusão de processamento de negócio.
- O validador não implementa handshake, autenticação, replay, resume, resync, heartbeat, backpressure ou persistência.
- O catálogo público de erros permanece PARTIAL/MISSING; códigos adicionais não devem ser tratados como normativos sem aprovação.

## Session / integration gate — 2026-08-24

- IA-06 is the authority for device identity, enrollment, Ed25519 proof-of-possession, authentication verification, revocation and key rotation. IA-07 consumes the authenticated outcome and owns generic WSS transport mechanics. 
- IA-06 must provide an executable/testable authenticated-session boundary before IA-07 can implement a session lifecycle. Minimum required evidence: authoritative `device_id`, authentication result, definitive `session_id` if sessions exist, explicit expiry semantics if applicable, revocation signal and reconnect/reauthentication rule.
- IA-03 is the authority for InboundInbox, deduplication, durable ACK boundary, replay/recovery and event infrastructure. IA-07 must consume a testable durable-intake result with persisted/duplicate/failure outcomes and explicit ACK authorization.
- Replay/resume/recovery may be deferred for the first V1 lifecycle slice only if the selected delivery contract explicitly allows that deferral. Sequence ownership and duplicate/gap behavior must still be explicit for any feature implemented.
- Backpressure must have minimum behavioral semantics before runtime; numeric thresholds are not to be invented locally.
- IA-07 must not implement competing Inbox, Outbox, replay storage, cryptographic verification or session authority.
- `WSS-INTEGRATION-GATE.md`, `WSS-IA06-CONTRACT.md`, `WSS-IA03-CONTRACT.md` and `WSS-RUNTIME-V1-REQUIREMENTS.md` are the operational gate package for the next runtime phase.
