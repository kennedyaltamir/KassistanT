# KassisT — Provider Dispatch Contract Discovery v1

**Task:** P0-012C  
**Owner:** AG-ENG-01  
**Territory:** Dispatch / WhatsApp Provider Integration Contract  
**Baseline:** MVP2 @ `35df2fe5f924d3147a5346b716ca1dd2e96cfb3b`  
**Completion:** `PARTIALLY_CLOSED / PROVIDER_INFORMATION_REQUIRED`  
**Critical status:** `PROVIDER_NOT_DETERMINED`

## 1. Scope

P0-012C reconciles P0-012, P0-012A and P0-012B against the provider integration that actually exists in the baseline. This document is discovery/contract-only. It does not authorize a new provider, provider implementation, batch worker, endpoint, schema, migration, UI change or real send operation.

## 2. Provider identification

### 2.1 Observed implementation

The baseline Gateway contains a direct WhatsApp Web integration through `@whiskeysockets/baileys` version `7.0.0-rc14`. The package is declared in `gateway/package.json`; the Gateway imports `makeWASocket`, `useMultiFileAuthState`, `DisconnectReason` and related Baileys primitives in `gateway/src/whatsapp.mjs`. The runtime exposes a local `sendText()` function that calls `socket.sendMessage(jid, { text: body })`. 

The HTTP boundary exposes this implementation through `POST /api/whatsapp/messages`, returning HTTP `202` when `sendText()` returns a message snapshot, and the Gateway connects automatically during startup. These are existing implementation facts, not an authorization for a future batch API.

### 2.2 Authorization decision

`PROVIDER_NOT_DETERMINED`.

Baileys is the **observed transport library**, but no canonical project decision, approved provider contract, provider credential mapping, or documented Meta/WhatsApp authorization was found that establishes Baileys as the officially authorized provider for KassisT batch dispatch.

The Baileys maintainers explicitly describe the library as unofficial and not affiliated with WhatsApp. The same official Baileys documentation states that it should be used responsibly and in accordance with WhatsApp Terms of Service. Therefore the observed library cannot be silently promoted from implementation detail to an authorized business messaging provider.

The official WhatsApp Business Platform / Cloud API is a distinct provider surface. Its existence does not make it the KassisT provider: no baseline configuration or approved integration was found that authorizes substituting Cloud API for the current Baileys integration in this task.

**Decision:** do not choose a provider by inference. Await an explicit provider authorization decision or an existing approved integration contract.

## 3. Evidence reconciled from the baseline

| Area | Observed baseline fact | Contract status |
|---|---|---|
| Transport | `@whiskeysockets/baileys@7.0.0-rc14` | OBSERVED |
| Socket | `makeWASocket()` | OBSERVED |
| Session auth | `useMultiFileAuthState(authDir)` | OBSERVED |
| Pairing | QR through `qrcode-terminal` on `connection.update.qr` | OBSERVED |
| Connection | `connection.update` with `open` / `close` | OBSERVED |
| Recipient | JID or normalized digits mapped to `@s.whatsapp.net` | OBSERVED |
| Send operation | `socket.sendMessage(jid, { text: body })` | OBSERVED |
| Local API | `POST /api/whatsapp/messages` | OBSERVED |
| Provider acceptance | No distinct provider acceptance contract in KassisT | OPEN |
| Delivery receipt | No provider delivery callback/receipt integrated in KassisT | OPEN |
| Read receipt | No provider read contract integrated in KassisT | OPEN |
| Provider idempotency | No provider-specific idempotency key/mechanism in KassisT | OPEN |
| Provider request ID | No durable provider effect reference contract in KassisT | OPEN |
| Provider retry codes | No KassisT provider-specific vocabulary frozen | OPEN |
| Provider rate limits | No official provider-specific policy frozen for KassisT | OPEN |
| Reconciliation API | No provider reconciliation operation exposed by KassisT | OPEN |

## 4. Authentication contract

### Observed implementation

The current WhatsApp transport authenticates as a linked WhatsApp session using Baileys auth state and QR pairing. The auth material is persisted through `useMultiFileAuthState` and `saveCreds`.

### Contract closure status

`PARTIALLY CLOSED / PROVIDER INFORMATION REQUIRED`.

This proves the mechanism used by the current implementation. It does **not** establish that this mechanism is an approved KassisT provider authentication model for future batch dispatch.

The future runtime must not invent API tokens, business accounts, bearer credentials, or provider-specific authorization headers unless the explicitly authorized provider requires them.

## 5. Canonical outbound request

### Observed Baileys operation

The current single-recipient effect is conceptually:

`recipient JID + text content -> socket.sendMessage(jid, { text })`

