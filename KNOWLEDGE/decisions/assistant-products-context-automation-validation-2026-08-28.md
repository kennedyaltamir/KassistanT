# KassisT — Assistant / Products / Context / Automation Validation

**Date:** 2026-08-28  
**Change Unit:** Assistant/IA, Products, Conversations/Context, Conversation Analysis, Local LLM, Auto-Reply, Audio, Image, CSV Dispatch and Manual Dispatch  
**Target branch:** `MVP2-implementandoQRCODE`  
**Protected branch:** `MVP2`  
**Protected baseline:** `2aa27a93a8fe1f62ae64c3a5aec98809ae01a423`  
**Validation HEAD:** `bf22717e84a2efea46376ca14b08776abe372fe0`  
**Status:** `PARTIAL` — technical and several functional paths are proven; mandatory audio/CSV/manual validation remains incomplete.

## 1. Scope and governance

This record documents facts observed during the finalization/validation round. It does not introduce a new domain architecture, does not promote the pending Identity/Binding/Memory contract, and does not modify `MVP2`.

The canonical separation remains:

```text
IDENTITY != CUSTOMER != CONVERSATION != MEMORY != CONTEXT
```

The pending/proposed identity contract remains pending. `LEGACY_JID_DERIVED` / observed phone identity must not be promoted to `CONFIRMED` by inference.

## 2. Git state and protected baseline

The Windows checkout was explicitly synchronized by SHA and remained on the target branch without detached HEAD.

Observed final synchronization state:

```text
BRANCH      = MVP2-implementandoQRCODE
HEAD        = bf22717e84a2efea46376ca14b08776abe372fe0
REMOTE HEAD = bf22717e84a2efea46376ca14b08776abe372fe0
MVP2        = 2aa27a93a8fe1f62ae64c3a5aec98809ae01a423
```

The worktree contained only an untracked `artifacts/` directory produced locally by quality-gate execution. It was preserved with `git stash` during synchronization and was not added to the target commits.

The final two commits of this validation correction were:

```text
8dc169d31fb12e477abe5f68239f577e402fce2b
fix: classify inbound WhatsApp media payloads correctly

bf22717e84a2efea46376ca14b08776abe372fe0
test: cover nested WhatsApp media classification
```

Immediately preceding closure commits included:

```text
de15b7492603768a3bfcc09bd857939ff24e2ded
fix: harden identity-safe auto-reply output

fe11c01ef73b1dd5ff99ef7a302162383522fdea
fix: make identity safety name extraction case-insensitive
```

## 3. Technical gates

The Windows checkout at `bf22717e84a2efea46376ca14b08776abe372fe0` executed all mandatory technical gates successfully:

```text
pnpm test       = PASS
pnpm qa:gates   = PASS
pnpm lint       = PASS
pnpm typecheck  = PASS
pnpm build      = PASS
```

The quality-gate manifest recorded `lint`, `typecheck`, `unit`, `integration`, `build`, `security` and `supply-chain` as `PASS` for `bf22717e84a2efea46376ca14b08776abe372fe0`.

The full test suite reached 106 gateway tests plus the other workspace tests with zero failures after the identity hardening correction and media-classification correction.

## 4. Assistant / IA

### Facts

The Gateway exposed a real persisted assistant configuration containing the required structured fields, including:

- assistant name
- business name
- role
- personality
- tone of voice
- language
- response format
- commercial rules
- delivery fee policy
- delivery instructions
- business hours
- behavior instructions
- limitations
- local LLM provider/model/base URL
- auto-reply enabled state

Observed runtime values included:

```text
provider = ollama
model = qwen2.5:14b-instruct
baseUrl = http://127.0.0.1:11434
autoReplyEnabled = true
```

The runtime also returned an assistant system prompt with `promptId = assistant.system`, `promptVersion = 1.2.0`, and a configuration version derived from the persisted configuration.

### Evidence-based status

`PARTIAL` for the complete acceptance criterion because the available evidence proves real persistence/consumption and runtime use, but the full required UI sequence of edit → save → application reload → persistence verification was not independently captured as a clean acceptance run in this round.

## 5. Products

### Facts

The existing `Product` entity was used as the source of truth. No parallel product table was introduced by the validation correction.

A real product was persisted and returned by the API with:

```text
name        = Produto QA KassisT
description = Produto criado para validação funcional
category    = QA
priceCents  = 1234
currency    = BRL
stock       = 7
available   = true
imageReference = real local filesystem reference
```

The runtime context later supplied the same product data to the auto-reply path. A real WhatsApp question about the product produced a response containing the persisted price `R$12,34` and stock `7`, demonstrating that catalog data reached the LLM context rather than being invented.

### Evidence-based status

`PARTIAL` as a complete acceptance bundle: real persistence and LLM consumption were demonstrated, but a single clean end-to-end create → edit → remove → reopen verification sequence was not captured in the final evidence set. Image reference persistence was proven; product-image sending was not.

## 6. Conversations / context / continuity

### Facts

The same WhatsApp LID conversation was reused across multiple real inbound/outbound exchanges. The context endpoint returned a stable `Conversation` record and persisted message history, current state, available products, business context, relevant memories and active order.

