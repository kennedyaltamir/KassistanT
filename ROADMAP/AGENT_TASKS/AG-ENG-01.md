# AG-ENG-01 — Implementation Task Packet v1.1

**Agent:** `AG-ENG-01`  
**Technical territories:** primarily `IA-07 — Gateway + WSS`; operationally delegated per D-009 to execute `P0-001A` in `IA-06` and `P0-001B` in `IA-03` without merging technical ownership.  
**Implementation state:** AUTHORIZED for P0-001A/P0-001B/P0-001 according to dependency gates.

## Baseline requirement

- **Baseline ref:** `MVP2`.
- **Before every task:** record exact `BASELINE_SHA_AT_START`, task branch and task ID.
- `main` is reference-only unless a task explicitly authorizes it.
- Never switch refs silently.
- If the baseline policy or authoritative task packet is unavailable on the selected ref, report `BASELINE_MISMATCH` and stop before editing.

## P0-001A — Device Authentication Runtime

**Issue:** #54  
**Technical territory:** `IA-06 — Device Authentication`  
**Operational owner:** `AG-ENG-01` by D-009 delegation.

### Allowed paths
- IA-06-owned device-auth/runtime paths only
- IA-06 tests

### Protected paths
- `gateway/src/device-auth/**` outside the IA-06 task boundary
- `packages/contracts/**`
- frozen protocol docs
- unrelated territories
- shared/root config unless explicitly authorized

### Required behavior
- deterministic enrollment/authentication lifecycle;
- explicit authenticated identity/session context for WSS consumers;
- fail-closed authentication errors;
- no business authorization inside authentication;
- no secret leakage;
- consumer boundary usable by IA-07 without transferring IA-06 ownership.

### Required tests
- success;
- invalid/expired credentials;
- replay/duplicate;
- unauthorized device;
- timeout/error;
- secret leakage;
- IA-07 consumer contract.

### Handoff
`P0-001A → AG-QAOPS-01` and `P0-001`.

## P0-001B — Inbox/Outbox Runtime Integration

**Issue:** #55  
**Technical territory:** `IA-03 — Inbox/Outbox / Event Integration`  
**Operational owner:** `AG-ENG-01` by D-009 delegation.

**Contract prerequisite:** `D-010` approved by Kennedy Altamir + Esdras Ribeiro on `2026-08-25 23:11:44 America/Sao_Paulo (UTC−03:00)`. `INBOX-V1` and `OUTBOX-V1` are frozen; `CONTRACT-001` is resolved.

### Allowed paths
- IA-03-owned Inbox/Outbox/runtime integration paths only
- IA-03 tests

### Protected paths
- `gateway/**` outside explicitly approved integration boundary
- `packages/contracts/**`
- frozen protocol docs
- unrelated territories
- shared/root config unless explicitly authorized
- IA-01 schema/migration paths except via a separately authorized integration boundary

### Canonical boundary

`IA-03` owns Inbox/Outbox event/runtime semantics. `IA-01` owns SQLite schema and migrations. The IA-03 ↔ IA-01 interface is explicit, versioned and independent of SQLite.

The interface must not expose SQL, table names, SQLite internals, migration numbers or physical storage details.

Canonical semantic operations:

`accept_inbound`, `deduplicate`, `retrieve_pending`, `stage_outbound`, `mark_processing`, `mark_delivered`, `record_retry`, `record_failure`, `recover_pending`.

### Inbox semantics

- identity: `(provider, external_event_id)`;
- durable acceptance before processing;
- idempotent acceptance;
- deterministic state;
- correlation/causation preserved;
- restart recovery;
- ACK only after the durability required by the contract.

### Outbox semantics

- identity: `idempotency_key`;
- represents an externally visible effect committed after the internal operation is accepted;
- canonical states: `PENDING`, `PROCESSING`, `DELIVERED`, `RETRY_WAIT`, `FAILED_TERMINAL`;
- deterministic lifecycle transitions;
- duplicate logical identities cannot create a second logical effect;
- no physical DLQ in P0-001B.

### Retry / recovery

Retry and recovery semantics belong to IA-03. Persistence stores attempts, state, timestamps and failure metadata. Implement bounded retry, deterministic backoff, terminal failure classification and restart recovery without moving business authority into persistence or transport.

### Required behavior
- durable inbound acceptance where required;
- durable outbound staging where required;
- deterministic idempotency/deduplication;
- correlation/causation preservation;
- explicit retry/failure semantics;
- transport does not become business authority;
- consumer boundary usable by IA-07 without transferring IA-03 ownership.

### Required tests
- inbound/outbound persistence;
- duplicate/idempotency;
- correlation/causation;
- retry/failure;
- persistence failure;
- restart recovery where supported;
- state-transition coverage;
- IA-07 consumer contract.

### Handoff
`P0-001B → AG-QAOPS-01` and `P0-001`.

### Gate

`CONTRACT_FROZEN → IMPLEMENTED → TESTED → VERIFIED → READY_FOR_REVIEW`.

`READY_FOR_REVIEW` does not mean `APPROVED` or `RELEASED`.

## P0-001 — WSS Runtime Transport

**Issue:** #43  
**Technical territory:** `IA-07 — Gateway + WSS`.

### Dependencies
P0-001 MUST NOT proceed to final verification until:

1. P0-001A reaches at least `READY_FOR_REVIEW` with evidence.
2. P0-001B reaches at least `READY_FOR_REVIEW` with evidence.
3. `WSS-V1` and `WSS-RUNTIME-V1` remain frozen.

### Allowed paths
- `gateway/**`
- directly associated IA-07 tests

### Protected paths
- `packages/contracts/**`
- `docs/**`
- IA-03 and IA-06 owned implementation paths
- `.github/**`
- shared/root configuration

### Required behavior
- replace `attachWssTransport() -> not_implemented`;
- bind WSS lifecycle to approved Gateway lifecycle;
- enforce device-auth boundary;
- validate WSS envelope/message types;
- deterministic ACK/correlation/causation;
- deterministic duplicate/idempotency behavior;
- reconnect/resume per WSS-RUNTIME-V1;
- explicit protocol errors;
- no direct business-state mutation from transport.

### Required tests
- WSS unit;
- handshake/auth boundary;
- envelope validation;
- ACK/correlation;
- reconnect/resume;
- duplicate/idempotency;
- Gateway/WSS integration;
- failure paths.

### Evidence
Every delivery must include:

- baseline ref;
- starting SHA;
- dependency SHAs/branches;
- task branch;
- changed paths;
- final SHA;
- test/build/typecheck/lint results where applicable;
- runtime and negative-path evidence;
- unresolved risks.

## Coordination rules

- IA-03 owns event/Inbox/Outbox semantics.
- IA-06 owns device authentication/enrollment semantics.
- IA-08 owns Desktop-side integration evidence.
- `AG-ENG-01` must not rewrite their contracts unilaterally.
- D-009 is an operational delegation, not technical ownership transfer.
- D-010 is the closed contract prerequisite for P0-001B.
- Missing implementation dependency = `BLOCKED / IMPLEMENTATION_DEPENDENCY_GAP`.

## Handoff

P0-001A/P0-001B → `AG-QAOPS-01` → P0-001 → `AG-QAOPS-01` / P0-005.

## Forbidden

- merge;
- release;
- governance changes outside explicitly authorized canonicalization work;
- silent cross-territory ownership;
- weakening WSS security or idempotency semantics;
- silent baseline/ref changes.
