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

## Integration gate package

### IA-06 → IA-07

Antes do WSS lifecycle, IA-06 precisa fornecer uma interface executável/testável para:

- authenticated session result;
- authoritative `device_id`;
- `session_id`, se o contrato de sessão o utilizar;
- expiry semantics, se aplicável;
- authoritative revocation signal;
- reconnect/reauthentication rule.

IA-06 continua responsável pela autoridade criptográfica, revogação e identidade.

### IA-03 → IA-07

Antes do WSS receive/ACK/recovery runtime, IA-03 precisa fornecer:

- durable intake interface;
- persisted / duplicate / failure outcomes;
- ACK authorization after durable persistence;
- explicit duplicate/retry semantics;
- selected replay/resume boundary or explicit deferral;
- sequence ownership and duplicate/gap semantics for the selected scope.

IA-03 continua responsável pela persistência, deduplicação, ACK e replay/recovery.

### IA-07 → IA-08

IA-07 fornece estado de conexão/sessão e envelopes de eventos; IA-08 apenas apresenta/consome esses resultados no Desktop.

## Minimum V1

The first lifecycle slice must not automatically include every future WSS capability. Full resync, advanced replay retention and numerical backpressure tuning may be deferred only when the selected V1 contract explicitly permits it.

## Artifacts

- `WSS-INTEGRATION-GATE.md`
- `WSS-IA06-CONTRACT.md`
- `WSS-IA03-CONTRACT.md`
- `WSS-RUNTIME-V1-REQUIREMENTS.md`
- `WSS-INTEGRATION-BOUNDARY.md`
- `WSS-SESSION-DECISION-MATRIX.md`

## Current readiness

`WSS_RUNTIME_READINESS = BLOCKED`.

The `WSS connection lifecycle abstraction` is not authorized for implementation until all critical gates pass.

## Bloqueios conhecidos

- CONTRACT-001.
- CONTRACT-002 when `order.status_changed` semantics affect transport.
- GOV-001 when document/version authority is relevant.
- Endpoint-specific `Idempotency-Key` rules.
- Complete error catalogue.
- Webhook/provider semantics and numeric rate/backpressure limits.

## Regra de continuidade

Não implementar além do que os contratos aprovados sustentam. Se a próxima etapa exigir mudança fora do ownership, produzir solicitação formal com impacto e testes necessários.
