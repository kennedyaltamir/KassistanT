# Local LLM Auto-Reply — KassisT

## Objetivo

Adicionar uma primeira camada de resposta automática para mensagens inbound do WhatsApp usando um LLM local, sem colocar regras comerciais dentro do modelo.

Princípio:

> A IA conversa. O sistema decide.

## Implementação atual

O Gateway possui um cliente Ollama em `gateway/src/llm.mjs` e um serviço de resposta automática em `gateway/src/auto-reply.mjs`.

Fluxo:

```text
WhatsApp inbound
  -> Gateway messages.upsert
  -> recordMessage()
  -> evento message
  -> AutoReply
  -> contexto recente da conversa
  -> Ollama /api/chat
  -> texto da resposta
  -> sendText()
  -> evento OUTBOUND / SSE
```

O cliente usa o endpoint local `POST /api/chat` do Ollama, com `stream: false`. citeturn203516search2turn203516search7

## Segurança operacional da primeira versão

O recurso fica desativado por padrão.

```text
KASSIST_AI_AUTOREPLY=false
```

Para habilitar explicitamente no processo do Gateway:

```powershell
$env:KASSIST_AI_AUTOREPLY="true"
$env:KASSIST_LLM_URL="http://127.0.0.1:11434"
$env:KASSIST_LLM_MODEL="qwen3:14b"
$env:KASSIST_LLM_TIMEOUT_MS="60000"
pnpm --dir gateway dev
```

O modelo pode ser trocado por `KASSIST_LLM_MODEL`.

## Limites atuais

- contexto limitado às últimas mensagens do mesmo JID;
- máximo configurável por `KASSIST_AI_CONTEXT_MESSAGES` (default 12);
- somente mensagens `INBOUND` com texto são elegíveis;
- `@lid` permanece fora do auto-reply nesta primeira versão, pois a rota atual de envio ainda não deve converter LID em telefone artificial;
- existe cooldown por conversa para evitar respostas concorrentes imediatas;
- o Gateway continua sendo responsável pelo transporte; a LLM apenas produz texto.

## Diagnóstico

```text
GET /api/whatsapp/ai/status
```

Exemplo de configuração habilitada:

```json
{
  "enabled": true,
  "baseUrl": "http://127.0.0.1:11434",
  "model": "qwen3:14b",
  "timeoutMs": 60000,
  "contextMessages": 12,
  "cooldownMs": 1500,
  "inflightConversations": 0
}
```

## Próxima etapa

A próxima evolução deve introduzir uma política explícita de atendimento e estado de conversa antes de permitir respostas automáticas amplas, incluindo:

1. modo `DRY_RUN` sem envio;
2. habilitação por conversa/JID;
3. regras de handoff para humano;
4. persistência de contexto aprovada pelo Core;
5. observabilidade de prompt, latência e resultado sem armazenar conteúdo sensível desnecessariamente.
