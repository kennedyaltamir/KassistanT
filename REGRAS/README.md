# KassisT — Governança de Regras

## 1. Objetivo

`REGRAS/` é a fonte documental normativa para decisões funcionais, arquiteturais e operacionais do KassisT que precisam permanecer estáveis entre IAs, agentes, manutenção, revisão e QA.

Uma regra específica de uma área deve registrar o comportamento esperado, os contratos relevantes, os limites de responsabilidade e os critérios verificáveis para mudanças futuras.

**A documentação não é prova de implementação.** Uma regra pode existir antes do código, coexistir com uma implementação parcial ou permanecer como requisito para uma Change Unit futura.

## 2. Hierarquia documental

A estrutura recomendada é:

```text
REGRAS/
├── README.md
└── abas/
    └── <area>/
        └── <aba>.md
```

O `REGRAS/README.md` é o documento de entrada e estabelece a governança comum. Cada regra específica de aba detalha os contratos e limites daquela superfície.

Exemplos válidos para evolução:

```text
REGRAS/abas/configuracoes/whatsapp.md
REGRAS/abas/configuracoes/assistente.md
REGRAS/abas/configuracoes/notificacoes.md
REGRAS/abas/conversas/README.md
```

Não criar regras fictícias para áreas ainda não documentadas.

## 3. Regra obrigatória antes de alterar uma aba

Nenhuma alteração em uma aba deve começar antes da leitura integral da regra específica correspondente, quando ela existir.

Antes de editar, o agente deve:

1. localizar a regra específica;
2. ler o documento integralmente;
3. auditar a implementação atual;
4. identificar contratos existentes;
5. separar o que é regra do que é implementação;
6. registrar as divergências antes de modificar o código.

Para **Configurações → WhatsApp / Conexão**, a regra específica é:

`REGRAS/abas/configuracoes/whatsapp.md`

## 4. REGRA, CONTRATO, REQUISITO e FUTURO

### REGRA

Determinação normativa que deve orientar o comportamento e os limites da área.

### CONTRATO EXISTENTE

Comportamento efetivamente definido por uma interface existente do sistema, como endpoint, evento, payload ou ownership já estabelecido.

### REQUISITO

Comportamento que deve existir para satisfazer a regra, mas cuja implementação precisa ser verificada separadamente.

### STATUS: EXISTENTE

Há evidência concreta no código, contrato ou teste de que o item existe.

### STATUS: NÃO IMPLEMENTADO

O item é requerido ou documentado, mas não há implementação suficiente para considerá-lo atendido.

### STATUS: FUTURO / CHANGE UNIT

O item exige uma alteração de contrato, arquitetura, ownership ou outra mudança que não deve ser introduzida implicitamente durante uma correção local.

A documentação nunca deve ser usada como substituta de evidência de código ou teste.

## 5. Ownership entre camadas

Cada alteração deve respeitar o dono da responsabilidade existente.

De forma geral:

```text
Renderer → consome contratos, solicita operações e apresenta estados.
Gateway  → executa responsabilidades de integração e fornece autoridade operacional.
```

Uma camada não deve absorver responsabilidades de outra apenas para simplificar a UI.

No caso de WhatsApp, isso significa que socket, Baileys, autenticação, auth state, credenciais, sessão e persistência da integração permanecem no Gateway.

## 6. Regra de não invenção

Nenhum agente pode inventar para preencher uma lacuna:

- endpoints;
- estados;
- payloads;
- identidade;
- credenciais;
- persistência;
- responsabilidades arquiteturais;
- dados derivados apresentados como se fossem dados reais;
- mecanismos paralelos de autoridade.

Quando a solução exigir um contrato novo, a lacuna deve ser identificada como **FUTURO / CHANGE UNIT**.

## 7. Regra de não duplicação

Uma responsabilidade existente deve ter uma implementação coerente, não uma segunda implementação paralela.

Não criar uma segunda função, uma segunda árvore de UI, uma segunda fonte de estado ou uma segunda autoridade apenas para contornar uma dificuldade do caminho existente.

Workarounds de DOM, watchers, sanitização posterior, `MutationObserver` ou mecanismos equivalentes não podem substituir uma correção no ponto arquitetural correto.

## 8. Change Unit

Uma Change Unit deve possuir escopo explícito.

Quando uma mudança exigir alteração de contrato ou arquitetura fora do escopo atual, o agente deve parar antes da alteração e registrar a necessidade como **FUTURO / CHANGE UNIT**.

