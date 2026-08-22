# KassisT — Especificação Oficial do Produto e Sistema

Produto: KassisT
Documento: Especificação Oficial do Produto e Sistema
Versão: 1.0.1
Status: Approved Technical Baseline / Ready for Repository Bootstrap — Editorial / Consistency Patch
Data: 22/08/2026
Idioma do produto: Português do Brasil
Produto/UI: Português do Brasil
Código/contratos: Inglês
Plataforma inicial: Windows 10/11 64-bit
Escopo: MVP comercial local, preparado para evolução SaaS

---

0. Controle do documento

0.1 Objetivo

Este documento é o contrato de produto e arquitetura do KassisT. Ele consolida os requisitos fornecidos no briefing, decisões arquiteturais necessárias para torná-lo implementável, limites do MVP, critérios de aceitação, riscos, fluxos, modelo de dados e regras para desenvolvimento assistido por IA.

O briefing define explicitamente que o KassisT deve ser um produto real, não um experimento, e que a especificação deve servir como fonte única de verdade para múltiplas IAs, desenvolvedores e ferramentas. Também estabelece como diretrizes centrais: widget Windows compacto, atendimento de WhatsApp por LLM local, catálogo como conhecimento, cadastro de clientes, Google Contacts, notificações de venda, sons, métricas, logs, segurança, backup e possibilidade futura de SaaS. Essas diretrizes são preservadas nesta especificação.

0.2 Regras de leitura

MUST / DEVE: obrigatório no escopo indicado.

SHOULD / DEVERIA: recomendado, mas pode ser postergado com justificativa.

MAY / PODE: opcional.

MVP: obrigatório para a primeira versão comercial definida neste documento.

Future: planejado, mas não bloqueia o MVP.

Open Decision: depende de decisão humana ou validação externa.

0.3 Fonte de verdade e governança

A especificação é versionável. Alterações arquiteturais devem ser registradas em ADR e refletidas neste documento. Nenhuma IA pode redefinir unilateralmente uma decisão arquitetural registrada.

1. Executive Summary

1.1 O que é o KassisT

O KassisT é um aplicativo desktop para Windows que funciona como uma atendente virtual de WhatsApp para pequenos negócios, inicialmente uma sorveteria/picoleteria/açaiteria.

O sistema combina:

uma interface desktop compacta e futurista;

um widget circular flutuante;

um núcleo local de negócio;

uma LLM executada no computador por meio de Ollama;

catálogo estruturado como base de conhecimento;

atendimento automatizado;

intervenção humana;

motor determinístico de pedidos;

gestão de clientes;

sincronização opcional/automática com Google Contacts;

notificações de venda;

sons operacionais;

dashboard e relatórios;

logs e diagnóstico;

backup e restauração;

mecanismo de atualização para Windows.

1.2 Princípio central

A IA conversa. O sistema decide.

A LLM não deve ser autoridade sobre preço, dinheiro, estoque, identidade, persistência, autorização ou estados críticos. Ela interpreta mensagens, identifica intenção, coleta dados e sugere ações estruturadas. O KassisT Core valida e executa.

1.3 Topologia recomendada

O MVP será predominantemente local, mas a integração profissional com WhatsApp utiliza um pequeno KassisT Gateway público para receber webhooks. O Gateway não inicia conexões de entrada para a rede da loja. O Desktop mantém uma conexão persistente de saída com o Gateway, evitando dependência de port forwarding, IP público ou exposição direta do Windows à internet.

flowchart LR
    C[Cliente] --> WA[WhatsApp Business Platform]
    WA -->|HTTPS Webhook| G[KassisT Gateway]
    G --> IN[(InboundInbox)]
    D[KassisT Desktop] -->|WSS outbound| G
    G -->|event delivery| D
    D --> L[Ollama / LLM Local]
    D --> DB[(SQLite)]
    D --> GC[Google People API]
    D --> N[Notification Engine]
    D --> UI[KassisT UI]

Transporte Gateway ↔ Desktop

O mecanismo padrão do MVP é WebSocket seguro (WSS), iniciado pelo Desktop. O fluxo obrigatório é:

WhatsApp
   ↓ HTTPS/Webhook
KassisT Gateway
   ↓
DomainOutbox
   ↓
WSS persistente iniciado pelo Desktop
   ↓
KassisT Desktop
   ↓ ACK
Gateway marca entrega

Regras do transporte:

o Desktop sempre inicia a conexão;

cada instalação possui uma identidade de dispositivo própria;

autenticação do dispositivo ocorre durante o handshake;

eventos possuem event_id globalmente único;

o Gateway entrega eventos pendentes após reconexão;

o Desktop confirma recebimento com ACK;

ACK perdido não pode gerar duplicação lógica;

o Gateway conserva eventos até confirmação ou expiração definida pela política de retenção;

reconexões usam backoff exponencial com jitter;

o Gateway não executa regras de preço, estoque, pedido ou atendimento;

nenhuma porta de entrada do Windows é necessária para o fluxo normal.

O Gateway é, portanto, uma camada de transporte confiável e NAT/firewall-friendly outbound transport, não o cérebro do produto.

2. Product Vision

2.1 Missão

Permitir que pequenos negócios ofereçam atendimento automático de vendas pelo WhatsApp sem exigir que a proprietária opere um sistema complexo durante o dia.

2.2 Visão

Tornar-se uma plataforma de atendimento e vendas local-first para pequenos negócios, capaz de evoluir para SaaS sem obrigar o usuário do MVP a compreender infraestrutura, prompts, modelos ou integrações.

2.3 Problema

Pequenos estabelecimentos recebem pedidos por WhatsApp, gastam tempo repetindo informações, podem perder mensagens, têm dificuldade de acompanhar pedidos e frequentemente não possuem ferramentas de análise simples.

2.4 Proposta de valor

O KassisT transforma o WhatsApp em um canal de atendimento e venda assistido por IA, com configuração simples e operação quase autônoma.

2.5 Diferenciais

IA local como opção padrão do MVP.

Regras críticas fora da LLM.

Interface desktop-first compacta.

Operação local mesmo sem um SaaS completo.

Intervenção humana nativa.

Conhecimento de negócio estruturado.

Observabilidade operacional.

Arquitetura preparada para cloud/SaaS.

2.6 Persona principal

Proprietário ou operador de pequeno negócio de alimentação, com pouca disponibilidade e baixa tolerância a complexidade técnica.

2.7 Limites do produto no MVP

O KassisT não será, inicialmente:

um ERP;

um sistema contábil;

um sistema completo de estoque de nível industrial;

um gateway de pagamento;

um CRM empresarial completo;

um sistema de roteirização de entregas;

uma plataforma multi-tenant SaaS completa;

um substituto absoluto para atendimento humano.

3. Escopo do MVP

3.1 Incluído

Aplicativo Windows em Electron.

React + TypeScript.

Widget circular minimizado.

Tray do Windows.

Dashboard operacional.

Atendimentos.

Pedidos.

Produtos.

Clientes.

Relatórios básicos.

Configurações.

Logs.

Banco SQLite local.

Ollama como camada inicial de LLM.

Base de conhecimento estruturada.

Motor determinístico de pedido.

Atendimento automático.

Assumir/pausar/devolver atendimento.

Google Contacts via OAuth, sujeito à aprovação/configuração da aplicação Google.

WhatsApp Business Platform/Cloud API como direção profissional recomendada.

Gateway web mínimo para webhooks.

Notificação de nova venda.

Sons configuráveis.

Backup e restauração.

Health checks.

Modo simulação.

Installer Windows.

Testes unitários, integração e E2E mínimos.

3.2 Pós-MVP

Estoque quantitativo.

Áudios e imagens entendidos pela IA de ponta a ponta.

IA Insights avançado.

Pagamento online.

múltiplos usuários.

licenciamento e billing.

painel cloud.

analytics multiempresa.

sincronização entre dispositivos.

SaaS multi-tenant.

4. Decisões arquiteturais consolidadas

ID

Decisão

Status

ADR-001

Electron + React + TypeScript

Obrigatória

ADR-002

SQLite no MVP

Obrigatória

ADR-003

Ollama como camada inicial de LLM local

Obrigatória

ADR-004

Business Rules separadas da LLM

Obrigatória

ADR-005

Widget circular + Windows Tray

Obrigatória

ADR-006

Google People API via OAuth

Obrigatória, condicionada à homologação

ADR-007

WhatsApp Business Platform/Cloud API

Direção oficial

ADR-008

KassisT Gateway para integração externa

Obrigatória

ADR-009

Desktop inicia conexão WSS outbound

Obrigatória

ADR-010

Device authentication por Ed25519 challenge-response

Obrigatória

ADR-011

Inbox/Outbox/Queue/EventBus/AuditLog separados

Obrigatória

ADR-012

GitHub Secrets somente para CI/CD

Obrigatória

ADR-013

Vercel/Firebase não são dependências do Desktop MVP

Obrigatória

ADR-014

Delivery simples no MVP

Obrigatória

ADR-015

Estoque binário no MVP

Obrigatória

ADR-016

Pagamento como método registrado no MVP

Obrigatória

ADR-017

Modo Simulação

Obrigatória

ADR-018

CONFIRMED é o marco operacional da venda

Obrigatória

ADR-019

KassisT é fonte operacional; Google é projeção sincronizada

Obrigatória

ADR-020

Mudanças arquiteturais passam por ADR + versionamento

Obrigatória

5. UX e experiência do produto

5.1 Princípio de uso

A proprietária configura uma vez e ativa. Depois:

Ligar Windows
  ↓
KassisT inicia
  ↓
Health checks
  ↓
Integrações conectadas
  ↓
Widget minimizado
  ↓
Atendimento automático

A abertura do widget acontece apenas quando necessário.

5.2 Janela principal

Dimensões iniciais de referência, sujeitas a benchmark visual:

largura: aproximadamente 1120–1360 px;

altura: aproximadamente 680–820 px;

mínimo funcional: aproximadamente 960 × 620 px.

Esses números são metas iniciais, não contratos de compatibilidade.

5.3 Navegação

Navegação principal recomendada:

Dashboard

Atendimentos

Pedidos

Produtos

Clientes

Relatórios

Configurações

Logs e Saúde podem ficar dentro de Configurações ou em um centro administrativo acessível pelo menu superior.

Isso consolida as ideias do briefing de abas operacionais e evita que Logs passem a competir com Atendimentos na navegação principal.

