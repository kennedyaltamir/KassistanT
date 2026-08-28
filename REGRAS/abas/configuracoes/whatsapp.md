# Regra permanente — Configurações → WhatsApp / Conexão

**Natureza:** especificação normativa funcional e arquitetural.

> Esta regra é obrigatória para qualquer IA, agente, mantenedor ou QA que altere `Configurações → WhatsApp / Conexão`. Documentação não constitui prova de implementação.

## 1. Objetivo e responsabilidade

`Configurações → WhatsApp / Conexão` é o **ponto único de administração operacional** da integração WhatsApp.

A área deve permitir verificar saúde, conectar, acompanhar a conexão, parear por QR, visualizar identidade fornecida pelo Gateway, acompanhar estado em tempo real, desconectar, reconectar, resetar a sessão, compreender erros e consultar proveniência.

`Conversas` não administra conexão. Pode informar indisponibilidade e encaminhar o usuário para esta área, mas não deve possuir conectar, desconectar, resetar sessão, QR ou onboarding de conexão.

## 2. Distinção normativa

| Categoria | Significado |
|---|---|
| **REGRA** | determinação obrigatória de comportamento, segurança ou arquitetura |
| **CONTRATO EXISTENTE** | contrato confirmado e consumível pelo sistema atual |
| **REQUISITO** | comportamento que a interface deve oferecer, sujeito à verificação da implementação |
| **STATUS: EXISTENTE** | há evidência concreta no código/contrato/teste |
| **STATUS: NÃO IMPLEMENTADO** | requisito documentado sem evidência suficiente de implementação |
| **STATUS: FUTURO / CHANGE UNIT** | exige alteração formal de contrato, arquitetura ou ownership |

Nunca considerar a documentação, isoladamente, como prova de implementação.

## 3. Contratos existentes

Os contratos HTTP atuais são:

```http
GET  /api/whatsapp/status
GET  /api/whatsapp/events
POST /api/whatsapp/connect
POST /api/whatsapp/logout
POST /api/whatsapp/reset-session
```

`GET /api/whatsapp/events` é SSE.

O contrato de status possui:

```text
connection
qr
me.id
me.name
lastError
messageCount
```

O endpoint abaixo **não existe**:

```http
POST /api/whatsapp/reconnect
```

A ação visual **Reconectar** reutiliza `POST /api/whatsapp/connect`. Um novo endpoint somente pode existir por uma Change Unit futura que altere formalmente o contrato.

## 4. Estados oficiais

Os únicos estados de conexão são:

```text
DISCONNECTED
CONNECTING
PAIRING
CONNECTED
ERROR
```

Não criar estados paralelos, renomear estados ou mascarar estado desconhecido como sucesso.

### DISCONNECTED — STATUS: EXISTENTE

Nenhuma sessão está conectada.

A UI deve apresentar `WhatsApp desconectado` e `Conectar WhatsApp`, usando:

```http
POST /api/whatsapp/connect
```

### CONNECTING — STATUS: EXISTENTE

A conexão foi solicitada e está em andamento.

Enquanto `CONNECTING`:

- não mostrar QR;
- não mostrar identidade como conectada;
- não declarar sucesso;
- evitar múltiplas solicitações simultâneas;
- aguardar estado real do Gateway.

### PAIRING — STATUS: EXISTENTE

Quando:

```text
connection = PAIRING
qr = <valor real>
```

a UI deve mostrar `Vincule seu WhatsApp` e um QR visual, não editável.

Fluxo obrigatório:

```text
Gateway → qr → Renderer → qrcode-generator@2.0.4 → SVG
```

### CONNECTED — STATUS: EXISTENTE

A UI deve mostrar `WhatsApp conectado`.

Quando fornecidos, apresentar somente:

```text
me.id
me.name
```

Não inferir telefone, nome, dispositivo, conta ou qualquer identidade a partir de outro dado. Não converter JID em telefone como se isso fosse informação fornecida pelo Gateway.

### ERROR — STATUS: EXISTENTE

Mostrar `Falha na conexão` e `lastError` quando disponível. Distinguir estado, mensagem e origem do erro. Não substituir uma mensagem útil fornecida pelo Gateway por um erro genérico.

## 5. QR Code

O QR representa dados de pareamento fornecidos pelo Gateway. O Renderer apenas os transforma em representação visual.

Regras obrigatórias:

- usar `qrcode-generator@2.0.4`;
- carregar a distribuição browser local apropriada;
- não usar CDN;
- gerar SVG;
- tornar o SVG acessível;
- substituir o QR anterior quando um novo valor chegar;
- não usar `textarea`, `input` ou texto editável para o QR;
- não acessar filesystem, credenciais ou auth state;
- não executar Baileys no Renderer.