Observed real conversation evidence included:

```text
Conversation id = 6dfa1e85-2b2f-4cce-b38a-97671fe57bc0
externalThreadId = 246973638648023@lid
ownership = AI
aiState = ACTIVE
```

A second message referring to prior context received a response based on persisted history. Product price follow-up also resolved against the persisted product in the same conversation.

Message idempotency was covered by the existing tests, including duplicate message IDs and persistence across transport restart scenarios.

### Identity boundary

The runtime reported `OBSERVED_PHONE_IDENTITY` for the real test conversation. The context explicitly exposed a non-confirmed binding status. Unit tests verified that unverified customer identity fields are excluded from the LLM context and that identity-safety instructions are present.

During validation, the historical conversation contained conflicting self-reported names and previous assistant outputs containing different names. This was a concrete finding: sanitizing only the stored customer name is insufficient because the model can otherwise repeat a name found in history.

The fix therefore added runtime identity-safety instructions and output sanitization for unverified names. The direct tests now verify:

```text
unverified customer identity fields are omitted from LLM context
identity-safety policy is explicit
unverified names are removed from outbound generated text
confirmed names remain available when identity is confirmed
```

### Evidence-based status

`PASS` for the validated conversation/context continuity and identity-safety behaviors demonstrated by the real runtime and tests.

The canonical Identity/Binding/Memory domain remains outside this Change Unit and is not considered completed.

## 7. Conversation Analysis

The existing conversation-analysis implementation and tests now cover:

- inbound-only extraction
- provenance
- `source_message_id`
- candidate fields including product mentions and order information
- preservation of conflicting candidates
- supported wording for explicit city extraction
- avoidance of arbitrary text being promoted to city evidence

The suite passed these scenarios.

A complete real-conversation functional acceptance run proving every requested candidate field, confidence and conflict behavior against a freshly generated local dataset was not captured separately from the existing tests.

**Status:** `PARTIAL`.

## 8. Local LLM

Ollama was available and real at:

```text
http://127.0.0.1:11434
```

Installed models observed included:

```text
qwen2.5:14b-instruct
qwen2.5vl:7b
qwen2.5-coder:7b-instruct
nomic-embed-text:latest
```

A direct real `POST /api/chat` call to Ollama using `qwen2.5:14b-instruct` returned:

```text
OLLAMA_REAL_OK
```

The Gateway also reported real local auto-reply using the persisted Ollama configuration, and real WhatsApp inbound questions generated real outbound replies.

**Status:** `PASS` for real local Ollama execution and consumption by the runtime.

## 9. Auto-Reply

The real Windows runtime reached:

```text
Gateway 3210 = active
Desktop persistence 3211 = active
WhatsApp = CONNECTED
Auto-reply = ENABLED
Model = qwen2.5:14b-instruct
```

Real inbound WhatsApp messages triggered real persisted outbound responses.

The identity-safe hardening was validated after a regression was initially found: the sanitizer failed to remove `Carlos` from a generated response. The implementation was corrected for case-insensitive extraction and the resulting identity test passed.

The real responses were also shown to consume persisted product data. For example, the question about `Produto QA KassisT` produced the stored price and stock values.

**Status:** `PASS` for the demonstrated text auto-reply path.

## 10. Image / visual multimodality

### Defect found and fixed

The real Baileys payload nests media under `message.message`. The classifier previously inspected the wrong level and therefore treated real images as `TEXT`.

The correction normalizes the nested payload before classification. A dedicated test suite was added for nested `AUDIO`, `IMAGE`, `VIDEO` and `DOCUMENT` payloads.

The dedicated media-classification tests passed 5/5.

### Real functional evidence

After the classifier fix and a clean Gateway runtime configured with:

```text
KASSIST_LLM_VISION_MODEL=qwen2.5vl:7b
```

a real WhatsApp image was persisted as:

```text
message_type = IMAGE
media_status = COMPLETED
media_error = null
```

The persisted `text` field contained an actual visual interpretation. A subsequent real user question about the image produced a real outbound assistant response based on the interpretation.

This is the required evidence chain:

```text
WhatsApp image
→ IMAGE classification
→ visual processing
→ persisted interpretation
→ context availability
→ LLM response
→ outbound message
```

**Status:** `PASS` for the demonstrated image flow.

## 11. Audio

The audio adapter exists and is designed to use a local Whisper command. The runtime supports configuration through:

```text
KASSIST_WHISPER_COMMAND
KASSIST_WHISPER_MODEL
KASSIST_WHISPER_TIMEOUT_MS
```

The Windows environment was checked directly and showed:

```text
whisper executable = not found in PATH
openai-whisper Python package = not installed
Python = 3.10.6
```

Therefore a real end-to-end audio transcription could not be executed.

This is an environmental blocker, not evidence that the adapter itself is absent.

**Status:** `BLOCKED`.

**Do not claim PASS for audio.** A real provider installation/configuration followed by a real WhatsApp audio test is still required.

## 12. CSV Dispatch

The repository contains parser/dispatch implementation and unit/integration coverage for important safety boundaries, including:

- CSV validation
- recipient normalization
- duplicate detection
- DRAFT/preview behavior
- explicit confirmation before queueing
- durable batch state
- recipient identity preservation across retry
- no automatic promotion of unknown outcomes to success
- cancellation safety
- restart/idempotency behavior
- per-recipient terminal status semantics

These tests passed in the technical suite.

However, no final local functional run was captured that independently demonstrated:

```text
real CSV
→ preview
→ human confirmation
→ batch
→ queue
→ controlled real send
→ persisted per-recipient result
```

**Status:** `PARTIAL` / not functionally closed.

## 13. Manual Dispatch

The dispatch pipeline contains confirmation and queue semantics shared with the controlled-send machinery, and the technical suite covers confirmation, queueing, retry and terminal-result behavior.

No final local functional run was captured that independently demonstrated:

```text
manual recipient
→ validation
→ preview
→ explicit confirmation
→ batch/queue
→ controlled real send
→ persisted result
```

**Status:** `PARTIAL` / not functionally closed.

## 14. Runtime preparation findings

The Windows environment repeatedly exposed stale KassisT Gateway processes holding port `3210`. These were identified by executable and command line as:

```text
node.exe ... node src/main.mjs
```

Only processes positively identified as the KassisT Gateway were terminated during validation. Unknown processes were not killed merely because they occupied the port.

Once stale instances were removed, a clean runtime could start with the intended environment and demonstrate the real image path.

## 15. Stable architectural decisions confirmed by validation

1. `Message` remains the canonical persisted history source.
2. `Conversation` remains distinct from `Message` and `Customer`.
3. `Customer` remains distinct from technical channel identity.
4. The runtime, not the LLM, assembles customer/conversation/business context.
5. Product price, stock and availability are runtime/persistence facts.
6. LLM prompts must not contain technical secrets or raw WhatsApp authentication state.
7. Unverified names from history, push name, message text or inference are not confirmed Customer identity.
8. Local LLM execution is performed through loopback Ollama.
9. Multimodal processing belongs to the Gateway/runtime path, not the Renderer.
10. Real runtime validation is sensitive to stale local processes; port ownership must be checked by process identity, not port number alone.
11. The Baileys media event shape must be normalized from `message.message` before classification.

## 16. Remaining gaps required by the original acceptance criteria

The Change Unit cannot be marked `DONE` yet because the following mandatory criteria remain unresolved:

### Audio

`BLOCKED`: local Whisper provider is not installed/configured in the Windows environment.

### CSV Dispatch

`NOT_TESTED` / `PARTIAL`: no final controlled real local send with a real small CSV and persisted recipient result was captured.

### Manual Dispatch

`NOT_TESTED` / `PARTIAL`: no final controlled real local send with manually entered test recipient and persisted result was captured.

### Assistant configuration UI acceptance

`PARTIAL`: runtime persistence and consumption were proven, but the complete UI edit → save → reload acceptance sequence was not independently captured in this final evidence set.

### Products complete CRUD acceptance

`PARTIAL`: real persistence and runtime consumption were proven, but the final clean create → edit → remove → reopen sequence was not captured as a single acceptance run.

### Conversation Analysis functional acceptance

`PARTIAL`: contract/unit behavior is covered and passing, but the requested complete real conversation analysis scenario was not separately executed as a final local functional test.

### Canonical Identity/Binding/Memory

`OUT OF SCOPE / DECISION PENDING`: the proposed contract remains pending. `LEGACY_JID_DERIVED` and observed identity statuses must not be promoted to `CONFIRMED`.

### Knowledge publication

This document is the formal persistent record created in the repository's `KNOWLEDGE/decisions/` area for the 2026-08-28 validation findings. It intentionally records partial and blocked items rather than hiding them.

## 17. Final status

```text
ASSISTANT_AI            = PARTIAL
PRODUCTS                = PARTIAL
CONVERSATIONS           = PASS
CONTEXT_CONTINUITY      = PASS
IDENTITY_SAFETY         = PASS
CONVERSATION_ANALYSIS   = PARTIAL
LLM_LOCAL               = PASS
AUTO_REPLY              = PASS
IMAGE                   = PASS
AUDIO                   = BLOCKED
CSV_DISPATCH            = PARTIAL / NOT_TESTED FUNCTIONALLY
MANUAL_DISPATCH         = PARTIAL / NOT_TESTED FUNCTIONALLY

PNPM_TEST               = PASS
QA_GATES                = PASS
LINT                    = PASS
TYPECHECK               = PASS
BUILD                   = PASS

MVP2_MODIFIED           = NO
DETACHED_HEAD           = NO

CHANGE_UNIT_DONE        = NO
```

## 18. Next closure actions

Only the following actions remain appropriate to this Change Unit:

1. provide/install/configure an authorized local Whisper provider and execute a real audio test;
2. execute one controlled CSV dispatch end-to-end;
3. execute one controlled manual dispatch end-to-end;
4. optionally capture a clean UI-based assistant configuration edit/save/reload run if that evidence is required for the acceptance record;
5. capture the final Git audit and keep the untracked local `artifacts/` out of commits.

No new Identity/Binding/Memory domain should be introduced as part of these closure actions.