6. Widget minimizado

6.1 Forma

O estado minimizado é um círculo flutuante pequeno, com raio visual aproximado de 24–32 px, dimensionado para não atrapalhar outras aplicações.

6.2 Estados

Estado

Indicador

Comportamento

Online

brilho/halo discreto

estado normal

Offline

indicador neutro/escuro

tooltip explica problema

Pausado

indicador âmbar

IA não responde

Nova mensagem

contador

animação curta

Atendimento humano

avatar/indicador humano

IA pausada naquela conversa

Pedido realizado

pulso curto

acompanha som

IA processando

animação discreta

sem excesso de movimento

Erro

alerta

clique abre diagnóstico

Sincronizando

spinner

temporário

6.3 Interações

Clique esquerdo: abre/restaura janela principal.
Duplo clique: abre diretamente Atendimentos.
Clique direito: menu contextual.
Arrastar: reposiciona widget.
Fechar widget: apenas oculta widget; não encerra o processo, exceto se explicitamente configurado.
Fechar aplicativo pelo tray: encerra o processo após confirmação se houver processamento crítico.

6.4 Menu contextual

Abrir KassisT

Nova mensagem: abrir atendimento

Pedidos recentes

Pausar IA global

Retomar IA

Modo simulação

Saúde do sistema

Configurações

Sair

7. Dashboard

Objetivo

Visão operacional da loja.

KPIs canônicos

Atendimentos ativos.

Mensagens recebidas.

Pedidos CONFIRMED.

Faturamento operacional.

Ticket médio.

Clientes novos.

Pedidos recentes.

Estado das integrações.

Alertas.

Semântica

Faturamento operacional =
sum(order.total_cents WHERE order.lifecycle_state = CONFIRMED)

Pedidos CANCELLED são excluídos.

Indicador futuro, separado:

Valor entregue =
sum(order.total_cents WHERE order.lifecycle_state = DELIVERED)

Dashboard e Reports devem usar exatamente as mesmas regras.

A LLM e o Renderer nunca calculam métricas financeiras.

8. Atendimentos

8.1 Lista

Filtros:

Todas.

Novas.

Em atendimento.

Aguardando.

Pedido em andamento.

Pedido realizado.

Aguardando humano.

Finalizadas.

8.2 Cartão de conversa

Exibir:

nome;

telefone;

última mensagem;

hora;

status;

indicador de IA;

mensagens não lidas;

pedido associado;

alerta.

8.3 Tela de conversa

Layout de três painéis:

┌───────────────┬─────────────────────────┬─────────────────┐
│ Conversas     │ Conversa                │ Pedido          │
│               │                         │                 │
│ filtros       │ mensagens               │ carrinho        │
│ lista         │ entrada manual          │ totais          │
│               │ status IA/humano        │ endereço        │
│               │ ações                   │ pagamento       │
└───────────────┴─────────────────────────┴─────────────────┘

8.4 Ações humanas

Assumir atendimento.

Pausar IA.

Devolver para IA.

Enviar mensagem manual.

Finalizar conversa.

Reabrir conversa.

Marcar como prioridade.

Abrir cliente.

Abrir pedido.

9. Máquina de estados da conversa

As máquinas de estado são independentes.

ConversationLifecycle

OPEN
CLOSED

ConversationOwnership

AI
HUMAN

AIState

ACTIVE
PAUSED
UNAVAILABLE

MessageLifecycle

RECEIVED
QUEUED
PROCESSING
SENT
DELIVERED
READ
FAILED
REJECTED

OrderLifecycle

DRAFT
CONFIRMED
IN_PRODUCTION
READY
OUT_FOR_DELIVERY
DELIVERED
CANCELLED

10. Motor de IA

10.1 Responsabilidades da IA

A IA pode:

interpretar texto;

identificar intenção;

extrair itens e quantidades;

fazer perguntas de esclarecimento;

recomendar produtos conhecidos;

responder perguntas apoiadas pela Knowledge Base;

coletar endereço;

identificar pedido de humano;

resumir contexto.

10.2 Proibições

A IA não pode diretamente:

inventar preço;

inventar produto;

aplicar desconto sem regra;

criar pagamento real;

mudar status crítico arbitrariamente;

persistir diretamente no banco;

acessar credenciais privadas;

executar comandos de sistema não autorizados;

alterar configurações sem ação explícita do usuário.

10.3 Perfil da atendente

Campos:

nome da atendente;

tom;

formalidade;

emojis;

idioma;

objetivo;

regras de conversação;

saudação;

mensagem fora do horário;

mensagem de transferência humana.

10.4 Exemplo de configuração funcional

Nome: Kassis
Tom: Amigável
Formalidade: Casual
Emojis: Ativados
Objetivos:
  [x] Vender
  [x] Tirar dúvidas
  [x] Recomendar produtos
  [x] Registrar pedidos
Regras críticas:
  [x] Nunca inventar preços
  [x] Nunca confirmar sem resumo
  [x] Nunca confirmar sem endereço quando entrega
  [x] Nunca confirmar sem quantidade

11. Knowledge Center

11.1 Estrutura

Categorias:

Loja.

Produtos.

Categorias.

Preços.

Complementos.

Horários.

Endereço.

Área de entrega.

Taxas.

Formas de pagamento.

Promoções.

FAQ.

Políticas.

Observações.

11.2 Fonte de verdade

A fonte de verdade para dados operacionais é a base estruturada do KassisT. A LLM recebe contexto derivado dela.

11.3 Anti-alucinação

O sistema deve combinar:

Context injection da loja.

Ferramentas determinísticas de consulta.

Structured outputs.

Validação no Core.

Resposta segura quando não houver informação.

Exemplo:

Pergunta: "Vocês entregam no bairro X?"

AI → consulta delivery_rules
        ↓
Engine → bairro permitido?
        ↓
SIM → responde com regra
NÃO/UNKNOWN → pede informação ou encaminha humano

A API do Ollama permite respostas estruturadas com JSON Schema e chamadas de ferramentas, o que pode ser usado para transformar a saída da LLM em intenções/ações verificáveis antes da execução. citeturn936616search1turn936616search2

12. Ollama e execução local

12.1 Papel

Ollama é a camada inicial de execução local de LLM. O produto deve depender de uma interface abstrata LLMProvider, e não de APIs específicas do Ollama espalhadas pelo código.

12.2 Capacidades usadas

Chat.

Structured output.

Tool calling quando suportado pelo modelo.

Timeout.

Health check.

Listagem/detecção de modelo.

Configuração de temperatura.

Limite de tokens.

Contexto.

A API de chat do Ollama expõe mensagens, ferramentas, formato estruturado e opções de execução; a resposta também informa métricas de duração e tokens, úteis para observabilidade local. citeturn936616search2

12.3 Health check

Ollama instalado?
↓
API responde?
↓
Modelo selecionado existe?
↓
Modelo aceita capacidade exigida?
↓
Teste de inferência
↓
READY

12.4 Fallback

MVP:

nenhum fallback cloud automático por padrão;

quando a LLM estiver indisponível, responder com estado controlado ou escalonar para humano;

não fingir que a IA está funcionando.

12.5 Seleção do modelo

Configuração do usuário:

modelo principal;

parâmetros básicos;

teste de conexão;

botão para validar modelo.

Detalhes avançados ficam ocultos por padrão.

13. WhatsApp

Direção oficial

A integração de produção utiliza WhatsApp Business Platform / Cloud API por meio de MetaCloudWhatsAppProvider.

Automação não oficial de WhatsApp Web não faz parte da arquitetura oficial.

Entrada

WhatsApp
↓ HTTPS/Webhook
Gateway
↓
InboundInbox
↓
Inbound Processor
↓
WSS EVENT
↓
Desktop
↓
SQLite InboundInbox
↓ COMMIT
ACK
↓
Message normalization
↓
Conversation Engine

Saída

Desktop
↓ WSS REQUEST
Gateway
↓
DomainOutbox / JobQueue
↓
MetaCloudWhatsAppProvider
↓
WhatsApp

ACK

ACK significa:

evento persistido localmente com sucesso.

Portanto:

EVENT
↓
SQLite InboundInbox
↓ COMMIT
ACK
↓
IA/Human processing

Se o banco local falhar, o Desktop não envia ACK.

Policy

Antes de envio:

conversation state
opt-in/out
provider policy
window/template requirement
rate limit

A aplicação não deve codificar como permanente regras externas que possam mudar.

Compliance gate

Antes do release comercial:

[ ] número elegível
[ ] configuração Business concluída
[ ] webhook validado
[ ] permissões validadas
[ ] opt-in/opt-out
[ ] templates aplicáveis
[ ] rate limits
[ ] quality/policy monitoring

14. Google Contacts

Direção

Utilizar Google People API por meio de GoogleContactsSyncAdapter.

KassisT é a fonte operacional de verdade. Google Contacts é uma projeção sincronizada.

OAuth Desktop

Desktop
↓
Browser externo
↓
OAuth
↓
PKCE
↓
Callback
↓
Refresh token
↓
Windows Secure Storage

O executável Desktop não contém client_secret secreto.

O GOOGLE_DESKTOP_CLIENT_ID pode ser público.

GOOGLE_CLIENT_SECRET só existe em eventual componente servidor que realmente necessite dele.

Sincronização

Customer created/updated
↓
Google Sync Job
↓
Search / create / update
↓
resourceName + etag
↓
SYNCED

O warm-up necessário para operações de busca é responsabilidade do adapter.

Conflitos

detect
↓
AuditLog
↓
CONFLICT
↓
não sobrescrever silenciosamente

Default: KassisT permanece como fonte operacional.

Falha Google nunca bloqueia venda.

O escopo de contatos e a verificação/revisão aplicável são release gates da integração.

15. Order Engine

Regra fundamental

A LLM interpreta; o Order Engine decide.

Commands

CreateDraftOrder
AddItem
RemoveItem
ChangeQuantity
SetDeliveryType
SetAddress
SetPaymentMethod
ApplyEligiblePromotion
RecalculateOrder
RequestCustomerConfirmation
ConfirmOrder
CancelOrder

Cada comando possui:

INPUT
PRECONDITIONS
BUSINESS RULES
OUTPUT
ERRORS
EVENTS
IDEMPOTENCY

Invariantes

quantidade é inteiro positivo;

dinheiro usa centavos inteiros;

