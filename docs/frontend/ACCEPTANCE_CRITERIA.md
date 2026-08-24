# ACCEPTANCE CRITERIA

## Visual acceptance

- Todas as seis áreas C1 abrem e possuem navegação ativa.
- Products e Orders executam interação local e validação apresentacional.
- DRAFT → confirmação explícita → CONFIRMED é visual e claramente provisional.
- Conversations não declara entrega sem transport.
- Estados provisional/unavailable/not connected são visíveis.
- Labels, foco e dialog são navegáveis por teclado.
- Layout permanece utilizável em janela pequena, padrão e maximizada.

## Integration acceptance — separado

Persistence real, ConfirmOrder canônico, IPC, WSS/WhatsApp, auth e diagnostics reais exigem boundaries externos. Status atual: NOT_VERIFIED nesta tarefa.

## Operator validation commands

`pnpm lint` · `pnpm typecheck` · `pnpm test` · `pnpm build` · `pnpm --dir apps/desktop dev`

Somente após execução local/Electron é permitido declarar runtime VERIFIED.
