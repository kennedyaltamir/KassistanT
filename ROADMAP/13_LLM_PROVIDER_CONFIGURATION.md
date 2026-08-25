# KassisT — 13. LLM PROVIDER CONFIGURATION

## Objetivo

Permitir que o operador configure múltiplos provedores de LLM sem acoplar a aplicação a um único fornecedor.

## Providers

A arquitetura deve suportar, mediante adapters reais e capacidades verificadas:

```text
OLLAMA_LOCAL
OPENAI_COMPATIBLE
ANTHROPIC
GOOGLE_GEMINI
GROQ
OPENROUTER
CUSTOM_OPENAI_COMPATIBLE
```

Um provider só poderá ser marcado como disponível após validação real de implementação e integração.

## Modelo

```text
LlmProvider
├── id
├── key
├── display_name
├── transport_kind
├── base_url
├── credential_ref
├── default_model
├── capabilities
├── enabled
├── status
└── updated_at
```

## Credenciais

API keys, tokens e segredos devem ser administrados pela boundary de credentials já existente. A UI poderá criar/editar uma referência de credencial, mas não deve persistir segredo em configuração aberta nem expô-lo ao renderer desnecessariamente.

Fluxo:

```text
Settings UI
  -> Credentials boundary
  -> encrypted/secure secret storage when available
  -> provider validation
  -> provider status
```

## Validação

Cada provider deve possuir:

- configuração estrutural;
- credencial válida quando necessária;
- endpoint acessível;
- modelo selecionável;
- timeout;
- erro sanitizado;
- capability report.

Estados:

```text
NOT_CONFIGURED
CONFIGURED
VALIDATING
READY
DEGRADED
INVALID
DISABLED
UNAVAILABLE
```

## Roteamento

A configuração do Atendente deve selecionar um `provider_ref` e `model_ref`. A LLM não decide a troca de provider por conta própria, salvo política explícita do backend.

## Fallback

Fallback entre providers será permitido somente quando houver política persistida e testes de idempotência/timeout. Não realizar fallback silencioso que cause custo inesperado ou alteração de comportamento comercial.

## Critérios de aceitação

1. listar providers suportados;
2. adicionar configuração;
3. salvar referência de credential sem expor segredo;
4. validar provider;
5. selecionar modelo;
6. executar inferência real;
7. reportar falhas reais;
8. preservar configuração após restart;
9. não apresentar provider não implementado como disponível.