total é calculado deterministicamente;

LLM não escreve total;

pedido confirmado não volta para DRAFT;

estado terminal não reabre;

item confirmado possui snapshot;

modifier obedece disponibilidade/limites;

promoção aplicada é estruturada;

confirmação exige resumo final + confirmação inequívoca;

evento order.confirmed é persistido na mesma transação.

Monetário

price_cents
subtotal_cents
discount_cents
delivery_fee_cents
total_cents
currency = BRL

Nunca usar float.

Draft

DRAFT = sempre recalculável
CONFIRMED = preço congelado

Alteração de catálogo antes de confirmar causa recálculo.

Confirmação inequívoca

Um “sim” que simultaneamente introduza uma alteração não é confirmação final.

16. Fechamento automático da venda

cliente escolhe
↓
Structured Intent
↓
validação determinística
↓
cálculo determinístico
↓
resumo final
↓
confirmação inequívoca
↓
Order Transaction
↓
CONFIRMED

Dentro da transação:

Order
OrderItem
OrderItemModifier
OrderStatusHistory
order.confirmed
DomainOutbox

Depois do commit:

EventBus → Sound/Toast/Badge/Dashboard
JobQueue → Google Sync
JobQueue → External Notification

Falhas de integração externa não desfazem a venda.

17. Clientes

17.1 Dados

nome;

telefone normalizado;

endereços;

observações;

primeiro pedido;

último pedido;

número de pedidos;

total gasto;

origem;

status.

17.2 Deduplicação

Chave primária prática inicial:

telefone normalizado + storeId.

Quando necessário, confirmação por nome/endereço.

Nunca criar um cliente novo apenas porque o nome veio escrito de forma diferente.

18. Notificações de venda

Efeitos locais

Sound
Toast
Badge
Dashboard

São eventos locais e podem usar EventBus após commit.

Efeitos externos

Google
WhatsApp notification
Future email/Telegram

Usam JobQueue + provider.

Idempotência

notification_key =
order_id + channel + template_version

Retry não pode produzir duplicatas involuntárias.

Canal

LocalNotificationProvider é obrigatório no MVP.

ExternalNotificationProvider é contrato obrigatório; o canal final para o número do responsável depende de homologação do provedor escolhido.

O Order Engine nunca depende do canal externo.

19. Sons

Eventos:

message.received

order.confirmed

system.error (opcional)

Configurações:

sons ativados;

sons desativados;

volume;

som de mensagem;

som de venda;

testar som.

Quando minimizado, o som deve continuar obedecendo à preferência do usuário.

20. Configurações

Geral

nome do estabelecimento;

logo;

telefone;

endereço;

fuso horário;

idioma;

iniciar com Windows;

estado inicial do widget.

Atendimento

horário;

mensagem fora do horário;

permitir IA automaticamente;

timeout humano;

escalonamento.

IA

nome da atendente;

modelo;

temperatura;

limite de resposta;

personalidade;

regras;

objetivos;

teste do modelo.

WhatsApp

estado da conexão;

identificadores necessários;

gateway;

teste;

reconexão.

Google Contacts

conectar;

desconectar;

sincronização automática;

sincronizar novamente;

status;

último sync.

Produtos

catálogo;

categorias;

complementos;

disponibilidade.

Notificações

canal;

destinatário;

habilitado;

template;

teste.

Sons

habilitado;

volume;

sons por evento.

Widget

tamanho;

posição;

sempre no topo;

animações;

abrir ao iniciar;

snap.

Backup

habilitado;

frequência;

local;

retenção;

exportar;

restaurar.

Logs

nível;

retenção;

exportar diagnóstico;

limpar logs, respeitando política de retenção.

Segurança

status do armazenamento seguro;

sessões;

revogação de integrações;

proteção local.

Sobre

versão;

build;

licenciamento futuro;

links de suporte;

diagnóstico.

21. Arquitetura Desktop

21.1 Stack final

Electron + React + TypeScript + Tailwind CSS + Zustand + Lucide Icons + biblioteca de gráficos.

Justificativa:

Electron atende ao caso Windows/tray/widget.

React permite composição de telas e componentes.

TypeScript aumenta segurança de contratos.

Tailwind facilita consistência visual sem CSS difuso.

Zustand é suficiente para estado de UI no MVP; não deve ser usado como substituto do banco.

Lucide oferece conjunto de ícones consistente.

Biblioteca de gráficos deve ser escolhida por simplicidade e bundle, somente onde houver necessidade.

21.2 Processos

flowchart TB
    R[Renderer React] --> P[Preload / contextBridge]
    P --> M[Electron Main]
    M --> S[Application Services]
    S --> DB[(SQLite)]
    S --> L[LLM Adapter]
    S --> I[Integration Adapters]
    S --> E[Event Bus]
    E --> N[Notification Worker]
    E --> G[Google Sync Worker]
    E --> W[WhatsApp Outbox]

21.3 Segurança do Renderer

O renderer não deve possuir acesso direto a:

filesystem arbitrário;

banco;

tokens;

credenciais;

APIs administrativas.

A comunicação deve passar por uma API segura exposta pelo preload/contextBridge.

As recomendações oficiais do Electron incluem context isolation, sandboxing, ausência de Node integration para conteúdo não confiável, CSP, validação da origem das mensagens IPC e limitação de navegação/janelas. citeturn959616search0turn959616search1turn959616search7

22. IPC

Princípios:

canais explícitos;

payloads tipados;

validação de entrada;

validação do sender;

sem ipcRenderer.send exposto diretamente;

sem APIs genéricas tipo execute(command).

Exemplos conceituais:

conversation:list
conversation:sendMessage
conversation:takeover
conversation:resumeAI
order:get
product:list
product:create
settings:get
settings:update
health:get
logs:query

Cada canal deve ter contrato de entrada/saída.

23. Banco de dados — modelo canônico

Tecnologia

SQLite local no MVP.

IDs

UUIDv7 para entidades/eventos quando suportado pela stack.

Timestamps

Todos os timestamps persistidos em UTC.
Exibição no timezone da Store.

Entidades canônicas

Store
Device
Settings
ProductCategory
Product
ProductModifier
ProductImage
Promotion
Customer
CustomerAddress
Conversation
Message
Order
OrderItem
OrderItemModifier
OrderStatusHistory
PaymentMethod
Notification
Integration
IntegrationCredential
InboundInbox
DomainOutbox
Job
AuditLog
Log
AIProfile
AIExecution
KnowledgeItem

Regras-chave

Store

id, name, phone, address, timezone, timestamps.

Device

id, store_id, status, protocol_version, app_version, last_seen_at, revoked_at, timestamps.

Product

id, store_id, category_id, name, description, price_cents, currency, available, tags, timestamps.

ProductModifier

id, store_id, product_id, name, price_cents, available, min_quantity, max_quantity.

ProductImage

product_id, file_path, mime_type, dimensions, checksum.

Promotion

store_id, name, active, start_at, end_at, type, value, product_scope, minimum_quantity.

MVP:

FIXED_AMOUNT
PERCENTAGE

Customer

store_id, phone_normalized, name, notes, first_order_at, last_order_at, order_count, total_spent_cents, currency, Google identifiers, status, timestamps.

CustomerAddress

Endereço estruturado + is_default.

Conversation

store_id, customer_id, external_thread_id, lifecycle_state, ownership, ai_state, unread count, timestamps.

Message

store_id, conversation_id, external_message_id, direction, sender_type, message_type, text, media reference, reply reference, raw_event_reference, lifecycle_state, provider status/error, timestamps, correlation_id, causation_id.

raw_event_reference = apenas ID interno do InboundInbox.

Order

store_id, display_number, customer_id, conversation_id, lifecycle_state, subtotal_cents, discount_cents, delivery_fee_cents, total_cents, currency, delivery_type, address_id, payment_method_id, notes, timestamps.

OrderItem

product_name_snapshot, unit_price_cents_snapshot, quantity, subtotal_cents.

OrderItemModifier

modifier_name_snapshot, unit_price_cents_snapshot, quantity, subtotal_cents.

OrderStatusHistory

from_state, to_state, reason, actor, timestamp.

PaymentMethod

Somente método informado no MVP; não representa processamento financeiro.

Notification

Canal, destination, idempotency data, attempts, status, errors, timestamps.

Integration / IntegrationCredential

Estado da integração e referência segura de credenciais.

InboundInbox

Provider, external event ID, payload hash/reference, processing state, timestamps, correlation.

DomainOutbox

Evento criado dentro de transação, idempotency key, attempts e processed state.

Job

Tipo, estado, payload reference, scheduling, lock/attempts.

AuditLog

Actor, action, entity, before/after reference, correlation, timestamp.

Log

Timestamp, level, category, event, correlation, entity, message, error code, metadata.

AIProfile

Perfil de atendimento, rules version, objectives, model, temperature, token limit.

AIExecution

Model, prompt/policy/knowledge versions, input hash, output validation, latency, fallback, timestamps.

KnowledgeItem

Conteúdo estruturado por store_id.

23.1 Índices normativos

UNIQUE Customer(store_id, phone_normalized)
UNIQUE Conversation(store_id, external_thread_id)
UNIQUE Message(store_id, external_message_id)
UNIQUE InboundInbox(provider, external_event_id)
UNIQUE DomainOutbox(idempotency_key)
UNIQUE Order(store_id, display_number)
UNIQUE Device(store_id, id)

id interno é UUIDv7; display_number é sequencial por Store.

24. Event-Driven Architecture

Componentes normativos

InboundInbox
DomainOutbox
JobQueue
EventBus
AuditLog

O MVP não utiliza DomainOutbox/Event Sourcing.

Inbound

Webhook
↓
InboundInbox
↓
Inbound Processor
↓
WSS

Outbound

Domain Transaction
↓
DomainOutbox
↓
JobQueue
↓
External Provider

Eventos

message.received
message.sent
message.delivery_updated
conversation.started
conversation.updated
conversation.escalated
ai.response.generated
order.created
order.confirmed
order.status_changed
order.cancelled
customer.created
customer.updated
google.contact.sync.requested
google.contact.synced
notification.created
notification.sent
sound.played
integration.connected
integration.disconnected
system.error

order.status_changed não faz parte do catálogo.

Event envelope

event_id
event_name
event_version
aggregate_type
aggregate_id
occurred_at
producer
correlation_id
causation_id
schema
payload

