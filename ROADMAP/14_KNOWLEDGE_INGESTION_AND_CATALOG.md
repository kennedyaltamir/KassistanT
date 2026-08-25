# KassisT — 14. KNOWLEDGE INGESTION AND CATALOG

## Objetivo

Permitir que o operador forneça materiais de negócio para o KassisT transformar conhecimento não estruturado em contexto utilizável pelo atendimento e, quando seguro, auxiliar no preenchimento do catálogo.

## Materiais aceitos

Primeira evolução:

- PDF;
- TXT;
- Markdown;
- CSV;
- imagens/documentos somente quando um pipeline de extração real estiver disponível.

## Fluxo

```text
Material
  -> Upload Boundary
  -> File Validation
  -> Extraction
  -> Normalization
  -> Structured Candidate Data
  -> Human Review when required
  -> Persisted Knowledge / Catalog
```

A LLM poderá interpretar o conteúdo, mas nunca deverá publicar automaticamente uma informação comercial sensível sem validação determinística adequada.

## Auto-preenchimento de produtos

O sistema poderá detectar candidatos:

```text
Produto
Nome
Descrição
Preço
Categoria
Disponibilidade
Variações/modificadores
```

O resultado deve ser tratado como `PROPOSED`, não como produto definitivo, até passar pelas validações e regras do catálogo.

Exemplo:

```text
IMPORT RESULT
ProductCandidate
├── source_file_id
├── source_reference
├── name
├── description
├── price_amount_cents
├── currency
├── category_candidate
├── availability_candidate
├── confidence
└── review_status
```

## Regras

- nunca inferir preço ausente;
- nunca transformar texto promocional em preço oficial sem evidência;
- nunca sobrescrever produto existente silenciosamente;
- preservar origem do dado;
- registrar versão do material;
- registrar quem aprovou a publicação;
- permitir rejeição de candidatos;
- suportar reprocessamento idempotente.

## Base de conhecimento

Conhecimento institucional separado de catálogo comercial:

```text
KnowledgeDocument
KnowledgeChunk
KnowledgeSource
CatalogCandidate
```

A futura recuperação deve respeitar `store_id`, permissões e escopo do assistente.

## Critérios de aceitação

1. importar material;
2. validar tipo/tamanho;
3. extrair texto;
4. persistir fonte e checksum;
5. gerar candidatos estruturados quando suportado;
6. revisar antes de publicação sensível;
7. registrar auditoria;
8. disponibilizar conteúdo ao Context Builder;
9. não expor arquivos ou secrets indevidamente.
