# KassisT — Change Unit: Assistant, Products, Conversation Context and Controlled Automation

**Status:** EXECUTION AUTHORIZED BY CURRENT TASK / bounded implementation slice

**Branch:** `MVP2-implementandoQRCODE`

**Baseline:** `MVP2 @ 2aa27a93a8fe1f62ae64c3a5aec98809ae01a423`

## Objective

Evoluir o atendimento real do KassisT sem transformar a UI em fonte de verdade. A implementação deve reutilizar Gateway, persistência SQLite, contratos de LLM e runtime de dispatch já existentes.

## Reconciliation with proposed Identity/Context contract

`REGRAS/conversation-identity-memory-llm-context.md` permanece **CONTRATO PROPOSTO / PENDENTE DE REVISÃO E APROVAÇÃO**. A presente tarefa autoriza apenas uma implementação operacional limitada ao schema atual, sem declarar que o modelo canônico de Identity/Binding/Memory foi fechado.

### Limite explícito

- Customer continua sendo resolvido pela modelagem persistida atual.
- Conversation continua sendo localizada por `store_id + external_thread_id` no runtime atual.
- A derivação histórica por JID/`phone_normalized` permanece um **GAP conhecido** e não será promovida a contrato semântico canônico.
- Não haverá fusão de Customers por inferência.
- Dados extraídos de conversa serão candidatos com provenance, nunca fatos confirmados automaticamente.
- LLMContext operacional será uma projeção sanitizada de Customer + Conversation + mensagens + dados de negócio disponíveis.
- Credenciais, auth state, eventos brutos e segredos do WhatsApp permanecem fora do contexto da LLM.

## Reused existing contracts

- Gateway HTTP em `gateway/src/http.mjs`.
- Persistência SQLite local em `apps/desktop/electron/database/runtime.cjs`.
- `Message` como fonte canônica, mantendo `(store_id, external_message_id)` idempotente.
- Ollama local já implementado em `gateway/src/llm.mjs`.
- `AIExecutionService` e contratos de provider em `apps/desktop/electron/conversation/` e `apps/desktop/electron/providers/llm/`.
- Batch dispatch com confirmação humana em `gateway/src/batch-dispatch.mjs`.
- Gateway como único dono da integração Baileys/WhatsApp.

## New/evolved responsibilities

- Configuração estruturada e persistível do Assistente/IA.
- Compilação versionada do system prompt a partir da configuração estruturada.
- Catálogo de produtos com campos operacionais necessários ao atendimento.
- Contexto recuperado do SQLite por Conversation.
- Análise determinística de histórico gerando candidatos estruturados com provenance.
- Adapters multimodais configuráveis, sem lógica de mídia na UI.
- Superfícies HTTP para consumo da UI sem criar uma segunda fonte de verdade.

## Acceptance evidence

Cada requisito será classificado somente como `PASS`, `PARTIAL`, `BLOCKED`, `FAIL` ou `NOT TESTED`, conforme evidência executada.

## Out of scope

- Alteração da branch `MVP2`.
- Merge/rebase.
- Fechamento definitivo do contrato Identity/Binding/Memory.
- Qualquer exposição de auth state, credentials ou transport secrets ao Renderer/LLM.