25. Workers e filas

Mesmo com SQLite, o sistema deve possuir uma abstração de jobs local.

Workers mínimos:

WhatsApp inbound/outbound.

Google sync.

Notifications.

Backup.

Diagnostics.

O worker deve implementar:

retries;

backoff;

limite de tentativas;

dead-letter/local failed queue;

idempotência;

logging.

26. Segurança

Runtime secrets

GitHub Secrets
→ CI/CD

Gateway Secret Manager
→ Gateway runtime

Windows Secure Storage
→ Device private key
→ Google refresh token
→ client runtime secrets

Device auth

Ed25519:

Desktop private key
Gateway public key
Challenge/response

Gateway não armazena shared secret por dispositivo.

Electron

Obrigatório:

contextIsolation = true
nodeIntegration = false
sandbox quando compatível
CSP restritiva
IPC sender validation
navigation control
new-window control
permission handlers
shell.openExternal allowlist
Electron Fuses conforme matriz

Secrets nunca chegam ao Renderer ou à LLM.

27. LGPD e privacidade

O sistema lida com dados pessoais: nome, telefone, endereço e histórico de conversa/pedido.

Princípios:

minimização;

finalidade;

retenção definida;

segurança;

acesso controlado;

exportação;

exclusão conforme requisitos aplicáveis;

auditoria;

cuidado com backups.

A política jurídica específica deve ser validada com profissional competente antes da operação comercial. Este documento é técnico e não substitui orientação jurídica.

28. Logs e observabilidade

Níveis

DEBUG

INFO

WARNING

ERROR

CRITICAL

Categorias

SYSTEM

WHATSAPP

AI

ORDER

CUSTOMER

GOOGLE

NOTIFICATION

DATABASE

SECURITY

Campos

timestamp;

level;

category;

event;

correlation_id;

entity;

result;

error code;

stack trace quando aplicável.

Não registrar

access tokens;

refresh tokens;

client secrets;

senhas;

dados de cartão;

payloads completos desnecessários de conversas;

credenciais de sistema.

Diagnóstico

O usuário deve conseguir gerar um arquivo de diagnóstico contendo:

versão;

Windows;

saúde das integrações;

modelo LLM;

erros recentes;

versões de banco/migrations;

timestamp;

IDs de correlação relevantes.

Nunca incluir segredos.

29. Health Check

Painel:

WhatsApp       ● Online
Gateway        ● Online
IA Local       ● Online
Modelo         ● Pronto
Banco          ● Online
Google         ● Conectado
Notificações   ● Online
Backup         ● OK

Cada estado deve ter explicação e ação sugerida.

30. Backup e restauração

O que salvar

SQLite;

imagens de produtos;

configuração não secreta;

referências de integrações;

metadados necessários para restauração.

O que não colocar em backup desprotegido

tokens de acesso em texto puro;

segredos do sistema;

arquivos temporários.

Política inicial

backup automático diário;

backup manual;

retenção configurável;

exportação manual;

restauração com validação;

backup antes de migration crítica.

31. Atualizações Windows

Estratégia

Semantic Versioning.

Installer assinado em release real.

Canal stable.

Verificação de atualização.

Download em segundo plano quando possível.

Instalação controlada.

Backup/migration antes de atualização de schema.

Rollback definido para falhas críticas.

GitHub Releases pode ser uma fonte de artefatos, mas não deve ser tratado como toda a estratégia de atualização.

32. GitHub

Estrutura inicial recomendada:

KassisT/
├── apps/
│   └── desktop/
├── packages/
│   ├── domain/
│   ├── contracts/
│   ├── ui/
│   └── config/
├── gateway/
├── docs/
│   ├── product/
│   ├── architecture/
│   ├── adr/
│   ├── ux/
│   └── operations/
├── tests/
├── scripts/
├── assets/
├── .github/
│   ├── workflows/
│   ├── ISSUE_TEMPLATE/
│   └── pull_request_template.md
├── README.md
├── CONTRIBUTING.md
├── SECURITY.md
├── CHANGELOG.md
└── LICENSE

Regras de repositório

branch principal protegida;

PR obrigatório;

checks obrigatórios;

CODEOWNERS quando aplicável;

conventional commits;

tags versionadas;

releases geradas por pipeline.

33. CI/CD

Pipeline:

Commit
 ↓
Lint
 ↓
Typecheck
 ↓
Unit tests
 ↓
Integration tests
 ↓
Build
 ↓
E2E / smoke
 ↓
Package
 ↓
Security checks
 ↓
Release artifact

Secrets de CI

Exemplos conceituais:

GOOGLE_CLIENT_ID

GOOGLE_CLIENT_SECRET

WHATSAPP_APP_SECRET

WHATSAPP_VERIFY_TOKEN

GATEWAY_DATABASE_URL

RELEASE_SIGNING_SECRET

Os nomes são exemplos; valores reais nunca entram no repositório/documentação.

34. Vercel

Decisão

Vercel não é parte do desktop.

Pode ser usada para:

landing page;

site institucional;

gateway HTTP mínimo, se economicamente e tecnicamente adequado;

painel web futuro.

Não deve ser adicionada apenas porque está disponível.

Para o gateway, a escolha final deve considerar necessidade de processamento assíncrono, armazenamento durável e características dos webhooks. Se Vercel não for a melhor opção para a combinação final, usar outro provedor sem alterar o contrato do Core.

35. Firebase

Decisão

Firebase não é necessário no MVP local.

Motivo:

SQLite resolve persistência local;

Google já possui OAuth/People API;

o gateway pode usar tecnologia própria mais simples;

adicionar Firebase sem requisito claro aumenta superfície operacional.

No futuro, Firebase só deve ser introduzido se uma necessidade concreta superar alternativas como PostgreSQL, Supabase ou serviços especializados.

36. Arquitetura SaaS futura

O futuro poderá adicionar:

Tenant
Workspace
Store
User
Role
Subscription
License

Princípios

Store vira unidade de operação.

Tenant engloba cliente empresarial.

User pertence a tenant/workspace.

Role controla permissões.

Desktop pode autenticar uma licença/tenant no futuro.

Dados locais podem sincronizar com cloud.

Papéis previstos:

Owner

Admin

Manager

Attendant

Viewer

Nada disso é requisito de implementação no MVP.

37. Design System

Direção visual

dark;

futurista;

premium;

glassmorphism moderado;

neon roxo/magenta/ciano;

compacto;

profissional;

não infantil;

não excessivamente gamer.

Cores de referência

Background  #0B0A12
Surface     #14111F
Surface 2   #1B1728
Primary     #8B5CF6
Magenta     #D946EF
Cyan        #22D3EE
Success     #22C55E
Warning     #F59E0B
Danger      #EF4444
Text        #F8FAFC
Muted       #A1A1AA

Os valores são tokens iniciais e devem ser validados visualmente.

Tipografia

Preferência por família moderna sem ser futurista em excesso. O objetivo é legibilidade.

Radius

pequeno: 8px;

médio: 12px;

grande: 16px;

modal/widget: 20px+.

Componentes

Button

IconButton

Input

Select

Switch

Badge

Card

Table

Tab

Tooltip

Modal

Toast

Drawer

Skeleton

Empty State

Error State

Status Indicator

Chat Bubble

Order Summary

KPI Card

Timeline

38. Acessibilidade

contraste adequado;

não depender apenas de cor;

foco de teclado;

tamanhos de clique apropriados;

labels acessíveis;

tooltips com significado;

mensagens de erro claras;

redução de movimento quando suportado;

atalhos documentados.

39. Internacionalização

Idioma inicial: pt-BR.

Não espalhar strings diretamente por componentes. Usar camada de tradução desde o começo, mesmo com somente um idioma.

40. Performance

Metas iniciais, sujeitas a benchmark:

inicialização da UI perceptivelmente rápida;

troca de abas sem travamento;

lista de conversas virtualizada se necessário;

pesquisa local responsiva;

nenhuma inferência LLM na thread da UI;

processamento pesado em worker/processo apropriado.

Consumo de memória deve ser medido em cenário real com:

aplicativo minimizado;

100+ conversas;

centenas de produtos;

LLM ativa.

41. Fluxos de negócio

Caso 1 — Cliente pergunta se existe açaí

Mensagem chega.

KassisT persiste mensagem.

IA identifica intenção.

Consulta catálogo.

Responde com produtos disponíveis.

Som de mensagem já ocorreu na chegada.

Caso 2 — Cliente monta pedido

IA extrai itens.

Order Engine valida.

Carrinho é atualizado.

IA pergunta dados faltantes.

Total nunca é calculado pela LLM.

Caso 3 — Endereço incompleto

Sistema detecta campos obrigatórios ausentes.

IA solicita somente os dados necessários.

Pedido não pode ser confirmado sem os campos exigidos para delivery.

Caso 4 — Cliente muda quantidade

Nova intenção atualiza o draft.

Order Engine recalcula.

Resumo atualizado é apresentado.

Caso 5 — Produto indisponível

Engine revalida disponibilidade.

Produto não entra no pedido confirmado.

IA sugere alternativa somente com base na Knowledge Base.

Caso 6 — Cliente quer humano

Intent HUMAN_REQUEST.

Conversa vai para HUMAN_PENDING.

IA envia mensagem de transição.

Não insiste.

Responsável assume.

Caso 7 — Reclamação

Classificar como potencial escalonamento. Não tentar resolver disputas sensíveis com lógica inventada.

Caso 8 — IA perde conexão

Health check falha.

Mensagem continua persistida.

Conversa entra em estado de degradação.

Usuário recebe alerta.

O sistema não deve duplicar mensagens ao retomar.

Caso 9 — Pedido confirmado

Executar cadeia de eventos.

Caso 10 — Venda concluída

order.confirmed.

Notification.created.

Sound.played.

Google sync queued.

Dashboard atualizado.

Logs gravados.

42. Edge Cases

MVP

mensagem duplicada;

produto desativado durante conversa;

mudança de preço antes da confirmação;

cliente corrige quantidade;

pedido duplicado;

WhatsApp desconectado;

gateway indisponível;

Ollama indisponível;

modelo ausente;

Google indisponível;

notificação falha;

computador reinicia;

app fecha durante processamento;

banco temporariamente indisponível;

retry de evento.

Futuro

áudio com transcrição;

imagem com visão;

múltiplos dispositivos humanos;

