# FRONTEND SPECIFICATION — C1

SPEC_VERSION: `1.0.1-c1`
BASE_COMMIT: `947d8da1cb42c51e3ed8e2ba1ff46eb4e37e126e`
LAST_IMPLEMENTED_COMMIT: `2b521615692c8323cc5fedf79d4c221d4fc9cfa8`
C1_SCOPE: `C1_FIRST_REAL_USER`
DOCUMENT_STATUS: `DRAFT_RECONCILED`

Aprovação final pertence ao operador. Esta versão reconcilia o estado real conhecido da branch MVP sem declarar integração backend ou runtime verificados.

## IMPLEMENTATION AND VERIFICATION STATUS

`FRONTEND_OPERATIONAL_SURFACE = IMPLEMENTED_FOR_C1`

`UI_PRESENTATION_STATUS = IMPLEMENTATION_COMPLETE_PENDING_RUNTIME_VERIFICATION`

`FRONTEND_VERIFICATION = PENDING`

`RUNTIME_VERIFICATION = NOT_VERIFIED`

A implementação presente no código não equivale a execução validada como produto operacional. Verificação anterior só é evidência para o SHA em que foi executada; ela não é transferida automaticamente para commits posteriores.

## CURRENT_IMPLEMENTATION

IMPLEMENTED: AppShell, navegação C1, Dashboard, Products, Orders, confirmação visual, Conversations, Clients mínimo, Settings/Diagnostics, dialogs, toasts, validação de apresentação, foco visível e layout responsivo. A implementação principal permanece renderer-local e atualmente concentrada no bootstrap HTML; os modelos em `main.tsx` são presentation-only/provisional/non-canonical.

UI_ARCHITECTURE: `EARLY_MONOLITHIC_RENDERER`. Refatoração arquitetural é `DEFERRED` e não é condição adicional para C1.

## CURRENT_GAPS

- Adapter real de Product/Order: APPROVED_TARGET, fonte: escopo C1 + MVP-SLICE-002; CURRENT_GAP enquanto não houver boundary consumível autorizada.
- Confirmação canônica: APPROVED_TARGET, fonte: C1/domain scope; renderer não pode implementar ConfirmOrder canônico.
- Transporte de Conversas: APPROVED_TARGET para futura integração, fonte: C1 scope; CURRENT_GAP, sem WSS/WhatsApp.
- Diagnósticos reais de IPC/persistence/transport/auth: PROVISIONAL/UNKNOWN sem canal autorizado.
- Testes de interação executada: CURRENT_GAP. `STATIC_SOURCE_ASSERTIONS_PRESENT`; `INTERACTION_RUNTIME_TESTS = PENDING`; `ELECTRON_RUNTIME_TESTS = NOT_VERIFIED`.
- Runtime e aceitação visual do HEAD atual: CURRENT_GAP até nova execução de lint, typecheck, test, build e Electron/Windows no SHA correspondente.

## Navigation

CURRENT_NAVIGATION = APPROVED_C1_NAVIGATION: Dashboard, Conversas, Pedidos, Produtos, Clientes, Configurações. FUTURE_NAVIGATION: Financeiro, Estoque, CRM avançado, Analytics, Billing e SaaS = NOT_REQUIRED_FOR_C1.

## Design system evidence boundary

`DESIGN_SYSTEM = TOKENS_AND_COMPONENT_VOCABULARY_IMPLEMENTED`

`REUSABLE_COMPONENT_IMPLEMENTATIONS = NOT_PROVEN / PARTIAL`

`packages/ui/src/index.ts` estabelece tokens, tipos, estados e vocabulário. A lista de nomes de componentes não prova que cada componente React/UI exista como implementação reutilizável funcional. Implementações concretas podem permanecer renderer-local até haver necessidade real de compartilhamento.

## Test strategy evidence boundary

O teste `frontend-operational.test.mjs` fornece assertivas estruturais de fonte. Ele não demonstra por si só click, navegação executada, submit, confirmação, teclado ou transições de estado em runtime.

`STATIC_UI_ASSERTIONS = VERIFIED_BY_TEST`

`INTERACTION_TESTS = NOT_VERIFIED`

`ELECTRON_RUNTIME_TESTS = NOT_VERIFIED`

## Real data boundary

`REAL_DATA` somente quando integração verificada entregar o dado. Fixtures locais são `PROVISIONAL_DATA`; capacidades sem boundary são `UNAVAILABLE`. Nenhuma tela pode apresentar fixture como persistida ou sucesso de transporte como confirmado.

## Cross-agent boundary

CAR-01, CAR-02 e CAR-03 são requests de capacidade externa. Status de request não é aprovação de contrato. `REQUESTED` ou `PENDING` significa ausência de autorização/evidência até decisão formal da autoridade correspondente.

## Traceability

| UI-REQ-ID | AREA | REQUIREMENT | STATE | IMPLEMENTATION_REFERENCE | TEST_REFERENCE | SCOPE |
|---|---|---|---|---|---|---|
| UI-01 | Shell | Navegação C1 e active state | IMPLEMENTED / UNVERIFIED_RUNTIME | index.html AppShell | static source assertions | C1 |
| UI-02 | Products | List/create/detail/edit sessão | IMPLEMENTED / PROVISIONAL | index.html products | static source assertions | C1 |
| UI-03 | Orders | Draft/review/items/confirmation visual | IMPLEMENTED / PROVISIONAL | index.html orders | static source assertions | C1 |
| UI-04 | Conversations | List/history/composer unavailable | IMPLEMENTED / UNVERIFIED_RUNTIME | index.html conversations | static source assertions | C1 |
| UI-05 | Clients | Lista e identidade mínima | IMPLEMENTED / PROVISIONAL | index.html clients | static source assertions | C1 |
| UI-06 | Settings | Settings/Diagnostics/About | IMPLEMENTED / PROVISIONAL | index.html settings | static source assertions | C1 |
| UI-07 | A11y | Labels/dialog/focus | IMPLEMENTED / UNVERIFIED_RUNTIME | index.html CSS/HTML | static source assertions | C1 |
| UI-08 | Responsive | Desktop pequeno/padrão | IMPLEMENTED / VISUAL_ACCEPTANCE_PENDING | index.html media query | static source assertions | C1 |
| UI-09 | Integration | Real persistence/transport/auth/IPC | APPROVED_TARGET / REQUESTED_BOUNDARY | CROSS_AGENT_REQUESTS | integration acceptance | C1 |
| UI-10 | Verification | Executed interaction/runtime evidence | APPROVED_TARGET / CURRENT_GAP | test/runtime infrastructure | pending | C1 |

## Acceptance separation

VISUAL_ACCEPTANCE: layout, navegação, interação, forms, states, accessibility e responsiveness. Status atual: `PENDING` para o HEAD atual.

INTEGRATION_ACCEPTANCE: persistence, backend, WhatsApp/WSS, auth e IPC. Status atual: `NOT_VERIFIED / NOT_AUTHORIZED` conforme a boundary.

A aprovação visual não implica `REAL_BACKEND_INTEGRATION = VERIFIED`.
