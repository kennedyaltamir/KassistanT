# KassisT — Behaviour Rules for AI

## 1. Objetivo

Este documento define o comportamento operacional obrigatório de qualquer IA, agente, copiloto ou sistema automatizado que trabalhe no KassisT.

`REGRAS/behaviour.md` é uma regra transversal.

Ele não substitui as regras específicas de cada área.

Sua função é estabelecer **como a IA deve trabalhar**, enquanto as regras das abas estabelecem **o que deve ser construído ou preservado**.

Antes de iniciar qualquer alteração no KassisT, a IA deve considerar este documento como obrigatório.

---

# 2. Princípio central

O KassisT é tratado como um **projeto de software profissional**.

A IA não deve tratar o repositório como:

* experimento descartável;
* protótipo sem governança;
* playground;
* código temporário;
* projeto pessoal informal;
* conjunto de arquivos independentes.

Toda alteração deve ser tratada como alteração potencialmente produtiva, com:

* rastreabilidade;
* preservação de contexto;
* compatibilidade;
* validação;
* controle de escopo;
* documentação;
* testes;
* reversibilidade;
* responsabilidade arquitetural.

A IA deve preferir uma alteração pequena, verificável e coerente a uma reconstrução ampla.

---

# 3. Regra absoluta de ambiente local

A IA deve assumir que o usuário trabalha em um **ambiente local Windows**, utilizando principalmente:

```text
Windows
PowerShell
VSCode Integrated Terminal
Git
pnpm
```

A IA não deve presumir que possui acesso direto ao computador do usuário.

Quando uma operação precisar ser executada no ambiente local, a IA deve fornecer ao usuário os comandos completos para execução no terminal do VSCode.

---

# 4. Sempre enviar comandos completos

Esta é uma regra obrigatória.

Quando a IA solicitar ao usuário que execute uma operação no terminal, deve fornecer o bloco completo.

Nunca enviar somente:

```text
git status
```

quando for necessário estabelecer contexto.

Preferir:

```powershell
Set-Location 'C:\Users\Kennedy Oliveira\Desktop\KassisT'

$ErrorActionPreference = 'Stop'

git branch --show-current

git rev-parse HEAD
git status --short --branch
```

Cada bloco deve conter contexto suficiente para que possa ser copiado e executado diretamente.

---

# 5. Nunca presumir o commit local

A IA **NUNCA** deve assumir que o checkout local do usuário está no mesmo commit que a IA considera atual.

Mesmo quando a IA acabou de criar um commit, deve tratar o ambiente local como potencialmente divergente.

Antes de qualquer operação dependente de estado Git, deve verificar:

```text
branch atual
HEAD local
HEAD remoto
```

Quando existir um commit específico criado pela IA, ela deve informar explicitamente:

```text
LAST_COMMIT_SHA
LAST_COMMIT_MESSAGE
```

e fornecer comandos para validar esse estado.

---

# 6. Regra de sincronização por SHA

Quando uma tarefa continuar a partir de um commit específico da IA, o procedimento deve começar verificando:

```powershell
git rev-parse HEAD
git rev-parse origin/<branch>
```

A IA deve declarar qual SHA espera encontrar.

Exemplo:

```text
LAST_COMMIT_SHA:
ca4f6bc8358f343bab6a4c8c75a9100d83643d01
```

Se o SHA local não corresponder ao esperado, a IA deve:

```text
PARAR
```

e reportar:

```text
DIVERGÊNCIA DE ESTADO
```

Não deve automaticamente:

* resetar;
* restaurar;
* rebasear;
* sobrescrever;
* descartar trabalho;
* sincronizar destrutivamente.

Primeiro deve diagnosticar a divergência.

---

# 6.1 Regra obrigatória após commit da IA

Sempre que a IA criar um commit no repositório KassisT, ela MUST informar imediatamente:

```text
LAST_COMMIT_SHA
LAST_COMMIT_MESSAGE
BRANCH
BASELINE
```

No bloco operacional imediatamente seguinte, a IA MUST fornecer um comando PowerShell completo para o usuário posicionar o checkout local do VSCode exatamente no `LAST_COMMIT_SHA`, sem presumir equivalência entre o ambiente da IA e o ambiente local.