estoque quantitativo;

roteirização de entrega;

pagamentos online.

43. Modo Simulação

O modo simulação é recomendado antes da ativação real.

Características:

conversa fictícia;

pedidos fictícios;

notificação simulada;

possibilidade de reset;

sem mensagens reais;

sem sincronização real com Google.

Objetivo: permitir homologação da personalidade e das regras da IA.

44. Onboarding

Fluxo:

Boas-vindas
  ↓
Dados da loja
  ↓
Produtos
  ↓
IA
  ↓
WhatsApp
  ↓
Google
  ↓
Notificações
  ↓
Sons
  ↓
Teste
  ↓
Setup Checker
  ↓
Ativar KassisT

Setup Checker

✓ Banco
✓ Produtos
✓ IA local
✓ Modelo
✓ WhatsApp
✓ Google
✓ Sons
✓ Notificações
✓ Backup

Mensagem final:

KassisT pronto para atender.

45. Requisitos funcionais

ID

Requisito

Prioridade

Aceitação resumida

RF-001

Iniciar aplicativo

P0

Aplicação inicia sem erro fatal

RF-002

Widget minimizado

P0

Widget circular pode ser exibido

RF-003

Tray

P0

App permanece acessível pelo tray

RF-004

Configurar loja

P0

Usuário salva dados básicos

RF-005

Cadastro de produtos

P0

Produto pode ser criado/editado/arquivado

RF-006

Knowledge Base

P0

IA utiliza dados estruturados

RF-007

Atender conversa

P0

Mensagem é recebida e processada

RF-008

Intervenção humana

P0

Humano pode assumir conversa

RF-009

Order Engine

P0

Total é calculado deterministicamente

RF-010

Confirmar pedido

P0

Cliente confirma antes da criação

RF-011

Registrar cliente

P0

Cliente é criado/atualizado

RF-012

Google Contacts

P1

Cliente é sincronizado quando conectado

RF-013

Notificar venda

P0

Evento gera notificação conforme canal homologado

RF-014

Sons

P0

Sons podem ser ligados/desligados

RF-015

Dashboard

P0

Métricas do período aparecem

RF-016

Relatórios

P1

Hoje/semana/mês disponíveis

RF-017

Logs

P0

Eventos críticos são registrados

RF-018

Health check

P0

Serviços exibem estado

RF-019

Backup

P0

Backup manual/automático funciona

RF-020

Restore

P0

Backup válido pode ser restaurado

RF-021

Modo simulação

P1

Fluxo pode ser testado sem produção

RF-022

Atualização

P0

Release pode ser instalada com migration segura

RF-023

Diagnóstico

P1

Relatório pode ser exportado sem secrets

RF-024

Configuração IA

P0

Nome/tom/regras/modelo configuráveis

46. Requisitos não funcionais

ID

Categoria

Requisito

RNF-001

Segurança

Renderer não acessa secrets

RNF-002

Segurança

IPC possui validação de entrada e origem

RNF-003

Segurança

Segredos nunca são commitados

RNF-004

Privacidade

Logs não armazenam tokens

RNF-005

Confiabilidade

Mensagens não devem ser perdidas silenciosamente

RNF-006

Idempotência

Eventos críticos podem ser reprocessados sem duplicação

RNF-007

Manutenção

LLM provider é abstraído

RNF-008

Escalabilidade

Domínio não deve depender da forma de persistência local

RNF-009

Observabilidade

Falhas possuem correlation ID

RNF-010

UX

Interface é operável com mouse e teclado

RNF-011

Atualização

Banco usa migrations versionadas

RNF-012

Disponibilidade

App pode operar localmente quando cloud secundária estiver indisponível, dentro dos limites definidos

RNF-013

Performance

Inferência não bloqueia thread de UI

RNF-014

Acessibilidade

Estados não dependem somente de cor

RNF-015

Distribuição

Release é versionada e reproduzível

47. Testes

Unit

cálculo de preço;

quantidade;

descontos;

taxa;

total;

máquina de estados;

deduplicação;

normalização de telefone;

validação de endereço;

idempotência.

Integration

SQLite;

Ollama;

gateway WhatsApp;

Google People API;

Notification Provider;

armazenamento seguro.

E2E

Mensagem
↓
IA
↓
Produto
↓
Endereço
↓
Resumo
↓
Confirmação
↓
Pedido
↓
Notificação
↓
Dashboard
↓
Log

Failure tests

Repetir cada etapa sob:

timeout;

processo reiniciado;

resposta duplicada;

conexão perdida;

serviço indisponível.

Security testing

IPC abuse;

XSS;

CSP;

injection;

exposição de secrets;

permissões de filesystem;

armazenamento local;

OAuth tokens;

logs.

48. Acceptance Criteria do MVP

O MVP somente será considerado pronto quando:

aplicativo inicia;

widget funciona;

minimização circular funciona;

tray funciona;

onboarding funciona;

loja pode ser configurada;

produtos podem ser cadastrados;

fotos de produtos podem ser anexadas;

IA local funciona;

modelo é detectado;

WhatsApp funciona pela integração homologada;

mensagens são persistidas;

conversa funciona;

intervenção humana funciona;

pedido é fechado;

total é calculado deterministicamente;

cliente é registrado;

endereço é armazenado;

venda é registrada;

notificação é disparada ou entra em fallback claramente visível;

som funciona;

som pode ser desativado;

dashboard funciona;

relatórios básicos funcionam;

logs funcionam;

backup funciona;

restore foi testado;

falhas básicas são tratadas;

diagnóstico não vaza secrets;

build Windows é reproduzível;

pipeline CI passa.

49. Definition of Ready

Uma feature está Ready quando:

possui objetivo claro;

pertence ao escopo atual;

possui critérios de aceitação;

possui dependências identificadas;

decisões abertas relevantes estão resolvidas;

design foi aprovado quando aplicável;

contratos necessários estão definidos;

testes esperados estão descritos.

50. Definition of Done

Uma feature está Done quando:

implementada;

testada;

integrada;

documentada;

sem regressão conhecida;

logs/observabilidade necessários existem;

segurança revisada quando aplicável;

documentação/ADR atualizados;

CI verde;

acceptance criteria atendidos.

51. Matriz de riscos

Risco

Probabilidade

Impacto

Severidade

Mitigação

Contingência

WhatsApp muda requisito

M

A

Alta

API oficial + adapter

pausar integração, preservar Core

LLM alucina preço

M

A

Crítica

Order Engine determinístico

bloquear confirmação

Desktop offline

M

A

Alta

outbox/filas locais

reprocessar ao voltar

Gateway indisponível

M

A

Alta

retry + health check

alertar e reprocessar

Banco corrompido

B

A

Alta

backups + restore testado

restaurar último backup válido

Token exposto

B

A

Crítica

secure storage + logs sanitizados

revogar/rotacionar

Google falha

M

M

Média

fila de sync

retry assíncrono

Pedido duplicado

M

A

Alta

idempotência

reconciliação

Atualização quebra migration

B

A

Alta

backup + migrations + rollback

restore + release anterior

Uso excessivo de recursos

M

M

Média

benchmark + tuning

reduzir contexto/modelo

Integração de notificação inviável

M

M

Média

provider abstraction

fallback local

Usuário não entende IA

M

M

Média

onboarding simples

assistente de configuração

52. Matriz de dependências

Feature

Depende de

Bloqueia

Prioridade

Shell desktop

nada

todas

P0

Design system

shell

UI

P0

SQLite

shell/core

domínio

P0

Products

banco

Knowledge

P0

Order Engine

produtos/clientes

vendas

P0

Ollama adapter

core

IA

P0

Conversation Engine

DB + LLM

WhatsApp

P0

WhatsApp Gateway

integração externa

atendimento real

P0

Google

customer/order

sync

P1

Notifications

event bus

alertas

P0

Reports

orders

analytics

P1

Backup

DB

release

P0

Installer

app

distribuição

P0

53. ADRs detalhadas

ADR-001 — Electron + React

Contexto: produto precisa de widget, tray e desktop Windows.
Decisão: Electron + React + TypeScript.
Alternativas: Tauri, WPF, WinUI.
Consequência: maior footprint que nativo, mas aproveita stack web e acelera UI.

ADR-002 — SQLite no MVP

Contexto: single-store local-first.
Decisão: SQLite.
Alternativas: PostgreSQL local, Firebase, cloud DB.
Consequência: simples operação e backup; exige cuidado com concorrência e migrações.

ADR-003 — Ollama

Contexto: requisito de LLM local.
Decisão: adapter sobre Ollama.
Alternativas: runtime próprio, LM Studio, cloud.
Consequência: dependência operacional local, mas desacoplada pelo provider interface.

ADR-004 — Business Rules fora da LLM

Contexto: preço e pedido são críticos.
Decisão: domínio determinístico.
Alternativa rejeitada: LLM com autonomia sobre banco.
Consequência: maior confiabilidade e mais código de domínio.

ADR-005 — Widget circular

Contexto: usuário pediu mínimo espaço de tela.
Decisão: widget circular flutuante.
Consequência: identidade visual forte e UX compacta.

ADR-006 — Google People API

Contexto: salvar clientes em Google Contacts.
Decisão: People API + OAuth.
Consequência: exige consentimento, revisão/configuração do projeto Google e armazenamento seguro dos tokens.

ADR-007 — WhatsApp oficial

Contexto: produto comercial e futura escalabilidade.
Decisão: API oficial como direção.
Consequência: exige infraestrutura pública mínima e configuração Meta mais complexa.

ADR-008 — Gateway público

Contexto: webhook não deve depender de rede doméstica.
Decisão: KassisT Gateway.
Consequência: introduz componente cloud pequeno, não substitui o Core local.

ADR-017 — Gateway → Desktop por WSS outbound + DomainOutbox

Contexto: o Windows da loja estará normalmente atrás de NAT/firewall e não deve expor uma porta pública para receber eventos do WhatsApp.

Decisão: o Desktop inicia uma conexão persistente WSS com o Gateway. O Gateway recebe webhooks por HTTPS, grava eventos em DomainOutbox, entrega os eventos pelo canal WSS e aguarda ACK do Desktop.

Alternativas:

WebSocket inbound no Desktop; rejeitada por exigir exposição/encaminhamento de porta;

polling HTTP periódico; possível, mas menos eficiente e com maior latência;

