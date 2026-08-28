# KassisT — LLM Knowledge Handoff

**Data da consolidação:** 2026-08-28  
**Projeto:** KassisT  
**Repositório:** `kennedyaltamir/KassistanT`  
**Branch de trabalho:** `MVP2-implementandoQRCODE`  
**Branch protegida/base de referência desta rodada:** `MVP2`  
**Baseline protegida observada:** `2aa27a93a8fe1f62ae64c3a5aec98809ae01a423`  
**Commit da branch após publicação:** `d0a6afb30eaf65a8d84b937dd2756e543d4ebfe1`  

> Este documento é um handoff operacional para uma próxima LLM. Ele registra não apenas o que funcionou, mas também as falhas, os diagnósticos, as correções e os limites atuais. Não deve ser interpretado como autorização para alterar `MVP2`, fazer merge ou release.

---

## 1. Objetivo desta rodada

O objetivo prático da rodada foi validar no Windows, em ambiente local, o fluxo multimodal do KassisT via WhatsApp:

```text
WhatsApp
  -> Baileys / Gateway
  -> classificação de mídia
  -> download/obtenção do buffer
  -> enriquecimento multimodal
      AUDIO -> Whisper -> texto
      IMAGE -> Ollama Vision -> descrição
  -> persistência
  -> contexto da conversa
  -> LLM principal
  -> auto-reply
  -> OUTBOUND via WhatsApp
```

Também foi necessário resolver problemas reais encontrados durante o teste: execução de JavaScript colado em PowerShell, disponibilidade do processo local, integração Windows/Whisper, incompatibilidade NumPy/PyTorch, pressão de memória, criação excessiva de threads OMP, resolução do runtime Whisper pelo Node, ordenação do contexto enviado ao LLM e respostas vazias do Ollama.

O estado final desta rodada é **LIVE FUNCIONAL para áudio + transcrição + LLM + outbound**, com **Vision funcional e persistência de imagens funcional**, além de uma suíte Gateway completamente verde com 115 testes.

Há, porém, pontos que continuam como observações de engenharia e não devem ser considerados fechados apenas porque o teste manual passou. Eles estão listados no final.

---

## 2. Estado de Git e governança

### 2.1 Branches e SHAs relevantes

A execução foi realizada na branch:

```text
MVP2-implementandoQRCODE
```

A baseline protegida observada foi:

```text
origin/MVP2
2aa27a93a8fe1f62ae64c3a5aec98809ae01a423
```

Antes da correção multimodal final, a branch estava em:

```text
6252c1528f1593b52344738a3f36b525523cd723
```

Esse SHA continha, entre outros:

```text
6252c15 test(gateway): validate whatsapp multimodal processingpipeline
451efaf feat(gateway): enable multimodal whatsapp auto reply pipeline
c5e2a95 chore: ignore local qa artifacts
```

Depois das correções, a branch foi publicada em:

```text
d0a6afb30eaf65a8d84b937dd2756e543d4ebfe1
feat(gateway): complete multimodal whatsapp pipeline
```

Local e remoto foram verificados com o mesmo SHA:

```text
d0a6afb30eaf65a8d84b937dd2756e543d4ebfe1
```

A publicação foi feita apenas para:

```text
origin/MVP2-implementandoQRCODE
```

A `MVP2` não foi alterada.

### 2.2 Estado do commit final

O commit final alterou 3 arquivos:

```text
gateway/src/auto-reply.mjs
gateway/src/multimodal.mjs
gateway/test/multimodal.test.mjs
```

Estatísticas reportadas pelo Git:

```text
402 additions
37 deletions
```

O commit final passou no teste completo do Gateway com:

```text
115 tests
115 pass
0 fail
0 cancelled
0 skipped
0 todo
```

O arquivo foi publicado posteriormente como documentação nesta mesma branch. Portanto, o commit do handoff é um commit adicional ao `d0a6afb`; não deve ser confundido com o commit da implementação multimodal.

---

## 3. Primeiro problema encontrado: JavaScript foi colado diretamente no PowerShell

No começo da validação, foi criado o arquivo:

```text
gateway/test/multimodal.test.mjs
```

mas o conteúdo JavaScript foi colado diretamente no prompt PowerShell como se fosse código PowerShell. Isso gerou erros como:

```text
Argumento ausente na lista de parâmetros.
Expressão ausente após ',' no elemento pipeline.
Token 'async' inesperado na expressão ou instrução.
```

### Aprendizado

PowerShell não executa JavaScript de Node diretamente. Para escrever ou executar um arquivo `.mjs` a partir do terminal, usar explicitamente:

```powershell
[System.IO.File]::WriteAllText(...)
node gateway/test/multimodal.test.mjs
```

ou usar here-string para gerar o arquivo e depois chamar `node`.

Esse detalhe é importante para qualquer próxima sessão: **não colar sintaxe JS diretamente em um prompt PowerShell**.

---

## 4. Teste unitário inicial e expansão do teste multimodal

O teste multimodal passou a cobrir quatro comportamentos:

1. Whisper mockado retorna `COMPLETED` e texto.
2. Comando Whisper inexistente retorna `UNAVAILABLE`.
3. Vision local envia o payload correto para `/api/chat`, incluindo `images` em base64.
4. Ausência de modelo Vision retorna `UNAVAILABLE`.

O teste final de `gateway/test/multimodal.test.mjs` usa um `.cmd` temporário para simular Whisper e valida explicitamente o payload Vision.

O teste foi inicialmente executado sozinho e depois integrado à suíte inteira.

O resultado final foi:

```text
✔ transcribes audio buffer using whisper output
✔ returns unavailable when whisper command is missing
✔ analyzes image buffer using local vision endpoint
✔ returns unavailable when vision model is missing
```

E posteriormente a suíte inteira ficou:

```text
115 pass
0 fail
```

### Aprendizado

O teste unitário precisa separar claramente:

```text
runtime real
```

de:

```text
comportamento do módulo
```

Por isso o mock de `.cmd` continua útil mesmo quando o Whisper real já foi validado manualmente.

---

## 5. Runtime local do KassisT

O ambiente funcional local observado contém três serviços principais:

### Gateway

```text
127.0.0.1:3210
```

Endpoints utilizados durante a validação:

```text
GET /health
GET /ready
GET /api/whatsapp/status
GET /api/whatsapp/messages?limit=100
```

### Persistence / Desktop

```text
127.0.0.1:3211
```

Serviço iniciado por:

```powershell
pnpm --filter @kassist/desktop dev
```

