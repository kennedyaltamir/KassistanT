# ACCEPTANCE CRITERIA

## Implementation acceptance

- Todas as seis áreas C1 possuem implementação de superfície e navegação ativa no renderer.
- Products e Orders possuem interação local e validação apresentacional no código.
- DRAFT → confirmação explícita → CONFIRMED é visual e claramente provisional.
- Conversations não declara entrega sem transport.
- Estados provisional/unavailable/not connected são representados.
- Labels, foco e dialog possuem implementação de acessibilidade no renderer.
- O layout contém regras para janela pequena, padrão e maximizada.

Status desta seção: `IMPLEMENTED / RUNTIME_UNVERIFIED`.

## Test evidence

O teste atual fornece `STATIC_SOURCE_ASSERTIONS_PRESENT`. Ele verifica a presença estrutural de elementos críticos no código-fonte, mas não executa interação real.

- `STATIC_UI_ASSERTIONS = VERIFIED_BY_TEST`
- `INTERACTION_TESTS = NOT_VERIFIED`
- `ELECTRON_RUNTIME_TESTS = NOT_VERIFIED`

## Visual acceptance

Visual acceptance exige execução no SHA atual para validar layout, interação, navegação, forms, states, accessibility e responsiveness. Status atual: `PENDING`.

## Integration acceptance — separado

Persistence real, ConfirmOrder canônico, IPC, WSS/WhatsApp, auth e diagnostics reais exigem boundaries externos. Status atual: `NOT_VERIFIED / NOT_AUTHORIZED` conforme a capability.

## Operator validation commands

`pnpm lint` · `pnpm typecheck` · `pnpm test` · `pnpm build` · `pnpm --dir apps/desktop dev`

Resultados de execução devem ser registrados contra o commit exato validado. Somente após execução local/Electron no SHA correspondente é permitido declarar runtime VERIFIED.