The current HTTP facade is:

`POST /api/whatsapp/messages`

with a body containing `to` and `text`.

### Contract closure

`OPEN / PROVIDER_DEPENDENCY` for P0-012B batch integration.

No batch request shape is frozen by P0-012C because provider authorization has not been established and the existing single-message HTTP facade is not itself the batch provider contract.

## 6. Provider acceptance semantics

`OPEN / PROVIDER_INFORMATION_REQUIRED`.

The current `sendText()` result demonstrates that the library returned a message object. It does not establish a product-level delivery guarantee, nor does the baseline define a distinct provider acceptance event that can be mapped safely to KassisT `SUCCESS`.

Therefore:

- local return from `sendText()` != delivery confirmation;
- HTTP `202` from KassisT != provider acceptance confirmation beyond the current local command processing;
- successful local serialization != provider acceptance;
- successful socket write != delivery.

## 7. Success / delivery / read semantics

### Success

`SUCCESS_SEMANTICS = OPEN / PROVIDER_INFORMATION_REQUIRED`.

P0-012B remains authoritative: KassisT cannot claim success solely from request construction, local enqueue, HTTP success, or a local function return.

### Delivery

`DELIVERY_CONFIRMED = NOT_DETERMINED`.

No provider delivery receipt or equivalent confirmation path is present in the baseline integration.

### Read

`READ_CONFIRMED = NOT_DETERMINED`.

No provider read-receipt contract is established for batch dispatch.

## 8. Idempotency

`PROVIDER_IDEMPOTENCY = NOT_DETERMINED`.

The KassisT semantic identity from P0-012B remains:

- `batch_id` stable across the batch lifecycle;
- `recipient_identity` stable across retries/restart;
- correlation/causation are not idempotency keys;
- a future logical `recipient_effect_id` must remain stable across reconciliation/retry.

No provider-specific key, deduplication endpoint, message-id replay rule, or equivalent mechanism was found in the baseline.

Until such a provider mechanism is frozen, blind retry after an indeterminate effect remains prohibited.

## 9. Retryable failures

`OPEN / PROVIDER_INFORMATION_REQUIRED`.

The generic semantic classes from P0-012B remain valid:

- transient service unavailability;
- eligible throttling/rate limiting;
- transient network failure;
- timeout where final provider outcome is not conclusively terminal.

The exact provider error codes, HTTP statuses, disconnect reasons, retry-after signals and classification rules are **not frozen** by this discovery. No rate-limit bypass, anti-ban behavior or evasion mechanism is authorized.

## 10. Terminal failures

`OPEN / PROVIDER_INFORMATION_REQUIRED`.

The semantic terminal classes remain:

- malformed recipient that the provider definitively rejects;
- unauthorized operation;
- unsupported operation;
- permanently rejected recipient;
- provider configuration failure requiring operator action.

Concrete provider codes must be supplied by an explicitly authorized provider contract before implementation.

## 11. Timeout semantics

`OPEN / PROVIDER_INFORMATION_REQUIRED`.

P0-012B already establishes a **5-minute processing recovery threshold**. That threshold is not a provider request timeout and MUST NOT be reinterpreted as one.

A future provider contract must define separately:

- request/transport timeout;
- provider acknowledgement timeout;
- receipt/reconciliation timeout;
- whether a timeout can be classified retryable without reconciliation.

## 12. Indeterminate-effect reconciliation

The required semantic case remains:

`PROCESSING -> restart -> provider effect unknown`

Current baseline discovery found no safe provider reconciliation operation or provider-specific idempotency mechanism sufficient to close this case.

Therefore:

`INDETERMINATE_EFFECT_UNRESOLVED`.

The future runtime MUST:

1. preserve `batch_id`, `recipient_identity`, attempt ordinal and logical effect identity;
2. preserve correlation/causation history;
3. record the effect as indeterminate rather than failed or successful;
4. attempt provider reconciliation only through a contractually supported provider mechanism;
5. prohibit blind duplicate-producing retry when reconciliation is unavailable.

## 13. Cancellation race

`OPEN / PROVIDER_INFORMATION_REQUIRED`.

P0-012B closes the aggregate semantic rule: cancellation may prevent pending work, but a recipient already crossing an irreversible effect boundary cannot be erased by a later cancellation request.

The provider-specific race remains unknown:

`cancel requested` versus `provider transmission started` versus `provider accepted`.

No implementation may claim cancellation means zero external effects.

## 14. Provider → KassisT state mapping

The mapping below intentionally distinguishes observed information from authoritative provider confirmation.

