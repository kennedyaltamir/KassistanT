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
- Status: EM ANDAMENTO; auditoria HTTP/WSS, fechamento do envelope estrutural, boundary audit, integration gate package e acceptance gate definition concluídos.

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

## Integration gate — 2026-08-24

A primeira implementação funcional do lifecycle WSS está condicionada a gates objetivos:

1. IA-06 fornece interface executável de authenticated session.
2. IA-06 fornece sinal executável de revogação.
3. IA-06 fecha reconnect/reauthentication semantics.
4. IA-03 fornece durable intake result.
5. IA-03 fornece ACK authorization boundary.
6. O escopo V1 de replay/resume é pronto ou explicitamente deferido.
7. Sequence ownership e duplicate/gap semantics estão fechados para o slice escolhido.
8. Backpressure possui semântica mínima sem números inventados.
9. Error-to-connection/session effects são testáveis sem novo catálogo global.
10. Testes determinísticos do lifecycle podem ser escritos.

Artefatos:
- `WSS-INTEGRATION-GATE.md`
- `WSS-IA06-CONTRACT.md`
- `WSS-IA03-CONTRACT.md`
- `WSS-RUNTIME-V1-REQUIREMENTS.md`

## Dependency acceptance gate — 2026-08-24

- `WSS-DEPENDENCY-ACCEPTANCE.md` define quatro resultados operacionais: `ACCEPTED`, `ACCEPTED_WITH_GAPS`, `REJECTED`, `NOT_VERIFIED`.
- IA-06 somente pode ser aceita quando os gates necessários do slice selecionado forem executáveis/testáveis.
- IA-03 somente pode ser aceita quando durable intake e ACK forem executáveis/testáveis; replay pode ser explicitamente deferido para V1.
- Uma nova revisão de IA-06/IA-03 será validada por branch + commit + artefatos do gate, sem repetir a auditoria global salvo conflito de evidência.

## Próximo marco

Aguardar as interfaces executáveis de IA-06 e IA-03. Reavaliar a matriz de aceitação e classificar cada dependência antes de qualquer runtime WSS.

## Bloqueio permanente

Nenhuma fase de implementação deve começar se exigir redefinição silenciosa de contrato global ou duplicação de ownership entre IA-06, IA-07 e IA-03.
