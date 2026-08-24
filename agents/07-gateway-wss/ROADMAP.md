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
- Status: EM ANDAMENTO; auditoria HTTP/WSS e fechamento do envelope estrutural concluídos.

## Fase 2 — Runtime HTTP

- `/health`: IMPLEMENTADO.
- `/ready`: IMPLEMENTADO com checks injetáveis; predicates canônicas permanecem PARTIAL.
- Webhooks, device endpoints e restante da API: aguardam contratos suficientes.
- Não implementar parâmetros Meta, schemas, idempotência ou rate limits ausentes.

## Fase 3 — Runtime WSS

- Validação estrutural do envelope v1: IMPLEMENTADA.
- Transporte, handshake, AUTH, ACK, sequence, replay/resume/resync, heartbeat, backpressure e revocation: BLOQUEADOS por dependências e contratos parciais.
- O próximo slice proposto é `WSS connection lifecycle abstraction`, atualmente BLOCKED.

## Fase 4 — Integração e validação

- Testes unitários e de integração do território.
- Validação de segurança e observabilidade.
- Testes de interoperabilidade com Desktop e demais fronteiras.
- PR, revisão e aprovação humana.

## Próximo marco

Obter interfaces executáveis de IA-06 para identidade/sessão e IA-03 para durabilidade/ACK/replay, além de fechar as semânticas parciais de recuperação e backpressure, antes de iniciar runtime WSS funcional.

## Bloqueio permanente

Nenhuma fase de implementação deve começar se exigir redefinição silenciosa de contrato global.
