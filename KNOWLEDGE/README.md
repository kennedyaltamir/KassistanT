# KassisT — Knowledge Base

## 1. Objetivo

`KNOWLEDGE/` é a base de conhecimento persistente do KassisT.

Seu objetivo é preservar conhecimento útil para futuras IAs, agentes, desenvolvedores, auditorias e sistemas RAG.

O conteúdo deste diretório deve reduzir redescoberta, retrabalho e repetição de erros.

---

## 2. O que pertence ao KNOWLEDGE

Registrar informações que tenham valor futuro, incluindo:

* decisões arquiteturais;
* decisões de produto;
* decisões de design;
* contratos;
* invariantes;
* causas raiz;
* bugs;
* soluções;
* limitações;
* testes significativos;
* problemas de integração;
* regras operacionais;
* decisões de segurança;
* aprendizados de incidentes;
* relações importantes entre componentes.

---

## 3. O que não pertence

Não transformar `KNOWLEDGE/` em:

* dump de terminal;
* cópia integral de conversas;
* backup do código;
* histórico de commits;
* coleção de logs sem interpretação;
* arquivo de ideias descartáveis.

O conhecimento deve ser sintetizado.

---

## 4. Estrutura inicial

```text
KNOWLEDGE/

├── README.md

├── architecture/

├── behavior/

├── decisions/

├── bugs/

├── testing/

├── security/

└── design/
```

As categorias podem crescer conforme o projeto exigir.

---

## 5. Regra de qualidade

Cada registro deve, quando aplicável, responder:

```text
O que aconteceu?

Por que aconteceu?

Como foi resolvido?

Qual regra foi estabelecida?

Qual comportamento não pode regredir?

Qual evidência existe?

Quais arquivos estão relacionados?

Quais commits estão relacionados?
```

---

## 6. Formato recomendado

```markdown
**# Título**

**## Contexto**

**## Problema / Descoberta**

**## Causa**

**## Decisão**

**## Implementação**

**## Invariante**

**## Evidência**

**## Arquivos relacionados**

**## Commits relacionados**

**## Status**

**## Observações futuras**
```

Não é obrigatório preencher todas as seções quando forem irrelevantes.

---

## 7. RAG

Os documentos serão posteriormente utilizados como fonte de recuperação semântica.

Por isso:

* usar linguagem precisa;
* utilizar nomes reais de componentes;
* preservar termos técnicos importantes;
* registrar relações entre componentes;
* evitar redundância;
* evitar textos vagos;
* registrar decisões e causas, não apenas resultados.

---

## 8. Regra de atualização

Sempre que uma Change Unit produzir conhecimento reutilizável, esse conhecimento deve ser registrado em `KNOWLEDGE/`.

Uma tarefa técnica relevante não deve ser considerada documentalmente completa quando uma descoberta importante permanece somente no contexto temporário da IA.

---

## 9. Fonte de verdade

`KNOWLEDGE/` não substitui:

```text
REGRAS/

código

testes

contratos

Git
```

Cada fonte possui uma função diferente.

```text
REGRAS     → comportamento normativo
código     → implementação
testes     → evidência verificável
Git        → histórico
KNOWLEDGE  → conhecimento reutilizável
```

---

## 10. Regra para futuras IAs

Antes de iniciar uma Change Unit:

```text
Leia a regra da área.

Leia REGRAS/behaviour.md.

Procure conhecimento relevante em KNOWLEDGE/.

Depois audite o código.
```

O agente deve reutilizar conhecimento existente antes de reconstruir uma solução já conhecida.
