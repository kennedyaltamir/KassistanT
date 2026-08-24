# KassisT — IA-01 Human Schema Review

Status: **REVIEW REQUIRED / 0002 FORBIDDEN**
Branch: `Agent01-schema-canonical-sqlite`

## Purpose

Este documento transforma a especificação física em um pacote de decisões que o operador pode aprovar, rejeitar ou encaminhar sem reestudar toda a auditoria.

`PROPOSAL` não significa aprovado.

## A. Decisions ready for immediate operator approval

### SD-001 — Physical SQL naming

**CONTEXT**
As entidades canônicas estão congeladas, mas os nomes físicos das tabelas não estão normativamente definidos.

**QUESTION**
Adotar `lower_snake_case` para nomes físicos das tabelas e colunas do schema canônico?

**EVIDENCE**
`_schema_metadata` já usa snake_case; os campos documentados também usam snake_case em sua forma publicada. Não existe uma regra global explícita de naming.

**OPTIONS**
- A: aprovar `lower_snake_case` para o território de schema da IA-01.
- B: definir outra convenção.
- C: promover a questão para regra global de repository.

**RECOMMENDATION**
A — é a opção de menor surpresa e mais consistente com o código/schema existente.

**IMPACT**
Todas as 28 tabelas e futuras migrations.

**OWNER**
IA-01, com confirmação do operador.

**RISK**
Médio; mudança posterior exigiria migration/rename.

**REVERSIBILITY**
Moderada antes de qualquer DDL; baixa depois de schema consumido por runtime.

**APPROVAL REQUIRED**
SIM — operador.

### SD-002 — UUID physical representation

**CONTEXT**
UUIDv7 é normativo semanticamente, mas TEXT/BLOB não está congelado.

**QUESTION**
Persistir UUIDv7 como canonical UUID string em SQLite `TEXT`?

**EVIDENCE**
M5.1 expõe UUIDv7 como string-compatible primitive; não há decisão de BLOB no contrato protegido.

**OPTIONS**
- A: `TEXT` canonical UUID.
- B: `BLOB` 16-byte.
- C: outra representação aprovada.

**RECOMMENDATION**
A — simplifica inspeção, interoperabilidade e debugging e não exige nova primitive física.

**IMPACT**
IDs, FKs, unique keys e correlação entre componentes.

**OWNER**
IA-01 como decisão física local, sujeita a confirmação do operador.

**RISK**
Médio.

**REVERSIBILITY**
Baixa após consumidores existirem.

**APPROVAL REQUIRED**
SIM — operador.

### SD-003 — UTC timestamp representation

**CONTEXT**
UTC é normativo semanticamente, mas a representação SQLite não está congelada.

**QUESTION**
Persistir timestamps UTC como RFC3339/ISO-8601 canonical `TEXT`?

**EVIDENCE**
`packages/domain` define UTC semanticamente; não há tipo físico SQLite aprovado.

**OPTIONS**
- A: canonical UTC text.
- B: Unix epoch integer.
- C: outro formato aprovado.

**RECOMMENDATION**
A — preserva legibilidade, compatibilidade e alinhamento com os valores exibidos pelos contratos.

**IMPACT**
Todos os timestamps persistidos.

**OWNER**
IA-01 como decisão física local, sujeita a confirmação do operador.

**RISK**
Médio.

**REVERSIBILITY**
Baixa após consumers existirem.

**APPROVAL REQUIRED**
SIM — operador.

### SD-004 — Boolean physical representation

**CONTEXT**
Existem vários campos boolean-like (`available`, `active`, `is_default`, flags), mas SQLite não possui boolean nativo.

**QUESTION**
Usar `INTEGER` com `CHECK (value IN (0,1))`?

**EVIDENCE**
Semântica booleana aparece na baseline; SQLite é a persistência definida para MVP.

**OPTIONS**
- A: INTEGER 0/1 + CHECK.
- B: TEXT `TRUE/FALSE`.
- C: outra convenção.

**RECOMMENDATION**
A.

**IMPACT**
Campos boolean-like em várias entidades.

**OWNER**
IA-01 como decisão física local, sujeita a confirmação do operador.

**RISK**
Baixo.

**REVERSIBILITY**
Moderada antes dos consumidores.

**APPROVAL REQUIRED**
SIM — operador.

### SD-005 — JSON-like payload representation

**CONTEXT**
Payloads, metadata e references aparecem em infraestrutura e AI, mas não podem virar blobs JSON arbitrariamente.

**QUESTION**
Quando o contrato identifica explicitamente conteúdo JSON e não há necessidade relacional, armazenar canonical JSON em `TEXT`?

