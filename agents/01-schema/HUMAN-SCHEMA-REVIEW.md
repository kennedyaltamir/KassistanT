# KassisT — IA-01 Human Schema Review

Status: **REVIEW REQUIRED / 0002 NOT AUTHORIZED**
Branch: `Agent01-schema-canonical-sqlite`

## Decision review — SD-001..SD-005

These five decisions are independent physical-schema decisions. They are **PROPOSALS**, not decisions, and each requires explicit operator approval or rejection.

### SD-001 — Physical SQL naming

**DECISION_ID:** `SD-001`

**QUESTION**

Adotar `lower_snake_case` para nomes físicos de tabelas e colunas do schema canônico SQLite?

**CURRENT_EVIDENCE**

- `apps/desktop/database/migrations/0001_bootstrap.sql` já usa `_schema_metadata`, `schema_version` e `key/value` em `snake_case`.
- Os nomes de campos publicados na baseline/documentação são predominantemente `snake_case`.
- Não existe, até o momento, uma regra global protegida que congele outra convenção física.
- A decisão é de representação física no território IA-01; não altera semântica de domínio.

**REAL_OPTIONS**

- **A — Approve:** `lower_snake_case` para tabelas e colunas do schema canônico.
- **B — Reject and define another convention:** o operador deverá informar a convenção substituta antes do DDL.
- **C — Escalate globally:** transformar naming físico em regra de repository/arquitetura antes de avançar.

**RECOMMENDATION**

`A`. É a alternativa de menor surpresa e mais consistente com a foundation existente.

**TRADE_OFFS**

- Prós: consistência com `0001`, SQL legível, nomes previsíveis e menor chance de divergência entre migrations.
- Contras: depois que o schema for consumido, renaming físico passa a exigir migration e compatibilidade.
- Não resolve nullability, defaults, FK actions ou campos semânticos.

**CROSS_AGENT_IMPACT**

Afeta consumidores de persistência de forma indireta: IA-02..IA-07 e futuros repositories/adapters referenciarão os nomes físicos. Não muda nenhum contrato semântico por si só.

**REVERSIBILITY**

Alta antes da primeira migration canônica; baixa depois que consumidores dependam dos nomes físicos.

**RISKS**

Médio: divergência de naming entre schema e runtime se diferentes consumidores adotarem convenções distintas.

**CLASSIFICATION**

`PROPOSAL`

**OPERATOR_DECISION**

`PENDING`

---

### SD-002 — UUID physical representation

**DECISION_ID:** `SD-002`

**QUESTION**

Persistir UUIDv7 canônico como string UUID em SQLite `TEXT`?

**CURRENT_EVIDENCE**

- UUIDv7 é uma convenção semântica/projeto já estabelecida.
- A foundation M5.1 fornece primitive UUIDv7 string-compatible.
- Não há contrato protegido que exija representação binária `BLOB(16)`.
- A decisão não escolhe a forma lógica do identificador; escolhe somente a representação física SQLite.

**REAL_OPTIONS**

- **A — Approve:** canonical UUID string em `TEXT`.
- **B — Reject / BLOB:** UUID binário de 16 bytes em `BLOB`.
- **C — Other:** outra representação explicitamente definida pelo operador.

**RECOMMENDATION**

`A`.

**TRADE_OFFS**

- `TEXT`: melhor inspeção/debug, interoperabilidade direta e menor acoplamento a codecs binários.
- `BLOB`: armazenamento mais compacto e representação binária, porém aumenta necessidade de codec/serialização e dificulta inspeção manual.
- A escolha precisa ser estável porque afeta PKs, FKs, UNIQUEs e correlação entre componentes.

**CROSS_AGENT_IMPACT**

Afeta qualquer tabela que persista UUIDv7 em PK/FK/correlation identifiers. IA-02..IA-07 precisam consumir a mesma representação; isso não redefine os IDs semanticamente.

**REVERSIBILITY**

Moderada antes de consumers; baixa após criação e consumo de PK/FK.

**RISKS**

