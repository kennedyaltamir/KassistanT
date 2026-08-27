# C1B — WhatsApp Frontend Integration

Status: FUNCTIONAL_FRONTEND_INTEGRATION

The desktop renderer consumes the existing local Gateway at `http://127.0.0.1:3210`.

## Real sources

- `GET /health` — Gateway health.
- `GET /api/whatsapp/status` — connection, qr, me, lastError, messageCount.
- `GET /api/whatsapp/messages?limit=N` — limited in-memory Gateway history.
- `GET /api/whatsapp/events` — SSE status, connection and message events.
- `POST /api/whatsapp/connect` — real connection request.
- `POST /api/whatsapp/logout` — real logout.
- `POST /api/whatsapp/reset-session` — real local session reset.
- `POST /api/whatsapp/messages` with `{to,text}` — real text send when a real recipient is available.

The renderer does not invent conversation identity or recipients. The current Gateway source does not expose an explicit conversation list or an approved Customer relation, so recent messages are presented as Gateway history and outbound sending remains unavailable without a real recipient source.

## Semantics

- WhatsApp connection state is sourced from the Gateway and is distinct from Gateway health and SSE state.
- A successful Gateway request is not presented as delivered or read.
- Message delivery receipts: UNKNOWN.
- Customer relation: UNAVAILABLE.
- Media transport: DEFERRED.
- Message history is limited Gateway memory and is not KassisT persistence.

REAL_WHATSAPP_OPERATIONAL is only claimable after local runtime validation of the renderer consuming health, status and SSE from the real Gateway.
