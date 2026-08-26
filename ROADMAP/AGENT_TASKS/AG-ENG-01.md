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

### Allowed paths
- IA-03-owned Inbox/Outbox/runtime integration paths only
- IA-03 tests

### Protected paths
- `gateway/**` outside explicitly approved integration boundary
- `packages/contracts/**`
- frozen protocol docs
- unrelated territories
- shared/root config unless explicitly authorized

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
- IA-07 consumer contract.

### Handoff
`P0-001B → AG-QAOPS-01` and `P0-001`.

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
- Missing dependency = `BLOCKED / IMPLEMENTATION_DEPENDENCY_GAP`.

## Handoff

P0-001A/P0-001B → `AG-QAOPS-01` → P0-001 → `AG-QAOPS-01` / P0-005.

## Forbidden

- merge;
- release;
- governance changes;
- silent cross-territory ownership;
- weakening WSS security or idempotency semantics;
- silent baseline/ref changes.
