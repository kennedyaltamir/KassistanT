# KassisT — Operação da IA Local

## Objetivo

Transformar o auto-reply local de uma integração técnica em uma capacidade operacional do Desktop.

A arquitetura mantém o Gateway como autoridade para execução e o Desktop apenas como superfície de configuração e observabilidade.

## Configuração global

A API do Gateway expõe:

- `GET /api/whatsapp/ai/status` — estado operacional resumido.
- `GET /api/whatsapp/ai/config` — configuração efetiva.
- `PUT /api/whatsapp/ai/config` — atualização de configuração.

Os campos persistidos localmente são:

- `enabled`
- `baseUrl`
- `model`
- `timeoutMs`
- `contextMessages`
- `cooldownMs`
- `systemPrompt`

O arquivo local é `gateway/data/ai-config.json` e é ignorado pelo Git. Nenhuma configuração de máquina deve ser commitada.

O padrão global continua desativado. Variáveis de ambiente continuam aceitas como fallback para bootstrap e automação, mas a configuração persistida pode sobrescrevê-las.

## Política por conversa

O Gateway usa o JID real como identidade operacional da conversa.

Endpoints:

- `GET /api/whatsapp/ai/conversations?jid=<JID>`
- `GET /api/whatsapp/ai/conversations`
- `PUT /api/whatsapp/ai/conversations`
- `DELETE /api/whatsapp/ai/conversations?jid=<JID>`

Cada conversa pode:

- herdar o estado global;
- forçar auto-reply ativo;
- desativar auto-reply;
- receber um prompt específico opcional.

A política é persistida localmente em `gateway/data/ai-conversations.json`, também ignorado pelo Git.

## Regras de segurança operacional

O Gateway continua vinculado por padrão a `127.0.0.1`. A configuração de IA não cria endpoint remoto de administração por padrão.

O sistema não deve declarar que uma mensagem foi entregue antes da confirmação do transporte. O auto-reply gera a resposta no LLM e entrega pelo `sendText()` do Gateway; o evento outbound continua sendo a fonte operacional de confirmação.

`@lid`, JID individual e JID de grupo são mantidos como identificadores reais. Nenhum deles é convertido artificialmente para telefone ou Customer ID.

## UI do Desktop

O Desktop carrega o painel `apps/desktop/src/ai-panel.js` pelo preload.

O painel fornece:

- estado global da IA;
- ativação/desativação;
- modelo Ollama;
- URL do Ollama;
- timeout;
- quantidade de mensagens de contexto;
- cooldown por conversa;
- prompt global;
- modo por conversa (`Herdar`, `Sempre ativo`, `Desativado`);
- prompt específico por conversa.

O painel usa exclusivamente a API local do Gateway.
