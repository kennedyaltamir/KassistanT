# IA-07 — Roadmap

Este roadmap é exclusivo do território IA-07 e não substitui o ROADMAP global.

## Fase 0 — Configuração

- Auditoria do Gateway/WSS.
- Definição de ownership.
- Registro de dependências, riscos e contratos.
- Status: CONCLUÍDA.

## Fase 1 — Pré-condições

- Confirmar contratos HTTP/WSS vigentes.
- Confirmar interface de identidade fornecida pela IA-06.
- Confirmar fronteiras Inbox/Outbox/EventBus fornecidas pela IA-03.
- Confirmar necessidades de persistência sem assumir ownership do schema.
- Resolver ou obter decisão formal para ambiguidades que bloqueiem implementação.
- Status: EM ANDAMENTO; auditoria HTTP/WSS, fechamento do envelope estrutural e boundary audit entre IA-06/IA-07/IA-03 concluídos.

## Fase 2 — Runtime HTTP

- `/health`: IMPLEMENTADO.
- `/ready`: IMPLEMENTADO com checks injetáveis; predicates canônicas permanecem PARTIAL.
- Webhooks, device endpoints e restante da API: aguardam contratos suficientes.
- Não implementar parâmetros Meta, schemas, idempotência ou rate limits ausentes.

## Fase 3 — Runtime WSS

- Validação estrutural do envelope v1: IMPLEMENTADA.
- Transporte, handshake, AUTH, session lifecycle, ACK, sequence, replay/resume/resync, heartbeat, backpressure e revocation: BLOQUEADOS por dependências e contratos parciais.
- `WSS connection lifecycle abstraction`: proposta, atualmente BLOCKED.

## Fase 4 — Integração e validação

- Testes unitários e de integração do território.
- Validação de segurança e observabilidade.
- Testes de interoperabilidade com Desktop e demais fronteiras.
- PR, revisão e aprovação humana.

## Boundary gate — 2026-08-24

- IA-06: autoridade de device identity/authentication/revocation/key rotation; session identity existe na sua fronteira, mas os detalhes executáveis ainda estão incompletos.
- IA-07: autoridade de WSS connection/transport mechanics após identidade autenticada ser fornecida.
- IA-03: autoridade de InboundInbox, durable ACK, deduplication e replay/recovery.
- IA-08: consumidor de estado/eventos de conexão na camada de UI.

Artefatos produzidos:
- `WSS-INTEGRATION-BOUNDARY.md`
- `WSS-SESSION-DECISION-MATRIX.md`

## Próximo marco

Obter uma interface executável de IA-06 para sessão/autenticação/reconexão/revogação e interfaces de IA-03 para durable intake/ACK/replay. Só então reavaliar `WSS connection lifecycle abstraction`.

## Bloqueio permanente

Nenhuma fase de implementação deve começar se exigir redefinição silenciosa de contrato global ou duplicação de ownership entre IA-06, IA-07 e IA-03.
