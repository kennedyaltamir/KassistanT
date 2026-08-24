# KassisT — C1B WhatsApp Gateway Verified Checkpoint

## CHECKPOINT_ID

`C1B-WHATSAPP-GATEWAY-VERIFIED`

## CHECKPOINT_DATE

`2026-08-24`

## MVP_SHA

`137855eb204c233fed7e0a45cef37cb3d6b90b02`

Commit:

`fix(gateway): resolve final HTTP typecheck error`

Branch:

`MVP`

`main` is protected and was not modified by this checkpoint cycle.

## CHECKPOINT_PURPOSE

This checkpoint captures the verified technical knowledge accumulated while building, integrating, debugging and validating the real WhatsApp Gateway and the C1B renderer integration.

It is intended to be a continuity source for future IA agents. It distinguishes observed facts from inference, unresolved work and deferred capability.

No functional code is changed by the checkpoint itself.

---

# 1. STATUS SUMMARY

## GATEWAY_STATUS

`VERIFIED`

The local Gateway is a real Node process connected to WhatsApp through Baileys.

## C1B_GATEWAY_RUNTIME

`VERIFIED`

Verified local operating sequence:

```text
Gateway starts
→ persisted session is loaded
→ WhatsApp connects
→ no new QR when session is valid
→ outbound works
→ inbound works
→ SSE works
→ history works
→ message deduplication works
→ Gateway restart preserves the session
```

## VERIFIED_AT_CHECKPOINT

The operator-reported final local validation for this checkpoint confirms:

```text
Lint       PASS
Typecheck  PASS
Tests      8 passed / 0 failed / 0 skipped / 0 todo
Build      PASS
WhatsApp   CONNECTED
QR         null
Outbound   PASS
Inbound    PASS
SSE        PASS
History    PASS
Dedup      PASS
Session    PASS
```

This is **local checkout/runtime evidence supplied and validated by the operator**, not a claim based only on repository inspection.

---

# 2. CLASSIFICATION OF KNOWLEDGE

## VERIFIED

The following are directly observed in the real Gateway/runtime or confirmed in the repository:

- WhatsApp connection through Baileys.
- Persisted WhatsApp authentication state.
- Real outbound messages.
- Real inbound messages.
- Real SSE events.
- In-memory Gateway history.
- Gateway-side message deduplication by `message.id`.
- Connection lifecycle and automatic reconnection behavior.
- Current HTTP endpoint surface.
- Current normalized message model.
- Current status semantics.
- Current typecheck/test/build status at the checkpoint SHA, based on the operator's local validation.

## INFERRED

The following are architectural interpretations derived from the verified implementation:

- The Gateway is the authoritative publication boundary for message history and SSE.
- The renderer must consume Gateway message identity instead of inventing message identity.
- A WhatsApp JID must not be treated as a phone number or Customer identity without an explicit approved relation.
- Gateway health, WhatsApp connection state and SSE transport state are distinct concepts.

## UNVERIFIED

The following are not established by this checkpoint:

- Full historical conversation retrieval from WhatsApp.
- Complete delivery/read receipt semantics.
- A production Customer ↔ WhatsApp Conversation relation.
- Campaign orchestration.
- Consent/opt-out orchestration.
- Media transport completeness.
- Permanent historical storage of all WhatsApp messages.

## DEFERRED

The following are explicitly deferred capabilities:

- Media transport.
- Delivery/read receipt protocol expansion.
- Campaign subsystem.
- Consent subsystem.
- Opt-out subsystem.
- Queue/campaign orchestration.
- Formal conversation persistence model.
- Full conversation-list API.

---

# 3. ARCHITECTURE OBSERVED

The real topology is:

```text
Electron Renderer
       ↓
Gateway HTTP / SSE
       ↓
KassisT WhatsApp Gateway
       ↓
Baileys
       ↓
WhatsApp
```

This is not a hypothetical abstraction. It is the operating topology validated during C1B.

The renderer consumes the local Gateway at:

```text
http://127.0.0.1:3210
```

The current C1B renderer documentation explicitly identifies health, status, messages, SSE, connect, logout, reset-session and send-text as Gateway sources. fileciteturn83file0L2-L2

