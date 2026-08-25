# KassisT — 22. B1 PROVIDER REGISTRY IMPLEMENTATION

## Objetivo

Registrar a evolução da plataforma LLM para distinguir explicitamente providers que possuem runtime real de chat daqueles que possuem somente infraestrutura de credenciais/validação.

## Estado anterior confirmado

O Gateway já possuía `provider-registry.mjs`, credenciais protegidas por Windows DPAPI e validação de credenciais por provider. A infraestrutura, porém, não distinguia formalmente capacidade de inferência de capacidade de validação.

A inferência real observada no runtime continua concentrada no Ollama local. Providers externos registrados não devem ser apresentados como adapters de chat enquanto não existir implementação correspondente.

## Implementação

### Registry

`gateway/src/provider-registry.mjs`

Adicionado:

- `ollama_local` como provider de chat realmente suportado;
- `runtimeCapability` com os estados:
  - `CHAT`;
  - `CREDENTIAL_VALIDATION_ONLY`.

Providers externos atualmente registrados permanecem explicitamente sem adapter de chat.

### API

`GET /api/llm/providers`

Novo endpoint de catálogo sanitizado para consumo da UI e futuras boundaries de seleção de provider.

O endpoint expõe somente:

- provider;
- label;
- availability;
- runtimeCapability;
- credentialKeys;
- capability/metadados de validação.

Nenhum valor de credencial é retornado.

### Testes

Atualizados:

- `gateway/test/provider-registry.test.mjs`
- `gateway/test/http.test.mjs`

Os testes comprovam:

1. presença do provider de chat local;
2. distinção entre chat e validação de credencial;
3. preservação do catálogo de credenciais;
4. disponibilidade explícita de providers não implementados;
5. exposição do catálogo HTTP sem secrets.

## Limite da etapa

Esta etapa **não declara multi-provider de chat implementado**.

Ainda permanecem para etapas seguintes:

- adapters reais para providers externos;
- seleção persistida provider/model no Atendente;
- execução de inferência externa;
- fallback governado;
- validação de modelo por provider;
- UI completa da plataforma LLM.

## Estado

`PARTIAL`

## Próximo passo

`B2/B3 — validação operacional e mapeamento persistido de provider/modelo para o Atendente, utilizando somente adapters realmente disponíveis.`
