# 03 — VALIDATION AND TESTING

## Validação padrão

```powershell
pnpm typecheck
pnpm lint
pnpm test
pnpm build
git diff --check
```

## Regras

- Sempre testar antes de declarar correção.
- Testes direcionados podem complementar a suíte completa.
- Não inventar scripts, testes ou resultados.
- Antes de usar um script específico, conferir os `package.json` reais.
- Se um comando falhar por inexistência, registrar isso como evidência do repositório.
- Após corrigir falhas, repetir os testes afetados e depois a validação geral necessária.
- Validar também o estado final do Git.