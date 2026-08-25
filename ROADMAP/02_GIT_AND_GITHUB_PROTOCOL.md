# 02 — GIT AND GITHUB PROTOCOL

## Estado obrigatório

Antes de testes ou alterações, conferir:

```powershell
git status
git branch --show-current
git rev-parse HEAD
git rev-parse origin/<branch>
git log -1 --oneline
```

## Regras

- Nunca assumir que branch local e remoto são iguais sem verificar.
- Nunca assumir que PR foi criado, aprovado, atualizado ou mergeado sem consultar GitHub.
- SHA completo deve ser usado quando sincronização exata importar.
- Divergências entre local e remoto devem ser investigadas antes de integração.
- Evitar operações destrutivas sem análise explícita.

## Após publicação

1. Conferir SHA remoto.
2. Conferir PR relacionado.
3. Conferir checks de CI.
4. Conferir base e head.
5. Confirmar que o conteúdo publicado corresponde ao esperado.