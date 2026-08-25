
---

## Registro de implementação — A2/A3

### A2 — Business Hours

**Estado:** `IMPLEMENTED_PENDING_VERIFICATION`

Boundary determinística adicionada para:

- parsing de horários `HH:mm`;
- resolução do dia da semana pelo timezone configurado;
- suporte a múltiplos intervalos por dia;
- decisão `isBusinessOpenAt`;
- tratamento explícito de timezone inválido;
- `enabled=false` sempre resulta em fechado.

A LLM não decide se o estabelecimento está aberto.

### A3 — Customer Context Policy

**Estado:** `IMPLEMENTED_PENDING_VERIFICATION`

Boundary determinística adicionada para:

- `name`;
- `phone`;
- `whatsapp_id`;
- `preferences`;
- `conversation_history`;
- `order_history`;
- `relationship`;
- `address`;
- `email`.

Somente categorias explicitamente autorizadas entram no contexto.

O histórico possui limite configurável e pode ser desabilitado.

### Limite

A existência dessa boundary e dos testes não representa, por si só, integração completa com o pipeline real de `AI Job -> Context Builder -> LLM Runtime`.

### Próxima etapa

`B1 — Provider Registry`
