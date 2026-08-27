# APP SHELL

Status: IMPLEMENTED.

Sidebar profissional, header, título de página, navegação ativa, área principal, status global, toast e dialog layer são renderer-local. Foco visível é aplicado aos controles; o conteúdo principal recebe foco programático por `tabindex=-1` quando apropriado. A sidebar colapsa para navegação horizontal em largura reduzida.

Tratamento de alteração não salva é PROVISIONAL: o renderer mantém alterações apenas na sessão atual; nenhuma operação é persistida.
