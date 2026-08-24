# IA-07 — Learnings

## Auditoria inicial

- O território Gateway tem código mínimo; a maior parte do comportamento de HTTP/WSS está documentada em contratos, não implementada. FACT. fileciteturn51file0L2-L2 fileciteturn53file0L2-L2
- A fronteira de transporte deve permanecer separada das regras determinísticas do Core. FACT. fileciteturn56file0L2-L2
- Durabilidade e ACK dependem da fronteira Inbox; o Gateway não deve tratar recebimento de rede como processamento concluído. FACT. fileciteturn55file0L2-L2
- Idempotência endpoint-specific não pode ser inventada enquanto as regras permanecerem ausentes. FACT. fileciteturn57file0L2-L2
- A camada de autenticação de dispositivo é deliberadamente separada de IA-07. FACT conforme ownership do registry.

## Limites epistemológicos

- Detalhes não comprovados no runtime devem permanecer `NOT_VERIFIED`/`UNKNOWN`.
- A documentação de protocolo não prova que exista uma implementação funcional correspondente.
