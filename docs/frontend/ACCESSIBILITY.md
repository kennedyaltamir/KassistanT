# ACCESSIBILITY, KEYBOARD AND RESPONSIVE

Status: IMPLEMENTED baseline / visual runtime validation pending.

- Navegação semântica em `<nav>` e botões.
- Labels associados a inputs.
- Foco visível consistente.
- Dialog com `role=dialog` e `aria-modal=true`.
- Main focável para navegação programática.
- Layout responde abaixo de 820px: sidebar horizontal, grids e split em coluna, padding reduzido e overflow da navegação controlado.

CURRENT_GAP: atalhos globais documentados e implementados além do comportamento nativo de Tab/Shift+Tab/Enter/Escape = APPROVED_TARGET quando houver implementação explícita sem conflito com Electron. Não declarar atalhos inexistentes.

Validação obrigatória ainda pendente em runtime Windows: janela pequena, padrão e maximizada; navegação integral por teclado e gerenciamento de foco de dialog.