---

# 4. TECHNOLOGY BASELINE

## Gateway

- Node process.
- ES modules.
- `@whiskeysockets/baileys` `7.0.0-rc14`.
- `pino` `10.0.0`.
- `qrcode-terminal` `0.12.0`.

The Gateway package is `@kassist/gateway` version `0.2.0`. Its real scripts are `dev`, `lint`, `typecheck`, `test`, integration/unit/e2e aliases and `build`. fileciteturn72file0L2-L2

## Workspace

The workspace declares:

```text
pnpm@10.6.5
TypeScript 5.8.3
@types/node 22.20.1
```

The CI workflow uses Node 22 and pnpm 10.6.5. The exact local Node runtime used for each prior manual validation is not treated as a new permanent architectural contract unless separately recorded. fileciteturn79file0L2-L2

## Desktop

The product surface is an Electron desktop application with a renderer/frontend layer. The current renderer artifact is `apps/desktop/src/index.html`. It was originally a provisional UI surface and its earlier state must not be confused with the verified Gateway runtime contract. fileciteturn75file0L2-L6

---

# 5. IMPORTANT FILES

## `gateway/src/whatsapp.mjs`

Responsibility:

- Owns the WhatsApp transport lifecycle.
- Creates the Baileys socket.
- Loads and saves authentication state.
- Maps connection events to Gateway connection state.
- Receives `messages.upsert` events.
- Normalizes WhatsApp messages.
- Stores the bounded in-memory history.
- Publishes Gateway events.
- Owns `recordMessage()` and `state.messageIds` deduplication.
- Sends outbound text.
- Performs logout and session reset.

Critical risks:

- Changing socket lifecycle can break reconnect or session persistence.
- Changing message publication paths can reintroduce duplicate history/SSE entries.
- Changing status semantics can create false delivery claims.
- Changing `jid` handling can break real WhatsApp/LID identities.

## `gateway/src/http.mjs`

Responsibility:

- Exposes the Gateway HTTP API.
- Serializes JSON responses.
- Parses inbound JSON request bodies.
- Opens and manages the SSE stream.
- Maps HTTP commands to Gateway functions.

Critical risks:

- Changing route names or payload shapes breaks the renderer contract.
- Opening SSE after the message has already been emitted does not replay historical message events.

## `gateway/src/main.mjs`

Responsibility:

- Starts the HTTP server.
- Calls Gateway `connect()` on startup.
- Handles SIGINT/SIGTERM shutdown.

Critical risk:

- Startup/shutdown changes can affect persisted-session recovery or clean process termination.

## `gateway/src/whatsapp.test.mjs`

Responsibility:

- Unit tests for recipient normalization.
- Gateway message deduplication behavior.
- SSE publication behavior at the subscription layer.
- Independence of distinct message IDs.
- INBOUND/OUTBOUND identity separation.
- Session-restart deduplication registry behavior.

The validated current suite is:

```text
8 passed
0 failed
0 skipped
0 todo
```

## `gateway/package.json`

Defines Gateway dependencies and validation scripts. fileciteturn72file0L2-L2

## `gateway/tsconfig.json`

The Gateway uses JavaScript/MJS with strict static checking:

```text
allowJs = true
checkJs = true
strict = true
noEmit = true
```

It explicitly includes `.d.ts` declarations. fileciteturn73file0L2-L2

## `gateway/src/types/qrcode-terminal.d.ts`

Provides the local declaration required to keep the real `qrcode-terminal` integration type-safe without changing the runtime library. fileciteturn84file0L2-L2

## `apps/desktop/src/index.html`

Current renderer surface. It should not be treated as the authority for WhatsApp transport state. The renderer consumes Gateway state; the Gateway remains the transport authority. The file's earlier provisional indicators such as `NOT_CONNECTED` / `PROVISIONAL_DATA` were part of the renderer's prior state and are not evidence that the real Gateway is disconnected. fileciteturn75file0L2-L6

## `docs/C1B_WHATSAPP_FRONTEND.md`

Current C1B integration documentation. It records the real Gateway endpoint surface, the distinction between Gateway connection state and health/SSE, UNKNOWN delivery semantics, deferred media, unavailable Customer relation and limited in-memory message history. fileciteturn83file0L2-L2