túnel VPN específico; possível, porém adiciona complexidade operacional desnecessária ao MVP.

Consequências:

o Desktop funciona atrás de NAT sem configuração de roteador;

eventos podem sobreviver a reinícios e desconexões;

exige identidade de dispositivo, autenticação, ACK, idempotência e política de retenção no Gateway;

o Gateway passa a ser componente operacional crítico e deve possuir health checks e observabilidade.

Escopo: obrigatório para a integração oficial com WhatsApp no MVP; implementação local pode ser simulada antes da infraestrutura cloud estar pronta.

ADR-009 — Secure Storage

Contexto: runtime credentials do usuário.
Decisão: Windows secure storage.
Consequência: instalação deve ser por usuário/ambiente.

ADR-010 — Firebase não adotado no MVP

Contexto: ausência de requisito que justifique.
Decisão: não usar.
Consequência: menos dependências.

ADR-018 — NotificationProvider desacoplado do domínio

Contexto: o envio de uma mensagem ao número do responsável depende de capacidades e regras externas do canal escolhido.

Decisão: o domínio emite eventos de negócio; adapters NotificationProvider realizam a entrega.

Alternativas: acoplar o Order Engine diretamente ao WhatsApp; rejeitada.

Consequência: homologação do canal pode ocorrer independentemente do motor de pedidos, mantendo o núcleo estável.

54. Diagramas essenciais

54.1 Arquitetura geral

flowchart LR
    U[Cliente] --> W[WhatsApp]
    W --> G[Gateway]
    G --> D[Desktop]
    D --> C[Conversation Engine]
    C --> A[AI Adapter]
    A --> O[Ollama]
    C --> K[Knowledge]
    C --> R[Order Engine]
    R --> DB[(SQLite)]
    R --> E[Event Bus]
    E --> N[Notifications]
    E --> S[Sounds]
    E --> GG[Google Sync]

54.2 Inicialização

flowchart TD
    A[Windows] --> B[KassisT Start]
    B --> C[Load Config]
    C --> D[Open DB]
    D --> E[Health Checks]
    E --> F{Ready?}
    F -- Yes --> G[Minimized Widget]
    F -- No --> H[Diagnostic State]

54.3 Falha

flowchart TD
    A[Operation] --> B{Success?}
    B -- Yes --> C[Commit + Event]
    B -- No --> D[Log]
    D --> E{Retryable?}
    E -- Yes --> F[Backoff Queue]
    E -- No --> G[Failed State]
    F --> A

Validação externa antecipada

Embora a implementação do backend siga depois do frontend, o projeto deve validar em paralelo, desde a Fase 1, os pré-requisitos externos de Meta/WhatsApp e Google: conta/business, número/linha elegível, OAuth, permissões e credenciais de ambiente de desenvolvimento. Essas validações podem ser feitas sem incorporar as integrações ao frontend inicial.

55. Primeiros 20 passos de implementação

Criar repositório GitHub privado.

Criar branch protection.

Adicionar README, SECURITY, CONTRIBUTING e CHANGELOG.

Registrar esta especificação em docs/product/specification.md.

Registrar ADRs iniciais em docs/adr/.

Definir monorepo e workspace.

Criar shell Electron.

Criar React + TypeScript.

Configurar Tailwind e tokens do Design System.

Implementar janela principal e tray.

Implementar widget circular minimizado.

Implementar navegação e estados vazios com mock data.

Definir contratos de domínio em packages/contracts.

Implementar SQLite + migrations.

Implementar Products e Knowledge Center.

Implementar Order Engine com testes unitários antes da integração da IA.

Implementar Conversation Engine e máquina de estados.

Implementar adapter Ollama + structured outputs.

Implementar Gateway/adapter WhatsApp em ambiente de teste, com transporte WSS outbound, DomainOutbox e MockWhatsAppProvider; em paralelo, homologar os pré-requisitos reais da Meta e Google.

Integrar Google, NotificationProviders, sons, backup, E2E e empacotamento Windows.

A ordem deve ser revista à medida que decisões externas (Meta/Google) forem homologadas.

56. Roadmap

Fase 0 — Especificação

Concluída quando este documento e ADRs estiverem aprovados.

Fase 1 — Frontend visual/mock

shell;

widget;

abas;

componentes;

dados mockados;

navegação.

Fase 2 — Core local

banco;

migrations;

domínio;

eventos;

logs;

health checks.

Fase 3 — Produtos e pedidos

catálogo;

Order Engine;

clientes;

dashboard.

Fase 4 — LLM local

Ollama;

prompts/contexto;

structured outputs;

tools;

testes.

Fase 5 — WhatsApp

app Meta;

webhook;

gateway;

envio/recebimento;

idempotência.

Fase 6 — Google

OAuth;

People API;

sync.

Fase 7 — Notificações e sons

provider;

templates;

sons;

retries.

Fase 8 — Segurança, backup e diagnóstico

secure storage;

logs;

restore;

diagnostics.

Fase 9 — Testes

unit;

integration;

E2E;

failure;

security.

Fase 10 — Release Windows

build;

assinatura;

installer;

update.

Fase 11 — SaaS futuro

tenant;

users;

roles;

licensing;

billing;

cloud sync.

57. Open Decisions

OD-001 — Conta WhatsApp e elegibilidade da linha

Decisão: qual conta/business/linha será usada na implantação real.
Alternativas: número atual, novo número, configuração Business oficial.
Recomendação: validar com Meta antes de fechar o onboarding definitivo.
Impacto: crítico.
Necessidade para MVP: sim.

OD-002 — Regras de entrega

Decisão: quais modalidades a primeira loja realmente usa.
Alternativas: retirada, entrega própria, taxa fixa, taxa por região.
Recomendação: MVP suportar retirada + entrega com taxa fixa configurável; taxação por distância fica para depois.
Impacto: alto.
Necessidade: sim.

OD-003 — Estoque

Decisão: quantidade real ou disponibilidade binária.
Recomendação: available/unavailable no MVP; estoque quantitativo futuro.
Impacto: médio.
Necessidade: sim.

OD-004 — Pagamento

Decisão: processamento online no MVP?
Recomendação: não; registrar apenas método informado.
Impacto: médio.
Necessidade: não para o MVP atual.

OD-005 — Canal de notificação ao responsável

Decisão: canal exato para a mensagem de nova venda.
Recomendação: abstração de provider; validar a rota WhatsApp oficial desejada.
Impacto: alto.
Necessidade: sim para aceitação final.

OD-006 — Nome da atendente

Decisão: nome configurável.
Recomendação: sim.
Impacto: baixo.
Necessidade: não bloqueia arquitetura.

58. Configuração externa necessária

GitHub

repository;

branch protections;

environments;

Actions secrets;

release permissions;

Dependabot/Security features quando disponíveis;

CODEOWNERS;

PR rules.

Google Cloud

projeto;

OAuth consent screen;

credenciais OAuth;

People API;

redirect URIs;

escopo contacts;

política de publicação/revisão quando aplicável.

Meta / WhatsApp

Meta Business;

app;

WhatsApp product;

webhook endpoint;

credenciais/assinatura;

número elegível;

ambiente de teste;

política de envio.

Gateway cloud

domínio HTTPS;

secrets do runtime;

logs;

health endpoint;

armazenamento/queue quando escolhido.

Windows

installer signing;

update channel;

secure storage;

startup configuration.

Vercel

Somente se selecionada para gateway/site.

Firebase

Não utilizar no MVP sem novo ADR.

59. Política para desenvolvimento com IA

As IAs do projeto DEVEM:

ler a especificação relevante antes de alterar código;

não inventar funcionalidades silenciosamente;

registrar decisões arquiteturais novas;

não expor secrets;

não mover lógica de negócio para a LLM;

escrever testes para alterações relevantes;

atualizar documentação;

respeitar contratos;

identificar impacto e dependências;

não apagar arquivos sem necessidade explícita;

preservar dados do usuário;

produzir mudanças rastreáveis.

Regra principal:

Nenhuma IA pode redefinir unilateralmente uma decisão arquitetural registrada.

60. Resumo executivo da arquitetura para novas IAs

O que é

KassisT é um atendente virtual de WhatsApp para pequenos negócios.

Onde roda

Aplicativo Windows baseado em Electron, com core local e SQLite.

Como a IA funciona

Ollama executa LLM localmente; o KassisT transforma as respostas em intenções/estruturas verificáveis.

Como recebe mensagens

WhatsApp Business Platform → HTTPS/Webhook → Gateway → InboundInbox → WSS outbound → Desktop.

Como fecha pedidos

LLM identifica intenção → Order Engine valida → cliente confirma → pedido persistido.

Como registra clientes

Customer Manager usa telefone e histórico; Google Contacts é integração complementar.

Como notifica vendas

Evento de pedido confirmado → Notification Provider → canal homologado + som + dashboard.

Como armazena dados

SQLite local, migrations versionadas, backup e restore.

Como é observado

Logs estruturados, correlation IDs, health checks, diagnóstico.

Como é distribuído

Installer Windows versionado, assinado e com política de atualização.

Como pode virar SaaS

Adapters e domínio desacoplados; Store pode evoluir para Tenant/Workspace/User/Role/Subscription sem transformar o MVP em multi-tenant prematuramente.

61. Glossário

AI_ACTIVE: conversa em atendimento automático.
Cloud API: integração oficial de WhatsApp pela infraestrutura da Meta.
Core: lógica de domínio e aplicação do KassisT.
Gateway: componente cloud mínimo de transporte/webhook e entrega confiável de eventos ao Desktop via conexão iniciada pelo cliente.
DomainOutbox: armazenamento temporário/durável de eventos ainda não confirmados pelo Desktop.
WSS: WebSocket sobre TLS, usado para a conexão persistente de saída do Desktop.
ACK: confirmação explícita de recebimento de um evento pelo Desktop.
Knowledge Base: dados estruturados usados para responder clientes.
LLM Provider: abstração de provedor de modelo.
Order Engine: motor determinístico de pedidos.
Outbox: fila persistente para tarefas/eventos a enviar.
People API: API de contatos do Google.
Renderer: camada React da interface Electron.
Main Process: processo privilegiado do Electron.
Structured Output: resposta da LLM aderente a schema.
Takeover: ação de humano assumir atendimento.

62. Observações de implementação e validações externas

A documentação deste produto não deve congelar detalhes de APIs externas que podem mudar.

