# KassisT — IA-01 Human Schema Review

Status: **WAITING FOR OWNER / OPERATOR RESPONSES / 0002 FORBIDDEN**
Branch: `Agent01-schema-canonical-sqlite`

## Response consolidation state

No new semantic-owner response was supplied in the current execution input.

Therefore:

- `OWNER_RESPONSES_RECEIVED = 0`
- `OWNER_RESPONSES_ACCEPTED = 0`
- `OWNER_RESPONSES_PARTIAL = 0`
- `OWNER_RESPONSES_CONFLICTING = 0`
- `OWNER_RESPONSES_NOT_VERIFIED = 0`
- all previously issued cross-agent requests remain pending;
- no proposal has been promoted to `APPROVED`;
- no table has been promoted to `READY`;
- no conflict has been fabricated from absence of evidence.

The only authoritative state change in this execution is the explicit recording that responses are still pending.

## A. Decisions ready for immediate operator approval

### SD-001 — Physical SQL naming
**QUESTION**
Adotar `lower_snake_case` para nomes físicos das tabelas e colunas do schema canônico?

**EVIDENCE**
`_schema_metadata` já usa snake_case; os campos documentados também usam snake_case. Não existe regra global explícita de naming.

**OPTIONS**
- A: aprovar `lower_snake_case` para o território de schema da IA-01.
- B: definir outra convenção.
- C: promover a questão para regra global de repository.

**RECOMMENDATION**
A.

**IMPACT**
Todas as 28 tabelas e futuras migrations.

**OWNER**
IA-01, com confirmação do operador.

**RISK / REVERSIBILITY**
Médio / moderada antes de DDL, baixa após consumo pelo runtime.

**APPROVAL REQUIRED**
SIM — operador.

**RESPONSE STATUS**
`PENDING`

### SD-002 — UUID physical representation
**QUESTION**
Persistir UUIDv7 como canonical UUID string em SQLite `TEXT`?

**EVIDENCE**
M5.1 fornece UUIDv7 string-compatible; não há decisão BLOB no contrato protegido.

**OPTIONS**
- A: `TEXT` canonical UUID.
- B: `BLOB` 16-byte.
- C: outra representação aprovada.

**RECOMMENDATION**
A.

**IMPACT**
IDs, FKs, unique keys e correlação entre componentes.

**OWNER**
IA-01, sujeita à confirmação do operador.

**APPROVAL REQUIRED**
SIM — operador.

**RESPONSE STATUS**
`PENDING`

### SD-003 — UTC timestamp representation
**QUESTION**
Persistir timestamps UTC como RFC3339/ISO-8601 canonical `TEXT`?

**EVIDENCE**
UTC é semântica aprovada; representação SQLite não está congelada.

**OPTIONS**
- A: canonical UTC text.
- B: Unix epoch integer.
- C: outro formato aprovado.

**RECOMMENDATION**
A.

**IMPACT**
Todos os timestamps persistidos.

**OWNER**
IA-01, sujeita à confirmação do operador.

**APPROVAL REQUIRED**
SIM — operador.

**RESPONSE STATUS**
`PENDING`

### SD-004 — Boolean physical representation
**QUESTION**
Usar `INTEGER` com `CHECK (value IN (0,1))`?

**EVIDENCE**
Há semântica booleana na baseline; SQLite é a persistência MVP.

**OPTIONS**
- A: INTEGER 0/1 + CHECK.
- B: TEXT `TRUE/FALSE`.
- C: outra convenção.

**RECOMMENDATION**
A.

**IMPACT**
Campos boolean-like em várias entidades.

**OWNER**
IA-01, sujeita à confirmação do operador.

**APPROVAL REQUIRED**
SIM — operador.

**RESPONSE STATUS**
`PENDING`

### SD-005 — JSON-like payload representation
**QUESTION**
Quando o contrato identifica explicitamente conteúdo JSON e não há necessidade relacional, armazenar canonical JSON em `TEXT`?

**EVIDENCE**
Persistence/Job/Audit/AI contracts descrevem payload/metadata; não existe tipo JSON SQLite aprovado.

**OPTIONS**
- A: canonical JSON in TEXT.
- B: BLOB encoding.
- C: decomposição relacional quando o contrato exigir consulta estrutural.

**RECOMMENDATION**
A somente para payloads realmente definidos como JSON; C quando o contrato exigir campos relacionais.

**IMPACT**
Job, Inbox, Audit, Log, AIExecution e integrações relevantes.

**OWNER**
IA-01 como convenção física, caso não contradiga contrato específico.

**APPROVAL REQUIRED**
SIM — operador.

**RESPONSE STATUS**
`PENDING`

## B. Cross-agent response status

| Owner | Requests | Responses received | Accepted | Partial | Conflicting | Not verified | Current status |
|---|---:|---:|---:|---:|---:|---:|---|
| IA-02 | 3 | 0 | 0 | 0 | 0 | 0 | WAITING |
| IA-03 | 3 | 0 | 0 | 0 | 0 | 0 | WAITING |
| IA-04 | 4 | 0 | 0 | 0 | 0 | 0 | WAITING |
| IA-05 | 3 | 0 | 0 | 0 | 0 | 0 | WAITING |
| IA-06 | 2 | 0 | 0 | 0 | 0 | 0 | WAITING |
| IA-07 | 1 | 0 | 0 | 0 | 0 | 0 | WAITING |
| IA-08 | 0 | 0 | 0 | 0 | 0 | 0 | NO BLOCKING REQUEST |

