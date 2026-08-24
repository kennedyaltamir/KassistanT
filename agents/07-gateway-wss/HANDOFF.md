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

## Fechamento do envelope WSS

O envelope está suficientemente estável para validação estrutural, não para transporte funcional.

Explicitamente suportado:
- `protocol_version = 1.0`.
- enumeração atual de `message_type`.
- presença/tipo básico de `message_id`, `device_id`, `timestamp_utc` e `payload`.
- campos opcionais `event_id`, `correlation_id`, `causation_id` quando presentes.
- `sequence` como número quando presente.
- `ACK.payload.event_id`.

Ainda não fechado:
- formato lexical exato de IDs;
- gramática estrita de timestamp;
- limites de `sequence`;
- política para campos desconhecidos;
- negociação/compatibilidade de versões;
- schemas específicos de payloads;
- replay/resume/resync e retenção;
- backpressure quantitativo.

## Boundary audit — 2026-08-24

### IA-06 → IA-07

IA-06 owns device identity, enrollment, Ed25519 proof-of-possession, authentication verification, revocation and key rotation. Session identity exists in the device-auth boundary, but its exact fields, lifecycle, expiration and reconnect/reauthentication semantics are not fully specified.

### IA-03 → IA-07

IA-03 owns InboundInbox, deduplication, durable ACK boundary, replay/recovery and event infrastructure. ACK is legal only after durable Inbox persistence. IA-07 must consume these interfaces and must not create competing durability or replay storage.

### IA-07 → IA-08

IA-07 provides transport-level connection/session state and WSS event delivery; IA-08 presents that state in the renderer/UI. IA-08 does not own authentication, durable persistence or WSS protocol authority.

### Revocation

IA-06 is the authority for revocation. IA-07 only applies connection/session termination after receiving an executable revocation signal defined by the device-auth boundary.

### Sequence

Sequence is documented as monotonic per `(store_id, device_id)`, but persistent ownership and gap/replay semantics are still PARTIAL.

## Artifacts

- `WSS-INTEGRATION-BOUNDARY.md` — ownership and cross-agent interface matrix.
- `WSS-SESSION-DECISION-MATRIX.md` — unresolved decisions and required approvals.

## Next slice

`PROPOSED_NEXT_SLICE = WSS connection lifecycle abstraction`

Classification: `BLOCKED` until IA-06 provides an executable session identity/authentication/reconnect boundary and IA-03 provides durable intake/ACK/replay interfaces.

## Bloqueios conhecidos

- CONTRACT-001.
- CONTRACT-002 when `order.status_changed` semantics affect transport.
- GOV-001 when document/version authority is relevant.
- Endpoint-specific `Idempotency-Key` rules.
- Complete error catalogue.
- Webhook/provider semantics and numeric rate/backpressure limits.

## Regra de continuidade

Não implementar além do que os contratos aprovados sustentam. Se a próxima etapa exigir mudança fora do ownership, produzir solicitação formal com impacto e testes necessários.