O mecanismo de geração deve ser equivalente a:

```javascript
const qr = qrcode(0, 'M');
qr.addData(String(state.wa.qr));
qr.make();
target.innerHTML = qr.createSvgTag({
  cellSize: 6,
  margin: 18,
  scalable: true
});
```

Acessibilidade mínima: SVG com papel `img` e rótulo adequado.

## 6. Pareamento e atualização

Quando `PAIRING`, mostrar:

```text
1. Abra o WhatsApp no celular.
2. Acesse Dispositivos conectados.
3. Selecione Vincular dispositivo.
4. Escaneie o QR Code exibido pelo KassisT.
```

O QR é temporário e pode ser substituído por outro valor fornecido pelo Gateway.

Não exigir recarregamento manual da aplicação para substituir o QR.

Fluxo esperado:

```text
SSE → evento de conexão → PAIRING + novo qr → estado → Renderer → novo SVG
```

## 7. SSE e proveniência

O canal oficial é:

```http
GET /api/whatsapp/events
```

Direção:

```text
Gateway → SSE → Renderer → applyStatus() → UI
```

Não criar uma segunda autoridade de estado ou uma segunda implementação de SSE.

A UI deve diferenciar:

```text
Gateway  = saúde do serviço
WhatsApp = estado da sessão
SSE      = estado do canal de eventos
```

Exibição técnica discreta recomendada:

```text
Gateway      HEALTHY
WhatsApp     CONNECTED
SSE          CONNECTED
```

Não confundir `Gateway saudável` com `WhatsApp conectado`, nem `WhatsApp conectado` com `SSE saudável`.

## 8. Identidade

Quando `CONNECTED`, a identidade vem exclusivamente de:

```text
me.id
me.name
```

Ausência de nome deve permanecer explícita, por exemplo `Nome: Indisponível`.

Não inferir:

- telefone;
- nome;
- dispositivo;
- versão do WhatsApp;
- número legível a partir de JID;
- qualquer outra identidade não fornecida.

## 9. Sessão: logout versus reset

**Desconectar** encerra a conexão operacional sem ser tratado como apagamento de autenticação:

```http
POST /api/whatsapp/logout
```

**Resetar sessão** é uma operação destrutiva sobre o estado persistido de autenticação:

```http
POST /api/whatsapp/reset-session
```

As duas operações são diferentes e nunca devem ser tratadas como equivalentes.

O reset exige confirmação explícita antes da chamada destrutiva. Mensagem normativa mínima:

```text
Resetar sessão?

A sessão WhatsApp armazenada pelo KassisT será removida.
Um novo QR Code poderá ser necessário.

[Cancelar] [Resetar sessão]
```

## 10. Reconexão

A ação visual `Reconectar` deve reutilizar:

```http
POST /api/whatsapp/connect
```

Não criar `POST /api/whatsapp/reconnect` apenas para satisfazer a UI. Um novo endpoint exige Change Unit própria.

## 11. Segurança e ownership

### Renderer

Pode:

- solicitar operações pelos contratos;
- receber estados;
- renderizar estados;
- renderizar QR;
- apresentar identidade fornecida pelo Gateway;
- apresentar diagnósticos.

Não pode:

- criar socket WhatsApp;
- executar Baileys;
- usar `makeWASocket`;
- usar `useMultiFileAuthState`;
- acessar auth state;
- acessar credenciais;
- acessar diretório de autenticação;
- criar sessão WhatsApp.

### Gateway

É o dono da integração WhatsApp e mantém:

- Baileys;
- socket;
- autenticação;
- auth state;
- credenciais;
- sessão;
- QR como dado de conexão;
- conexão e reconexão interna;
- logout;
- reset;
- mensagens;
- persistência da integração;
- eventos.

Regra central:

> **Gateway é autoridade operacional da integração WhatsApp. Renderer é consumidor do contrato.**

## 12. Elementos proibidos

Não devem existir nesta superfície:

```text
makeWASocket
useMultiFileAuthState
KASSIST_WA_AUTH_DIR
socket WhatsApp no renderer
auth state no renderer
credenciais no renderer
QR em textarea
CDN para biblioteca QR
estado inventado
identidade inventada
endpoint inexistente
```

Também são proibidos como mecanismos de contorno:

```text
MutationObserver
patch de DOM pós-render
sanitização posterior da UI
duplicação de functions
segunda árvore de UI
segunda autoridade de estado
helpers paralelos que controlem a mesma conexão
```

## 13. State machine oficial

