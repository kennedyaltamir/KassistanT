# KassisT — Dashboard Operational Contract

**Status:** IMPLEMENTED / VALIDATION_PENDING_DYNAMIC_GATE
**Branch:** `MVP2-implementandoQRCODE`
**Scope:** Dashboard desktop, Gateway HTTP and SQLite persistence summary.

## Purpose

O Dashboard apresenta somente dados derivados do runtime real. O Renderer não calcula métricas financeiras e não possui números estáticos de negócio.

## Data path

`Desktop Renderer`
→ `GET /api/dashboard/summary`
→ `Gateway HTTP`
→ `getDashboardSummary()`
→ `GET /internal/v1/dashboard/summary`
→ `SQLite persistence runtime`

## KPI contract

| KPI | Definition | Source | Formula / filter | Period |
|---|---|---|---|---|
| Atendimentos ativos | Conversas no estado operacional aberto | `conversation` | `COUNT(*) WHERE store_id=? AND lifecycle_state='OPEN'` | snapshot |
| Mensagens recebidas | Mensagens inbound persistidas | `message` | `COUNT(*) WHERE direction='INBOUND'` | all persisted |
| Mensagens enviadas hoje | Outbound persistidas no dia atual | `message` | `COUNT(*) WHERE direction='OUTBOUND' AND created_at >= todayStartUtc AND created_at < todayEndUtc` | UTC calendar day |
| Mensagens enviadas 7 dias | Outbound persistidas na janela móvel | `message` | `COUNT(*) WHERE direction='OUTBOUND' AND created_at >= now-7d AND created_at < now` | rolling 7×24h |
| Mensagens enviadas 30 dias | Outbound persistidas na janela móvel | `message` | `COUNT(*) WHERE direction='OUTBOUND' AND created_at >= now-30d AND created_at < now` | rolling 30×24h |
| Mensagens ignoradas | Sem semântica canônica comprovada no schema atual | N/A | `ignoredMessages=null`, `ignoredMessagesAvailable=false` | N/A |
| Pedidos confirmados | Orders no estado canônico confirmado | `order` | `COUNT(*) WHERE lifecycle_state='CONFIRMED'` | all persisted |
| Faturamento operacional | Soma de pedidos confirmados | `order` | `SUM(total_cents) WHERE lifecycle_state='CONFIRMED'` | all persisted |
| Ticket médio | Média determinística do faturamento confirmado | `order` | `round(revenueCents / confirmedOrders)` em centavos inteiros | all persisted |
| Clientes novos hoje | Clientes criados no dia atual | `customer` | `COUNT(*) WHERE created_at >= todayStartUtc AND created_at < todayEndUtc` | UTC calendar day |

## Monetary invariants

- Valores financeiros permanecem em centavos inteiros.
- O Renderer somente formata `revenueCents` e `ticketAverageCents`.
- Pedidos `CANCELLED` não entram no faturamento.
- Pedidos `DRAFT` não entram no faturamento.
- Não há inferência de faturamento por mensagens.

## Integration status

The Gateway derives integration states from real runtime checks:

- Gateway: READY when the summary endpoint is being served.
- Persistence: READY only when persistence `/health` returns `status=ok`.
- LLM/Ollama: READY only when Ollama is reachable and the selected model is present; DEGRADED when reachable without the selected model; UNAVAILABLE when unreachable.
- WhatsApp: taken from the existing Gateway session state.

## Failure behavior

When refresh fails and a previous successful summary exists, the UI retains the previous data and marks the Dashboard as degraded.

When no successful summary exists, the UI exposes an error state instead of zeroing the KPIs.

All refresh and query failures are logged with the `[KassisT Dashboard]` prefix.

## Refresh policy

- Manual refresh button.
- Polling every 30 seconds while Dashboard is active.
- A successful inbound SSE message schedules one controlled refresh after 1 second.
- No additional realtime infrastructure was introduced.

## Orders recent list

The list is read from persisted `order` rows joined to persisted `customer` rows, ordered by `updated_at DESC, created_at DESC`, limited to ten records.

No synthetic orders are generated.

## Timezone limitation

The approved baseline states that Store has a timezone and persisted timestamps are UTC. The current runtime path inspected for this task does not expose Store timezone to the Dashboard contract. Therefore this implementation explicitly uses UTC and documents that limitation rather than inferring a Store-local timezone.

## Tests

- `apps/desktop/electron/database/runtime.test.cjs`: Dashboard summary integration coverage against SQLite, including confirmed/cancelled orders, integer-cent revenue, period windows, customer creation and empty database.
- `tests/frontend-operational.test.mjs`: Dashboard UI contract coverage, endpoint binding, required KPI labels, error retention and no hardcoded monetary value.

## Validation status

Source-level implementation is present.

Dynamic execution of the repository quality gates remains subject to the CI/runtime environment available for this branch. The task must not be called production-ready solely from static tests.

## Known non-goals

- No new meaning was invented for ignored messages.
- No Order Engine semantics were duplicated in the Renderer.
- No new Store timezone resolver was introduced.
- No implementation was added to other product tabs.


## Validation finding fixed

The initial implementation used only lower bounds for temporal KPI queries. Future-dated persisted records could therefore contaminate "today", rolling 7-day, and rolling 30-day metrics. The fix adds explicit end-exclusive bounds: UTC calendar day `[todayStartUtc, todayEndUtc)` and rolling windows `[now - N days, now)`. A regression test in `runtime.test.cjs` covers a future outbound message and future customer creation.