O endpoint testado diretamente foi:

```text
POST /internal/v1/whatsapp/message
```

### Ollama

```text
127.0.0.1:11434
```

Endpoints utilizados:

```text
GET /api/tags
POST /api/chat
POST /api/generate
```

### Estado observado no teste final

```text
11434 -> ONLINE
3211  -> ONLINE
3210  -> ONLINE
```

O Gateway reportou:

```json
{
  "status": "ok"
}
```

e o WhatsApp:

```json
{
  "connection": "CONNECTED",
  "qr": null,
  "lastError": null
}
```

O número conectado foi observado como:

```text
553798253971:22@s.whatsapp.net
```

com nome apresentado pelo runtime:

```text
Valéria Martins
```

Esses dados são evidência de uma execução local real, não uma simulação.

---

## 6. Ollama e modelos usados

Ollama estava instalado e respondendo em:

```text
http://127.0.0.1:11434
```

Modelos observados em `/api/tags`:

```text
qwen2.5-coder:7b-instruct
qwen2.5vl:7b
nomic-embed-text:latest
qwen2.5:14b-instruct
```

Papéis usados:

```text
LLM principal: qwen2.5:14b-instruct
Vision:       qwen2.5vl:7b
```

Em alguns momentos foi executado:

```powershell
ollama ps
```

E o modelo principal chegou a aparecer carregado como:

```text
qwen2.5:14b-instruct
15 GB
34%/66% CPU/GPU
context 32768
```

### Problema inicial do Ollama

Quando foi executado:

```powershell
ollama serve
```

o comando retornou:

```text
listen tcp 0.0.0.0:11434: bind: Only one usage of each socket address ...
```

Isso não significava que Ollama estava quebrado. Significava que **já havia um Ollama ativo** escutando em `11434`.

A prova foi:

```powershell
Invoke-RestMethod http://127.0.0.1:11434/api/tags
```

que respondeu corretamente.

### Aprendizado

Antes de iniciar `ollama serve`, sempre verificar:

```powershell
Invoke-RestMethod http://127.0.0.1:11434/api/tags
```

ou:

```powershell
Get-NetTCPConnection -LocalPort 11434 -State Listen
```

Não iniciar uma segunda instância se a primeira já existe.

---

## 7. Vision foi validado diretamente no runtime real

Foi selecionada uma imagem real do Desktop/Downloads e convertida para base64.

O payload usado diretamente contra Ollama foi equivalente a:

```json
{
  "model": "qwen2.5vl:7b",
  "stream": false,
  "think": false,
  "messages": [
    {
      "role": "user",
      "content": "Analise esta imagem objetivamente...",
      "images": ["<base64>"]
    }
  ]
}
```

Ollama retornou HTTP 200 e texto real, por exemplo uma descrição de uma imagem com pessoa de terno, laptop, celular e relógio.

Outro teste real também retornou descrições de planilha e interface de desenvolvimento.

### Resultado

```text
VISION MODEL = PASS
```

### Integração da imagem no Gateway

Foi observado no endpoint de mensagens:

```text
message_type = IMAGE
media_status = COMPLETED
text = descrição gerada pelo Vision
```

Exemplo observado:

```text
id: 3EB038897B8AE5CE570F22
message_type: IMAGE
media_status: COMPLETED
text: A imagem mostra uma planilha de dados...
```

Outro exemplo:

```text
id: 3EB0AEBD1A9D6635CD901C
message_type: IMAGE
text: A imagem mostra uma interface de desenvolvimento...
```

### Observação importante de semântica

Ao consultar o contexto pelo cliente de persistência, essas mensagens `IMAGE` retornavam texto enriquecido, mas a representação de contexto observada não mostrava `media_status` no objeto retornado. Em um teste que exigia explicitamente:

```text
latest.media_status === COMPLETED
```

o teste falhou porque o objeto do contexto não expunha esse campo.

Isso não prova falha da persistência do enriquecimento; prova apenas que o **context reader usado naquele momento não materializa o `media_status` no formato consultado**.

Não alterar isso sem auditar o contrato do persistence client.

---

## 8. Um comportamento incorreto observado no auto-reply de imagem

Depois de uma imagem real ser enriquecida e persistida, o auto-reply do LLM chegou a produzir uma resposta semelhante a:

```text
Infelizmente, eu não posso visualizar ou interagir diretamente com imagens...
```

Isso ocorreu apesar de existir uma descrição textual gerada pelo Vision no contexto.

Em seguida, foi observado um fluxo melhor em outros testes: a descrição da imagem foi incorporada ao contexto e uma resposta posterior referenciou corretamente o conteúdo da imagem.

### Aprendizado

O sistema possui dois níveis diferentes que não devem ser confundidos:

```text
Vision -> produz descrição textual
```

e:

```text
Main LLM -> recebe contexto textual e decide resposta
```

O Main LLM não precisa de acesso binário à imagem se o contrato do pipeline for transformar a imagem em uma descrição confiável antes do prompt final.

Porém, o prompt do Main LLM não deve afirmar que ele “não consegue ver a imagem” quando já recebeu um enriquecimento Vision derivado daquela imagem.

Esse ponto merece uma revisão específica de UX/prompt antes de tratar a camada multimodal como semanticamente fechada.

---

## 9. Primeira falha real do Whisper: incompatibilidade NumPy / PyTorch

O Whisper real foi encontrado em:

```text
C:\Users\Kennedy Oliveira\AppData\Roaming\Python\Python310\Scripts\whisper.exe
```

Python:

```text
C:\Users\Kennedy Oliveira\AppData\Local\Programs\Python\Python310\python.exe
Python 3.10.6
```

O import funcionava:

```text
WHISPER_IMPORT_OK
```

Mas a execução real inicialmente falhou com:

```text
A module that was compiled using NumPy 1.x cannot be run in NumPy 2.2.6
```

seguido por:

```text
RuntimeError: Numpy is not available
```

### Diagnóstico

O problema não era Node.

O problema não era o caminho do arquivo de áudio.

O problema era o runtime Python/Whisper/PyTorch/NumPy.

### Aprendizado

Quando Whisper falhar dentro do Gateway, separar o diagnóstico em três camadas:

1. `Get-Item` confirma o executável.
2. `python -c "import whisper"` confirma o pacote.
3. execução do áudio confirma o runtime de inferência.

Não considerar o estado “Whisper instalado” como equivalente a “Whisper operacional”.

---

## 10. Segunda falha real do Whisper: falta de memória ao forçar CPU