**EVIDENCE**
Persistence/Job/Audit/AI contracts descrevem payload/metadata concepts; não existe JSON SQLite type contract.

**OPTIONS**
- A: canonical JSON in TEXT.
- B: BLOB encoding.
- C: decomposição relacional quando o contrato exigir consulta estrutural.

**RECOMMENDATION**
A somente para payloads realmente definidos como JSON; C quando o contrato exigir campos relacionais.

**IMPACT**
Job, Inbox, Audit, Log, AIExecution e estruturas de integração relevantes.

**OWNER**
IA-01 como convenção física, caso não contradiga contrato específico.

**RISK**
Médio.

**REVERSIBILITY**
Moderada.

**APPROVAL REQUIRED**
SIM — operador.

## B. Cross-agent decisions — requests ready

### IA-02 — Domain Runtime

**REQ-02-01 — Nullability/default semantic ownership**

QUESTION: Para campos de domínio não explicitamente definidos, quais são `required`, `optional`, `nullable` e quais defaults são semanticamente aplicados pelo domínio?

CONTEXT: IA-01 não pode converter ausência de informação em `NOT NULL` ou SQL `DEFAULT`.

CURRENT_SCHEMA_ASSUMPTION: unknown-by-default.

EVIDENCE: baseline §23, domain entities and invariants; field-level schemas remain partial.

EXACT_DECISION_REQUIRED: fornecer por entidade/campo a classificação required/optional/nullable e defaults semânticos.

OPTIONS: `REQUIRED`, `OPTIONAL`, `NULLABLE`, `DERIVED`, `DOMAIN_DEFAULT`, `NO_DEFAULT`.

RECOMMENDED_OPTION: só classificar quando houver regra de domínio explícita.

TABLES_AFFECTED: Settings, ProductCategory, CustomerAddress, Conversation, Message, Order, KnowledgeItem e outras tabelas de domínio com lacunas.

BLOCKING_IMPACT: BLOQUEIA `0002` para campos afetados.

RESPONSE_REQUIRED: decisão documentada no contrato/artefato autorizado.

**REQ-02-02 — Lifecycle/state semantic ownership**
QUESTION: confirmar conjuntos canônicos e invariantes de Conversation/Message/AI/Order; indicar se algum estado adicional é necessário.
BLOCKING_IMPACT: bloqueia physical CHECK generation, não a criação de tabelas sem state fields.

**REQ-02-03 — Store scoping**
QUESTION: para entidades sem `store_id` explicitamente congelado, confirmar se são `STORE_SCOPED`, `GLOBAL` ou outro boundary.
BLOCKING_IMPACT: bloqueia tabelas afetadas e composite uniqueness.

### IA-03 — Event Infrastructure

**REQ-03-01 — Inbox physical fields**
QUESTION: fornecer field inventory mínimo de `InboundInbox`: processing state, payload hash/reference, correlation, timestamps, internal identifier e campos necessários para reconciliation.

OPTIONS: somente campos já descritos; adicionar novos apenas com evidência de runtime/contract.

BLOCKING_IMPACT: BLOQUEIA `InboundInbox` e `Message.raw_event_reference` físico.

**REQ-03-02 — Outbox physical fields**
QUESTION: separar o que é indispensável para a transação local do que depende de ownership Gateway/Core em `DomainOutbox`.

BLOCKING_IMPACT: parcial; `DomainOutbox` continua bloqueado pelo CONTRACT-001.

**REQ-03-03 — Job/Audit physical semantics**
QUESTION: fechar `Job` state/attempt/lock/scheduling fields e `AuditLog` actor/entity/before-after representations.

BLOCKING_IMPACT: bloqueia as tabelas correspondentes.

### IA-04 — Order Engine

**REQ-04-01 — OrderItem parent key**
QUESTION: qual parent reference é canônica (`Order`), qual campo físico lógico, cardinalidade e ownership?

RECOMMENDED: `Order 1:N OrderItem`, mas o campo exato deve ser fornecido por IA-04.

BLOCKING_IMPACT: BLOQUEIA OrderItem.

**REQ-04-02 — OrderItemModifier parent/child relations**
QUESTION: confirmar relação com OrderItem e ProductModifier, quantidade, ordering, uniqueness e key semantics.

BLOCKING_IMPACT: BLOQUEIA OrderItemModifier.

**REQ-04-03 — OrderStatusHistory**
QUESTION: confirmar parent Order key, history row identity, actor semantics, ordering and mutability.

BLOCKING_IMPACT: BLOQUEIA OrderStatusHistory.

**REQ-04-04 — CustomerAddress / PaymentMethod / Order nullability**
QUESTION: confirmar quais references in Order are required/optional and semantic ownership of address/payment method.