Médio: representação inconsistente entre tabelas ou adapters produziria conversões silenciosas e risco de incompatibilidade.

**CLASSIFICATION**

`PROPOSAL`

**OPERATOR_DECISION**

`PENDING`

---

### SD-003 — UTC timestamp representation

**DECISION_ID:** `SD-003`

**QUESTION**

Persistir timestamps UTC em `TEXT` usando uma forma canônica RFC3339/ISO-8601?

**CURRENT_EVIDENCE**

- UTC é requisito semântico estabelecido.
- M5.1 fornece primitive UTC/timestamp.
- SQLite não possui um timestamp nativo independente de convenção.
- Não há contrato protegido que congele epoch integer ou outra representação física.

**REAL_OPTIONS**

- **A — Approve:** canonical UTC text em formato RFC3339/ISO-8601.
- **B — Reject / epoch:** Unix epoch em `INTEGER`.
- **C — Other:** formato físico explicitamente definido.

**RECOMMENDATION**

`A`.

**TRADE_OFFS**

- `TEXT`: legível, auditável e simples para integração/debug.
- Epoch integer: compacto e eficiente para ordenação/comparação, mas menos legível e exige convenção explícita de unidade/precisão.
- Qualquer escolha precisa congelar unidade, precisão e timezone semantics de forma consistente.

**CROSS_AGENT_IMPACT**

Afeta todos os campos temporais persistidos por Core, Event Infrastructure, Order, Conversation/AI, Device e integrações. Não altera o significado de eventos ou lifecycle.

**REVERSIBILITY**

Moderada antes da materialização; baixa depois que consultas, indexes e adapters dependerem do formato.

**RISKS**

Médio: precisão inconsistente ou mistura de formatos pode produzir ordenação incorreta, comparações ambíguas e problemas de interoperabilidade.

**CLASSIFICATION**

`PROPOSAL`

**OPERATOR_DECISION**

`PENDING`

---

### SD-004 — Boolean physical representation

**DECISION_ID:** `SD-004`

**QUESTION**

Representar valores boolean-like em SQLite como `INTEGER` com `CHECK (value IN (0,1))`, somente onde o campo é semanticamente booleano?

**CURRENT_EVIDENCE**

- SQLite não possui um tipo booleano independente.
- A documentação já possui campos semanticamente boolean-like, como flags de disponibilidade/ativação/default.
- A decisão não transforma campos `status` ou enums em booleans.

**REAL_OPTIONS**

- **A — Approve:** `INTEGER` + `CHECK (0,1)`.
- **B — TEXT boolean:** `TRUE/FALSE` textual.
- **C — Other:** convenção física explícita.

**RECOMMENDATION**

`A`.

**TRADE_OFFS**

- `INTEGER 0/1`: compatível com SQLite, compacto e fácil de restringir por `CHECK`.
- `TEXT`: mais legível, porém menos consistente com a semântica de domínio booleana e maior superfície para valores inválidos.
- A regra deve ser aplicada apenas a campos realmente booleanos; não deve encobrir estados múltiplos.

**CROSS_AGENT_IMPACT**

Afeta qualquer consumidor de campos boolean-like; IA-02, IA-04, IA-05 e IA-06 precisam preservar a semântica booleana sem introduzir encodings alternativos.

**REVERSIBILITY**

Alta antes de DDL; moderada após consumidores.

**RISKS**

Baixo a médio: o maior risco é aplicar o encoding a um campo que na verdade representa um estado/enumeration.

**CLASSIFICATION**

`PROPOSAL`

**OPERATOR_DECISION**

`PENDING`

---

### SD-005 — JSON payload representation

**DECISION_ID:** `SD-005`

**QUESTION**

Quando o contrato define explicitamente um payload/metadata como JSON e não requer decomposição relacional, armazenar o JSON canônico em SQLite `TEXT`?

**CURRENT_EVIDENCE**

