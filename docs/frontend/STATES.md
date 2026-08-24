# STATES AND FORMS

## Global states

IMPLEMENTED vocabulary: LOADING, EMPTY, ERROR, SUCCESS, UNAVAILABLE, OFFLINE, PROVISIONAL, DISABLED, READ_ONLY. A UI deve selecionar apenas o estado com evidência: `PROVISIONAL_DATA` para fixtures, `UNAVAILABLE` para capability ausente, e nunca sucesso para operação não confirmada.

## Forms

Products e OrderItem possuem labels, required/min constraints, feedback inline ou toast, cancelamento e submit de sessão. O renderer não implementa validação canônica de domínio. Submit duplicado e erro de integração real permanecem APPROVED_TARGET até haver adapter autorizado.

## Feedback

Inline para erro de campo, dialog para confirmação explícita, toast para feedback não crítico e badges para estado. Erro crítico não deve depender exclusivamente de toast.
