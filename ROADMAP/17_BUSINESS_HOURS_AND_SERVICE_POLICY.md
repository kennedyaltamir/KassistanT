# KassisT — 17. BUSINESS HOURS AND SERVICE POLICY

## Objetivo

Transformar horário de atendimento em dado operacional determinístico usado pelo Core.

## Modelo

```text
BusinessHoursPolicy
├── timezone
├── monday[]
├── tuesday[]
├── wednesday[]
├── thursday[]
├── friday[]
├── saturday[]
├── sunday[]
├── holidays[]
├── enabled
└── version
```

Cada intervalo possui:

```text
start: HH:mm
end: HH:mm
```

Suportar múltiplos intervalos por dia.

## Avaliação

A função de negócio deve ser determinística:

```text
isOpen(storeId, instant) -> boolean
```

Ela deve considerar timezone persistido, dia da semana, intervalos e exceções configuradas.

## Fora do horário

O assistente poderá responder, por exemplo:

```text
Estamos fechados no momento. Nosso atendimento retorna às 08:00.
```

A LLM apenas redige a mensagem. O Core determina `OPEN` ou `CLOSED`.

## Feriados e exceções

Preparar estrutura para exceções futuras sem obrigar automação externa no MVP.

## Critérios de aceitação

1. configuração persistente;
2. avaliação determinística;
3. testes de borda no início/fim do intervalo;
4. timezone correto;
5. múltiplos intervalos;
6. resposta fora do horário baseada em dado real;
7. sem alteração autônoma pela LLM.