```text
DISCONNECTED
      │
      │ POST /connect
      ▼
CONNECTING
      │
      ├──────────────► ERROR
      │
      ▼
PAIRING
      │
      │ QR escaneado / estado real do Gateway
      ▼
CONNECTED
      │
      │ logout
      ▼
DISCONNECTED
```

Também são válidas as transições de falha:

```text
CONNECTING → ERROR
PAIRING    → ERROR
```

O estado real é sempre determinado pelo Gateway.

## 14. Não inferir nem fabricar

Quando ausentes do contrato, não exibir como fatos:

```text
última sincronização
IP
bateria
modelo do celular
versão do WhatsApp
nome do dispositivo
telefone derivado do JID
status de entrega
status de leitura
CRM
dados de cliente
```

## 15. Relação com Conversas

A divisão de responsabilidade é:

```text
Conversas
  → mensagens, histórico, seleção, envio e diagnósticos

Configurações / WhatsApp / Conexão
  → administração da conexão
```

Quando não conectado, Conversas pode mostrar:

```text
WhatsApp DISCONNECTED
Configure a conexão em Configurações → WhatsApp / Conexão
[ Abrir configuração ]
```

O encaminhamento não deve duplicar conexão, desconexão, reset ou QR.

## 16. Regras de implementação

Alterações devem corrigir a implementação existente no ponto arquitetural correto.

Não criar segunda `settings()`, segunda `conversations()`, segunda `bind()`, segunda `bindConversations()` ou segunda autoridade de estado.

Não alterar contratos existentes por conveniência de UI.

Não mover responsabilidades do Gateway para o Renderer.

Quando uma lacuna exigir mudança de contrato ou arquitetura, marcar como **FUTURO / CHANGE UNIT** antes de implementar.

## 17. Matriz documental e evidência

Para cada mudança, manter a distinção:

```text
REQUISITO
→ CONTRATO
→ IMPLEMENTAÇÃO
→ TESTE
→ STATUS
```

A documentação pode declarar um requisito mesmo quando ele estiver `STATUS: NÃO IMPLEMENTADO`. A situação só muda para `STATUS: EXISTENTE` mediante evidência concreta.

## 18. Critérios de aceitação

```text
[ ] Existe um único ponto de administração WhatsApp.
[ ] Configurações possui a área WhatsApp / Conexão.
[ ] DISCONNECTED é tratado explicitamente.
[ ] CONNECTING é tratado explicitamente sem QR.
[ ] PAIRING é tratado explicitamente.
[ ] CONNECTED é tratado explicitamente.
[ ] ERROR é tratado explicitamente.
[ ] QR é visual, não editável e derivado do Gateway.
[ ] QR utiliza qrcode-generator@2.0.4 localmente.
[ ] QR não usa CDN.
[ ] QR não é textarea nem input.
[ ] QR atualiza quando o Gateway fornece outro valor.
[ ] Identidade vem de me.id e me.name.
[ ] lastError é preservado quando disponível.
[ ] logout usa POST /api/whatsapp/logout.
[ ] reset usa POST /api/whatsapp/reset-session.
[ ] reset exige confirmação explícita.
[ ] Reconectar usa POST /api/whatsapp/connect.
[ ] Não existe /api/whatsapp/reconnect como requisito implícito.
[ ] SSE usa /api/whatsapp/events.
[ ] Gateway, WhatsApp e SSE são diferenciados na proveniência.
[ ] Conversas não administra a conexão.
[ ] Renderer não possui Baileys, socket ou auth state.
[ ] Estados inventados não são usados.
[ ] Identidade inventada não é usada.
[ ] Dados ausentes não são fabricados.
[ ] Nenhum DOM watcher/workaround é usado.
[ ] Não existem funções duplicadas.
[ ] Validações declaradas como PASS foram realmente executadas.
```

## 19. Regra para futuras alterações

Qualquer IA, agente, mantenedor ou QA que pretenda modificar `Configurações / WhatsApp / Conexão` deve obrigatoriamente:

1. ler `REGRAS/README.md`;
2. ler integralmente este documento;
3. identificar quais requisitos já existem;
4. identificar quais requisitos ainda não existem;
5. distinguir REGRA, CONTRATO EXISTENTE, REQUISITO e FUTURO / CHANGE UNIT;
6. não alterar contratos sem Change Unit explícita;
7. não duplicar responsabilidades entre Renderer e Gateway;
8. não criar endpoints ou estados fictícios;
9. não remover comportamento existente sem justificativa e evidência;
10. validar a implementação contra esta regra;
11. registrar qualquer divergência antes de implementar;
12. declarar limitações e testes não executados.

A regra prevalece sobre conveniências locais de implementação.