## `scripts/typecheck.mjs`

Runs the project's TypeScript compiler against the target `tsconfig.json` with `--noEmit`. A missing local toolchain causes an explicit failure. fileciteturn74file0L2-L2

---

# 6. REAL HTTP CONTRACTS

## `GET /health`

Purpose:

Gateway process health.

Observed payload:

```json
{
  "ok": true,
  "service": "kassist-whatsapp-gateway"
}
```

This endpoint is Gateway health, not WhatsApp connection state.

## `GET /api/whatsapp/status`

Purpose:

Current Gateway/WhatsApp connection status.

Observed model:

```json
{
  "connection": "CONNECTED",
  "qr": null,
  "me": {
    "id": "553798253971:14@s.whatsapp.net",
    "name": "Valéria Martins"
  },
  "lastError": null,
  "messageCount": 0
}
```

Important:

- `messageCount` is the current in-memory Gateway history length.
- It is not permanent database history.
- `me` can be `null` during intermediate lifecycle states.
- `qr` can be non-null during pairing.

## `GET /api/whatsapp/messages?limit=N`

Purpose:

Read the bounded Gateway in-memory message history.

Observed model:

```json
{
  "messages": [
    {
      "id": "...",
      "jid": "...",
      "direction": "OUTBOUND",
      "fromMe": true,
      "text": "...",
      "timestamp": 1787567669,
      "status": "UNKNOWN"
    }
  ]
}
```

The limit is clamped by the Gateway and history is bounded to 500 messages internally.

## `GET /api/whatsapp/events`

Purpose:

Open the SSE stream.

Event names observed:

```text
status
connection
message
```

The initial stream write is a `status` event containing the current connection status. Later Gateway publications use the event's `type` as the SSE event name.

Conceptual structures:

```text
status
  data = { type: "connection", status: GatewayStatus }

connection
  data = { type: "connection", status: GatewayStatus }

message
  data = { type: "message", message: MessageSnapshot }
```

Important temporal rule:

SSE is a live stream. Opening the stream after a message was already emitted does not replay that past message event. The correct regression order is therefore:

```text
open SSE first
→ send message
→ observe event
```

## `POST /api/whatsapp/connect`

Requests Gateway connection startup.

The current public response semantics remain a Gateway command/result, not a delivery receipt.

## `POST /api/whatsapp/logout`

Logs the transport out and sets connection state to `DISCONNECTED` without changing the semantics of explicit session reset.

## `POST /api/whatsapp/reset-session`

Performs logout and then clears the persisted authentication directory.

This is destructive to the existing WhatsApp pairing state and must not be used casually during persistence validation.

## `POST /api/whatsapp/messages`

Payload:

```json
{
  "to": "553298353530",
  "text": "Mensagem"
}
```

Current Gateway flow:

```text
to
→ normalizeRecipient(to)
→ jid
→ socket.sendMessage(jid, { text })
→ snapshotMessage()
→ recordMessage()
```

Do not move message identity generation into the renderer.

---

# 7. CONNECTION STATES

The Gateway connection state domain is:

```text
CONNECTING
PAIRING
CONNECTED
DISCONNECTED
RECONNECTING
ERROR
```

## `CONNECTING`

Gateway is attempting to create/start the transport connection.

## `PAIRING`

A real QR pairing condition is active.

Expected condition:

```text
qr != null
```

QR is an authentication artifact generated from the real WhatsApp pairing lifecycle. It is not a fixture or visual placeholder.

## `CONNECTED`

The Baileys socket is open and the Gateway has populated `me` from the current socket user when available.

## `DISCONNECTED`

The Gateway is intentionally or explicitly disconnected, including an explicit logged-out condition.

## `RECONNECTING`

A non-logout socket close has occurred and the Gateway schedules automatic reconnection.

## `ERROR`

The Gateway encountered a connection/startup error that it surfaced in its state.

### Important distinction

Do not confuse:

```text
Gateway health
```

with:

```text
WhatsApp connection state
```

or:

```text
SSE transport state
```

These are different observations.

