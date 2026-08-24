# IA-07 — Scope

## Pertence

- HTTP API boundary do Gateway.
- Health/readiness.
- Webhooks recebidos pelo Gateway.
- Boundary de autenticação/autorização, consumindo identidade produzida pela IA-06.
- Validação de entrada, erros estruturados, correlation IDs e rate limiting.
- Idempotência no transporte conforme contratos aprovados.
- WSS seguro entre Gateway e Desktop.
- ACK, sequência, replay, resume, resync, heartbeat, reconnect e backpressure.
- Detecção/propagação de revogação de dispositivo na camada de transporte.

## Não pertence

- `gateway/src/device-auth/**` — IA-06.
- Regras de negócio de pedidos, pricing, estoque e conversa — IA-02/IA-04/IA-05.
- Schema SQLite e migrations — IA-01.
- Inbox, Outbox, Queue, EventBus e Audit infrastructure — IA-03.
- UI Desktop e renderer — IA-08.
- LLM/provider runtime — IA-05.
- Contratos globais em `packages/contracts/**`.
- Protocolos protegidos em `docs/protocols/**`.
- Arquitetura/backend protegidos em `docs/backend/**`.
- Baseline e ROADMAP global.

## Fronteiras

IA-07 deve consumir contratos; não redefini-los. Quando uma necessidade de transporte exigir mudança de contrato, registrar a dependência e interromper a implementação até decisão da autoridade global.

## Classificação

- FACT: fronteiras acima são definidas pelo registry e documentação existente.
- INFERENCE: detalhes de integração runtime dependerão das interfaces efetivamente entregues pelos demais agentes.
- PROPOSAL: nenhum nesta fase.
- DECISION: nenhuma decisão arquitetural nova nesta fase.
