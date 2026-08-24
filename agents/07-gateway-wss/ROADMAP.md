# IA-07 — Roadmap

Este roadmap é exclusivo do território IA-07 e não substitui o ROADMAP global.

## Fase 0 — Configuração

- Auditoria do Gateway/WSS.
- Definição de ownership.
- Registro de dependências, riscos e contratos.
- Status: CONCLUÍDA nesta execução.

## Fase 1 — Pré-condições

- Confirmar contratos HTTP/WSS vigentes.
- Confirmar interface de identidade fornecida pela IA-06.
- Confirmar fronteiras Inbox/Outbox/EventBus fornecidas pela IA-03.
- Confirmar necessidades de persistência sem assumir ownership do schema.
- Resolver ou obter decisão formal para ambiguidades que bloqueiem implementação.

## Fase 2 — Runtime HTTP

- Implementação somente após autorização para sair do implementation freeze.
- Health/readiness, validação, erros, correlation, rate limiting, webhooks e idempotência conforme contratos aprovados.

## Fase 3 — Runtime WSS

- Implementação somente após contratos e dependências confirmados.
- Sessão segura, ACK, sequence, replay/resume/resync, heartbeat/reconnect e backpressure conforme protocolo aprovado.

## Fase 4 — Integração e validação

- Testes unitários e de integração do território.
- Validação de segurança e observabilidade.
- Testes de interoperabilidade com Desktop e demais fronteiras.
- PR, revisão e aprovação humana.

## Bloqueio permanente

Nenhuma fase de implementação deve começar se exigir redefinição silenciosa de contrato global.