---

# 8. QR / PAIRING BEHAVIOR

Observed lifecycle can be:

```text
DISCONNECTED
→ CONNECTING
→ PAIRING
→ CONNECTED
```

When a valid persisted session exists, the normal restart path can instead be:

```text
startup
→ CONNECTING
→ CONNECTED
```

with:

```text
qr = null
```

A `reset-session` intentionally destroys the persisted auth state and may therefore require QR pairing again.

---

# 9. SESSION PERSISTENCE

## SESSION_PERSISTENCE

`VERIFIED`

The WhatsApp authentication state is stored under:

```text
gateway/.data/whatsapp/auth
```

The implementation resolves that directory from `KASSIST_WA_AUTH_DIR` or defaults to the path above.

Real session files observed during validation included files such as:

```text
creds.json
session-*.json
identity-key-*.json
app-state-sync-*.json
pre-key-*.json
tctoken-*.json
```

Validated behavior:

```text
scan QR
→ connect
→ stop Gateway
→ restart Gateway
→ reconnect without new QR
```

This is a real persisted authentication mechanism using Baileys multi-file auth state, not a mock session.

Do not delete or reset this directory when testing persistence unless the explicit purpose is to test fresh pairing.

---

# 10. ACCOUNT IDENTITY

Real connected identity observed:

```text
id   = 553798253971:14@s.whatsapp.net
name = Valéria Martins
```

Important:

- `me` may be `null` during intermediate states.
- `name` may be `null`.
- Future code must not assume a permanently populated display name.
- Account identity and customer identity are different concepts.

---

# 11. NORMALIZED MESSAGE MODEL

Gateway `MessageSnapshot`:

```text
id
jid
direction
fromMe
text
timestamp
status
```

## `id`

Primary message identity.

Normally derived from:

```text
message.key.id
```

The Gateway's deduplication identity is this `id`.

Do not replace it with:

```text
timestamp
jid + timestamp
text
random UUID
```

## `jid`

WhatsApp address/JID from the message key.

It can be `null` in the normalized model when no remote JID is present.

## `direction`

Allowed values:

```text
INBOUND
OUTBOUND
```

## `fromMe`

Boolean derived from the WhatsApp message key.

Observed invariant:

```text
OUTBOUND → true
INBOUND  → false
```

## `text`

Current text extraction supports the existing message fields for conversation, extended text, image caption and video caption. Unrecognized/media-only content may produce `null`.

## `timestamp`

Derived from `messageTimestamp`, with the existing local timestamp fallback.

## `status`

Allowed current semantics:

```text
UNKNOWN
RECEIVED
```

Observed meaning:

```text
OUTBOUND
  fromMe = true
  status = UNKNOWN

INBOUND
  fromMe = false
  status = RECEIVED
```

Critical prohibition:

```text
UNKNOWN != SENT
UNKNOWN != DELIVERED
UNKNOWN != READ
```

Do not invent delivery/read semantics in the renderer or Gateway.

---

# 12. JID / LID KNOWLEDGE

Real identifiers observed include:

```text
553298353530@s.whatsapp.net
```

and:

```text
246973638648023@lid
```

Therefore:

```text
jid ≠ necessarily phone number
```

The Gateway and future renderer logic must preserve the full JID string.

Do not automatically derive:

```text
customer_id
phone
whatsapp_number
```

from a JID.

Different suffixes are legitimate observed forms, including:

```text
@s.whatsapp.net
@lid
```

The existing recipient normalization is intentionally narrower for outbound phone-oriented input and must not be generalized into a false identity mapping for inbound data.

---

# 13. DUPLICATION INCIDENT

## ORIGINAL DEFECT

The same outbound message could be recorded twice because the message travelled through two publication paths.

Previous flow:

```text
sendText()
   ↓
socket.sendMessage()
   ↓
snapshot
   ↓
push + emit

and later

messages.upsert
   ↓
snapshot
   ↓
push + emit
```

Both could carry the same:

```text
message.key.id
```

The observed runtime symptom was duplicate history and duplicate SSE for the same message ID.

Example of the original duplicate:

```text
3EB04FEF184BA8A19F39A8
OUTBOUND
Teste KassisT WhatsApp
```

