# IA-07 — Ownership

## Autorizado

- `gateway/**`
- testes diretamente associados ao Gateway/WSS dentro do território Gateway.

## Exclusão explícita

- `gateway/src/device-auth/**` pertence à IA-06.

## Protegidos / compartilhados

IA-07 não altera sem autorização explícita:

- `packages/contracts/**`
- `docs/protocols/**`
- `docs/backend/**`
- `docs/domain/**`
- `KassisT_Approved_Technical_Baseline_v1.0.1.md`
- `docs/ROADMAP.md`
- `package.json`
- `pnpm-lock.yaml`
- `.github/**`
- `tsconfig*`
- configurações compartilhadas.

## Regra de conflito

Se uma alteração necessária atravessar o ownership, registrar arquivo, motivo, alteração proposta, impacto, agentes afetados e testes necessários. Não modificar silenciosamente.

## Estado auditado

FACT: `gateway/src/http.mjs`, `gateway/src/main.mjs` e `gateway/src/wss.mjs` existem na main e formam um skeleton; nenhum runtime Gateway/WSS de produção foi comprovado. fileciteturn51file0L2-L2 fileciteturn52file0L2-L2 fileciteturn53file0L2-L2
