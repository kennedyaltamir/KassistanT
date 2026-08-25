# KassisT — 22. B1/B2 PROVIDER REGISTRY E RUNTIME LLM

## Objetivo

Registrar a evolução da plataforma LLM para distinguir providers que possuem runtime real de chat daqueles que possuem somente infraestrutura de credenciais/validação, e conectar os runtimes de chat efetivamente implementados à configuração operacional do Gateway/Desktop.

## Estado inicial confirmado

O Gateway já possuía `provider-registry.mjs`, credenciais protegidas por Windows DPAPI e validação de credenciais por provider. A inferência real observada no runtime estava concentrada no Ollama local. A configuração de IA aceitava somente endpoint local.

A configuração persistente do Atendente já existe em SQLite e é exposta ao renderer via IPC seguro; ela não deve ser usada para colocar regra comercial no preload. fileciteturn206file0 fileciteturn227file0 fileciteturn228file0

## Implementação B1

### Registry

`gateway/src/provider-registry.mjs`

Adicionado:

- `ollama_local` como provider de chat real;
- `runtimeCapability` com os estados `CHAT` e `CREDENTIAL_VALIDATION_ONLY`;
- Groq posteriormente promovido a `CHAT` após adapter real implementado.

Providers sem adapter permanecem explicitamente fora do runtime de chat.

### API

`GET /api/llm/providers`

Novo catálogo sanitizado para consumo da UI e futuras boundaries de seleção. Ele não retorna credenciais.

## Implementação B2

### Seleção de provider/modelo

`gateway/src/ai-config.mjs`

A configuração da IA agora possui `provider` explícito. O estado suportado é:

- `ollama_local`;
- `groq`.

Para Groq, o endpoint é canônico e não pode ser substituído por uma URL arbitrária.

### Adapter Groq

`gateway/src/llm-groq.mjs`

Novo adapter isolado para chamadas de chat não-streaming no endpoint OpenAI-compatible do Groq.

A chave `GROQ_API_KEY` é recuperada exclusivamente pelo store de credenciais existente e nunca é exposta no status da UI/API.

### Runtime LLM

`gateway/src/llm.mjs`

A execução agora roteia explicitamente:

- `ollama_local` → `/api/chat` local;
- `groq` → adapter Groq.

A atualização de modelos locais permanece disponível somente quando `ollama_local` está selecionado.

### Desktop

`apps/desktop/src/llm-provider-settings.js`

Nova superfície de seleção de provider/modelo na página de Settings.

`apps/desktop/electron/preload.cjs`

Loader atualizado para incluir a nova superfície sem expor Node/API keys ao renderer.

## Testes adicionados/atualizados

- `gateway/test/provider-registry.test.mjs`
- `gateway/test/http.test.mjs`
- `gateway/test/ai-config.test.mjs`
- `gateway/test/llm.test.mjs`
- `gateway/test/llm-groq.test.mjs`

Os testes cobrem:

1. catálogo de providers;
2. distinção entre capacidades;
3. endpoint HTTP sanitizado;
4. normalização de configuração;
5. execução local Ollama;
6. adapter Groq;
7. ausência de vazamento de credenciais;
8. erro de provider e credencial ausente.

## Limites confirmados

Ainda **não** está implementado:

- adapters de chat para Mistral, Cohere, Hugging Face, NVIDIA, Cloudflare, SambaNova, ModelScope ou demais providers do registry;
- fallback automático entre providers;
- seleção de provider/modelo persistida dentro da tabela `assistant_configuration` do domínio do Atendente;
- validação de disponibilidade de modelo externo;
- Context Builder do Atendente;
- Business Hours `isOpen()` integrado ao Core;
- evento de venda/worker;
- first-sale end-to-end.

O cadastro de providers continua maior que a superfície de adapters de chat por decisão explícita de fail-closed.

## Estado

`IMPLEMENTED_PENDING_LOCAL_VERIFICATION`

## Validação GitHub

PR aberto: `#42` — `feat(attendant): implement persistent assistant configuration`.
Base: `MVP2`.
Head: `feat/attendant-configuration`.
Head confirmado após as alterações desta etapa: `f4eb97e56e41c61efcc85b4cd3e6b868ca77aa9c`.
CI/status no commit consultado não possui checks/status publicados pelo conector; a validação local no checkout Windows ainda é necessária.

## Próximo passo

1. Executar a suíte real no checkout Windows.
2. Corrigir qualquer falha de lint/typecheck/test/build encontrada.
3. Confirmar a integração visual do selector de provider/modelo.
4. Depois disso, persistir seleção no domínio `assistant_configuration` somente se a necessidade arquitetural for confirmada pela validação do runtime.
5. Em seguida, avançar para Context Builder/Business Hours antes de ampliar o número de adapters externos.
