# 09 — CURRENT STATE

## Regra

Este documento é uma fotografia de estado e deve ser atualizado após mudanças relevantes. Nunca tratar seu conteúdo como prova definitiva sem reconferir GitHub e checkout.

## Ponto de referência confirmado

**Repository:** `kennedyaltamir/KassistanT`  
**Branch:** `fix/windows-gateway-spawn`  
**SHA confirmado no checkout informado:** `e336bc36b5955081b3d6e6136db1f9571548fe97`  
**Working tree:** limpa no último estado informado  

## Runtime confirmado anteriormente

- Desktop inicia.
- Persistence server inicia em `127.0.0.1:3211`.
- Gateway inicia em `127.0.0.1:3210`.
- WhatsApp chegou ao estado `CONNECTED` no runtime observado.
- Correção da migration `external_thread_id` foi validada no ciclo local posterior.
- `pnpm build` passou.
- Suítes de domínio e gateway passaram no ciclo final informado.

## Capacidades recentemente especificadas no ROADMAP

| Capacidade | Estado atual |
|---|---|
| Atendente / Assistant Configuration | NOT_IMPLEMENTED |
| Horário de atendimento determinístico | NOT_IMPLEMENTED |
| Política de dados do cliente | NOT_IMPLEMENTED |
| Multi-provider LLM | PARTIAL / EXISTING PROVIDER INFRASTRUCTURE |
| Ingestão de materiais | NOT_IMPLEMENTED |
| Auto-preenchimento de catálogo por candidatos | NOT_IMPLEMENTED |
| Mensagens via CSV | NOT_IMPLEMENTED |
| Notificação administrativa de venda | NOT_IMPLEMENTED |
| Navegação das novas abas | PARTIAL |

## Arquivos normativos adicionados

- `12_ATTENDANT_CONFIGURATION.md`
- `13_LLM_PROVIDER_CONFIGURATION.md`
- `14_KNOWLEDGE_INGESTION_AND_CATALOG.md`
- `15_BULK_MESSAGING_CSV.md`
- `16_SALE_NOTIFICATIONS.md`
- `17_BUSINESS_HOURS_AND_SERVICE_POLICY.md`
- `18_CUSTOMER_CONTEXT_POLICY.md`
- `19_MVP_UI_NAVIGATION.md`
- `20_MVP_EVOLUTION_BACKLOG.md`

## Próximo passo oficial

Implementar a Fase 1 do `20_MVP_EVOLUTION_BACKLOG.md`: Assistant Configuration persistente, mantendo as separações entre UI, backend, Core, Context Builder, LLM e persistência.

## Critério de atualização

Nunca registrar `IMPLEMENTED` sem comprovação do caminho de execução real, testes, build e runtime quando aplicável.
