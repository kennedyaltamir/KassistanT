# MVP Transition — C1 First Real User

## PURPOSE
Formalizar a transição operacional para `C1_FIRST_REAL_USER` sem substituir a `main`, o baseline ou a governança existente.

## BASE_SHA
`86387b02ed55ef3af3b24f1591b3e0b0ff436a30`

## BASE_BRANCH
`main`

## MVP_BRANCH
`MVP`

## CURRENT_OBJECTIVE
`RUNNING_REAL_SYSTEM`

O objetivo imediato é permitir uma primeira operação real para uma pessoa real: instalar e executar o sistema, conectar WhatsApp real, receber e visualizar conversas, responder manualmente, cadastrar produtos e preços, criar e confirmar pedidos, persistir dados, reiniciar e recuperar o estado e concluir uma venda real.

## C1_FIRST_REAL_USER_DEFINITION
O fluxo-alvo é:

`install → start → real WhatsApp → receive message → identify conversation → display conversation → manual response → register product → create order → add products → calculate total → register payment condition → minimal delivery information when applicable → confirm order → persist → restart → recover → real sale`

Uma capacidade entra no C1 somente quando sua ausência impedir a primeira venda real.

## PRESERVED_FOUNDATION
Preservados integralmente:

- `main`
- baseline aprovado
- `consensus/`
- `consensus/audit1/`
- `consensus/audit2/`
- master audits e decision queues
- decisões históricas
- roadmap
- branches existentes

Esta transição é de prioridade e classificação operacional, não de destruição ou substituição arquitetural.

## C2_SCOPE
`COMMERCIAL_PRODUCT`

Inclui, conforme o escopo aprovado posteriormente: funcionalidade comercial mais ampla, automação LLM, integrações avançadas e demais capacidades que não sejam necessárias para a primeira operação real.

## C3_SCOPE
`SCALE / HARDENING / ADVANCED`

Escala, hardening avançado, multi-user/multi-tenant, analytics avançado, capacidades avançadas de IA e demais trabalhos pós-MVP.

## ACTIVE_DECISIONS
As decisões ainda pendentes permanecem separadas de autorização de implementação. O fato de a branch MVP existir não aprova contratos ou implementações pendentes.

Principais decisões ainda relevantes ao C1 devem ser registradas e tratadas conforme a fila humana vigente, incluindo, quando aplicável, decisões de schema, criptografia, autenticação mínima segura, integração WhatsApp e persistência/recuperação mínima.

## ACTIVE_IMPLEMENTATION_SLICES
Nenhuma implementação é autorizada automaticamente pela criação da branch. Os slices serão autorizados individualmente após decisão e readiness.

## MERGE_POLICY
A branch `MVP` é uma trilha de execução controlada. Trabalho nela permanece `MVP_PROGRESS`/`BRANCH_PROGRESS` até passar pelos gates de scope, testes, review, auditoria, CI e autorização de merge.

`main` continua sendo a autoridade de integração.

## LOCAL_TESTING_POLICY
Cada slice deve possuir, quando aplicável:

- comando exato;
- pré-requisitos;
- variáveis/credenciais necessárias;
- resultado esperado;
- testes locais;
- smoke test;
- observações de falha.

CI não substitui validação local do primeiro usuário real.

## SECURITY_MINIMUM
O C1 pode reduzir escopo e complexidade, mas não pode deliberadamente:

- desabilitar autenticação;
- bypassar autorização;
- hardcodar credenciais de produção;
- degradar segurança de transporte;
- introduzir tratamento inseguro de segredos.

## RECOVERY_MINIMUM
O C1 deve demonstrar que produtos, conversas e pedidos essenciais sobrevivem a reinício e podem ser recuperados. A infraestrutura necessária deve ser determinada por evidência, não por roadmap.

## EXIT_CRITERIA
`MVP_BRANCH_READY = TRUE`

`MVP_IMPLEMENTATION_AUTHORIZATION = PENDING_PER_SLICE`

`C1_FIRST_REAL_USER = VERIFIED` somente depois da execução e evidência reais do fluxo completo de primeira venda.

## GOVERNANCE
Esta branch não substitui a `main`, não concede autorização global e não promove automaticamente qualquer branch de agente. A governança anterior permanece válida.
