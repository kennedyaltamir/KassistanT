# IA-07 WSS Integration Gate Package

Status: INTEGRATION GATE / WSS RUNTIME BLOCKED
Date: 2026-08-24

## Objective

Replace vague dependencies such as “await IA-06” and “await IA-03” with concrete, testable release gates for WSS connection lifecycle implementation.

## Gate matrix

| GATE_ID | OWNER_AGENT | REQUIRED_INPUT | REQUIRED_OUTPUT | EXACT_INTERFACE | EVIDENCE_REQUIRED | TEST_REQUIRED | BLOCKING_LEVEL | CURRENT_STATUS | ACCEPTANCE_CRITERIA |
|---|---|---|---|---|---|---|---|---|---|
| IA06-AUTH-001 | IA-06 | Successful Ed25519 verification | Authenticated device/session result | Testable success/failure boundary exposing required session identity fields | Approved contract + executable runtime/interface + security evidence | AUTH_OK/AUTH_FAILED tests | CRITICAL | BLOCKED | IA-07 can consume authenticated identity without implementing crypto |
| IA06-REV-001 | IA-06 | Authoritative device revocation | Revocation signal | Defined signal carrying authoritative device/session identity and transport effect | Contract + runtime evidence | repeated revocation/idempotent termination tests | HIGH | BLOCKED | IA-07 can react without deciding revocation state |
| IA06-REAUTH-001 | IA-06 | Reconnect attempt | Reauthentication/session reuse decision | Defined reconnect rule: fresh auth, reusable session, or explicit alternative | Contract + tests | reconnect/expired/revoked tests | HIGH | BLOCKED | Connection lifecycle can deterministically establish session state |
| IA03-INTAKE-001 | IA-03 | Validated WSS inbound event | Durable persistence result | Testable intake result: persisted / duplicate / failure | Contract + runtime evidence | persistence, duplicate, failure tests | CRITICAL | BLOCKED | ACK decision is deterministic and delegated to IA-03 |
| IA03-ACK-001 | IA-03 | Durable intake result | ACK authorization | Explicit success/failure/duplicate semantics for ACK | Contract + runtime evidence | persistence-before-ACK tests | CRITICAL | BLOCKED | IA-07 emits ACK only on authorized result |
| IA03-REPLAY-001 | IA-03 | Resume/replay request | Ordered recovery result | Defined request/response + retention/sequence semantics | Contract + runtime evidence | replay/resume/gap tests | HIGH | BLOCKED | IA-07 can transport recovery without owning durable state |
| SEQ-001 | IA-03 + global contract | Event/device/store identity | Authoritative sequence behavior | Producer, persistence owner, duplicate/gap behavior and replay interaction | Contract decision + tests | duplicate/gap/reconnect tests | HIGH | BLOCKED | Sequence use is deterministic and non-invented |
| BP-001 | IA-03 + IA-07 | Queue pressure | Pressure state/action | Conceptual states and ownership split; numeric policy when required | Contract + capacity tests | pressure/disconnect/drop policy tests | HIGH | BLOCKED | Runtime does not invent queue thresholds |
| ERR-001 | Global contract / owner-specific runtime | Runtime failure | Mapped transport/session effect | Existing error envelope plus owner-specific semantics | Contract registry + tests | error mapping tests | HIGH | PARTIAL | No new global error codes are invented |

## V1 release gate

IA-07 may begin WSS connection lifecycle implementation only when all of the following are satisfied:

1. IA-06 authenticated session interface is executable and versioned/approved.
2. IA-06 revocation signal is executable and its effect on a WSS session is explicit.
3. Reconnect and reauthentication semantics are explicit.
4. IA-03 durable intake boundary is executable.
5. ACK authorization is executable and preserves persistence-before-ACK.
6. The selected V1 recovery scope is explicit: either replay/resume is ready or recovery is formally deferred with an agreed boundary.
7. Sequence ownership and duplicate/gap behavior are explicit for the selected slice.
8. Minimum backpressure behavior is explicit without invented numeric limits.
9. Error-to-connection/session effects are testable using the existing error envelope.
10. Deterministic tests can be written for the selected lifecycle slice.

## Dependency status

`WSS_RUNTIME_READINESS = BLOCKED`.

The current repository provides contractual concepts, not executable interfaces, for the two critical external boundaries. fileciteturn95file0turn100file0turn101file0