Depois de usar:

```text
--device cpu
```

foi observada uma falha:

```text
RuntimeError: [enforce fail at alloc_cpu.cpp:114] data. DefaultCPUAllocator: not enough memory
```

Mesmo tentando alocar apenas centenas de KB adicionais, o processo não conseguiu satisfazer a alocação.

Naquele momento, o Windows tinha aproximadamente:

```text
Total: 63,84 GB
Livre: 27 GB
Usada: 36,83 GB
```

Portanto, “RAM total disponível” não significava que o processo teria condições de criar qualquer número de threads/blocos de memória sem pressão.

### Aprendizado

A carga concorrente dos modelos locais é relevante.

O modelo Qwen 14B, quando carregado pelo Ollama, aparecia com cerca de 15 GB de uso reportado e parte do trabalho dividido entre CPU/GPU.

Para Whisper em Windows, além do tamanho do modelo, as bibliotecas numéricas podem tentar criar estruturas/thread pools que falham mesmo quando o `FreePhysicalMemory` parece razoável.

---

## 11. Terceira falha real do Whisper: OpenMP sem recursos para criar threads

Após descarregar os modelos do Ollama e testar novamente, o Whisper chegou a falhar com:

```text
OMP: Error #137: Cannot create thread.
OMP: System error #1450: Não existem recursos de sistema suficientes...
```

O ponto decisivo foi limitar o número de threads.

Variáveis utilizadas:

```powershell
$env:KASSIST_WHISPER_THREADS = '1'
$env:OMP_NUM_THREADS = '1'
$env:MKL_NUM_THREADS = '1'
$env:OPENBLAS_NUM_THREADS = '1'
```

E o Whisper recebeu:

```text
--threads 1
```

Com isso, a mesma execução passou.

Resultado real:

```text
NODE_WHISPER_EXIT=0
```

e um arquivo `.txt` foi gerado.

### Aprendizado principal

No ambiente Windows desta máquina, o caminho operacional confiável para Whisper local foi:

```text
Python 3.10
Whisper instalado
CPU
1 thread
OMP_NUM_THREADS=1
MKL_NUM_THREADS=1
OPENBLAS_NUM_THREADS=1
```

O fato de a GPU existir e CUDA estar disponível não significa que Whisper em toda chamada deva usar CUDA. Para estabilidade operacional deste runtime local, CPU com uma thread foi o caminho que efetivamente passou.

---

## 12. Quarta falha: Node não conseguia executar o `.exe` do Whisper de forma confiável

O Gateway tinha originalmente algo equivalente a:

```text
execFileAsync(command, [...])
```

com:

```text
KASSIST_WHISPER_COMMAND=C:\...\whisper.exe
```

No PowerShell, executar o mesmo `.exe` funcionava.

No Node, o teste retornava:

```text
ERROR_CODE=3221225477
```

e em outro estágio o módulo retornava:

```text
UNAVAILABLE
Transcription command not found: C:\...\whisper.exe
```

### Solução encontrada

Quando `KASSIST_WHISPER_COMMAND` aponta para um `.exe`, o módulo passou a interpretar o valor como referência ao runtime Whisper e executar diretamente o Python:

```text
python.exe -m whisper ...
```

Isso resolveu o problema de descoberta/execução do `.exe` dentro do Node.

Para `.cmd` e `.bat`, foi preservado suporte via `shell: true`, necessário para o teste de runtime Windows simulado.

### Estado final do código

`gateway/src/multimodal.mjs` possui agora lógica equivalente a:

```text
se command termina em .exe:
    command = configuredPython
    args = [
        -m,
        whisper,
        tempFile,
        --model, model,
        --device, device,
        --output_format, txt,
        --output_dir, tempDir
    ]

senão:
    command = configuredCommand
```

E também aplica:

```text
OMP_NUM_THREADS
MKL_NUM_THREADS
OPENBLAS_NUM_THREADS
```

ao ambiente do processo filho.

---

## 13. Quinta falha: variável `command` usada fora do escopo

Uma tentativa intermediária da correção introduziu um erro no catch:

```text
ReferenceError: command is not defined
```

Isso aconteceu porque `command` havia sido declarado dentro do `try` e era usado no `catch`.

### Correção

`command` foi declarado antes do `try`:

```text
let command = configuredCommand;
let args = [];
```

Assim o catch pode usar o valor efetivo na mensagem de erro.

### Aprendizado

Ao fazer patches por substituição de texto via PowerShell, não basta validar o trecho visualmente. Sempre executar a suíte imediatamente depois, porque mudanças de escopo são fáceis de introduzir.

---

## 14. Sexta falha: teste negativo de “command missing” precisava continuar sem quebrar o runtime real

O teste unitário precisava validar que um comando inexistente gera:

```text
UNAVAILABLE
```

Enquanto o runtime real precisava tratar `.exe` de maneira diferente.

A solução final mantém as duas semânticas:

```text
.exe configurado -> Python -m whisper
.cmd/.bat/outro comando -> executa o comando configurado
```

E um comando inexistente continua resultando em `ENOENT` e `UNAVAILABLE`.

Isso permitiu que os dois testes passassem simultaneamente.

---

## 15. Sétima falha: o teste de contexto descobriu problema de ordem das mensagens

Foi feita uma chamada real de:

```text
toLlmMessages(context)
```

O contexto tinha um bloco estruturado grande chamado:

```text
[TRUSTED_RUNTIME_CONTEXT]
...
[/TRUSTED_RUNTIME_CONTEXT]
```

mas a última mensagem enviada ao LLM não era necessariamente o atual turno do usuário.

Além disso, havia histórico e o `user_message` duplicado dentro do contexto estruturado.

O resultado era um prompt final com muitos blocos e, em determinadas condições, o modelo principal devolvia:

```text
message.content = ""
```

com:

```text
HTTP 200
DONE_REASON=stop
eval_count=1
```

O erro propagado pelo sistema era:

```text
Local LLM returned an empty response
```

### Evidência direta

Um payload real chegou a ter:

```text
message_count = 16
```

com um primeiro `user` de aproximadamente 4081 caracteres e o último item sendo um `assistant` de 656 caracteres.

Naquele ponto o LLM respondeu HTTP 200, mas `content` vazio.

### Correção aplicada em `toLlmMessages`

A função foi reorganizada para:

1. localizar o último inbound textual real;
2. removê-lo do histórico;
3. construir `recent_messages` somente com o restante;
4. construir o `TRUSTED_RUNTIME_CONTEXT` com `user_message` explicitamente;
5. reconstruir o histórico sem o turno atual;
6. **adicionar o turno atual como última mensagem `role=user`**.

A ordenação final observada passou a ser:

```text
#0  role=user       runtime context
#1  role=assistant   histórico
#2  role=user       histórico
...
#12 role=assistant  histórico
#13 role=user       turno atual
```

A checagem explícita confirmou:

```text
ULTIMO TURNO USER = PASS
```

### Aprendizado principal

Para um auto-reply conversacional, o último turno do usuário precisa aparecer como o **último item do array enviado ao LLM**. Não basta que a informação esteja em algum campo JSON anterior.

Esse detalhe teve impacto direto no comportamento real do `qwen2.5:14b-instruct`.

---

## 16. Oitava falha: teste direto do LLM com histórico complexo retornava vazio

Mesmo com o contexto corrigido, houve um teste direto usando `generateReply` que retornou resposta vazia.

O teste de baixo nível contra `/api/chat`, com histórico grande, mostrou:

```text
HTTP 200
message.content = ""
eval_count = 1
```

Por outro lado, uma chamada direta simples ao mesmo modelo, com apenas system + user, retornou texto válido em aproximadamente 6–7 segundos.

### Aprendizado

O problema não era “Ollama não funciona”.

O modelo funcionava.

O problema estava ligado ao **payload conversacional concreto**, principalmente composição/ordenação/contexto e/ou pressão do runtime.

A evidência decisiva foi:

```text
payload simples -> resposta válida
payload histórico complexo -> content vazio
payload com contexto/ordenação corrigidos -> resposta válida no fluxo live
```

Ao investigar uma falha futura de `content` vazio, não assumir imediatamente que Ollama está offline.

---

## 17. Fluxo textual simples foi validado

Uma mensagem de texto enviada pelo WhatsApp chegou como:

```text
INBOUND
TEXT
```

e recebeu uma resposta:

```text
OUTBOUND
TEXT
```

Exemplo:

```text
Inbound:
Olá, estou fazendo um teste. Responda apenas: teste recebido.

Outbound:
Teste recebido.
```

Isso confirmou que o mecanismo base de:

```text
INBOUND -> context -> LLM -> sendText -> OUTBOUND
```

continuava funcionando durante toda a investigação multimodal.

---

## 18. Fluxo real de áudio: primeira fase falhando

Antes das correções, vários áudios chegaram como:

```text
message_type = AUDIO
media_status = UNAVAILABLE
```

ou:

```text
media_status = FAILED
```

Exemplos de falhas:

```text
Transcription command not found: C:\...\whisper.exe
```

ou erro do Python/Whisper:

```text
RuntimeError: Numpy is not available
```

ou:

```text
OMP: Error #137: Cannot create thread.
```

Portanto, a classificação WhatsApp estava correta, mas o enriquecimento não estava operacional.

---

## 19. Fluxo real de áudio passou após o ajuste de threads

Depois de configurar:

```text
KASSIST_WHISPER_THREADS=1
OMP_NUM_THREADS=1
MKL_NUM_THREADS=1
OPENBLAS_NUM_THREADS=1
```

foi enviado um novo áudio real via WhatsApp.

Resultado observado diretamente no Gateway:

```text
message_type = AUDIO
media_status = COMPLETED
text = "Quais produtos vocês têm disponíveis?"
```

Outro áudio foi processado como:

```text
Eu gostaria que você me explicasse melhor sobre os produtos que vocês têm disponíveis.
```

Outro:

```text
Qual que é o meu nome mesmo?
```

Outro:

```text
Assim, eu gostaria de saber melhor sobre a empresa de vocês como funciona.
```

### Evidência mais forte

Foi executado um monitor que aguardava um novo áudio, depois verificava:

```text
media_status == COMPLETED
text não vazio
```

e depois procurava um outbound posterior no mesmo JID.

Resultado real:

```text
AUDIO -> TRANSCRICAO -> LLM -> OUTBOUND = PASS
```

Exemplo final:

```text
AUDIO:
Assim, eu gostaria de saber melhor sobre a empresa de vocês como funciona.

OUTBOUND:
O KassisT QA é uma empresa especializada em fornecer soluções de testes e validações...
```

Esse foi o teste end-to-end mais importante da rodada.

---

## 20. Evidência de persistência do áudio

Ao consultar:

```text
GET /api/whatsapp/messages?limit=100
```

foi possível localizar áudios com:

```text
message_type = AUDIO
media_status = COMPLETED
text = transcrição
```

Por exemplo:

```text
ACF10FA475DDB2A3F68D293B271F5F34
Quais produtos vocês têm disponíveis?
COMPLETED
```

```text
AC21A6CEF87E5B2867E5BF1FD4560510
Eu gostaria que você me explicasse melhor sobre os produtos que vocês têm disponíveis.
COMPLETED
```

```text
ACA07BBE425C1DC1549F8C4AD0FB12DF
Assim, eu gostaria de saber melhor sobre a empresa de vocês como funciona.
COMPLETED
```

Isso demonstra que o Gateway não apenas transcreveu em memória: o resultado apareceu na superfície de mensagens persistidas do runtime.

---

## 21. Evidência de áudio -> LLM -> outbound

Em uma execução real, a sequência observada foi:

```text
INBOUND AUDIO
    |
    v
Whisper COMPLETED
    |
    v
texto persistido
    |
    v
LLM qwen2.5:14b-instruct
    |
    v
OUTBOUND TEXT
```

Exemplo:

```text
Inbound AUDIO:
Assim, eu gostaria de saber melhor sobre a empresa de vocês como funciona.

Outbound:
O KassisT QA é uma empresa especializada em fornecer soluções de testes e validações...
```

Isso foi enviado pelo WhatsApp, não apenas retornado por uma função interna.

---

## 22. Mensagens de outbound e status UNKNOWN

Nas consultas do endpoint de mensagens, os outbound foram exibidos com:

```text
status = UNKNOWN
```

apesar de o texto ter sido realmente enviado e aparecer no histórico.

Isso não deve ser automaticamente interpretado como falha.

Existe diferença entre:

```text
efeito de envio observado localmente
```

e:

```text
semântica confirmada de entrega/leitura do provider
```

Esse ponto conversa diretamente com o histórico de contratos de dispatch do projeto: `UNKNOWN` não deve ser promovido cegamente a `SUCCESS` sem evidência do provider.