Antes de implementação, validar documentação corrente da Meta para webhook, mensagens, credenciais e políticas.

Antes de distribuição, validar requisitos correntes do Google para OAuth/People API e revisão de escopos.

Antes de release, validar requisitos correntes do Windows para assinatura/distribuição.

O modelo LLM escolhido precisa ser benchmarkado no hardware real antes de definir o modelo padrão.

O modo local-first não significa “sem internet”: WhatsApp oficial e Google dependem de conectividade externa.

63. Referências técnicas externas

Electron Security: https://www.electronjs.org/docs/latest/tutorial/security

Electron Context Isolation: https://www.electronjs.org/docs/latest/tutorial/context-isolation

Electron Process Model: https://www.electronjs.org/docs/latest/tutorial/process-model

Google OAuth scopes: https://developers.google.com/identity/protocols/oauth2/scopes

Google People API createContact: https://developers.google.com/people/api/rest/v1/people/createContact

Google People API contacts: https://developers.google.com/people/v1/contacts

Ollama Chat API: https://docs.ollama.com/api/chat

Ollama Structured Outputs: https://docs.ollama.com/capabilities/structured-outputs

64. Conclusão

O KassisT está suficientemente especificado para iniciar o projeto de forma profissional, desde que as decisões externas críticas sejam homologadas antes da integração de produção.

A ordem de implementação permanece intencionalmente simples:

Especificação
  ↓
GitHub
  ↓
Design System
  ↓
Frontend com mock
  ↓
Core local
  ↓
Banco
  ↓
Order Engine
  ↓
Ollama
  ↓
WhatsApp Gateway/API
  ↓
Google
  ↓
Notificações
  ↓
Testes
  ↓
Installer
  ↓
Release

A maior decisão que deve ser validada antes de congelar a arquitetura de integração é a implantação efetiva da linha de WhatsApp. O restante do domínio pode ser desenvolvido de forma desacoplada enquanto essa homologação é realizada.

65. Device Enrollment e Authority Model

Enrollment

Desktop
↓
POST /v1/devices/enrollment/start
↓
Gateway cria:
enrollment_id
device_id
pairing_code
expires_at
↓
Provisioning Service autentica/autoriza a Store
↓
Desktop envia public_key Ed25519
↓
Gateway associa store_id + device_id + public_key
↓
Desktop guarda private_key
↓
WSS AUTH

Enrollment states

PENDING
AUTHORIZED
COMPLETED
EXPIRED
CANCELLED
REVOKED

Provisioning Authority

O MVP utiliza um Provisioning Service autenticado no Gateway.

Ele é autorizado a:

authorize enrollment
revoke device
rotate device key
read device status

Não é necessário um painel SaaS completo no MVP.

Security

pairing code one-time;

expiração curta;

rate limit;

código não contém private key;

código não aparece em logs;

associação a Store é explícita.

66. Device Authentication

Ed25519 challenge-response

Gateway → nonce/challenge
Desktop → assinatura do nonce + session context
Gateway → verifica public key
Gateway → AUTH_OK

Storage

Desktop private key → Windows Secure Storage
Gateway public key → PostgreSQL

Revogação

Provisioning Service
↓
device.status = REVOKED
↓
Gateway → DEVICE_REVOKED
↓
Desktop encerra sessão

Rate limits

Independentes para:

enrollment
AUTH
RESUME
reconnect

Clock

Autenticação não depende exclusivamente do relógio local; challenge e validade são controlados pelo Gateway.

67. Protocolo KassisT WSS v1

Tipos

CONNECT
AUTH
AUTH_OK
AUTH_FAILED
PING
PONG
EVENT
ACK
COMMAND
COMMAND_RESULT
REQUEST
REQUEST_RESULT
RESUME
RESUME_OK
STATE_SYNC_REQUIRED
STATE_SYNC_START
STATE_SYNC_COMPLETE
DEVICE_REVOKED
DISCONNECT
ERROR

Semântica de direção

Gateway → Desktop
COMMAND
EVENT
DEVICE_REVOKED

Desktop → Gateway
REQUEST
ACK

Bidirecional
PING/PONG

Envelope

{
  "protocol_version": "1.0",
  "message_id": "uuidv7",
  "message_type": "EVENT",
  "event_id": "uuidv7",
  "device_id": "uuidv7",
  "correlation_id": "uuidv7",
  "causation_id": "uuidv7",
  "sequence": 123,
  "timestamp": "2026-08-22T03:00:00Z",
  "payload": {}
}

Limites

frame lógico máximo: 256 KiB;

mídia binária fora do frame;

timestamps UTC.

Sequence

Monotônica por (store_id, device_id).

Gap:

100 → 102
↓
RESUME/replay

ACK normativo

EVENT
↓
Desktop SQLite InboundInbox INSERT
↓
COMMIT
↓
ACK

Falha de persistência:

NO ACK

Heartbeat

Meta inicial:

PING/PONG = 30s

Três perdas consecutivas → reconnect.

Reconnect

Backoff com jitter:

1s
2s
4s
8s
16s
30s
60s
...

Teto inicial: 5 min.

68. WSS Resume e Resync

RESUME

Desktop envia o último sequence confirmado.

Gateway reenviará eventos posteriores ainda pendentes.

Gap

Se sequence esperado e recebido divergirem:

STATE_SYNC_REQUIRED

Resync

STATE_SYNC_START
↓
transport snapshot
↓
replay
↓
STATE_SYNC_COMPLETE

Autoridade

Gateway
→ autoridade para transporte/eventos pendentes

Desktop SQLite
→ autoridade para estado de negócio local

Resync não substitui silenciosamente pedidos, clientes ou conversas.

69. Gateway Cloud

Arquitetura

WhatsApp
   ↓ HTTPS
Gateway API
   ├── InboundInbox
   ├── Provisioning Service
   ├── WSS
   └── Outbound Dispatcher
           ↓
        DomainOutbox
           ↓
        JobQueue
           ↓
    WhatsApp Provider

Banco

PostgreSQL gerenciado.

O provedor é parametrizável.

Responsabilidades

webhooks;

autenticação da origem;

Inbox;

WSS;

device provisioning;

device revocation;

outbound dispatch;

rate limit;

retry;

observability;

reconciliation.

Não executa lógica comercial da loja.

70. Gateway HTTP Contract

GET  /health
GET  /ready

GET  /webhooks/whatsapp
POST /webhooks/whatsapp

POST /v1/devices/enrollment/start
POST /v1/devices/enrollment/complete
POST /v1/devices/enrollment/cancel

POST /v1/devices/revoke
POST /v1/devices/rotate
GET  /v1/devices/{device_id}/status

Error envelope

{
  "error": {
    "code": "KST-GW-001",
    "message": "Device revoked",
    "retryable": false,
    "correlation_id": "uuidv7"
  }
}

Stack traces nunca são expostos em respostas.

71. Backpressure e Queue Policy

Não existem filas ilimitadas.

Limites:

max_events_per_device
max_bytes_per_device
max_global_queue

Estados:

NORMAL
PRESSURED
CRITICAL
BLOCKED

Ações:

PRESSURED: alertar;

CRITICAL: limitar trabalho não essencial;

BLOCKED: rejeitar trabalho não essencial conforme policy.

Eventos obrigatórios nunca podem ser descartados silenciosamente.

72. Availability e Degraded Mode

A promessa do produto é:

o KassisT continua útil localmente quando serviços externos falham, mas não pode receber/enviar WhatsApp sem Gateway/WhatsApp disponível.

Estado

IA local

SQLite

Operação local

WhatsApp

Google

Online

✅

✅

✅

✅

✅

Gateway offline

✅

✅

✅

❌

pendente

WhatsApp offline

✅

✅

✅

❌

✅

Ollama offline

❌

✅

humano

✅

✅

Google offline

✅

✅

✅

✅

❌

Internet offline

✅

✅

✅

❌

❌

SQLite indisponível

modo seguro

❌

❌

sem operação crítica

sem operação crítica

73. Inbox, Outbox, Queue, Bus e Audit

InboundInbox

Recebe e persiste evento externo antes de processar.

DomainOutbox

Nasce dentro de uma transação de domínio e aguarda efeitos externos.

JobQueue

Executa trabalhos assíncronos.

EventBus

Distribuição interna.

AuditLog

Registro de alterações relevantes.

Não utilizar DomainOutbox/Event Sourcing no MVP.

74. Order State e Sale Semantics

DRAFT
↓
CONFIRMED
↓
IN_PRODUCTION
↓
READY
↓
OUT_FOR_DELIVERY
↓
DELIVERED

Transições inválidas devem ser rejeitadas.

CONFIRMED = venda operacional.

Operational Revenue = sum(CONFIRMED.total_cents)
Delivered Value = sum(DELIVERED.total_cents)

CANCELLED é excluído.

Não existe order.status_changed.

Evento final de lifecycle é order.status_changed ou um evento específico order.delivered se adotado posteriormente.

75. Money Contract

Campos:

price_cents
subtotal_cents
discount_cents
delivery_fee_cents
total_cents
unit_price_cents_snapshot

currency = BRL

Nunca usar float.

Rounding

ROUND_HALF_UP

Percentuais em basis points:

10% = 1000 bps

discount_cents =
ROUND_HALF_UP(base_cents × bps / 10_000)

Promotion

MVP:

FIXED_AMOUNT
PERCENTAGE

Sem PromotionRule como entidade separada.

Promoções são avaliadas pelo PromotionService.

76. Modifiers

Modelo:

Product
 └── ProductModifier

OrderItem
 └── OrderItemModifier

Snapshots no pedido:

modifier_name_snapshot
unit_price_cents_snapshot
quantity
subtotal_cents

O adicional é parte do item composto, não um pedido independente.

77. AI Contracts

Structured Intent

Intents oficiais MVP:

GREETING
PRODUCT_INQUIRY
ADD_PRODUCT
REMOVE_PRODUCT
CHANGE_QUANTITY
ASK_PRICE
ASK_DELIVERY
SET_ADDRESS
SET_PAYMENT
CONFIRM_ORDER
CANCEL_ORDER
HUMAN_REQUEST
COMPLAINT
OUT_OF_SCOPE
UNKNOWN

Tools

Read:

search_products
get_product
get_store_info
get_delivery_rules
get_payment_methods
get_current_order
get_customer_context

Write controlado:

create_order_draft
update_order_draft
set_customer_field
request_human

