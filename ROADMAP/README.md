# KassisT — ROADMAP OPERACIONAL

## Autoridade máxima

`00_MASTER_AUDITOR_PROMPT.xml` é o contrato operacional de maior prioridade.

Toda implementação deve respeitar a regra: **antes de agir, verificar; antes de afirmar, provar; antes de concluir, testar; depois de publicar, conferir o GitHub novamente.**

## Ordem mínima de leitura

1. `00_MASTER_AUDITOR_PROMPT.xml`
2. `01_EXECUTION_PROTOCOL.md`
3. `02_GIT_AND_GITHUB_PROTOCOL.md`
4. `03_VALIDATION_AND_TESTING.md`
5. `04_ARCHITECTURE_AND_RUNTIME.md`
6. `05_TERMINAL_COMMAND_PROTOCOL.md`
7. `06_LOG_ANALYSIS_PROTOCOL.md`
8. `09_CURRENT_STATE.md`
9. `10_NEXT_STEPS.md`
10. documento funcional específico da etapa
11. `20_MVP_EVOLUTION_BACKLOG.md`

## Mapa funcional da evolução

| Documento | Domínio | Objetivo |
|---|---|---|
| `12_ATTENDANT_CONFIGURATION.md` | Atendente | identidade, empresa, horário, personalidade, políticas |
| `13_LLM_PROVIDER_CONFIGURATION.md` | LLMs | múltiplos providers, modelos e credenciais |
| `14_KNOWLEDGE_INGESTION_AND_CATALOG.md` | Conhecimento | materiais, extração e candidatos de catálogo |
| `15_BULK_MESSAGING_CSV.md` | Mensagens | importação e envio controlado por CSV |
| `16_SALE_NOTIFICATIONS.md` | Notificações | alertas administrativos após venda real |
| `17_BUSINESS_HOURS_AND_SERVICE_POLICY.md` | Operação | horário e condição aberto/fechado |
| `18_CUSTOMER_CONTEXT_POLICY.md` | Dados do cliente | contexto autorizado e minimização |
| `19_MVP_UI_NAVIGATION.md` | Desktop UX | abas e estados operacionais |
| `20_MVP_EVOLUTION_BACKLOG.md` | Execução | ordem, dependências e gates |

## Fonte de verdade

A ROADMAP organiza contratos, decisões e plano de evolução. Ela **não substitui**:

- GitHub real;
- checkout local;
- código em execução;
- testes;
- logs;
- CI.

## Estados permitidos

```text
IMPLEMENTED
IMPLEMENTED_PENDING_VERIFICATION
PARTIAL
NOT_IMPLEMENTED
UNAVAILABLE
BLOCKED
```

Nunca usar `IMPLEMENTED` apenas pela existência de arquivo, interface, migration, endpoint, mock ou teste.

## Regra de evolução

Cada nova aba ou capacidade deve existir em quatro camadas quando aplicável:

```text
UX / Renderer
  -> Contract / API / IPC
  -> Core / Service
  -> Persistence / Transport
```

A ausência de uma camada deve aparecer explicitamente como lacuna e não como funcionalidade concluída.
