# IA-07 — Errors / Risks

## E-001 — Gateway HTTP skeleton

- Status: OPEN / EXPECTED IN CURRENT PHASE
- Evidence: `gateway/src/http.mjs` responde 404 para qualquer request. fileciteturn51file0L2-L2
- Impacto: nenhuma API HTTP de produção foi comprovada.

## E-002 — WSS não implementado

- Status: OPEN / EXPECTED IN CURRENT PHASE
- Evidence: `attachWssTransport()` retorna `not_implemented`. fileciteturn53file0L2-L2
- Impacto: nenhum transporte WSS funcional foi comprovado.

## E-003 — CONTRACT-001

- Status: BLOCKER / AMBIGUOUS
- DomainOutbox entre Core local e Gateway não possui ownership/scope final. fileciteturn55file0L2-L2
- Regra: não resolver localmente.

## E-004 — Idempotência HTTP incompleta

- Status: OPEN / CONTRACT GAP
- Regras endpoint-specific de `Idempotency-Key` replay/TTL permanecem ausentes quando não expressamente definidas. fileciteturn57file0L2-L2

## E-005 — Dependência de autenticação

- Status: DEPENDENCY
- IA-07 depende da IA-06 para identidade/autenticação de dispositivo; não pode duplicar `gateway/src/device-auth/**`.

## E-006 — Contrato global não deve ser inferido do skeleton

- Status: GOVERNANCE RISK
- O código atual não deve ser usado para inventar semântica que os contratos não estabelecem.
