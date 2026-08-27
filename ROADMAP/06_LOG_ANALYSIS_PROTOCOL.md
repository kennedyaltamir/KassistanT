# 06 — LOG ANALYSIS PROTOCOL

## Classificação obrigatória

- **PASSOU** — comprovado pelo resultado.
- **FALHOU** — erro real, exit code diferente de zero ou check negativo.
- **NÃO EXECUTADO** — comando não chegou a executar.
- **NÃO VERIFICADO** — existe hipótese sem evidência suficiente.
- **INCONCLUSIVO** — saída truncada, contraditória ou insuficiente.

## Método

1. Procurar primeiro erros causais.
2. Separar falha primária de erros em cascata.
3. Conferir contexto antes de interpretar linha isolada.
4. Conferir branch, SHA e comandos executados.
5. Reconstruir o estado final somente com evidências.

Logs são evidência do comportamento observado naquele momento; não substituem a consulta ao GitHub e ao código real.