Esse bloco MUST:

* começar com `Set-Location` para o repositório;
* atualizar refs quando necessário;
* verificar a branch;
* verificar o `HEAD` local;
* informar o SHA-alvo explicitamente;
* preservar alterações locais antes de qualquer operação que possa sobrescrevê-las;
* evitar `git reset --hard`, `git clean`, `git restore` ou qualquer descarte automático;
* concluir com uma verificação explícita do `HEAD` esperado.

O padrão mínimo esperado é conceitualmente:

```text
COMMIT CRIADO PELA IA
        ↓
INFORMAR SHA EXATO
        ↓
INFORMAR MENSAGEM
        ↓
FORNECER COMANDO COMPLETO DE SINCRONIZAÇÃO
        ↓
VALIDAR HEAD LOCAL
```

A IA MUST NOT dizer apenas "vá para o commit anterior", "atualize sua branch" ou equivalente sem fornecer o SHA exato e o comando completo.

Se o checkout local possuir alterações não commitadas, a IA MUST diagnosticar e preservar essas alterações antes de orientar qualquer sincronização.

A sincronização do VSCode deve ocorrer exclusivamente para a branch autorizada pela Change Unit.

---

# 7. Branch obrigatória da Change Unit

Cada Change Unit possui uma branch própria.

O formato esperado é:

```text
MVP2-<nome-da-aba>
```

Exemplos:

```text
MVP2-implementandoQRCODE
MVP2-configuracoes
MVP2-conversas
MVP2-assistente
```

Uma IA deve modificar **somente a branch definida para a Change Unit em andamento**.

Ela não deve:

* alterar `MVP2`;
* alterar `MAIN`;
* alterar outra branch;
* fazer merge;
* copiar alterações diretamente para outra branch;
* alterar uma branch diferente apenas porque considera que seria melhor.

Se a branch atual estiver incorreta:

```text
STOP
```

A IA deve fornecer os comandos para navegar até a branch correta antes da alteração.

---

# 8. Baseline protegida

Quando uma Change Unit possuir uma baseline protegida, a IA deve sempre registrá-la.

Exemplo:

```text
BASELINE:
MVP2
BASELINE_SHA:
2aa27a93a8fe1f62ae64c3a5aec98809ae01a423
```

Antes de alterações relevantes, deve verificar:

```powershell
git rev-parse origin/MVP2
```

e confirmar que a baseline permanece intacta.

---

# 9. Nenhum restore indiscriminado

É proibido usar comandos de restauração ampla sem diagnóstico.

Evitar automaticamente:

```text
git restore .
git reset --hard
git clean -fd
```

Esses comandos podem destruir trabalho legítimo.

Antes de qualquer descarte, a IA deve determinar:

```text
O arquivo pertence à Change Unit?

É alteração válida?

É artefato temporário?

Foi produzido por outra etapa?

Existe valor histórico?
```

Somente então determinar a ação apropriada.

---

# 10. Escopo da Change Unit

Cada Change Unit deve possuir:

```text
OBJECTIVE
BRANCH
BASELINE
AUTHORIZED FILES
CONTRACTS
INVARIANTS
ACCEPTANCE CRITERIA
VALIDATION
```

A IA não deve aproveitar uma Change Unit para "arrumar o projeto inteiro".

Quando encontrar problema fora do escopo, deve registrar:

```text
OUT OF SCOPE
```

e transformar a necessidade em:

```text
FUTURE / CHANGE UNIT
```

---

# 11. Projeto profissional

Toda alteração deve ser avaliada como código que precisará ser mantido posteriormente por outra pessoa ou outra IA.

Portanto:

* não duplicar responsabilidades;
* não criar workarounds temporários;
* não esconder erros;
* não falsificar estados;
* não mascarar problemas de arquitetura;
* não criar APIs apenas para satisfazer testes;
* não enfraquecer testes para conseguir PASS;
* não criar código sem ownership definido;
* não introduzir dependências sem justificativa.

A solução deve ser compreensível por outro agente que leia o repositório posteriormente.

---

# 12. Design — Apple Human Interface Guidelines

O KassisT deve utilizar como referência de design os princípios do Apple Human Interface Guidelines.

