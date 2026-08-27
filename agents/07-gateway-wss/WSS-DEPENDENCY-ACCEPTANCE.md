# IA-07 — WSS Dependency Acceptance Matrix

Status: DEFINITION / CURRENTLY NOT ACCEPTED
Date: 2026-08-24

## Result semantics

- `ACCEPTED`: all mandatory gates for the next approved WSS slice have repository-verifiable evidence and deterministic tests.
- `ACCEPTED_WITH_GAPS`: the dependency is usable for a narrowly defined slice, while non-required future semantics remain explicitly deferred.
- `REJECTED`: supplied material contradicts an authoritative contract, violates ownership, or is missing a mandatory safety invariant.
- `NOT_VERIFIED`: evidence is insufficient to decide acceptance without inference.

## IA-06 acceptance

| Dependency | Gate | Required Evidence | Current Status | Acceptance Criteria | Blocking Impact | Owner | Last Verified | Result |
|---|---|---|---|---|---|---|---|---|
| IA-06 | IA06-SESSION | Executable/testable authenticated-session interface; authenticated device identity; `device_id`; `store_id` when applicable; `session_id` if contract requires it; auth result; lifecycle/invalidation/expiry semantics | Session identity exists conceptually, but exact executable fields/lifecycle are not closed | A consuming IA-07 test can receive an authenticated identity and deterministically distinguish active, expired and invalid session states without reimplementing cryptographic verification | Blocks authenticated WSS lifecycle | IA-06 | 2026-08-24 | NOT_VERIFIED |
| IA-06 | IA06-REVOCATION | Executable/testable revocation signal with source, device identity, revocation state, timing, repeated-signal behavior, correlation and authorization evidence | `DEVICE_REVOKED` and session termination are documented; consumable signal contract is not executable | IA-07 can deterministically map a valid revocation signal to connection/session termination; duplicate signals are safe | Blocks revocation handling | IA-06 | 2026-08-24 | NOT_VERIFIED |
| IA-06 | IA06-REAUTH | Explicit reconnect rule: reauth required/not required; session reuse/new session; expiry; failure semantics | Not defined sufficiently | A reconnect test can determine whether IA-07 accepts existing session identity or must receive a fresh authenticated-session result | Blocks reconnect lifecycle | IA-06 | 2026-08-24 | NOT_VERIFIED |
| IA-06 | IA06-ERRORS | Distinguishable authentication failure, authorization failure, revocation and invalid-session outcomes using existing/global error semantics | Partial | IA-07 can map each outcome to transport behavior without creating new global error codes | Blocks deterministic error behavior | IA-06 + global authority | 2026-08-24 | NOT_VERIFIED |

## IA-03 acceptance

| Dependency | Gate | Required Evidence | Current Status | Acceptance Criteria | Blocking Impact | Owner | Last Verified | Result |
|---|---|---|---|---|---|---|---|---|
| IA-03 | IA03-DURABLE-INTAKE | Executable/testable inbound-intake interface with persist, duplicate and failure outcomes | Contractual only; runtime not implemented | IA-07 can submit a validated inbound event and observe persisted/duplicate/failure deterministically | Blocks receive→persist boundary | IA-03 | 2026-08-24 | NOT_VERIFIED |
| IA-03 | IA03-ACK | Explicit persistence-before-ACK rule, duplicate behavior, persistence failure behavior and observable success/failure signal | Semantics explicit; executable boundary absent | IA-07 can emit ACK only after IA-03 reports the required durable outcome; duplicate behavior is explicit; persistence failure produces no ACK | Blocks ACK | IA-03 | 2026-08-24 | NOT_VERIFIED |
| IA-03 | IA03-SEQUENCE | Sequence owner, persistence, duplicate handling, gap handling and replay interaction | Monotonic per `(store_id, device_id)` documented; durable semantics partial | First WSS slice has an explicit owner and deterministic tests for sequence/duplicate/gap behavior | Blocks ordered lifecycle/recovery | IA-03 + global authority | 2026-08-24 | NOT_VERIFIED |
| IA-03 | IA03-REPLAY | For selected V1 slice, replay is `REQUIRED`, `DEFERRED` or `NOT_REQUIRED`; if required, source/request/response/authorization/sequence/error are defined | Replay concept exists; retention/recovery details partial | Runtime slice cannot accidentally depend on unspecified replay. If deferred, the lifecycle contract explicitly excludes resume/replay behavior | Blocks only if the selected slice requires replay | IA-03 + global authority | 2026-08-24 | NOT_VERIFIED |

## Acceptance rule

IA-06 may be `ACCEPTED` only when the mandatory IA06 gates required by the first WSS slice are accepted. IA-03 may be `ACCEPTED` only when durable intake and ACK are executable and testable. A future slice may use `ACCEPTED_WITH_GAPS` only when every omitted gap is explicitly classified as deferred and is not required by that slice.

## Evidence packet for future revalidation

When IA-06 or IA-03 delivers a new revision:

1. Record the exact branch and commit SHA.
2. Read only the gate artifacts named by the acceptance package.
3. Compare each artifact against this matrix's acceptance criteria.
4. Record one result per gate.
5. Do not repeat the global architecture audit unless evidence conflicts with an authoritative source.
6. Do not modify runtime as part of dependency acceptance.

## First WSS slice evaluation

Candidates evaluated by minimum dependency surface:

| Candidate | Additional dependencies | Tests required | Risk | Current readiness |
|---|---|---|---|---|
| Connection lifecycle only | IA-06 session + reauth boundary; no durable intake path | connect/auth state/disconnect/error tests | session duplication if boundary is underspecified | BLOCKED |
| Authenticated connect + disconnect | IA-06 session + revocation + reauth boundary | auth success/failure, revoke, reconnect tests | cryptographic/session overlap | BLOCKED |
| Lifecycle without replay | IA-06 session/reconnect + IA-07 transport; explicitly defer replay | lifecycle and deferred-capability tests | medium; requires explicit protocol deferral | BLOCKED |
| Lifecycle with durable intake | IA-06 + IA-03 intake/ACK + sequence | persistence-before-ACK, duplicate/failure tests | highest dependency surface | BLOCKED |

Current proposed first slice: `connection lifecycle without replay`, but it remains `BLOCKED` until IA-06 session/reauthentication and IA-03 boundary evidence are accepted and the replay deferral is explicit in the selected runtime contract.

## External configuration (identification only)

TLS, DNS, public WSS endpoint, hosting/deployment and GitHub Secrets remain future external dependencies. No configuration is executed by this gate.
