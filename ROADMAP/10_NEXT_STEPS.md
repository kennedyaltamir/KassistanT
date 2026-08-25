# 10 — NEXT STEPS

## Regra operacional

Cada etapa começa pela descoberta do estado real e termina com evidência verificável.

## Próxima sequência prioritária

### Fase 1 — Atendente

**Objetivo:** tornar a configuração de identidade e política do atendimento persistente e operacional.

**Evidência necessária:** schema, contrato backend/IPC, UI real, testes de persistência e runtime.

**Referência:** `12_ATTENDANT_CONFIGURATION.md`

### Fase 2 — Horário e contexto do cliente

**Objetivo:** aplicar horário determinístico e política de dados autorizados no Context Builder.

**Referências:**
- `17_BUSINESS_HOURS_AND_SERVICE_POLICY.md`
- `18_CUSTOMER_CONTEXT_POLICY.md`

### Fase 3 — Plataforma LLM

**Objetivo:** suportar múltiplos providers e modelos com credenciais seguras.

**Referência:** `13_LLM_PROVIDER_CONFIGURATION.md`

### Fase 4 — Conhecimento e catálogo

**Objetivo:** importar materiais e produzir candidatos de catálogo com origem e revisão.

**Referência:** `14_KNOWLEDGE_INGESTION_AND_CATALOG.md`

### Fase 5 — Venda e notificações

**Objetivo:** gerar notificação administrativa apenas a partir de evento comercial real.

**Referência:** `16_SALE_NOTIFICATIONS.md`

### Fase 6 — Mensagens CSV

**Objetivo:** permitir importação, validação, aprovação e envio em massa via outbox/Gateway.

**Referência:** `15_BULK_MESSAGING_CSV.md`

### Fase 7 — UX final do MVP

**Objetivo:** reconciliar as novas capacidades com a navegação desktop e os estados operacionais reais.

**Referência:** `19_MVP_UI_NAVIGATION.md`

## Estrutura obrigatória de execução

1. Confirmar branch e SHA.
2. Consultar GitHub.
3. Ler contrato da etapa.
4. Inspecionar código existente.
5. Identificar reutilização possível.
6. Implementar menor alteração segura.
7. Criar/ajustar testes direcionados.
8. Executar suíte relevante.
9. Executar build e `git diff --check`.
10. Executar runtime real quando aplicável.
11. Analisar logs.
12. Atualizar `09_CURRENT_STATE.md`.
13. Atualizar `07_DECISION_LOG.md`/`08_CHANGE_REGISTER.md`.
14. Publicar.
15. Conferir novamente no GitHub.

## Ordem recomendada

```text
Atendente
  -> Horário + Contexto
  -> Multi-LLM
  -> Conhecimento
  -> Evento de venda + Notificação
  -> CSV
  -> Navegação/UX
```