A intenção não é copiar visualmente uma interface da Apple.

A intenção é aplicar princípios profissionais de interação e qualidade.

Os princípios fundamentais adotados são:

```text
Purpose
Agency
Responsibility
Familiarity
Flexibility
Simplicity
Craft
Delight
```

## 12.1 Propósito

Cada elemento da interface deve possuir uma função clara.

Antes de adicionar:

* botão;
* card;
* indicador;
* modal;
* animação;
* informação;
* configuração;

a IA deve conseguir responder:

```text
Por que isso existe?

Qual problema resolve?

Por que precisa aparecer aqui?
```

---

## 12.2 Agência

O usuário deve permanecer no controle.

Interfaces devem:

* informar o que está acontecendo;
* permitir ações previsíveis;
* evitar operações destrutivas acidentais;
* permitir recuperação de erros;
* evitar mudanças silenciosas de estado;
* evitar operações importantes sem confirmação apropriada.

Uma ação destrutiva deve ser explicitamente compreensível antes de sua execução.

---

## 12.3 Responsabilidade

A interface deve ser honesta.

Nunca apresentar:

```text
CONNECTED
```

quando a fonte real não confirmou conexão.

Nunca apresentar:

```text
SALVO
```

quando o sistema apenas iniciou a operação.

Nunca apresentar:

```text
ENVIADO
```

quando a mensagem apenas entrou em uma fila.

Estados devem representar evidência real.

---

## 12.4 Familiaridade

A interface deve utilizar padrões conhecidos.

Evitar:

* gestos incomuns;
* controles inesperados;
* navegação arbitrária;
* nomes ambíguos;
* comportamentos contraditórios.

Quando um padrão convencional atende ao problema, ele deve ser preferido.

---

## 12.5 Simplicidade

Simplicidade não significa remover funcionalidades.

Significa remover complexidade desnecessária.

A IA deve priorizar:

```text
clareza
hierarquia
espaçamento
linguagem direta
poucos passos
controles reconhecíveis
```

Evitar interfaces visualmente carregadas.

Cada elemento deve justificar sua presença.

---

## 12.6 Flexibilidade

A interface deve acomodar diferentes tamanhos de janela, métodos de entrada e necessidades de acessibilidade.

Considerar:

* teclado;
* foco;
* leitura assistiva;
* contraste;
* tamanhos de janela;
* textos longos;
* estados de erro;
* ausência de dados.

---

## 12.7 Craft

A qualidade final deve ser percebida nos detalhes.

A IA deve verificar:

* alinhamento;
* espaçamento;
* hierarquia visual;
* textos;
* estados;
* feedback;
* transições;
* acessibilidade;
* comportamento de erro;
* consistência entre telas.

Uma interface não deve ser considerada pronta apenas porque "funciona".

---

## 12.8 Delight

Delight não significa decoração.

Significa uma experiência previsível, fluida, clara e cuidadosamente acabada.

Não adicionar animações, efeitos ou ornamentos sem função.

O objetivo é fazer o produto parecer:

```text
confiável
natural
coerente
cuidadosamente construído
```

---

# 13. Estados visuais

A IA nunca deve esconder estados intermediários.

Quando relevante, devem existir distinções claras entre:

```text
LOADING
CONNECTING
READY
SUCCESS
ERROR
EMPTY
UNAVAILABLE
DISCONNECTED
```

Não transformar:

```text
UNKNOWN
```

em:

```text
SUCCESS
```

apenas para tornar a interface mais agradável.

---

# 14. Acessibilidade

A acessibilidade é requisito de qualidade, não acabamento posterior.

Toda UI nova deve considerar:

* navegação por teclado;
* foco visível;
* labels compreensíveis;
* semântica adequada;
* textos alternativos quando aplicável;
* contraste;
* mensagens de erro claras;
* não depender exclusivamente de cor;
* previsibilidade de interação.

A IA deve preferir padrões simples e familiares e evitar elementos que desapareçam automaticamente quando uma ação explícita for possível.

---

# 15. Conhecimento permanente — KNOWLEDGE

O diretório:

```text
KNOWLEDGE/
```

é a base de conhecimento persistente do projeto.

Ele será posteriormente utilizado para construção de um sistema RAG.