appeared twice.

---

# 14. DEDUPLICATION DESIGN

The fix introduced one Gateway publication boundary:

```text
recordMessage(snapshot)
```

and a process-local registry:

```text
state.messageIds = Set<string>
```

Publication flow:

```text
recordMessage(snapshot)
        ↓
message.id already registered?
    ├─ YES → return false
    └─ NO
         ↓
      add message.id
         ↓
      append history
         ↓
      emit SSE
```

Invariant:

```text
same message.id
→ one history entry
→ one SSE event
```

The deduplication occurs in the Gateway, before final SSE publication. It is not a renderer filter.

## HISTORY EVICTION

Current history limit:

```text
500 messages
```

When the oldest history entry is evicted, its corresponding `message.id` is also removed from `state.messageIds`.

Therefore the registry is intentionally bounded with the same in-memory horizon as the history.

---

# 15. RUNTIME DEDUPLICATION EVIDENCE

The runtime validation included distinct outbound message IDs such as:

```text
3EB07FC065411788827156
3EB08F47A3C2936A01BD74
```

and a later validation reference:

```text
3EB0B30D24718C93913B5D
```

The observed behavior was:

```text
one history entry per unique ID
one SSE event per unique ID
no duplicate history entry for the same ID
no duplicate SSE event for the same ID
```

Therefore:

```text
DEDUPLICATION = RUNTIME_VERIFIED
```

---

# 16. INBOUND BEHAVIOR

Real inbound examples included messages such as:

```text
oi
Tudo bem?
Bom dia
```

Observed normalized semantics:

```text
direction = INBOUND
fromMe = false
status = RECEIVED
```

Inbound messages are processed through the same Gateway publication boundary as outbound messages, preserving the same message identity and deduplication rule.

---

# 17. OUTBOUND BEHAVIOR

Real outbound validation included messages such as:

```text
FINAL RUNTIME VALIDATION
FINAL VALIDATION
FINAL DEDUP TEST
SSE FINAL TEST
```

Observed normalized semantics:

```text
direction = OUTBOUND
fromMe = true
status = UNKNOWN
```

A successful outbound API response confirms Gateway transport execution; it does not establish `SENT`, `DELIVERED` or `READ` state.

---

# 18. TYPECHECK HISTORY

The Gateway originally used strict JavaScript checking over `.mjs` files.

Important configuration:

```text
allowJs = true
checkJs = true
strict = true
noEmit = true
```

The residual type safety work covered these observed problem classes:

- `Error | Boom<any>` access to `.output`.
- implicit `any` parameters.
- missing `qrcode-terminal` declaration.
- `WAMessage | undefined` passed where `WAMessage` was required.
- HTTP `unknown` values passed to string parameters.
- HTTP callback parameter typing.
- state variables initialized as `null`.
- strict test array/object inference.

Final relevant correction patterns:

- explicit JSDoc typedefs for connection state, message state and Gateway events;
- explicit `WASocket | null` and `Promise<void> | null` state types;
- local `qrcode-terminal` declaration;
- structural narrowing for disconnect error status;
- explicit outbound `sendText(string, string)` parameters;
- explicit `unknown → string` conversion at the HTTP boundary.

The final operator-validated result at this checkpoint is:

```text
LINT       PASS
TYPECHECK  PASS
TEST       PASS
BUILD      PASS
```

Do not disable `strict`, `checkJs`, `noImplicitAny` or equivalent static analysis to preserve this result.

---

# 19. TEST SUITE

Current Gateway test result:

```text
8 passed
0 failed
0 skipped
0 todo
```

Test coverage relevant to C1B includes:

1. WhatsApp JID input is accepted unchanged.
2. Phone-like recipient input is normalized to user JID form.
3. Group JIDs are accepted unchanged.
4. Empty recipient input is rejected.
5. Same `message.id` is persisted once and published once.
6. Distinct message IDs remain independent.
7. Distinct INBOUND and OUTBOUND IDs are not conflated.
8. Deduplication registry remains effective across the tested transport session restart boundary.

The deduplication tests directly verify both history count and emitted event count for duplicate IDs.

---