- Persistence/backend/AI documents usam conceitos de `payload`, `metadata` e referências estruturadas.
- SQLite não possui um JSON type obrigatório no contrato atual.
- Nem todo campo `metadata` deve ser tratado como JSON: a representação só pode ser aplicada quando o contrato realmente define conteúdo JSON.
- Campos que possuem semântica relacional continuam devendo ser colunas relacionais.

**REAL_OPTIONS**

- **A — Approve narrowly:** JSON canônico em `TEXT` somente quando o contrato definir JSON e não houver requisito relacional.
- **B — BLOB encoding:** codec binário explícito.
- **C — Relational decomposition:** persistir campos estruturais como colunas/tabelas quando o contrato exigir consulta/constraint relacional.
- **D — Mixed policy:** A para payloads realmente JSON, C para conteúdo estrutural; rejeitar BLOB como padrão.

**RECOMMENDATION**

`D`, operacionalmente equivalente à regra restrita de A+C. Não aprovar “JSON em TEXT para qualquer metadata”.

**TRADE_OFFS**

- `TEXT JSON`: simples, interoperável e inspecionável, mas menos adequado para queries/constraints internas sobre subcampos.
- Relational: melhor para filtros, FKs e invariantes, porém exige schema explícito.
- BLOB: só deve existir se houver contrato de encoding binário; caso contrário adiciona complexidade sem evidência.

**CROSS_AGENT_IMPACT**

Principalmente IA-03 (Inbox/Job/Audit), IA-05 (AIExecution/Knowledge) e integrações. O encoding não pode ser usado para esconder campos que deveriam ter contrato relacional.

**REVERSIBILITY**

Moderada antes dos consumidores; baixa quando payloads forem persistidos e seu encoding for assumido por adapters.

**RISKS**

Médio: promover conteúdo sem contrato para JSON TEXT pode transformar lacunas semânticas em um “schema escape hatch”.

**CLASSIFICATION**

`PROPOSAL`

**OPERATOR_DECISION**

`PENDING`

---

## SD Decision Impact Matrix

| SD_ID | TABLES_AFFECTED | BLOCKERS_REMOVED | BLOCKERS_REMAINING | CROSS_AGENT_DEPENDENCIES | HUMAN_APPROVAL_REQUIRED |
|---|---|---|---|---|---|
| SD-001 | Todas as 28 tabelas com persistência física canônica | Physical naming blocker | Field model, nullability/defaults, PK/FK, constraints, indexes and semantics | Todos os consumidores físicos | YES |
| SD-002 | Todas as tabelas que persistirem UUIDv7 PK/FK/correlation identifiers | UUID physical representation blocker | Field-level ID inventory, nullability/defaults, PK/FK semantics | IA-02..IA-07, conforme campo | YES |
| SD-003 | Todas as tabelas com persisted timestamps | Timestamp representation blocker | Timestamp field inventory, nullability/defaults and index semantics | IA-02..IA-07, conforme campo | YES |
| SD-004 | Tabelas com campos boolean-like semanticamente congelados | Boolean physical representation blocker para esses campos | Identificação semântica de cada boolean, demais constraints | Relevant semantic owners | YES |
| SD-005 | Tabelas com payloads explicitamente definidos como JSON | JSON physical representation blocker desses payloads | Definição de quais payloads são JSON, relational decomposition where required | Principalmente IA-03/IA-05/provider owners | YES |

### Important interpretation

**No SD individually unlocks a table to `DETERMINISTIC`.** The SDs remove physical-representation classes of blockers. A table becomes deterministic only when its remaining field, relationship, nullability, default, constraint, index, lifecycle and ownership questions are also closed.

The five SDs therefore cannot be treated as an indivisible “approve all” package.

## Human decisions required

The operator may answer independently:

`APPROVE SD-001`

`REJECT SD-001`

`APPROVE OPTION-B SD-002`

`APPROVE SD-003`

`REJECT SD-004`

`APPROVE OPTION-D SD-005`

Unspecified decisions remain `PENDING`.

## Migration gate

`0002` remains **NOT AUTHORIZED**. No SD, individually or collectively, authorizes migration creation.