Toda descoberta relevante deve ser registrada.

Isso inclui:

* decisões arquiteturais;
* contratos;
* invariantes;
* causas raiz;
* bugs reais;
* correções;
* comportamentos importantes;
* decisões de design;
* decisões de segurança;
* limitações;
* testes significativos;
* decisões que evitarão retrabalho futuro.

---

# 16. Regra de escrita no KNOWLEDGE

Conhecimento não deve ser uma cópia do chat.

Deve ser um registro reutilizável.

Um bom registro deve responder:

```text
O que foi descoberto?

Por que importa?

Qual decisão foi tomada?

Qual comportamento deve permanecer?

Qual evidência existe?

O que outra IA precisa saber no futuro?
```

---

# 17. Estrutura recomendada do KNOWLEDGE

Preferir:

```text
KNOWLEDGE/

├── README.md

├── architecture/

├── behavior/

├── decisions/

├── bugs/

├── testing/

├── security/

└── design/
```

Os diretórios podem evoluir conforme o projeto.

Não criar dezenas de categorias prematuramente.

---

# 18. Nome dos registros

Preferir nomes descritivos.

Exemplos:

```text
KNOWLEDGE/behavior/whatsapp-lifecycle.md
KNOWLEDGE/decisions/renderer-gateway-ownership.md
KNOWLEDGE/bugs/stale-whatsapp-socket.md
KNOWLEDGE/testing/whatsapp-reset-validation.md
KNOWLEDGE/design/settings-apple-hig.md
```

---

# 19. Conhecimento deve registrar causa, não apenas resultado

Evitar:

```text
WhatsApp foi corrigido.
```

Preferir:

```text
Problema:

Eventos atrasados de uma lifecycle antiga podiam provocar reconexão.

Causa:

O socket antigo não era identificado por generation.

Correção:

Foi introduzido lifecycleGeneration associado ao socket.

Invariante:

Eventos de lifecycle inválida não podem alterar a lifecycle atual.

Evidência:

Teste X + teste funcional Y.
```

Isso permite que outra IA reutilize o conhecimento.

---

# 20. RAG — qualidade do conhecimento

Os registros em `KNOWLEDGE/` devem ser escritos para recuperação semântica.

Evitar textos excessivamente genéricos.

Utilizar termos técnicos reais do projeto.

Sempre que útil, registrar:

```text
project
area
component
contract
decision
status
cause
solution
invariant
evidence
related files
related commits
```

---

# 21. Aprendizado entre IAs

Uma IA deve considerar que poderá ser substituída por outra IA posteriormente.

Portanto, uma descoberta importante não pode permanecer apenas:

```text
no contexto da conversa
```

ou:

```text
na memória temporária do agente
```

Ela deve ser registrada em:

```text
KNOWLEDGE/
```

quando possuir valor futuro.

O objetivo é diminuir a necessidade de redescoberta e evitar que uma IA posterior repita os mesmos erros.

---

# 22. Regra de conhecimento após alteração

Após uma Change Unit relevante, a IA deve avaliar:

```text
Foi descoberta alguma informação que outra IA precisará conhecer?
```

Se sim:

```text
CRIAR/ATUALIZAR KNOWLEDGE
```

antes de considerar a tarefa documentalmente concluída.

---

# 23. Testes

Toda alteração relevante deve possuir alguma forma de validação.

Quando aplicável:

```text
static test
unit test
integration test
functional test
runtime test
lint
typecheck
build
qa gates
```

Testes devem proteger comportamento real.

Não escrever testes apenas para obter uma saída verde.

---

# 24. Teste funcional versus teste estrutural

A IA deve distinguir:

```text
ESTRUTURAL
```

de:

```text
FUNCIONAL REAL
```

Exemplo:

A presença de:

```text
/api/whatsapp/reset-session
```

no código não prova que o reset funciona.

Do mesmo modo:

```text
assert.match(...)
```

não prova automaticamente que uma integração real funciona.

O relatório deve indicar exatamente qual nível de evidência foi obtido.

---

# 25. Falhas

Uma falha deve permanecer uma falha.

Não transformar:

```text
FAIL
```

em:

```text
PASS
```

por interpretação.

Classificações permitidas:

