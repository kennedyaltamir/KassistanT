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

## Modelos locais

A configuração de Desktop usa o inventário real do Ollama por `GET /api/tags`.

O contrato normalizado contém, quando fornecido pelo runtime:

- nome/identificador;
- runtime;
- estado de disponibilidade;
- tamanho;
- digest;
- data de modificação;
- metadados de formato/família/parametrização/quantização.

A aplicação não infere `UPDATE_AVAILABLE` por comparação textual de nomes. O update manual e global usam `POST /api/pull` do Ollama e são serializados para impedir operações concorrentes conflitantes.

## Atualização automática

A API expõe:

- `GET /api/llm/settings`
- `PUT /api/llm/settings`
- `GET /api/llm/models`
- `POST /api/llm/models/update`

A política contém `autoUpdateEnabled` e `intervalHours`.

Existe um único scheduler no Gateway. Alterar a política reaplica imediatamente o agendamento; desabilitar cancela execuções futuras; falhas de update são observadas e o scheduler volta a se programar; `SIGINT`/`SIGTERM` cancelam o timer.

## Credenciais e providers

O registry canônico é `gateway/src/provider-registry.mjs`. As credenciais suportadas são:

- `NVIDIA_API_KEY`
- `GROQ_API_KEY`
- `MISTRAL_API_KEY`
- `COHERE_API_KEY`
- `CEREBRAS_API_KEY`
- `HUGGINGFACE_API_KEY`
- `PENROUTER_API_KEY`
- `MODELSCOPE_API_KEY`
- `CLOUDFLARE_API_KEY`
- `CLOUDFLARE_ACCOUNT_ID`
- `GITHUB_TOKEN`
- `SAMBANOVA_API_KEY`

Os providers sem integração/validação confirmada permanecem explicitamente `UNAVAILABLE`. `PenRouter` não possui endpoint inferido ou inventado.

O armazenamento continua em `gateway/src/credentials.mjs`, usando Windows DPAPI CurrentUser. A API de status retorna somente metadata e nunca retorna o segredo descriptografado.

## Validação de credenciais

A API expõe `POST /api/credentials/validate`.

O resultado utiliza somente estados sanitizados: `VALID`, `INVALID`, `UNAVAILABLE`, `ERROR` ou `UNKNOWN` quando ainda não há validação.

Para providers com contrato confirmado, a validação usa a operação oficial registrada no provider registry. Para providers sem operação confirmada, o resultado permanece `UNAVAILABLE`.

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

Segredos nunca são incluídos em status, logs, erros serializados, testes ou respostas para o renderer.

`@lid`, JID individual e JID de grupo são mantidos como identificadores reais. Nenhum deles é convertido artificialmente para telefone ou Customer ID.

## UI do Desktop

A seção existente de `Configurações` em `apps/desktop/src/llm-settings.js` fornece:

- inventário real de modelos locais;
- runtime e metadados do modelo;
- atualização individual;
- atualização global;
- política de atualização automática;
- status do Ollama;
- configuração/substituição/remoção de credenciais;
- teste de credencial quando suportado;
- estados sanitizados de validação.

A UI usa exclusivamente a API local do Gateway e não recebe segredos já armazenados.
