# 05 — TERMINAL COMMAND PROTOCOL

## Regra absoluta

Quando a IA enviar uma sequência de terminal, ela deve estar em UM ÚNICO bloco de código, completo e executável.

## Exemplo

```powershell
cd "C:\Users\Kennedy Oliveira\Desktop\KassisT"
git fetch origin --prune
git switch MVP2
git pull --ff-only origin MVP2
git status
git branch --show-current
git rev-parse HEAD
git rev-parse origin/MVP2
```

## Proibições

- Não incluir `PS C:\...>` como comando.
- Não incluir `>>`.
- Não misturar narrativa com comandos executáveis.
- Não quebrar uma sequência dependente em vários blocos.
- Não enviar comando sem indicar branch/commit quando a tarefa depender de sincronização específica.

PowerShell é o formato preferencial para o ambiente Windows deste projeto.