A request without a supplied owner response remains unresolved.

## C. Cross-agent requests pending

### IA-02 — Domain Runtime
- `REQ-02-01`: required/optional/nullable/default semantic ownership.
- `REQ-02-02`: lifecycle/state semantic catalogs for Conversation/Message/AI/Order.
- `REQ-02-03`: per-entity Store scoping where `store_id` is not explicit.

**STATUS:** `PENDING`

### IA-03 — Event Infrastructure
- `REQ-03-01`: InboundInbox field inventory and processing/reconciliation semantics.
- `REQ-03-02`: DomainOutbox local-vs-Gateway physical fields and transaction scope.
- `REQ-03-03`: Job/Audit persistence semantics.

**STATUS:** `PENDING`

### IA-04 — Order Engine
- `REQ-04-01`: OrderItem parent key/cardinality/ownership.
- `REQ-04-02`: OrderItemModifier parent keys, ordering and uniqueness.
- `REQ-04-03`: OrderStatusHistory parent/order reference, identity and actor semantics.
- `REQ-04-04`: Order address/payment reference optionality and ownership.

**STATUS:** `PENDING`

### IA-05 — Conversation + LLM
- `REQ-05-01`: Conversation/Message persistence semantics.
- `REQ-05-02`: AIProfile/AIExecution persistence field inventory.
- `REQ-05-03`: KnowledgeItem identity/content/scope model.

**STATUS:** `PENDING`

### IA-06 — Device Authentication
- `REQ-06-01`: Device status/lifecycle persistence.
- `REQ-06-02`: Store/Device identity and required uniqueness/security metadata.

**STATUS:** `PENDING`

### IA-07 — Gateway / WSS
- `REQ-07-01`: any Gateway-owned persistence that must cross into Desktop SQLite.

**STATUS:** `PENDING`

### IA-08 — Desktop UI
No blocking request issued. UI remains outside canonical persistence authority unless a concrete physical requirement is demonstrated.

## D. Global decisions

### GD-001 — CONTRACT-001
Resolve DomainOutbox ownership/scope across Core/Gateway.

**STATUS:** `PENDING GLOBAL DECISION`

### GD-002 — Physical conventions
Approve or reject IA-01 proposals SD-001..SD-005.

**STATUS:** `PENDING OPERATOR APPROVAL`

### GD-003 — GOV-001
Only adjudicate if an actual normative document conflict changes schema interpretation.

**STATUS:** `DEFERRED`

## E. Current readiness

| Table | Current status | Required next authority |
|---|---|---|
| store | READY_AFTER_LOCAL | operator approves local physical decisions |
| device | READY_AFTER_CROSS_AGENT | IA-06 + local physical approvals |
| settings | BLOCKED | IA-02 / product authority |
| product_category | BLOCKED | IA-02 |
| product | READY_AFTER_CROSS_AGENT | IA-02 + local physical approvals |
| product_modifier | READY_AFTER_CROSS_AGENT | IA-02 / IA-04 + local physical approvals |
| product_image | READY_AFTER_LOCAL | IA-01 physical approval |
| promotion | BLOCKED | IA-02 / IA-04 |
| customer | READY_AFTER_CROSS_AGENT | IA-02 / IA-05 + local approvals |
| customer_address | BLOCKED | IA-02 / IA-04 |
| conversation | READY_AFTER_CROSS_AGENT | IA-02 / IA-05 + local approvals |
| message | BLOCKED | IA-03 / IA-05 + local approvals |
| order | BLOCKED | IA-02 / IA-04 + local approvals |
| order_item | BLOCKED | IA-04 |
| order_item_modifier | BLOCKED | IA-04 |
| order_status_history | BLOCKED | IA-04 / IA-02 |
| payment_method | BLOCKED | IA-02 / IA-04 |
| notification | BLOCKED | IA-03 + provider/domain owners |
| integration | BLOCKED | IA-02 + provider owner |
| integration_credential | BLOCKED | IA-06 + provider owner |
| inbound_inbox | BLOCKED | IA-03 |
| domain_outbox | BLOCKED_GLOBAL | project authority / CONTRACT-001 |
| job | BLOCKED | IA-03 |
| audit_log | BLOCKED | IA-03 + domain owners |
| log | READY_AFTER_LOCAL | IA-01 physical approval |
| ai_profile | BLOCKED | IA-05 / IA-02 |
| ai_execution | BLOCKED | IA-05 / IA-03 |
| knowledge_item | BLOCKED | IA-02 / IA-05 |

## F. Gate

Migration `0002` remains forbidden.

No owner response is inferred from existing documentation, recommendations, or prior requests. The next state transition requires actual owner/authority responses followed by validation and conflict detection.