```text
PASS
PARTIAL
BLOCKED
FAIL
PENDING
NOT VERIFIED
COMPLETE
```

---

# 26. Processos locais

Antes de iniciar serviços locais:

```text
verificar processos

verificar portas

identificar instâncias antigas

iniciar somente uma instância
```

Para Windows, utilizar PowerShell.

Nunca encerrar processos arbitrariamente.

Antes de matar um processo, confirmar:

```text
PID

ProcessName

CommandLine

ParentProcessId

porta
```

e confirmar que pertence ao KassisT.

---

# 27. Commit

Commit não é o primeiro passo.

Antes do commit:

```text
auditoria

implementação

testes

validação

diff

escopo

documentação

knowledge
```

devem estar concluídos.

O commit deve conter somente arquivos autorizados pela Change Unit.

---

# 28. Pós-commit

Depois de um commit criado pela IA, registrar imediatamente:

```text
COMMIT SHA
COMMIT MESSAGE
BRANCH
BASELINE
FILES
TEST STATUS
```

A próxima operação deve usar aquele SHA como referência.

A regra complementar da seção 6.1 é obrigatória: imediatamente após informar o commit, a IA deve fornecer o bloco PowerShell completo que permita ao usuário posicionar o VSCode exatamente naquele SHA e validar o `HEAD` local.

---

# 29. Push

Push não é automático.

Somente executar push quando explicitamente autorizado pelo usuário ou quando a Change Unit determinar claramente que o push faz parte da operação aprovada.

Nunca fazer push de:

* artefatos;
* logs;
* dumps;
* bancos locais;
* arquivos temporários;
* backups acidentais;
* `node_modules`;
* arquivos gerados não autorizados.

---

# 30. Relatório obrigatório

Ao finalizar uma operação, a IA deve informar:

```text
STATUS

BRANCH

BASELINE

HEAD

LAST_COMMIT

FILES_CHANGED

TESTS

VALIDATION

KNOWLEDGE

BLOCKERS

NEXT_ACTION
```

Nunca responder apenas:

```text
feito
```

quando uma alteração técnica tiver sido executada.

---

# 31. Regra contra presunção

Nunca presumir:

```text
branch correta

commit correto

arquivo correto

estado correto

processo correto

porta livre

teste executado

deploy realizado

push realizado
```

Tudo que for relevante deve ser verificado.

---

# 32. Regra contra invenção

Quando não houver evidência:

```text
NÃO CONFIRMADO
```

é a resposta correta.

A IA não deve preencher lacunas com:

* suposições;
* estados inventados;
* identidade fictícia;
* métricas inventadas;
* testes imaginários;
* commits imaginários;
* resultados não executados.

---

# 33. Regra de continuidade

Ao iniciar uma nova sessão, a IA deve reconstruir seu contexto através de:

```text
REGRAS/README.md

REGRAS/behaviour.md

regra específica da área

KNOWLEDGE relevante

estado Git

Change Unit atual
```

Não presumir conhecimento do que aconteceu em uma sessão anterior.

O repositório é a fonte de continuidade.

---

# 34. Prioridade das regras

Quando houver conflito entre conveniência e governança:

```text
segurança

>

integridade do repositório

>

contrato

>

escopo da Change Unit

>

testabilidade

>

clareza

>

estética
```

Uma melhoria visual nunca justifica quebrar um contrato.

Uma alteração funcional nunca justifica modificar outra branch.

Uma solução rápida nunca justifica perder rastreabilidade.

---

# 35. Regra final

Toda IA que trabalha no KassisT deve operar com a seguinte mentalidade:

```text
ENTENDER

→

VERIFICAR

→

DEFINIR ESCOPO

→

ALTERAR

→

TESTAR

→

REGISTRAR CONHECIMENTO

→

AUDITAR

→

COMMITAR
```

Nunca:

```text
ALTERAR

→

ESPERAR QUE FUNCIONE

→

CORRER PARA O PRÓXIMO PROBLEMA
```

O objetivo não é apenas fazer o código funcionar.

O objetivo é construir um projeto que permaneça:

```text
compreensível

verificável

rastreável

manutenível

consistente

profissional
```

mesmo quando a implementação for continuada por outra IA.
