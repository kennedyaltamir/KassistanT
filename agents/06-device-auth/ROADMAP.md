# IA-06 Roadmap — Device Authentication

This roadmap covers only the IA-06 territory and records readiness, not delivery dates.

## Phase A — Territory Definition
**Status:** DONE

Identity, scope, ownership, memory, learnings, decisions, errors, progress, roadmap and handoff are established.

## Phase B — Contract Readiness Audit
**Status:** DONE

Audited device identity, enrollment, provisioning, authentication, challenge-response, Ed25519 boundary, Secure Storage, session identity, revoke, rotate, status, authorization, rate limiting, idempotency, errors, audit, events and cross-agent integration.

## Phase C — Contract Closure
**Status:** BLOCKED / PROJECT AUTHORITY

Required:

- complete enrollment request/response schemas;
- endpoint authn/authz and status matrix;
- endpoint idempotency semantics;
- numerical rate-limit policies;
- complete authentication/session semantics;
- complete rotation lifecycle;
- sufficient device error taxonomy;
- sufficient audit/event semantics.

## Phase D — Cross-agent Interface Agreement
**Status:** NOT_STARTED

Stabilize interfaces with IA-01, IA-02, IA-03, IA-07 and IA-08, without crossing ownership.

## Phase E — Runtime Implementation
**Status:** BLOCKED

Future scope: secure key lifecycle, enrollment, Ed25519 proof-of-possession, challenge-response, session identity, revocation, rotation, authorization enforcement, rate limiting, audit integration and tests.

## Phase F — Validation and Integration
**Status:** NOT_STARTED

Future gates: unit/integration/security/contract tests, CI on actual PR HEAD, cross-agent validation, human review, approved merge and post-merge audit.

## Current readiness artifacts

- `DEVICE-AUTH-READINESS.md`
- `DEVICE-ENROLLMENT-MATRIX.md`
- `DEVICE-AUTH-MATRIX.md`
- `DEVICE-LIFECYCLE-MATRIX.md`
- `DEVICE-AUTHORIZATION-MATRIX.md`
- `DEVICE-ERROR-MATRIX.md`
- `DEVICE-CRYPTO-SECURITY.md`
- `DEVICE-DEPENDENCIES.md`
- `IMPLEMENTATION-GATES.md`

## External dependency

Windows Secure Storage behavior must be validated on the supported Windows environment when runtime implementation begins. No external configuration is executed by IA-06 in this phase.
