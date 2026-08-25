# KassisT — 19. MVP UI NAVIGATION

## Objetivo

Definir a navegação do desktop sem esconder capacidades atrás de páginas sem contrato.

## Abas principais

```text
Início
Conversas
WhatsApp
Pedidos
Produtos
Atendente
LLMs
Conhecimento
Mensagens
Notificações
Diagnóstico
Configurações
```

## Estado por aba

Cada aba deve possuir um status explícito:

```text
IMPLEMENTED
PARTIAL
NOT_IMPLEMENTED
BLOCKED
UNAVAILABLE
```

Não usar apenas a presença da rota para inferir funcionalidade.

## Atendente

Superfície central de:

- identidade do estabelecimento;
- identidade do assistente;
- horário;
- estilo;
- políticas de contexto;
- simulação;
- estado operacional.

## LLMs

Superfície para:

- providers;
- modelos;
- validação;
- credenciais por referência;
- seleção do provider do Atendente;
- status.

## Conhecimento

Superfície para:

- upload de materiais;
- histórico de fontes;
- extração;
- candidatos de catálogo;
- aprovação/rejeição;
- estado do processamento.

## Mensagens

Superfície para CSV:

- importação;
- validação;
- preview;
- fila;
- progresso;
- resultados.

## Notificações

Superfície para configurar alertas administrativos de eventos comerciais reais.

## Regra de UX

Nenhuma aba poderá apresentar uma ação que execute uma operação inexistente. Recursos futuros devem aparecer como explicitamente indisponíveis ou permanecer ocultos até existir contrato real.
