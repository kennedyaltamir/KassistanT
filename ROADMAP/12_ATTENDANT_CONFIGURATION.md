# KassisT — 12. ATTENDANT CONFIGURATION

## Objetivo

Definir o contrato da aba **Atendente**, superfície central para configurar a identidade e as políticas linguísticas do assistente operacional do KassisT.

## Princípio de responsabilidade

```text
UI
  -> coleta e apresenta configuração
Backend
  -> valida e persiste
Core
  -> decide regras e efeitos comerciais
Context Builder
  -> seleciona contexto autorizado
LLM Runtime
  -> interpreta e gera linguagem
WhatsApp
  -> transporta mensagens
Database
  -> preserva estado persistente
```

A aba Atendente não poderá conter regra comercial crítica nem autoridade para alterar preços, estoque, pedidos, permissões ou estados de negócio.

## Seções do MVP

### Empresa

- nome comercial obrigatório;
- endereço opcional;
- horário de funcionamento por dia;
- múltiplos intervalos no mesmo dia;
- timezone operacional explícito.

### Identidade do assistente

- nome apresentado ao cliente;
- idioma principal;
- modo de comunicação;
- instruções adicionais limitadas a comportamento linguístico;
- estado operacional da configuração.

### Política de atendimento

- atendimento habilitado/desabilitado;
- janela de atendimento;
- mensagem fora do horário;
- comportamento quando não houver contexto suficiente;
- política para escalonamento ao administrador.

### Dados do cliente

Permitir política explícita sobre categorias disponibilizadas ao contexto:

- nome;
- telefone;
- identificador WhatsApp;
- preferências;
- histórico relevante;
- histórico de pedidos;
- informações de relacionamento;
- endereço/e-mail apenas quando suportados e autorizados.

A política controla contexto. A LLM nunca consulta SQLite diretamente.

### Histórico

O histórico completo permanece persistido. Cada inferência receberá somente a janela ou subconjunto autorizado pelo Context Builder.

### Simulação

A simulação deve utilizar a configuração persistida ou a configuração em validação, sem enviar mensagem real, criar pedido real ou gerar efeito comercial.

## Estados

```text
NOT_CONFIGURED
DIRTY
VALIDATING
VALID
INVALID
DISABLED
ERROR
```

Nenhum estado de UI substitui o estado retornado pelo backend.

## Contratos propostos

```http
GET  /api/assistant/config
PUT  /api/assistant/config
POST /api/assistant/config/validate
POST /api/assistant/simulation
```

Esses endpoints são propostos até serem implementados, testados e registrados no contrato oficial.

## Persistência conceitual

```text
assistant_configuration
├── id
├── store_id
├── company_name
├── company_address
├── timezone
├── business_hours_json
├── assistant_name
├── language
├── conversation_mode
├── system_behavior_policy_json
├── customer_context_policy_json
├── history_policy_json
├── after_hours_policy_json
├── sale_notification_policy_json
├── enabled
├── created_at
└── updated_at
```

O schema final deverá respeitar a modelagem canônica existente. Não criar mecanismo paralelo se houver boundary equivalente.

## Invariantes

- a configuração persistente é fonte de verdade;
- a LLM não modifica a configuração;
- horário é dado determinístico;
- simulação não gera efeitos reais;
- secrets ficam fora desta entidade;
- mudanças não persistidas não são descartadas silenciosamente;
- nenhum recurso é exibido como funcional sem evidência.

## Critérios de aceitação

1. carregar configuração persistida;
2. editar empresa, identidade e políticas;
3. salvar pelo backend;
4. recuperar após reinicialização;
5. validar operacionalmente;
6. simular sem efeitos colaterais;
7. aplicar política de contexto autorizada;
8. refletir estados reais;
9. bloquear recursos ainda não implementados;
10. passar pelos testes de contrato, persistência e runtime.
