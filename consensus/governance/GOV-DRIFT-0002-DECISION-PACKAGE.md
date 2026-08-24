# GOV-DRIFT-0002 — Decision Package

Status: **BLOCKER / PENDING_OPERATOR_DECISION**
Authority: `OPERATOR_PROJECT_GOVERNANCE`
Verified baseline: `MVP2` @ `0bea2a0ca7c52729cfd58bebc8cd568373222230`

## Conflict

O estado factual do branch contém `apps/desktop/database/migrations/0002_c1_product_order.sql`, enquanto `agents/01-schema/MIGRATION-0002-PROJECTION.md` declara `0002 file: NOT CREATED` e o `HUMAN-SCHEMA-REVIEW.md` declara `0002 NOT AUTHORIZED`.

O commit atual do branch é inclusive um revert de um probe documental, demonstrando necessidade de tratar o HEAD como evidência factual e não como relato histórico.

## Question

Qual deve ser a autoridade normativa do estado físico existente de Migration 0002 e qual tratamento deve receber o arquivo já presente?

## Real Alternatives

### Option A — Preserve and formally recognize existing 0002

Reconhecer o arquivo atual como artefato físico existente, sem ainda declarar que ele é normativamente aprovado. Em seguida, IA-01 reconcilia o conteúdo com os contratos vigentes e registra lacunas.

Consequence: preserva o estado físico, mas exige reconciliação explícita antes de qualquer uso como baseline normativa.

### Option B — Treat existing 0002 as non-authoritative artifact

Classificar o arquivo como implementação histórica/experimental não normativa e manter a regra documental de que nenhuma migration é autorizada até novo fechamento contratual.

Consequence: preserva a evidência do arquivo sem atribuir autoridade sem aprovação.

### Option C — Escalate to broader repository governance decision

O Operator decide uma regra global para artifacts físicos que contradizem gates documentais, incluindo ownership e autoridade de migration state.

Consequence: resolve a classe de conflitos, não apenas este arquivo.

## Recommendation

**Nenhuma opção é escolhida unilateralmente neste pacote.** A decisão pertence ao Operator. A recomendação operacional é somente registrar o conflito como blocker e impedir que a presença física de `0002` seja interpretada como aprovação normativa.

## Required Facts for Decision

- `0002` existe fisicamente em `MVP2`.
- O conteúdo atual cria `product`, `order`, `order_item` e `order_item_modifier` e adiciona índices de store/parent.
- O arquivo atual não corresponde integralmente ao projection document que lista 28 tabelas e sete uniqueness constraints.
- O projection document afirma que `domain_outbox` deve ser final e que CONTRACT-001 pode afetar seu escopo.

## Decision State

`PENDING_OPERATOR_DECISION`.

## Prohibited Interpretation

Existência física != aprovação normativa.

Nenhuma alternativa deste pacote autoriza executar migrations, criar nova migration, alterar schema, remover `0002` ou fazer merge.
