# IA-07 — Decisions

## Approved / inherited

| ID | Status | Decision |
|---|---|---|
| ADR-008 | APPROVED | KassisT Gateway é a fronteira oficial de integração externa. |
| ADR-009 | APPROVED | Desktop inicia conexão WSS outbound. |
| ADR-010 | APPROVED | Device authentication usa Ed25519 challenge-response; implementação pertence à IA-06. |
| CONTRACT-001 | AMBIGUOUS | Escopo/ownership de DomainOutbox entre Core e Gateway não está resolvido. |
| CONTRACT-002 | AMBIGUOUS | Semântica final de `order.status_changed` permanece dependente de decisão contratual. |
| GOV-001 | AMBIGUOUS | Autoridade/versionamento documental requer governança global. |

## Propostas locais

Nenhuma.

## Regra

Nenhuma decisão acima de escopo local deve ser reinterpretada como aprovada por IA-07. Alterações de contrato devem ser tratadas como dependências para autoridade de integração.
