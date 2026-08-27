# KassisT Frontend C1

Status: **DRAFT_RECONCILED** · SPEC_VERSION: **1.0.1-c1**

Este diretório descreve a superfície do renderer para C1_FIRST_REAL_USER. O documento mestre é `FRONTEND_SPECIFICATION.md`; os demais documentos detalham áreas sem criar requisitos novos.

## Maturity classification

- `FRONTEND_OPERATIONAL_SURFACE = IMPLEMENTED_FOR_C1`
- `UI_PRESENTATION_STATUS = IMPLEMENTATION_COMPLETE_PENDING_RUNTIME_VERIFICATION`
- `FRONTEND_VERIFICATION = PENDING`
- `RUNTIME_VERIFICATION = NOT_VERIFIED`
- `MERGE_READINESS = NOT_READY`

Implementação presente no código e verificação operacional são evidências distintas. Uma execução local em SHA anterior não verifica automaticamente um SHA posterior.

## Estados normativos da especificação

- IMPLEMENTED — comportamento presente no renderer.
- APPROVED_TARGET — aprovado por escopo C1 ou instrução explícita, ainda não entregue.
- PROVISIONAL — solução temporária, não-canônica.
- DEFERRED — posterior ao C1.
- NOT_REQUIRED_FOR_C1 — fora do primeiro usuário real.
- UNKNOWN — sem evidência suficiente.

## Evidência de testes

`STATIC_SOURCE_ASSERTIONS_PRESENT` não equivale a teste de interação executada. Click, submit, confirmação, teclado e runtime Electron permanecem `NOT_VERIFIED` até execução em ambiente capaz de exercê-los.

A documentação descreve UI e não autoriza IPC, Domain, Contracts, persistence, WSS, WhatsApp ou Auth.