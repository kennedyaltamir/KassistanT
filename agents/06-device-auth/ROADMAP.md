# IA-06 Roadmap — Device Authentication

This roadmap covers only the IA-06 territory and records readiness, not delivery dates.

## Phase A — Territory Definition
**Status:** DONE

Identity, scope, ownership, memory, learnings, decisions, errors, progress, roadmap and handoff are established.

## Phase B — Contract Readiness Audit
**Status:** DONE

Audited device identity, enrollment, provisioning, authentication, challenge-response, Ed25519 boundary, Secure Storage, session identity, revoke, rotate, status, authorization, rate limiting, idempotency, errors, audit, events and cross-agent integration.

## Phase C — Stratified Contract Closure
**Status:** IN_PROGRESS / PROJECT AUTHORITY

Decision layers are intentionally independent:

1. Device identity semantics vs physical persistence.
2. Ed25519 primitive vs cryptographic wire contract.
3. Challenge/replay security vs session security.
4. Authorization vs authentication.
5. Rate limiting vs cryptographic correctness.
6. Endpoint idempotency vs protocol verification.
7. Rotation vs revocation.
8. Auditability vs secret handling.

Open project decisions remain DR-01..DR-08.

## Phase D — First-Slice Approval
**Status:** BLOCKED PENDING PROJECT AUTHORITY

The proposed first slice is `Signature Verification Boundary`.
It requires only the minimum DR-02 cryptographic subset and explicit implementation authorization.
It does not require unrelated enrollment/session/authorization/rate-limit/idempotency/rotation decisions.

## Phase E — Cross-agent Interface Agreement
**Status:** NOT_STARTED

Stabilize interfaces with IA-01, IA-02, IA-03, IA-07 and IA-08 without crossing ownership.

## Phase F — Runtime Implementation
**Status:** BLOCKED

Future scope: secure key lifecycle, enrollment, Ed25519 proof-of-possession, challenge-response, session identity, revocation, rotation, authorization enforcement, rate limiting, audit integration and tests.

## Phase G — Validation and Integration
**Status:** NOT_STARTED

Future gates: unit/integration/security/contract tests, CI on actual PR HEAD, cross-agent validation, human review, approved merge and post-merge audit.

## Current decision artifacts

- `DEVICE-AUTH-DECISION-PACKAGE.md`
- `DEVICE-AUTH-APPROVAL-REQUEST.md`
- `DEVICE-GLOBAL-DECISIONS.md`
- `DEVICE-FIRST-SLICE.md`
- `DEVICE-EXTERNAL-CONFIGURATION.md`
- `IMPLEMENTATION-GATES.md`

## Current evidence artifacts

- `DEVICE-AUTH-READINESS.md`
- `DEVICE-ENROLLMENT-MATRIX.md`
- `DEVICE-AUTH-MATRIX.md`
- `DEVICE-LIFECYCLE-MATRIX.md`
- `DEVICE-AUTHORIZATION-MATRIX.md`
- `DEVICE-ERROR-MATRIX.md`
- `DEVICE-CRYPTO-SECURITY.md`
- `DEVICE-DEPENDENCIES.md`

## External dependency

Windows Secure Storage behavior must be validated on the supported Windows environment when runtime implementation begins. No external configuration is executed by IA-06 in this phase.