BLOCKING_IMPACT: bloqueia Order and dependent structures.

### IA-05 — Conversation + LLM

**REQ-05-01 — Conversation/Message field semantics**
QUESTION: confirmar direction, sender_type, message_type, provider status/error, media/reply references and AI state fields needed by runtime.

BLOCKING_IMPACT: bloqueia Conversation/Message where fields remain unknown.

**REQ-05-02 — AIProfile / AIExecution**
QUESTION: provide canonical persistence field inventory, version references, validation/tool-call persistence and token/latency fields.

BLOCKING_IMPACT: bloqueia AIProfile/AIExecution.

**REQ-05-03 — KnowledgeItem**
QUESTION: provide identity, content decomposition, type/category and store scope.

BLOCKING_IMPACT: bloqueia KnowledgeItem.

### IA-06 — Device Authentication

**REQ-06-01 — Device lifecycle persistence**
QUESTION: confirmar Device status catalog, lifecycle fields and which key references must persist locally vs securely.

BLOCKING_IMPACT: bloqueia Device status/check representation.

**REQ-06-02 — Store/Device identity**
QUESTION: confirmar whether Store and Device identity relations require any additional uniqueness or credential metadata beyond the existing contract.

BLOCKING_IMPACT: blocks affected physical constraints only.

### IA-07 — Gateway / WSS

**REQ-07-01 — Cross-boundary persistence ownership**
QUESTION: confirm whether any Gateway-side persistence semantics must be represented in Desktop SQLite or whether they remain Gateway-only.

BLOCKING_IMPACT: only tables explicitly crossing boundary; especially DomainOutbox under CONTRACT-001.

### IA-08 — Desktop UI

NO BLOCKING DECISION REQUEST is required now. UI semantics must not block canonical persistence unless a physical data requirement is explicitly established.

## C. Global decisions

### GD-001 — CONTRACT-001
Resolve DomainOutbox ownership/scope across Core/Gateway.

APPROVAL: project architectural authority.

### GD-002 — Physical conventions as repository-compatible schema policy
Approve or reject the IA-01 proposals for table naming, UUID, timestamp, boolean and JSON representation. If approved as local schema policy, no global ADR is required unless the project governance treats physical persistence conventions as architecture-wide.

### GD-003 — GOV-001
Only adjudicate when a documented source conflict changes a schema-critical interpretation.

## D. Current readiness

| Table | Current status | Required next authority |
|---|---|---|
| store | READY_AFTER_LOCAL | operator approves SD-001..004 as applicable |
| device | READY_AFTER_CROSS_AGENT | IA-06 + local physical approvals |
| settings | BLOCKED | IA-02 / product authority |
| product_category | BLOCKED | IA-02 |
| product | READY_AFTER_LOCAL/CROSS_AGENT | naming/type approvals + IA-02 scope/nullability |
| product_modifier | READY_AFTER_LOCAL/CROSS_AGENT | IA-02 + local physical approvals |
| product_image | READY_AFTER_LOCAL | naming/type approvals; parent relation mechanically supported |
| promotion | BLOCKED | IA-02/domain semantics |
| customer | READY_AFTER_CROSS_AGENT | IA-02 + local approvals |
| customer_address | BLOCKED | IA-02/IA-04 |
| conversation | READY_AFTER_CROSS_AGENT | IA-02/IA-05 + local approvals |
| message | BLOCKED | IA-03/IA-05 + local approvals |
| order | BLOCKED | IA-02/IA-04 + local approvals |
| order_item | BLOCKED | IA-04 |
| order_item_modifier | BLOCKED | IA-04 |
| order_status_history | BLOCKED | IA-04/IA-02 |
| payment_method | BLOCKED | IA-02/IA-04 |
| notification | BLOCKED | IA-03 + domain/provider owner |
| integration | BLOCKED | IA-02 + relevant provider owner |
| integration_credential | BLOCKED | IA-06 + relevant provider owner |
| inbound_inbox | BLOCKED | IA-03 |
| domain_outbox | BLOCKED_GLOBAL | project authority / CONTRACT-001 |
| job | BLOCKED | IA-03 |
| audit_log | BLOCKED | IA-03 |
| log | READY_AFTER_LOCAL | physical logging fields must still be frozen before DDL |
| ai_profile | BLOCKED | IA-05 + IA-02 |
| ai_execution | BLOCKED | IA-05 |
| knowledge_item | BLOCKED | IA-02 + IA-05 |

## E. Gate

Migration `0002` remains forbidden.

The next promotion step is not implementation; it is collecting the decisions above and updating the readiness matrix with actual answers. No answer is assumed merely because a recommended option exists.
