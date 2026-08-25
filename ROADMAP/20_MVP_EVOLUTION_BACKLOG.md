# KassisT — 20. MVP EVOLUTION BACKLOG

## Regra

A ordem abaixo prioriza dependências reais e evita construir UI sobre contratos inexistentes.

## EPIC A — Fundação de configuração

### A1 — Assistant Configuration
**Docs:** `12_ATTENDANT_CONFIGURATION.md`

Implementar persistência, backend contract, Electron boundary e UI da aba Atendente.

### A2 — Business Hours
**Docs:** `17_BUSINESS_HOURS_AND_SERVICE_POLICY.md`

Implementar timezone, intervalos, `isOpen()` e política fora do horário.

### A3 — Customer Context Policy
**Docs:** `18_CUSTOMER_CONTEXT_POLICY.md`

Implementar seleção de categorias, Context Builder e testes de exclusão.

## EPIC B — LLM Platform

### B1 — Provider registry
**Docs:** `13_LLM_PROVIDER_CONFIGURATION.md`

Separar registry, adapters, credential references e capability status.

### B2 — Provider validation

Executar validações reais por provider/modelo.

### B3 — Atendente → provider/model mapping

Permitir selecionar provider e modelo persistidos na configuração do Atendente.

## EPIC C — Knowledge

### C1 — Material ingestion
**Docs:** `14_KNOWLEDGE_INGESTION_AND_CATALOG.md`

Upload, checksum, parsing, extraction e armazenamento de fonte.

### C2 — Catalog candidates

Extrair candidatos de produto e preservar confidence + source reference.

### C3 — Human approval

Publicar candidatos somente após validação adequada.

## EPIC D — Messaging

### D1 — CSV import
**Docs:** `15_BULK_MESSAGING_CSV.md`

Parser, schema validation, preview e deduplication.

### D2 — Outbound queue

Transformar linhas aprovadas em jobs idempotentes.

### D3 — Real WhatsApp delivery status

Integrar sucesso/falha do transporte ao painel de campanha.

## EPIC E — Commercial notifications

### E1 — Sale event
**Docs:** `16_SALE_NOTIFICATIONS.md`

Garantir evento comercial real após confirmação.

### E2 — Admin notification worker

Consumir DomainOutbox e notificar canal configurado.

### E3 — Retry + idempotency

Garantir não duplicação e observabilidade.

## EPIC F — Desktop UX

### F1 — Navigation
**Docs:** `19_MVP_UI_NAVIGATION.md`

Criar ou reconciliar abas com o estado real do código.

### F2 — Operational states

Uniformizar loading, valid, error, disabled e unavailable.

### F3 — Diagnostics

Exibir provider, gateway, persistence e WhatsApp status reais.

## Ordem recomendada de execução

```text
A1
 ↓
A2 + A3
 ↓
B1 + B2
 ↓
B3
 ↓
C1
 ↓
C2 + C3
 ↓
E1 + E2 + E3
 ↓
D1
 ↓
D2 + D3
 ↓
F1 + F2 + F3
```

## Gate de cada etapa

```text
GitHub real
 -> contrato
 -> implementação mínima
 -> teste direcionado
 -> suíte relevante
 -> build
 -> diff check
 -> runtime quando aplicável
 -> registro no ROADMAP
 -> GitHub novamente
```

## Proibido

- pseudo-endpoints;
- mocks apresentados como integrações;
- segredo em config aberta;
- upload que altera catálogo sem governança;
- envio em massa sem aprovação;
- notificação baseada apenas em texto da LLM;
- horário decidido pela LLM;
- cliente acessado diretamente pela LLM.
