# SCREEN SPECIFICATIONS

## DASHBOARD — IMPLEMENTED/PROVISIONAL
Atalhos, contagens locais e status. Sem receita, faturamento ou KPI inventado.

## PRODUCTS — IMPLEMENTED/PROVISIONAL
List, create, detail e edit em sessão. Campos C1: nome e preço. Fixture não é persistência.

## ORDERS — IMPLEMENTED/PROVISIONAL
List, create, add item e detail. OrderItem presentation-only contém id, name, quantity, unit_price e modifiers; não introduz `product_id`. Total é de apresentação; Domain/Core continua autoridade canônica.

## CONFIRMATION — IMPLEMENTED/PROVISIONAL
Review → confirmação explícita → sucesso visual. O sucesso representa somente a mudança visual local; confirmação canônica requer boundary autorizada.

## CONVERSATIONS — IMPLEMENTED/UNAVAILABLE
Lista, histórico e composer. Sem transport real, envio não declara MESSAGE_SENT.

## CLIENTS — IMPLEMENTED/PROVISIONAL
Lista e identidade mínima. CRM avançado: NOT_REQUIRED_FOR_C1.

## SETTINGS/DIAGNOSTICS — IMPLEMENTED/PROVISIONAL
Renderer, IPC, persistence, transport e auth podem ser mostrados apenas como HEALTHY, ERROR, UNKNOWN, NOT_CONNECTED ou UNAVAILABLE conforme evidência. Sem IPC novo para obter status cosmético.
