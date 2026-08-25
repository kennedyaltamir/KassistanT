# 09 — CURRENT STATE

## Regra

Este documento é uma fotografia de estado e deve ser atualizado após mudanças relevantes. Nunca tratar seu conteúdo como prova definitiva sem reconferir GitHub e checkout.

## Ponto de referência confirmado

**Repository:** `kennedyaltamir/KassistanT`  
**Branch em implementação:** `feat/attendant-configuration`  
**Base:** `fix/windows-gateway-spawn`  
**SHA GitHub confirmado antes da implementação:** `6ddcbf879350e9c2e03bd0b476ff22443abcf097`  
**Último SHA da branch de implementação:** `6aeca6d72010fea918d61e6818b9563633c345e0`  
**Working tree:** não verificável deste ambiente; checkout local deve ser reconferido antes dos testes finais.

## Runtime confirmado anteriormente

- Desktop inicia.
- Persistence server inicia em `127.0.0.1:3211`.
- Gateway inicia em `127.0.0.1:3210`.
- WhatsApp chegou ao estado `CONNECTED` no runtime observado.
- Correção da migration `external_thread_id` foi validada no ciclo local posterior.
- `pnpm build` passou no último ciclo informado.
- Suítes de domínio e gateway passaram no último ciclo informado.

## Capacidades normativas e estado atual

| Capacidade | Estado |
|---|---|
| Atendente / Assistant Configuration | IMPLEMENTED_PENDING_VERIFICATION |
| Persistência da configuração por loja | IMPLEMENTED_PENDING_VERIFICATION |
| Validação da configuração | IMPLEMENTED_PENDING_VERIFICATION |
| IPC Electron da configuração | IMPLEMENTED_PENDING_VERIFICATION |
| Superfície UI Atendente | IMPLEMENTED_PENDING_VERIFICATION |
| Horário de atendimento determinístico | PARTIAL — armazenamento/UI preparados; Core `isOpen()` ainda pendente |
| Política de dados do cliente | PARTIAL — persistência preparada; Context Builder ainda pendente |
| Multi-provider LLM | PARTIAL / EXISTING PROVIDER INFRASTRUCTURE |
| Ingestão de materiais | NOT_IMPLEMENTED |
| Auto-preenchimento de catálogo por candidatos | NOT_IMPLEMENTED |
| Mensagens via CSV | NOT_IMPLEMENTED |
| Notificação administrativa de venda | PARTIAL — política persistida; evento/worker ainda pendentes |
| Navegação das novas abas | PARTIAL — Atendente é adicionada pela superfície renderer |

## Implementação A1 criada

- `apps/desktop/database/migrations/0006_assistant_configuration.sql`
- `apps/desktop/electron/assistant-configuration.cjs`
- `apps/desktop/electron/database/assistant-configuration.test.cjs`
- `apps/desktop/src/assistant-settings.js`
- `apps/desktop/electron/main.cjs` — IPC `assistant.config.*`
- `apps/desktop/electron/preload.cjs` — boundary segura do renderer
- `apps/desktop/electron/database/migrations.ts` — migration 0006 autorizada
- `apps/desktop/electron/database/runtime.cjs` — migration 0006 aplicada no runtime legado

## Critério de conclusão da A1

Ainda não marcar `IMPLEMENTED`. Exige checkout local sincronizado, teste direcionado, `pnpm test`, `pnpm build`, `git diff --check`, execução do desktop e conferência visual/funcional da aba Atendente.

## Próximo passo oficial

Validar A1 no checkout e, após aprovação, implementar A2 — Business Hours determinístico — e A3 — Customer Context Policy.