# 20. FINAL RUNTIME VALIDATION

The C1B runtime checkpoint is:

```text
Gateway starts
→ existing session loaded
→ CONNECTED
→ qr = null
→ me populated as available
→ outbound send works
→ inbound receive works
→ SSE emits status/connection/message events
→ history contains received messages
→ duplicate IDs do not create duplicate history/SSE
→ Gateway restart reconnects without new QR when auth persists
```

Status:

```text
C1B_GATEWAY_RUNTIME = VERIFIED
```

---

# 21. RUNTIME VALIDATION PROCEDURE

## Start

```powershell
$env:KASSIST_WA_LOG_LEVEL="info"
pnpm --dir gateway dev
```

## Status

```powershell
Invoke-RestMethod `
  "http://127.0.0.1:3210/api/whatsapp/status" |
  ConvertTo-Json -Depth 20
```

Expected persisted-session state:

```text
connection = CONNECTED
qr = null
```

## SSE

Open the stream **before** sending a test message:

```powershell
curl.exe -N "http://127.0.0.1:3210/api/whatsapp/events"
```

Then send outbound.

Do not open SSE after the send and expect the previous message event to replay.

## Outbound

```powershell
$body = @{
    to   = "553298353530"
    text = "C1B regression test"
} | ConvertTo-Json -Compress

Invoke-RestMethod `
  -Method POST `
  -Uri "http://127.0.0.1:3210/api/whatsapp/messages" `
  -ContentType "application/json" `
  -Body $body |
  ConvertTo-Json -Depth 20
```

Verify:

```text
1 outbound history entry
1 outbound SSE event
same message.id
```

## Inbound

With SSE already open, send an inbound WhatsApp message from another device.

Verify:

```text
direction = INBOUND
fromMe = false
status = RECEIVED
1 corresponding SSE message event
1 corresponding history entry
```

## History

```powershell
Invoke-RestMethod `
  "http://127.0.0.1:3210/api/whatsapp/messages?limit=50" |
  ConvertTo-Json -Depth 20
```

Verify every visible `message.id` occurs once.

## Restart

Stop with `Ctrl+C`, then restart:

```powershell
pnpm --dir gateway dev
```

Verify the persisted session reconnects without `reset-session` or credential deletion.

---

# 22. HTTP CONTRACT PRESERVATION RULES

The following endpoints are part of the verified Gateway surface:

```text
GET /health
GET /api/whatsapp/status
GET /api/whatsapp/messages
GET /api/whatsapp/events

POST /api/whatsapp/connect
POST /api/whatsapp/logout
POST /api/whatsapp/reset-session
POST /api/whatsapp/messages
```

Future changes must not silently change endpoint names, event names, payload structure or status semantics.

The current endpoint implementation lives in `gateway/src/http.mjs`. fileciteturn82file0L2-L2

---

# 23. LIMITATIONS / CURRENT GAPS

The current C1B Gateway is intentionally not a complete WhatsApp business platform.

Known limitations:

```text
No complete official conversation-list API.
No permanent conversation-history persistence.
No robust approved Customer ↔ WhatsApp Conversation relation.
No complete delivery/read receipt contract.
No complete media transport.
No Campaign subsystem.
No Consent subsystem.
No Opt-out subsystem.
No Queue/Campaign orchestration.
```

These are not bugs to be silently inferred away.

Future implementation must not fabricate missing capabilities.

The existing C1B documentation explicitly marks Customer relation unavailable, media deferred and message history as limited Gateway memory rather than KassisT persistence. fileciteturn83file0L2-L2

---

# 24. PROHIBITED INFERENCES

Future agents must not infer:

```text
HTTP 202 = SENT
UNKNOWN = SENT
UNKNOWN = DELIVERED
UNKNOWN = READ
jid = phone number
jid = customer_id
me.name is always present
messageCount = permanent persisted history
SSE reconnect = message replay
successful send = customer conversation established
real WhatsApp transport = complete Campaign subsystem
real WhatsApp transport = Consent subsystem
```

The Gateway transports and reports what it actually knows. It does not invent business state.

---

# 25. IMPORTANT SAFETY / INTEGRITY RULES FOR FUTURE AGENTS