Neste teste específico, a resposta aparecendo no WhatsApp foi evidência de efeito externo real, mas o modelo de estado persistido ainda pode não distinguir todos os níveis de confirmação.

---

## 23. Persistência 3211 foi testada de forma independente

O serviço Desktop/Persistence foi iniciado em:

```text
127.0.0.1:3211
```

O teste da raiz:

```text
GET /
```

retornou:

```text
404 not_found
```

Isso foi corretamente interpretado como:

```text
serviço respondeu
```

não como:

```text
processo morto
```

O endpoint canônico real testado foi:

```text
POST /internal/v1/whatsapp/message
```

com mensagem sintética.

Resultado:

```json
{
  "persisted": true,
  "conversation_id": "..."
}
```

E foi registrado:

```text
PERSISTENCE 3211 = PASS
```

### Aprendizado

Uma API sem endpoint de health não deve ser classificada como offline só porque `/` devolve 404. Testar um endpoint canônico da função real do serviço.

---

## 24. Problema operacional do terminal “fechar”

Durante a operação, vários comandos usavam:

```text
pnpm --filter @kassist/gateway dev
```

em foreground.

Quando o processo terminava ou quando o script PowerShell usava:

```text
exit 0
```

ou lançava uma exceção, o terminal integrado parecia “fechar sozinho” para o usuário.

### Solução operacional

Foi criada uma forma de iniciar o Gateway como processo independente, com logs separados:

```text
runtime-logs/gateway.stdout.log
runtime-logs/gateway.stderr.log
```

O processo foi iniciado via:

```powershell
Start-Process cmd.exe ...
```

e monitorado separadamente.

Com isso foi possível verificar que o Gateway continuava vivo mesmo depois de um script de teste terminar.

### Evidência

Foi observado:

```text
GATEWAY = ONLINE | PID=42092
```

por dezenas de ciclos.

Depois de testes de áudio, a porta `3210` permaneceu ativa e:

```text
GET /health -> status ok
GET /api/whatsapp/status -> CONNECTED
```

### Aprendizado

A conclusão “o terminal fechou” não equivale a “Gateway caiu”. Sempre separar:

```text
terminal do script de teste
```

de:

```text
processo do Gateway
```

e verificar a porta/PID independentemente.

---

## 25. O problema de `Start-Sleep` / loops de monitoramento

Foram usados vários monitores PowerShell de 2–5 segundos.

Alguns scripts terminaram por:

```text
exit 0
```

outros por exceção ao encontrar falha.

Para monitoramento contínuo do Gateway, a abordagem mais estável foi um `while ($true)` separado, exibindo:

```text
status HTTP
WhatsApp CONNECTED
messageCount
porta 3210
logs
```

Isso deve ser preferido para observação contínua.

---

## 26. Teste de memória e descarregamento de modelos

Foi diagnosticado o impacto de modelos carregados com:

```powershell
ollama ps
```

Em determinada execução, o Qwen 14B estava ocupando recursos substanciais.

Foi possível descarregar com:

```powershell
ollama stop qwen2.5:14b-instruct
ollama stop qwen2.5vl:7b
```

Depois:

```text
ollama ps
```

retornou vazio.

### Aprendizado

Para testes de Whisper em máquina local, especialmente em Windows, reduzir a concorrência dos backends ajuda muito.

Uma sequência operacional segura é:

```text
1. confirmar Ollama
2. medir modelos carregados
3. descarregar modelos se necessário
4. testar Whisper isoladamente
5. somente depois executar o fluxo Gateway completo
```

---

## 27. Comandos operacionais confiáveis descobertos

### Validar Ollama

```powershell
Invoke-RestMethod http://127.0.0.1:11434/api/tags
```

### Ver modelos carregados

```powershell
ollama ps
```

### Ver portas

```powershell
Get-NetTCPConnection -State Listen |
  Where-Object { $_.LocalPort -in 3210,3211,11434 }
```

### Testar Gateway

```powershell
Invoke-RestMethod http://127.0.0.1:3210/health
Invoke-RestMethod http://127.0.0.1:3210/ready
Invoke-RestMethod http://127.0.0.1:3210/api/whatsapp/status
```

### Testar suite

```powershell
pnpm --filter @kassist/gateway test
```

### Testar apenas multimodal

```powershell
node --test gateway/test/multimodal.test.mjs
```

### Executar Whisper real de forma reproduzível

```powershell
$env:KASSIST_WHISPER_PYTHON = 'C:\Users\Kennedy Oliveira\AppData\Local\Programs\Python\Python310\python.exe'
$env:KASSIST_WHISPER_COMMAND = 'C:\Users\Kennedy Oliveira\AppData\Roaming\Python\Python310\Scripts\whisper.exe'
$env:KASSIST_WHISPER_MODEL = 'base'
$env:KASSIST_WHISPER_DEVICE = 'cpu'
$env:KASSIST_WHISPER_LANGUAGE = 'pt'
$env:KASSIST_WHISPER_THREADS = '1'
$env:OMP_NUM_THREADS = '1'
$env:MKL_NUM_THREADS = '1'
$env:OPENBLAS_NUM_THREADS = '1'
$env:PYTHONUTF8 = '1'
$env:PYTHONIOENCODING = 'utf-8'
```

Depois chamar o módulo real:

```powershell
node --input-type=module -e @"
import fs from 'node:fs/promises';
import { transcribeAudioBuffer } from './gateway/src/multimodal.mjs';

const buffer = await fs.readFile(process.env.TEST_AUDIO);
const result = await transcribeAudioBuffer(buffer, {
  extension: 'ogg',
  device: process.env.KASSIST_WHISPER_DEVICE,
  language: process.env.KASSIST_WHISPER_LANGUAGE
});

console.log(JSON.stringify(result, null, 2));
if (result.status !== 'COMPLETED') process.exitCode = 1;
"@
```

---

## 28. Estado final de `gateway/src/multimodal.mjs`

A implementação atual está registrada na branch publicada e possui estas características:

### AUDIO

- classifica `audioMessage` como `AUDIO`;
- grava o buffer em diretório temporário;
- usa extensão configurável;
- respeita `KASSIST_WHISPER_MODEL`;
- respeita `KASSIST_WHISPER_DEVICE`;
- respeita `KASSIST_WHISPER_LANGUAGE`;
- respeita `KASSIST_WHISPER_TIMEOUT_MS`;
- permite `KASSIST_WHISPER_PYTHON`;
- quando `KASSIST_WHISPER_COMMAND` termina em `.exe`, executa `python -m whisper`;
- encaminha `--threads`/variáveis de ambiente para limitar threads;
- lê o `.txt` produzido pelo Whisper;
- retorna `COMPLETED` + texto;
- retorna `UNAVAILABLE` em runtime inexistente;
- retorna `FAILED` em outras falhas;
- sempre tenta limpar o diretório temporário.