| Provider observation/state | KassisT recipient interpretation | Classification | Rule |
|---|---|---|---|
| Local request constructed | `PROCESSING` | OBSERVED | no success claim |
| Local send operation invoked | `PROCESSING` | OBSERVED | no success claim |
| Local function returns message snapshot | `PROCESSING` | OBSERVED | not delivery confirmation |
| Provider acceptance event | `SUCCESS` only if future provider contract explicitly defines acceptance as success | CONFIRMED | currently OPEN |
| Delivery receipt | `SUCCESS` if future contract defines delivery as required success | CONFIRMED | currently OPEN |
| Read receipt | stronger evidence than delivery, never required implicitly | CONFIRMED | currently OPEN |
| Transient provider failure | `RETRY_WAIT` | RETRYABLE | exact codes OPEN |
| Permanent provider rejection | `FAILED_TERMINAL` | TERMINAL | exact codes OPEN |
| Timeout with unknown effect | `PROCESSING` / indeterminate attempt evidence | UNKNOWN | reconcile before blind retry |
| Restart with unknown effect | `PROCESSING` / indeterminate attempt evidence | UNKNOWN | `INDETERMINATE_EFFECT_UNRESOLVED` until provider mechanism exists |
| Explicit cancellation before effect start | `CANCELLED` | CONFIRMED by KassisT command semantics | provider race not relevant yet |
| Cancellation after effect boundary | retain actual recipient outcome | CONFIRMED/UNKNOWN | never rewrite prior effect evidence |

**Forbidden mapping:** `UNKNOWN -> SUCCESS`.

## 15. Reconciliation with D-010 / Inbox-Outbox

P0-012C does not change D-010 or Inbox/Outbox ownership.

The future dispatch integration must preserve the existing semantic boundary:

`stage_outbound -> mark_processing -> provider effect -> mark_delivered / record_retry / record_failure -> recovery`

The transport/provider layer cannot become the business authority, and physical SQLite schema/migration work remains outside P0-012C.

## 16. Security and policy

No provider bypass is authorized.

Specifically excluded:

- rate-limit bypass;
- anti-ban automation;
- identity multiplication;
- spoofing;
- policy evasion;
- bulk-abuse workarounds.

Only provider capabilities explicitly supported and authorized by the project may be implemented.

## 17. Open decisions / blockers

The following are still objectively unresolved:

1. authorized provider identity for batch dispatch;
2. whether current Baileys transport is approved for the product or must remain a legacy/experimental integration;
3. provider authentication contract;
4. canonical provider outbound request;
5. provider acceptance semantics;
6. success threshold;
7. delivery/read confirmation contract;
8. provider-specific idempotency/reconciliation mechanism;
9. retryable and terminal error vocabulary;
10. official rate-limit semantics exposed to the runtime;
11. provider timeout and retry-after semantics;
12. cancellation/send race behavior.

## 18. Implementation handoff

This task does **not** authorize implementation.

Future runtime owner may proceed only after an explicit authorized provider is established and the open decisions above are frozen into a provider contract.

Required handoff input:

`P0-012A + P0-012B + authorized provider contract`

Expected runtime output:

- batch recipient effects using the existing P0-012A confirmation boundary;
- stable batch and recipient identities;
- provider effect lifecycle mapped exactly to provider evidence;
- bounded retry/backoff/recovery from P0-012B;
- no fabricated provider success;
- safe handling of indeterminate effects;
- provider-specific idempotency only where officially supported;
- auditability and correlation/causation preservation.

## 19. Evidence and promotion

**IMPLEMENTED:** YES — provider discovery/contract-gap document created.  
**TESTED:** YES — static reconciliation of baseline code, P0-012B and provider documentation.  
**VERIFIED:** NO. No runtime send or provider account validation was executed.  
**READY_FOR_REVIEW:** YES for contract/governance review of the provider dependency finding.  
**APPROVED:** NO.  
**MERGE:** NO.  
**RELEASE:** NO.

## Official / normative sources

- WhiskeySockets Baileys documentation: https://github.com/WhiskeySockets/docs/blob/main/quickstart.mdx — documents session persistence, sending through `sendMessage`, and explicitly states Baileys is unofficial and not affiliated with WhatsApp.
- WhiskeySockets Baileys source/API documentation: https://github.com/WhiskeySockets/Baileys/blob/master/src/Types/Socket.ts — documents socket-level send/retry configuration and message-store hooks.
- Meta WhatsApp Business Platform Cloud API documentation (official distribution): https://www.postman.com/meta/whatsapp-business-platform/documentation/wlk6lh4/whatsapp-cloud-api — documents the official Cloud API send-message surface and `wamid` identifiers. This source is evidence of a distinct official provider surface, **not** evidence that KassisT has authorized or configured it.
