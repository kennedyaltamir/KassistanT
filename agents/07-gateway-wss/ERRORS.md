# IA-07 — Errors / Risks

## E-001 — Gateway HTTP skeleton

- Status: OPEN / PARTIALLY RESOLVED
- Evidence: `/health` and `/ready` have runtime coverage; remaining normative HTTP routes are still not implemented.
- Impacto: nenhuma API HTTP de produção completa foi comprovada.

## E-002 — WSS não implementado

- Status: OPEN / EXPECTED IN CURRENT PHASE
- Evidence: `gateway/src/wss.mjs` continua retornando `not_implemented`.
- Impacto: nenhum transporte WSS funcional foi comprovado.

## E-003 — CONTRACT-001

- Status: BLOCKER / AMBIGUOUS
- DomainOutbox entre Core local e Gateway não possui ownership/scope final.
- Regra: não resolver localmente.

## E-004 — Idempotência HTTP incompleta

- Status: OPEN / CONTRACT GAP
- Regras endpoint-specific de `Idempotency-Key` replay/TTL permanecem ausentes quando não expressamente definidas.

## E-005 — Dependência de autenticação

- Status: DEPENDENCY
- IA-07 depende da IA-06 para identidade/autenticação de dispositivo; não pode duplicar `gateway/src/device-auth/**`.

## E-006 — Contrato global não deve ser inferido do skeleton

- Status: GOVERNANCE RISK
- O código atual não deve ser usado para inventar semântica que os contratos não estabelecem.

## E-007 — Catálogo de erros incompleto

- Status: OPEN / CONTRACT GAP
- O contrato público define envelope com `code`, `message`, `retryable` e `correlation_id`, mas o catálogo completo de códigos permanece MISSING/PARTIAL.
- Impacto: códigos adicionais do Gateway não podem ser tratados como normativos sem decisão/contrato.
- Observação: `not_ready` e `internal_error` continuam sendo comportamentos locais da implementação anterior, não códigos comprovadamente normativos. Não ampliar seu uso sem contrato.

## E-008 — WSS protocol partially specified

- Status: OPEN / PARTIAL
- Sequence/replay/resume/resync, retenção, jitter exato e limites numéricos de backpressure permanecem incompletos.
- Impacto: transporte WSS completo permanece bloqueado.

## E-009 — Envelope lexical rules incomplete

- Status: OPEN / CONTRACT GAP
- O contrato declara tipos e presença de campos, mas não fecha formato exato de identificadores, gramática de timestamp, limites de `sequence`, política de campos desconhecidos ou negociação de versão.
- Impacto: o validador deve permanecer conservador; não assumir regras adicionais como normativas.