A Change Unit deve deixar rastreável:

- baseline;
- branch de trabalho;
- arquivos autorizados;
- contratos envolvidos;
- invariantes que não podem mudar;
- critérios de aceitação;
- evidências produzidas.

## 9. Processo de alteração

O processo mínimo é:

1. auditar branch, HEAD, status e arquivos;
2. ler a regra específica;
3. inspecionar contratos e implementação atual;
4. construir uma matriz `REQUISITO → CONTRATO → IMPLEMENTAÇÃO → TESTE → STATUS`;
5. corrigir somente as divergências dentro do escopo;
6. preservar ownership e contratos existentes;
7. validar os invariantes proibidos;
8. executar os testes autorizados;
9. revisar o diff;
10. registrar limitações reais.

Não reconstruir uma superfície inteira quando uma alteração localizada atende ao contrato.

## 10. Processo de validação

Validação deve ser baseada em evidência efetiva.

São evidências distintas:

- inspeção estática do código;
- testes automatizados;
- lint/typecheck/build;
- execução do serviço;
- teste funcional do Desktop;
- teste funcional de integração real.

Um nível de validação não substitui outro.

Nunca declarar `PASS` para uma etapa que não foi executada.

Nunca declarar integração real apenas porque o código parece correto.

## 11. Registro de erros

Não criar `ERROS/erros.md` preventivamente.

Registrar somente erros reais observados durante validação, contendo no mínimo:

```text
Identificador
Data/hora
Etapa
Comportamento esperado
Comportamento observado
Mensagem
Arquivo
Reprodução
Impacto
Status
```

Falhas operacionais de processo devem ser separadas de defeitos funcionais. Um erro como `EADDRINUSE` deve primeiro ser tratado como disputa de porta/processo, e não automaticamente como defeito do domínio WhatsApp.

## 12. Estrutura das futuras regras de abas

Cada regra específica deve, preferencialmente, conter:

1. objetivo da área;
2. responsabilidade da área;
3. estados válidos;
4. transições válidas;
5. ações disponíveis;
6. contratos existentes;
7. requisitos ainda não implementados;
8. limites arquiteturais;
9. ownership entre camadas;
10. segurança;
11. proveniência dos dados;
12. elementos proibidos;
13. critérios de aceitação;
14. regra para futuras alterações.

A regra específica deve marcar claramente o que é `EXISTENTE`, `NÃO IMPLEMENTADO` e `FUTURO / CHANGE UNIT`.

## 13. Relação com testes

Testes devem verificar contratos e invariantes relevantes à regra.

Quando a suíte existente usa testes estáticos, eles podem ser a estratégia apropriada para invariantes estruturais. Não criar simuladores gigantescos apenas para provar strings ou presença/ausência de responsabilidade.

Testes não devem ser removidos ou enfraquecidos apenas para produzir um resultado verde.

Quando um requisito ainda não tiver suporte real, o teste deve refletir o contrato correto em vez de fabricar uma implementação.

## 14. Relação com documentação de arquitetura

`REGRAS/` e a documentação arquitetural são complementares.

A arquitetura define limites sistêmicos e ownership. A regra de uma aba aplica esses limites àquela superfície concreta.

Uma regra específica não deve contradizer um contrato arquitetural existente sem que a mudança seja formalizada por uma Change Unit apropriada.

## 15. Regra final obrigatória para futuras IAs

Antes de alterar qualquer aba do KassisT, a IA, agente, mantenedor ou QA deve:

1. ler este README;
2. ler a regra específica da aba, quando existir;
3. identificar quais requisitos já existem;
4. identificar quais requisitos ainda não existem;
5. separar REGRA, CONTRATO EXISTENTE, REQUISITO e FUTURO / CHANGE UNIT;
6. não alterar contratos existentes sem Change Unit explícita;
7. não duplicar responsabilidades entre camadas;
8. não criar endpoints ou estados fictícios;
9. não remover comportamento existente sem justificativa e evidência;
10. validar a alteração contra a regra documental antes de declarar conclusão;
11. declarar limitações e testes não executados de forma explícita.

**A regra documental deve prevalecer sobre conveniências locais de implementação.**

### Regra específica atual

Para a superfície abaixo, a leitura obrigatória antes de alteração é:

`REGRAS/abas/configuracoes/whatsapp.md`

A presença dessa referência não significa que todos os requisitos da aba já estejam implementados. A implementação deve ser auditada separadamente.
