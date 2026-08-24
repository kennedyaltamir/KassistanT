# KassisT — Auditor Responsibility Model

> **Status:** APPROVED FOR OPERATING GOVERNANCE
>
> **Authority:** `main` continua sendo a autoridade de integração. Este documento define responsabilidade primária de auditoria, não ownership de código, arquitetura ou merge.

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

## 10. Divisão operacional

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
