# AG-ENG-01 — Implementation Task Packet v1.0

**Agent:** `AG-ENG-01`
**Technical territories:** primarily `IA-07 — Gateway + WSS`; coordinate with IA-03, IA-06 and IA-08 only where contracts cross boundaries.
**Implementation state:** AUTHORIZED for P0-001 only in the first wave.

## Mission
Implement the approved Gateway/WSS runtime path without moving business authority into transport code.

## P0-001 — WSS Runtime Transport

**Allowed paths**
- `gateway/**`
- directly associated IA-07 tests

**Protected paths**
- `packages/contracts/**`
- `docs/**`
- `gateway/src/device-auth/**`
- `.github/**`
- shared/root configuration

**Dependencies**
- `WSS-V1` frozen
- `WSS-RUNTIME-V1` frozen
- device-auth/enrollment contract
- Inbox/Outbox contract
- current Gateway entry points verified

**Required behavior**
- replace `attachWssTransport() -> not_implemented`
- bind WSS lifecycle to the approved Gateway lifecycle
- enforce device-auth boundary
- validate WSS envelope/message types
- deterministic ACK/correlation/causation
- deterministic duplicate/idempotency behavior
- reconnect/resume according to WSS-RUNTIME-V1
- explicit protocol errors
- no direct business-state mutation from transport

**Required tests**
- WSS unit
- handshake/auth boundary
- envelope validation
- ACK/correlation
- reconnect/resume
- duplicate/idempotency
- Gateway/WSS integration
- failure paths

**Evidence**
- starting branch/SHA
- changed paths
- test output
- typecheck/lint/build where applicable
- runtime attach/listen evidence
- negative-path evidence
- unresolved risks

## Coordination rules

- IA-03 owns event/Inbox/Outbox semantics.
- IA-06 owns device authentication/enrollment semantics.
- IA-08 owns Desktop-side integration evidence.
- AG-ENG-01 must not rewrite their contracts unilaterally.
- Shared changes require explicit authorization before modification.

## Handoff
Deliver to `AG-QAOPS-01` for P0-005 verification.

## Forbidden
- merge
- release
- governance changes
- silent cross-territory ownership
- weakening WSS security or idempotency semantics