### IMAGE

- classifica `imageMessage` como `IMAGE`;
- escolhe `KASSIST_LLM_VISION_MODEL` antes de `KASSIST_LLM_MODEL`;
- usa endpoint local Ollama;
- envia imagem como base64 no array `images`;
- usa `stream:false`;
- usa `think:false`;
- possui timeout por `AbortController`;
- retorna `COMPLETED` quando o `message.content` da Vision é não vazio;
- retorna `UNAVAILABLE` quando não há modelo configurado;
- retorna `FAILED` para HTTP não-2xx ou conteúdo vazio;
- também tenta manter a operação estritamente local através da configuração de URL do projeto.

O estado atual do arquivo na branch foi verificado diretamente após o commit final. fileciteturn118file0

---

## 29. Estado final de `gateway/src/auto-reply.mjs`

A função `toLlmMessages` foi alterada para fechar uma propriedade importante do diálogo:

```text
última mensagem textual INBOUND = turno atual
```

Ela agora:

- encontra o último inbound textual;
- remove esse item do histórico;
- inclui os dados estruturados em `[TRUSTED_RUNTIME_CONTEXT]`;
- transforma outbound em `assistant`;
- transforma inbound histórico em `user`;
- adiciona o turno atual como último `role=user`.

O auto-reply continua exigindo:

```text
conversation.ownership === AI
conversation.aiState === ACTIVE
conversation.lifecycleState === OPEN
```

O código também preserva a lógica de segurança de identidade não confirmada.

A implementação final foi verificada na branch publicada. fileciteturn119file0

---

## 30. Estado final de `gateway/src/llm.mjs`

O LLM principal usa:

```text
http://127.0.0.1:11434
```

e monta o payload como:

```text
system prompt
+
messages sem os system prompts internos
```

com:

```text
stream: false
think: false
```

Se o Ollama responder HTTP 200 mas `message.content` vier vazio, o sistema lança:

```text
Local LLM returned an empty response
```

Esse comportamento foi útil para detectar o problema real de payload/contexto em vez de esconder a falha.

A implementação atual foi verificada diretamente na branch. fileciteturn120file0

---

## 31. Estado da suíte de testes

Ao final:

```text
tests 115
pass 115
fail 0
cancelled 0
skipped 0
todo 0
```

A suíte inclui testes de:

- assistant config;
- LLM context;
- identidade;
- CSV;
- dispatch;
- persistence boundaries;
- credentials;
- device auth;
- HTTP health/ready;
- Ollama inventory/update;
- scheduler;
- LLM;
- multimodal;
- provider registry;
- WhatsApp JID/LID;
- lifecycle;
- classificação de mídia;
- WSS envelope/lifecycle.

O teste multimodal final possui quatro casos específicos e todos passaram. fileciteturn125file0

---

## 32. Histórico de mensagens reais observadas durante o teste

A conversa de teste chegou a conter dezenas de mensagens, incluindo:

### Texto

```text
qual meu nome?
Olá, estou fazendo um teste. Responda apenas: teste recebido.
```

### Áudio

```text
Quais produtos vocês têm disponíveis?
Eu gostaria que você me explicasse melhor sobre os produtos que vocês têm disponíveis.
Qual que é o meu nome mesmo?
Assim, eu gostaria de saber melhor sobre a empresa de vocês como funciona.
Você lembra meu nome?
Qual o meu nome de qual cidades estou falando?
```

### Imagem

Foram recebidas imagens com enriquecimento textual.

### Outbound

Foram observadas respostas coerentes com o contexto, como:

```text
Temos o Produto QA KassisT...
```

```text
Claro, o Produto QA KassisT é uma ferramenta...
```

```text
O KassisT QA é uma empresa especializada...
```

Isso demonstrou que o pipeline conversacional não estava apenas classificando mídia; ele estava efetivamente levando a mídia enriquecida para o motor de resposta.

---

## 33. Questão de identidade: aprendizado importante

O contexto observado continha dados como:

```text
identityBindingStatus = OBSERVED_PHONE_IDENTITY
```

com um `customer.name` conhecido na persistência.

Porém, a política do Gateway explicitamente trata identidades não confirmadas de forma conservadora.

Quando o cliente falou por áudio algo como:

```text
Meu nome é Kindred...
```

o sistema posteriormente respondeu sem necessariamente afirmar o nome como identidade confirmada.

Quando perguntado:

```text
Qual que é o meu nome mesmo?
```

houve uma resposta:

```text
Desculpe, mas não tenho informações sobre o seu nome...
```

Esse comportamento é consistente com a regra de que texto de usuário não deve automaticamente virar identidade confirmada.

### Aprendizado

Não “corrigir” esse comportamento simplificando para:

```text
se apareceu nome -> use nome
```

A lógica de identidade do projeto é deliberadamente mais restritiva.

---

## 34. Questão de contexto: o histórico é potencialmente muito grande

Em certo momento o contexto real continha:

```text
20 mensagens persistidas
```

e o payload chegou a ter 16 mensagens para o LLM depois da transformação.

O `TRUSTED_RUNTIME_CONTEXT` sozinho tinha milhares de caracteres.

Embora o runtime final tenha funcionado, isso revelou que existe um limite prático de contexto.

### Próxima evolução provável

Uma futura LLM pode precisar avaliar:

```text
contextMessages
history truncation
summarization
memory extraction
```

mas **não deve mudar isso sem revisar o contrato de AI context**.

O que ficou provado nesta rodada é apenas que o arranjo atual, após corrigir a ordem do turno, funciona nos testes reais executados.

---

## 35. Questão de limpeza de processo

Em diferentes momentos existiam processos antigos do Gateway:

```text
node.exe ... src/main.mjs
```

usando:

```text
127.0.0.1:3210
```

O erro clássico foi:

```text
EADDRINUSE: address already in use 127.0.0.1:3210
```

A correção operacional foi localizar o PID:

```powershell
Get-NetTCPConnection -LocalAddress '127.0.0.1' -LocalPort 3210 -State Listen
```

e depois inspecionar:

```powershell
Get-CimInstance Win32_Process -Filter "ProcessId = $pid"
```