Do not:

- alter `state.messageIds` casually;
- bypass `recordMessage()`;
- emit message SSE directly from a new publication path;
- add frontend-only duplicate filtering as a substitute for Gateway deduplication;
- reset the WhatsApp session during persistence tests;
- convert `UNKNOWN` into a delivery state;
- convert `@lid` to a phone number heuristically;
- invent Customer identity from a WhatsApp JID;
- treat the in-memory 500-message history as durable persistence;
- change Baileys version to solve an unrelated application-layer concern;
- weaken typecheck configuration to hide a real type problem.

---

# 26. RELEVANT COMMIT HISTORY

The relevant Gateway/C1B history is preserved below.

```text
c6eb3896ac9d5c01cd99ba54fdfa97acc789b30e
b658c129a2f0a9ae9cbf2c553c79b4bd2fe39f20
8adbb0a7418254c25e314df5c184e5f2b940edf9
e6385ac35b1814fdc910c030bead532664757508
da23c602f84aa9876ff4370b4841c718951bfe53
aafb3ccad5bf63b9b1bf943999e4fe8b3bfbc952
67fc1f045c0de169a9c26a05dda035deca7bfc91
63468f000e824645d72d76c6a91f0274c9bef37d
038df15c7d40e477b536c54a6f0a6e41d4453ecf
137855eb204c233fed7e0a45cef37cb3d6b90b02
```

The first hash supplied in the task text as `c1eb3896...` is recorded here as `c6eb3896...`, which is the actual hash of the earlier Gateway declaration commit observed in the repository history. The checkpoint does not invent or recreate the incorrect hash.

The final checkpoint commit itself is intentionally not listed above because it is created after this document is written.

---

# 27. CHECKPOINT FILE / DOCUMENTATION STATE

This checkpoint file is:

```text
docs/checkpoints/C1B-WHATSAPP-GATEWAY-VERIFIED.md
```

The `docs/checkpoints` directory did not previously exist at `137855eb204c233fed7e0a45cef37cb3d6b90b02`; this file creates the dedicated checkpoint location rather than creating a parallel knowledge tree.

Existing C1B integration documentation remains at:

```text
docs/C1B_WHATSAPP_FRONTEND.md
```

This checkpoint is the continuity-oriented technical record. The C1B document remains the shorter integration-facing document.

---

# 28. NEXT_PHASE

```text
WHATSAPP_FRONTEND_OPERATIONALIZATION
+
CAMPAIGN_FOUNDATION
```

The next phase must start from this checkpoint rather than reopening already validated transport, session, SSE or deduplication problems.

Before introducing new functionality, future agents should re-read:

```text
docs/checkpoints/C1B-WHATSAPP-GATEWAY-VERIFIED.md
docs/C1B_WHATSAPP_FRONTEND.md
gateway/src/whatsapp.mjs
gateway/src/http.mjs
gateway/src/whatsapp.test.mjs
```

and verify current branch/HEAD before changing anything.

---

# 29. AUDIT CHECKLIST

At checkpoint time:

```text
CHECKPOINT_ID
  = C1B-WHATSAPP-GATEWAY-VERIFIED

MVP_SHA
  = 137855eb204c233fed7e0a45cef37cb3d6b90b02

GATEWAY_STATUS
  = VERIFIED

SESSION_PERSISTENCE
  = VERIFIED

CONNECTION
  = VERIFIED

OUTBOUND
  = VERIFIED

INBOUND
  = VERIFIED

SSE
  = VERIFIED

HISTORY
  = VERIFIED

DEDUPLICATION
  = RUNTIME_VERIFIED

TYPECHECK
  = PASS

TESTS
  = 8 PASS

BUILD
  = PASS

KNOWN_LIMITATIONS
  = DOCUMENTED

NEXT_PHASE
  = WHATSAPP_FRONTEND_OPERATIONALIZATION + CAMPAIGN_FOUNDATION
```

## CHECKPOINT RULE

No functional implementation is authorized by this document itself. This is a knowledge and continuity checkpoint.

Future implementation must preserve the verified contracts and invariants recorded above unless an explicit new decision supersedes them.