Críticas:

confirm_order
cancel_order
pause_ai
resume_ai

LLM não executa ações críticas livremente.

78. AI Security e Context

Fluxo:

Untrusted Customer Input
↓
Intent Extraction
↓
Policy Validation
↓
Tool Allowlist
↓
Business Rules
↓
Output Validation

Context order:

System Policy
↓
Store Policy
↓
AI Profile
↓
Customer Context
↓
Current Order
↓
Relevant Knowledge
↓
Conversation Summary
↓
Recent Messages
↓
Current User Message

Prioridade:

System > Business Rules > Tool Results > Store Data > Customer Data > User Instructions

Prompt injection e conteúdo do cliente nunca recebem autoridade sobre regras do sistema.

79. AI Execution, Fallback e Limits

AIExecution registra:

model
model version/digest
prompt version
policy version
knowledge version
input hash
tool calls
validation
latency
token usage
fallback

Falhas:

retry
↓
retry
↓
safe fallback
↓
human

Limites configuráveis:

max_inference_time
max_retries
max_tool_calls_per_turn
max_context_tokens
max_output_tokens
max_concurrent_jobs

Loop conversacional acima do limite → HUMAN_REQUIRED.

80. Human/AI Concurrency Safety

Antes de qualquer outbound automático:

load conversation
↓
ownership == AI?
↓
AIState == ACTIVE?
↓
message still valid?
↓
send

Se humano assumir:

OWNERSHIP_CHANGED

O worker rejeita/cancela a mensagem automática pendente.

81. Customer e Google Sync

Cliente local pode ser criado/atualizado quando houver identidade suficiente.

Customer upsert local
↓
Google Sync Job

Não esperar order.confirmed para criar o cliente.

Google é uma projeção sincronizada e não controla o domínio.

82. Privacy Boundary e Retention

Gateway

Retenção curta somente para:

transport
retry
reconciliation

Webhook payload default TTL:

≤ 7 days

Desktop

Histórico operacional principal.

Retenção de mensagens, backups e logs segue política configurável e validação jurídica.

raw_event_reference

Somente ID interno do Inbox.

83. Observability e Audit

Métricas mínimas:

messages_received_total
messages_failed_total
ai_latency_ms
ai_errors_total
orders_confirmed_total
orders_cancelled_total
notification_failures_total
google_sync_failures_total
gateway_connected_devices
gateway_event_lag
gateway_ack_timeouts
gateway_queue_depth
backup_failures_total
disk_free_bytes

Audit events:

PRICE_CHANGED
PRODUCT_DISABLED
ORDER_CANCELLED
HUMAN_TAKEOVER
AI_PAUSED
AI_RESUMED
GOOGLE_CONNECTED
GOOGLE_DISCONNECTED
WHATSAPP_CONNECTED
WHATSAPP_DISCONNECTED
SETTINGS_CHANGED
BACKUP_RESTORED
DEVICE_REVOKED
CREDENTIAL_ROTATED

84. Health e Alerts

Estados de integração:

NOT_CONFIGURED
CONNECTED
AUTH_EXPIRED
DEGRADED
UNAVAILABLE

Alertas:

GATEWAY_OFFLINE
WHATSAPP_DISCONNECTED
OLLAMA_UNAVAILABLE
DISK_LOW
BACKUP_FAILED
QUEUE_STUCK
GOOGLE_AUTH_EXPIRED
AI_ERROR_RATE_HIGH
ORDER_FAILURE_RATE_HIGH

Cada alerta possui severity, condition, mensagem e ação recomendada.

85. Crash Consistency e Recovery

Regra:

persistência antes do efeito externo; confirmação antes de limpeza.

Falha antes do commit

rollback

Commit concluído, worker ainda não executou

Outbox pendente

Envio externo feito, confirmação interna perdida

retry idempotente/reconciliation

WSS entregue sem ACK

retransmissão

86. Migration, Backup, Restore

Backup deve existir antes de migration potencialmente destrutiva.

Cada migration:

migration_id
checksum
applied_at
application_version

Downgrade após migration irreversível:

somente via restore ou migration reversível explicitamente suportada.

87. Reinstall Contract

backup
↓
uninstall
↓
reinstall
↓
new enrollment
↓
restore
↓
reconnect integrations
↓
health check

Reinstalação não reativa automaticamente credenciais revogadas.

88. File System e Storage

Base:

%APPDATA%\KassisT\

database/
media/
backups/
logs/
cache/
diagnostics/
models/

Estados de disco:

NORMAL
LOW
CRITICAL

Nunca apagar dados de negócio automaticamente.

89. Electron e Supply Chain

Obrigatório:

contextIsolation
nodeIntegration=false
sandbox quando compatível
CSP
IPC validation
navigation control
new-window control
permission handlers
shell.openExternal allowlist
Electron Fuses
lockfile
dependency review
SCA
secret scanning
CodeQL
SBOM
Dependabot
pinned Actions
artifact checksums
code signing

90. Staging e Release

Ambientes:

development
test
staging
production

Staging possui:

credenciais isoladas;

dados sintéticos;

Gateway isolado;

banco isolado;

testes de integração;

smoke tests.

Não testar alterações diretamente na conta real da loja.

91. Gateway Production Operations

Runbooks obrigatórios:

gateway-offline
database-recovery
webhook-failure
device-revocation
secret-rotation
tls/dns
queue-stuck
rollback

Observabilidade:

queue depth
oldest event age
delivery latency
ACK timeout
connected devices
DB health
storage
cost

O orçamento operacional cloud deve ser definido antes do lançamento comercial e monitorado por ambiente/loja.

92. SaaS Boundary

Futuro:

Tenant
 └── Workspace
      └── Store
           └── Device

MVP:

1 Store
1 default Device

Arquitetura não ativa multi-tenancy agora, apenas preserva isolamento lógico por store_id.

93. Accessibility, i18n e Time

Acessibilidade

keyboard navigation
visible focus
screen reader labels
contrast
reduced motion
error association

i18n

locale
timezone
currency
date format
number format
pluralization

MVP:

pt-BR
America/Sao_Paulo configurável por Store
BRL

Todos os timestamps persistidos são UTC.

94. Operational Readiness

Gates:

Security Readiness
Integration Readiness
AI Readiness
Data Readiness
Reliability Readiness
Operations Readiness
Release Readiness

Nenhum gate pode ser “aceito por convenção”; deve haver evidência de teste/homologação.

95. Final Production Readiness Review

Obrigatórios:

[ ] device enrollment tested
[ ] Ed25519 auth tested
[ ] device revocation tested
[ ] WSS replay tested
[ ] WSS resync tested
[ ] ACK-after-Inbox-commit tested
[ ] no-ACK-on-DB-failure tested
[ ] backpressure tested
[ ] degraded mode tested
[ ] AI/human ownership race tested
[ ] queued outbound cancellation tested
[ ] Order invariants tested
[ ] money rounding tested
[ ] promotion tests passed
[ ] WhatsApp webhook/idempotency tested
[ ] WhatsApp policy gates passed
[ ] Google OAuth/PKCE tested
[ ] Google conflict handling tested
[ ] backup/restore drill passed
[ ] reinstall/restore passed
[ ] migration downgrade safety reviewed
[ ] Electron hardening verified
[ ] supply-chain scans passed
[ ] staging approved
[ ] production runbooks validated

96. Open Decisions

Somente estes itens permanecem como decisões de fornecedor/negócio/homologação:

OD-001
Canal definitivo da notificação externa do responsável.

OD-002
Provedor específico do PostgreSQL do Gateway.

OD-003
Budget operacional cloud.

OD-004
Modelo final por perfil de hardware após benchmark.

OD-005
Homologação/verification de Meta e Google.

Nenhum deles autoriza uma IA a alterar os contratos centrais.

97. Governance

Qualquer mudança relevante segue:

Requirement
↓
Impact Analysis
↓
ADR
↓
Version Change
↓
Tests

A regra:

Nenhuma IA pode redefinir unilateralmente uma decisão arquitetural registrada.

Código/contratos usam inglês.
Produto/UI usa pt-BR.
Documentação técnica usa pt-BR preservando nomes dos contratos.

98. Approved Technical Baseline

Produto: KassisT
Documento: Especificação Oficial do Produto e Sistema
Versão: 1.0.0
Status: Approved Technical Baseline / Ready for Repository Bootstrap
Data: 22/08/2026

A arquitetura, domínio, contratos de persistência, protocolo WSS, segurança, integração e readiness estão congelados nesta versão.

Validações externas continuam sendo gates de implementação:

Meta/WhatsApp
Google OAuth/verification
hardware/model benchmark
final external notification channel
cloud provider
operational budget

Após o baseline, alterações estruturais exigem ADR e nova versão documental.

99. Primeiros 20 passos após o freeze

1. Criar repositório GitHub.
2. Registrar esta v1.0.0 como baseline.
3. Criar proteção da branch principal.
4. Configurar CI.
5. Configurar secret scanning/SCA/CodeQL/SBOM.
6. Criar estrutura de documentação.
7. Criar Design System oficial.
8. Inicializar Electron + React + TypeScript.
9. Implementar shell, tray e widget.
10. Implementar telas com Mock Services.
11. Implementar schema SQLite + migrations.
12. Implementar Order Engine e invariantes.
13. Implementar InboundInbox/DomainOutbox/JobQueue.
14. Implementar Mock LLM + Structured Intent.
15. Implementar Ollama adapter.
16. Implementar Device enrollment/auth client.
17. Implementar WSS client + ACK/RESUME/RESYNC.
18. Implementar MockWhatsApp e testes de falha.
19. Implementar adapters oficiais após homologação.
20. Executar Production Readiness Review antes do release.

100. DECLARAÇÃO FINAL

O KassisT é definido como:

Local-first business application
+
Cloud transport gateway
+
Deterministic business core
+
Local LLM
+
Official external integrations

Princípio central:

LLM interprets.
Core decides.
Database persists.
Inbox receives.
Outbox delivers.
Gateway transports.
Adapters isolate.
Audit proves.
Observability explains.

O documento principal possui uma única fonte normativa.

Histórico de versões e decisões anteriores deve ser mantido fora desta especificação, em:

docs/product/changelog.md
docs/architecture/decisions-history.md

A partir da v1.0.0, o projeto deixa a fase de arquitetura exploratória e pode iniciar o bootstrap do repositório.