Só então encerrar o processo correto.

### Aprendizado

Não iniciar múltiplas instâncias do Gateway para “ver se funciona”. Sempre verificar a porta primeiro.

---

## 36. Questão de shutdown / restart

Foi testado:

```text
Gateway -> encerramento -> ausência da porta 3210 -> restart
```

Após restart:

```text
GET /health -> 200 / ok
WhatsApp -> CONNECTED
```

Os dados persistidos anteriores permaneceram acessíveis através do serviço de persistence quando a camada de contexto foi consultada.

Porém, testes de restart do Gateway devem ser entendidos como duas perguntas diferentes:

```text
1. o processo sobe novamente?
2. o histórico persistido continua acessível?
```

Na rodada, ambas as propriedades apresentaram evidência positiva em diferentes testes, mas o `media_status` não fazia parte de todos os objetos retornados pelo `getConversationContext`.

---

## 37. O que definitivamente funcionou

### Backend multimodal

```text
AUDIO classification = PASS
IMAGE classification = PASS
```

### Whisper real

```text
Whisper installed = PASS
Whisper import = PASS
Whisper standalone real audio = PASS
Node -> Whisper = PASS
Gateway -> Whisper = PASS
```

### Vision real

```text
Ollama Vision direct = PASS
Gateway IMAGE enrichment = PASS
IMAGE persistence = PASS
```

### Conversational pipeline

```text
TEXT -> LLM -> WhatsApp = PASS
AUDIO -> Whisper -> LLM -> WhatsApp = PASS
```

### Gateway

```text
/health = PASS
/ready = PASS
WhatsApp CONNECTED = PASS
```

### Tests

```text
115/115 = PASS
```

### Git

```text
d0a6afb publicado na branch MVP2-implementandoQRCODE
local SHA == remote SHA
MVP2 preservada
```

---

## 38. O que não deve ser considerado fechado ainda

### 38.1 Status semântico do outbound

O endpoint apresentou vários outbound com:

```text
status = UNKNOWN
```

Mesmo quando o efeito externo foi observado.

Isso não deve ser “corrigido” ad hoc.

A semântica de provider success/delivery precisa continuar alinhada ao contrato existente.

### 38.2 `media_status` no context reader

O endpoint de mensagens expõe `media_status`, mas o objeto retornado por `getConversationContext` não mostrou esse campo.

Não concluir automaticamente que é bug de persistence. Auditar o contrato do reader antes de mudar.

### 38.3 Resposta textual do Main LLM após imagem

Houve pelo menos um caso em que o auto-reply falou que não conseguia visualizar a imagem, apesar de existir descrição Vision persistida.

Isso merece uma validação específica do prompt/context mapping.

### 38.4 Pressão de recursos

O fluxo funcionou com:

```text
Whisper CPU
1 thread
OMP/MKL/OPENBLAS = 1
```

A máquina também roda Ollama com modelos grandes.

Isso é uma estratégia de estabilidade local comprovada, não uma prova de que qualquer configuração de hardware terá a mesma capacidade.

### 38.5 Arquivos modificados localmente

Antes do commit final existiam alterações em:

```text
gateway/src/auto-reply.mjs
gateway/src/multimodal.mjs
gateway/test/multimodal.test.mjs
```

O commit final incorporou essas alterações.

A documentação deste handoff é um arquivo novo e será um commit separado.

---

## 39. O que uma próxima LLM deve fazer antes de modificar código

1. Confirmar a branch atual:

```text
MVP2-implementandoQRCODE
```

2. Confirmar o HEAD atual no GitHub, não assumir `d0a6afb` como HEAD depois que este arquivo foi publicado. O handoff passa a ter um commit adicional.

3. Confirmar `origin/MVP2` antes de qualquer trabalho estrutural.

4. Ler primeiro:

```text
gateway/src/multimodal.mjs
gateway/src/auto-reply.mjs
gateway/src/llm.mjs
gateway/test/multimodal.test.mjs
docs/operations/README.md
```

5. Reproduzir as falhas apenas depois de verificar o estado do Ollama e dos processos.

6. Não iniciar `ollama serve` se `11434` já estiver ocupado por uma instância saudável.

7. Não iniciar outro Gateway se `3210` já estiver ocupada por uma instância saudável.

8. Em Windows, para Whisper local, começar com:

```text
cpu
threads=1
OMP_NUM_THREADS=1
MKL_NUM_THREADS=1
OPENBLAS_NUM_THREADS=1
```

9. Para o runtime real, usar o Python configurado via `KASSIST_WHISPER_PYTHON` e, quando o comando configurado for `.exe`, manter o caminho efetivo `python -m whisper`.

10. Ao testar o LLM, diferenciar:

```text
Ollama offline
```

de:

```text
Ollama online + payload problemático
```

11. Ao testar contexto, verificar sempre que a mensagem atual do usuário é o último item `role=user`.

12. Não transformar `UNKNOWN` em `SUCCESS` sem contrato/provider evidence.

13. Não assumir que “terminal fechou” significa “Gateway caiu”. Verificar PID/porta.

---

## 40. Linha do tempo resumida da execução

### Fase A — preparação

- Criado `gateway/test/multimodal.test.mjs`.
- Primeira tentativa foi colar JS diretamente no PowerShell; falhou por parser.
- Arquivo foi então escrito corretamente e executado via Node.
- Suíte inicial tinha 112 testes.

### Fase B — validação de ambiente

- `pnpm install` estava limpo.
- Ollama já estava ativo em `11434`.
- Gateway e Persistence alternaram entre online/offline conforme processos eram iniciados/encerrados.
- WhatsApp chegou a `CONNECTED`.

### Fase C — Whisper

- `whisper.exe` existia.
- import Python funcionava.
- execução falhou por NumPy 2.x vs componentes compilados para NumPy 1.x.
- execução CPU falhou por alocação.
- execução falhou por OpenMP não conseguir criar threads.
- redução para uma thread resolveu.
- Node passou a executar `python -m whisper` quando o comando configurado era `.exe`.

### Fase D — contexto/LLM

- contexto grande e ordenação problemática foram observados.
- Ollama retornou HTTP 200 com `content` vazio em payload complexo.
- chamada simples ao mesmo modelo retornou normalmente.
- `toLlmMessages` foi reorganizada.
- último turno do usuário passou a ser explicitamente o último item.
- chamada real `context -> LLM` passou.

### Fase E — áudio real end-to-end

