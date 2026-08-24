# FRONTEND SPECIFICATION — C1

SPEC_VERSION: `1.0.0-c1`
BASE_COMMIT: `947d8da1cb42c51e3ed8e2ba1ff46eb4e37e126e`
LAST_IMPLEMENTED_COMMIT: `0b57e73d8dfc86f3c50afc125251b852a2d86b6e`
C1_SCOPE: `C1_FIRST_REAL_USER`
DOCUMENT_STATUS: `DRAFT_RECONCILED`

Aprovação final pertence ao operador. Esta versão reconcilia o estado real conhecido da branch MVP sem declarar integração backend verificada.

## CURRENT_IMPLEMENTATION

IMPLEMENTED: AppShell, navegação C1, Dashboard, Products, Orders, confirmação visual, Conversations, Clients mínimo, Settings/Diagnostics, dialogs, toasts, validação de apresentação, foco visível e layout responsivo. A implementação principal permanece renderer-local e atualmente concentrada no bootstrap HTML; os modelos em `main.tsx` são presentation-only/provisional/non-canonical.

## CURRENT_GAPS

- Adapter real de Product/Order: APPROVED_TARGET, fonte: escopo C1 + MVP-SLICE-002; CURRENT_GAP enquanto não houver boundary consumível autorizada.
- Confirmação canônica: APPROVED_TARGET, fonte: C1/domain scope; renderer não pode implementar ConfirmOrder canônico.
- Transporte de Conversas: APPROVED_TARGET para futura integração, fonte: C1 scope; CURRENT_GAP, sem WSS/WhatsApp.
- Diagnósticos reais de IPC/persistence/transport/auth: PROVISIONAL/UNKNOWN sem canal autorizado.
- Testes de interação executada no Electron: APPROVED_TARGET; CURRENT_GAP de infraestrutura de execução disponível nesta tarefa.

## Navegação

CURRENT_NAVIGATION = APPROVED_C1_NAVIGATION: Dashboard, Conversas, Pedidos, Produtos, Clientes, Configurações. FUTURE_NAVIGATION: Financeiro, Estoque, CRM avançado, Analytics, Billing e SaaS = NOT_REQUIRED_FOR_C1.

## Real data boundary

`REAL_DATA` somente quando integração verificada entregar o dado. Fixtures locais são `PROVISIONAL_DATA`; capacidades sem boundary são `UNAVAILABLE`. Nenhuma tela pode apresentar fixture como persistida ou sucesso de transporte como confirmado.

## Traceability

| UI-REQ-ID | AREA | REQUIREMENT | STATE | IMPLEMENTATION_REFERENCE | TEST_REFERENCE | SCOPE |
|---|---|---|---|---|---|---|
| UI-01 | Shell | Navegação C1 e active state | IMPLEMENTED | index.html AppShell | frontend-operational | C1 |
| UI-02 | Products | List/create/detail/edit sessão | IMPLEMENTED/PROVISIONAL | index.html products | frontend-operational | C1 |
| UI-03 | Orders | Draft/review/items/confirmation visual | IMPLEMENTED/PROVISIONAL | index.html orders | frontend-operational | C1 |
| UI-04 | Conversations | List/history/composer unavailable | IMPLEMENTED | index.html conversations | frontend-operational | C1 |
| UI-05 | Clients | Lista e identidade mínima | IMPLEMENTED/PROVISIONAL | index.html clients | frontend-operational | C1 |
| UI-06 | Settings | Settings/Diagnostics/About | IMPLEMENTED/PROVISIONAL | index.html settings | frontend-operational | C1 |
| UI-07 | A11y | Labels/dialog/focus | IMPLEMENTED | index.html CSS/HTML | frontend-operational | C1 |
| UI-08 | Responsive | Desktop pequeno/padrão | IMPLEMENTED | index.html media query | visual acceptance pending | C1 |
| UI-09 | Integration | Real persistence/transport/auth/IPC | APPROVED_TARGET | CROSS_AGENT_REQUESTS | integration acceptance | C1 |

## Acceptance separation

VISUAL_ACCEPTANCE: layout, navegação, interação, forms, states, accessibility e responsiveness. INTEGRATION_ACCEPTANCE: persistence, backend, WhatsApp/WSS, auth e IPC. A aprovação visual não implica `REAL_BACKEND_INTEGRATION = VERIFIED`.
