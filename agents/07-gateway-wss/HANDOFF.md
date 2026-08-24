# IA-07 — Handoff

## Para assumir este território

1. Confirmar que a atribuição continua IA-07.
2. Ler `AGENT.md`, `SCOPE.md`, `OWNERSHIP.md`, `MEMORY.md`, `LEARNINGS.md`, `DECISIONS.md`, `ERRORS.md`, `PROGRESS.md` e este arquivo.
3. Reauditar `main` antes de qualquer implementação.
4. Verificar contratos protegidos vigentes; não confiar apenas neste registro histórico.
5. Confirmar dependências com IA-06, IA-03 e demais agentes envolvidos.
6. Confirmar branch e ownership antes de editar código.

## Estado de entrada — 2026-08-24

O Gateway possui `/health` e `/ready` implementados; webhooks e endpoints de dispositivo permanecem não implementados por insuficiência contratual/dependências. WSS de transporte continua NOT_IMPLEMENTED.

Foi acrescentado um validador estrutural puro em `gateway/src/wss-envelope.mjs` para o envelope WSS v1. Ele não substitui o runtime WSS.

## Dependências críticas

- IA-06: identidade/autenticação de dispositivo.
- IA-03: durabilidade, Inbox/Outbox/Queue/EventBus/Audit.
- IA-01: persistência/schema quando houver necessidade.
- IA-02/IA-04/IA-05: consumidores/produtores de capacidades de domínio, pedidos e conversa sem transferência de regras comerciais ao Gateway.
- IA-08: Desktop/WSS consumer.

## Auditoria contratual

HTTP:
- `/health`: runtime presente.
- `/ready`: runtime presente, readiness predicates ainda parciais.
- WhatsApp webhooks: EXTERNAL/PARTIAL; não inventar verificação Meta.
- Device endpoints: PARTIAL/BLOCKED; dependem de IA-06 e contratos incompletos.

WSS:
- envelope/version/message types: validação estrutural disponível.
- ACK/Inbox, AUTH/device identity, sequence/replay/resume/resync, heartbeat, backpressure e revocation: aguardam dependências/semântica suficiente.

## Bloqueios conhecidos

- CONTRACT-001.
- CONTRACT-002 quando semântica de `order.status_changed` afetar transporte.
- GOV-001 quando autoridade documental estiver em disputa.
- Regras endpoint-specific de Idempotency-Key.
- Catálogo completo de erros.
- Parâmetros de webhook/provider e limites numéricos de rate/backpressure.

## Regra de continuidade

Não implementar além do que os contratos aprovados sustentam. Se a próxima etapa exigir mudança fora do ownership, produzir solicitação formal com impacto e testes necessários.
