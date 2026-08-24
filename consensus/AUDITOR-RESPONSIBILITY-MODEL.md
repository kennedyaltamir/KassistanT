# KassisT — Auditor Responsibility Model

> **Status:** APPROVED FOR OPERATING GOVERNANCE
>
> **Authority:** `main` continua sendo a autoridade de integração. Este documento define responsabilidade primária de auditoria, não ownership de código, arquitetura ou merge.
>
> **Current operational baseline:** `MVP2` é a baseline operacional atual da fase MVP2 por decisão explícita de governança. Essa classificação não transfere autoridade de integração para `MVP2`; `main` permanece como autoridade/target de integração.

## 1. Objetivo

Estabelecer a responsabilidade primária dos dois auditores independentes sobre os oito agentes do KassisT, reduzindo sobreposição e mantendo revisão cruzada quando houver risco de integração, segurança ou decisões globais.

## 2. Auditor 1

### Responsabilidade primária

Acompanhamento e auditoria operacional primária de:

- IA-01 — Schema / Canonical SQLite
- IA-02 — Domain Runtime
- IA-03 — Event Infrastructure
- IA-07 — Gateway + WSS

### Foco

Schema, Domain, Event Infrastructure, Gateway/WSS e as dependências entre Core, persistência, eventos e transporte.

## 3. Auditor 2

### Responsabilidade primária

Acompanhamento e auditoria operacional primária de:

- IA-04 — Order Engine
- IA-05 — Conversation + LLM
- IA-06 — Device Authentication
- IA-08 — Desktop UI

### Foco

Order, Conversation/LLM, Device Authentication, Desktop UI e as dependências entre aplicação, segurança, IA e experiência do usuário.

## 4. Independência

A responsabilidade primária de auditoria NÃO transfere:

- ownership de código;
- ownership de arquitetura;
- autoridade de integração;
- autoridade de merge;
- autoridade de decisão humana.

Cada auditor continua autorizado a questionar qualquer conclusão quando houver risco, conflito cross-agent, violação de contrato, problema de segurança, inconsistência documental ou dependência oculta.

## 5. Revisão cruzada

O auditor primário acompanha continuamente seu grupo.

O segundo auditor realiza revisão cruzada quando houver:

1. decisão global;
2. conflito cross-agent;
3. risco de segurança relevante;
4. proposta de merge significativo;
5. dependência entre agentes de grupos diferentes;
6. solicitação explícita de revisão.

## 6. Níveis de decisão

### PRIMARY_AUDITOR_REVIEW

Questões locais, sem impacto cross-agent relevante, podem ser avaliadas pelo auditor primário.

### CROSS_AUDIT_REVIEW

Questões com impacto cross-agent, segurança relevante, dependência compartilhada ou risco arquitetural exigem revisão do segundo auditor.

### THREE_WAY_DECISION

Exige participação de Auditor 1, Auditor 2 e Operador quando envolver:

- contrato global;
- arquitetura global;
- mudança de ownership;
- `CONTRACT-001`;
- `CONTRACT-002`;
- alteração relevante da `main`;
- merge significativo;
- promoção de proposta para decisão normativa.

## 7. Autoridade humana

O operador continua sendo a autoridade final para decisões de produto, decisões arquiteturais globais, aprovação de contratos, autorização de implementação e aprovação de merge.

## 8. Autoridade de integração

`main` continua sendo a autoridade de integração.

`MVP2` é a **current operational baseline** da fase atual. Essa distinção é deliberada:

```text
Operational Baseline != Integration Authority
```

A baseline operacional define o ponto de referência para novas implementações da fase MVP2. A autoridade de integração permanece em `main` e qualquer convergência de MVP2 para `main` exige os gates normais de decisão, implementação, verificação, auditoria e merge.

Nenhum auditor possui autoridade para alterar a `main`, fazer merge ou alterar ownership silenciosamente.

## 9. Regra de consenso

Nenhum auditor pode unilateralmente:

- aprovar contrato global;
- resolver `CONTRACT-001`;
- resolver `CONTRACT-002`;
- alterar ownership;
- promover proposta para decisão global;
- autorizar merge significativo.

Nessas situações, a conclusão deve ser explicitamente registrada entre Auditor 1, Auditor 2 e Operador, quando aplicável.

## 10. Baseline e lineage operacional

A evolução histórica deve permanecer distinguível da baseline operacional atual:

```text
main @ 86387b02...
    │
    ├── historical C1 execution model
    │       └── MVP
    │
    └── subsequent operational evolution
            └── MVP2
                @ current MVP2 HEAD
                │
                └── current operational baseline
                        │
                        └── controlled convergence → main
```

`MVP` não deve ser reinterpretado automaticamente como `MVP2`. Referências históricas a `MVP`/C1 devem permanecer históricas quando esse for o significado original do documento.

A posição de `MVP2` no histórico Git não constitui, por si só, autoridade normativa. A classificação de `MVP2` como baseline operacional decorre da decisão explícita de governança registrada na fase atual.

## 11. Divisão operacional

```text
Auditor 1
  ├── IA-01
  ├── IA-02
  ├── IA-03
  └── IA-07

Auditor 2
  ├── IA-04
  ├── IA-05
  ├── IA-06
  └── IA-08
```

A divisão é de **responsabilidade primária de auditoria**, não de autoridade exclusiva.