- áudio real recebido pelo WhatsApp.
- Whisper retornou `COMPLETED`.
- transcrição apareceu no endpoint de mensagens.
- LLM gerou resposta.
- outbound foi enviado para o mesmo JID.
- fluxo foi declarado PASS com evidência operacional.

### Fase F — Vision real

- imagem local enviada diretamente para Ollama Vision.
- Vision retornou descrição real.
- imagens recebidas pelo WhatsApp foram enriquecidas.
- descrições apareceram no histórico persistido.
- ainda existe observação sobre semântica do context reader e sobre resposta do Main LLM após imagem.

### Fase G — suíte e publicação

- suíte inteira chegou a:

```text
115/115 PASS
```

- commit criado:

```text
d0a6afb30eaf65a8d84b937dd2756e543d4ebfe1
```

- push para:

```text
MVP2-implementandoQRCODE
```

- local e remoto sincronizados.

---

## 41. Referência do estado do repositório

A branch `MVP2-implementandoQRCODE` aponta para `d0a6afb...` no início da consolidação deste handoff, e o commit publicado contém exatamente as mudanças em `auto-reply`, `multimodal` e testes multimodais. fileciteturn121file0

A branch pode ser consultada diretamente no GitHub e está separada da `MVP2`. fileciteturn124file0

A árvore `docs/operations` já possuía documentação operacional de bootstrap, sem alegar automações de backup/recovery como implementadas; este handoff foi criado como complemento histórico/diagnóstico, não como substituto do contrato operacional. fileciteturn126file0

---

## 42. Aprendizados gerais para outra LLM

### Aprendizado 1 — testar camada por camada

A sequência correta foi:

```text
Python
-> Whisper
-> Node child process
-> módulo multimodal
-> Gateway
-> Persistence
-> LLM
-> WhatsApp
```

Quando pulamos uma camada, o diagnóstico ficava ambíguo.

### Aprendizado 2 — Windows é parte do contrato operacional real

Pipes, `.exe`, `.cmd`, `shell`, encoding, threads e processos filhos afetaram diretamente o comportamento.

Não presumir comportamento Linux/macOS.

### Aprendizado 3 — recursos locais são parte do runtime

RAM disponível não basta. Threads OpenMP e modelos carregados competem pelos recursos.

### Aprendizado 4 — 200 HTTP não significa resposta semanticamente útil

Ollama pode retornar:

```text
HTTP 200
content = ""
```

O Gateway corretamente trata isso como falha.

### Aprendizado 5 — contexto deve terminar no turno atual

O último item do array do Chat deve refletir o turno atual do cliente.

### Aprendizado 6 — multimodal não é apenas classificação

Classificar `AUDIO` ou `IMAGE` é apenas o começo. O caminho de valor é:

```text
mídia -> enriquecimento -> persistência -> contexto -> LLM -> resposta
```

### Aprendizado 7 — persistência e context reader são contratos diferentes

O fato de a mensagem existir com texto enriquecido não garante que o context reader exponha todos os metadados de mídia.

### Aprendizado 8 — o que funciona manualmente deve virar evidência reproduzível

Os testes mais úteis foram os que terminaram com assertions explícitas:

```text
PASS
```

ou com `exit code 0`.

### Aprendizado 9 — terminal e processo são coisas diferentes

Scripts de observação podem acabar sem que o daemon do Gateway tenha caído.

### Aprendizado 10 — não mexer no contrato só para “fazer parecer verde”

Foi necessário preservar:

```text
UNAVAILABLE
FAILED
UNKNOWN
IDENTITY SAFETY
AI ownership
OPEN/ACTIVE state
```

O objetivo foi tornar o runtime funcional sem apagar semânticas importantes do projeto.

---

## 43. Próximo ponto natural de trabalho

A implementação multimodal está funcional na branch de trabalho e publicada.

A próxima LLM deve evitar reabrir o diagnóstico básico de Whisper/Ollama, porque isso já foi comprovado no ambiente real.

O próximo trabalho técnico de maior valor, caso solicitado, é validar e eventualmente fechar os pontos ainda observados:

```text
1. semântica de status outbound UNKNOWN;
2. exposição de media_status no context reader;
3. coerência do Main LLM ao responder sobre imagens já enriquecidas por Vision;
4. estabilidade sob histórico maior/conversas longas;
5. documentação operacional dos requisitos Windows/Whisper.
```

Nenhum desses pontos deve ser resolvido inventando um novo contrato. Primeiro reconciliar com os contratos existentes do projeto.

---

## 44. Comando de retomada recomendado

Para uma próxima LLM ou sessão humana começar sem perder o estado:

```powershell
Set-Location 'C:\Users\Kennedy Oliveira\Desktop\KassisT'
$ErrorActionPreference = 'Stop'

git branch --show-current
git rev-parse HEAD
git rev-parse origin/MVP2
git status --short --branch

pnpm --filter @kassist/gateway test

Invoke-RestMethod http://127.0.0.1:3210/health
Invoke-RestMethod http://127.0.0.1:3210/ready
Invoke-RestMethod http://127.0.0.1:3210/api/whatsapp/status
Invoke-RestMethod http://127.0.0.1:11434/api/tags
```

Em seguida, ler este documento antes de repetir qualquer tentativa experimental.

---

## 45. Conclusão operacional

A execução desta rodada demonstrou, em ambiente Windows real, que a branch `MVP2-implementandoQRCODE` consegue realizar o fluxo multimodal principal de forma operacional:

```text
WhatsApp AUDIO
 -> Whisper real
 -> transcrição persistida
 -> contexto
 -> qwen2.5:14b-instruct
 -> OUTBOUND WhatsApp
```

E também:

```text
WhatsApp IMAGE
 -> qwen2.5vl:7b
 -> descrição persistida
 -> contexto
```

A parte mais importante do aprendizado não foi apenas “funciona”. Foi identificar **por que parecia não funcionar** em várias etapas:

```text
PowerShell != JavaScript
Ollama já estava rodando
Whisper instalado != Whisper funcional
NumPy/PyTorch incompatíveis
CPU pode falhar por alocação
OpenMP pode falhar por criação de threads
Node pode ter comportamento diferente ao executar .exe
payload de histórico pode gerar content vazio
último turno precisa ser o último user
terminal encerrado != Gateway encerrado
```

A implementação que passou esses problemas foi publicada no GitHub na branch de trabalho. O commit de implementação é `d0a6afb30eaf65a8d84b937dd2756e543d4ebfe1`; este documento foi criado como handoff adicional na mesma branch.
