# IA-06 Roadmap — Device Authentication

This roadmap covers only the IA-06 territory. It does not redefine the global KassisT roadmap.

## Phase A — Territory Definition

**Status:** DONE

- Establish agent identity and mission.
- Define scope and boundaries.
- Define future ownership paths.
- Record permanent facts.
- Record audit learnings, decisions, errors and current progress.

## Phase B — Contract Closure

**Status:** BLOCKED / DEPENDENT ON PROJECT AUTHORITY

Required before production implementation:

- Complete enrollment request/response schemas.
- Complete endpoint status-code semantics.
- Complete enrollment authorization matrix.
- Complete endpoint idempotency semantics.
- Define numerical rate-limit policies.
- Define any missing key-rotation and session-lifecycle details without contradicting the baseline.

IA-06 must not silently close these gaps.

## Phase C — Cross-agent Interface Agreement

**Status:** NOT_STARTED

Dependencies to stabilize:

- IA-01: canonical Device/Store persistence schema.
- IA-02: domain validation and identity conventions.
- IA-03: audit/event semantics that intersect authentication.
- IA-07: HTTP/WSS integration boundary, transport identity and revocation signaling.
- IA-08: UI requirements for enrollment/status without exposing secrets.

## Phase D — Runtime Implementation

**Status:** NOT_STARTED

Future scope, only after authorization:

- secure key lifecycle;
- enrollment flow;
- Ed25519 proof-of-possession;
- challenge-response authentication;
- session identity;
- revocation;
- rotation;
- authorization enforcement at the device boundary;
- rate limiting;
- audit integration;
- automated security and contract tests.

## Phase E — Validation and Integration

**Status:** NOT_STARTED

Future gates:

- unit and integration tests;
- negative/security tests;
- contract validation;
- actual CI validation on PR HEAD;
- cross-agent integration validation;
- human review;
- approved merge;
- post-merge verification.

## External dependencies

Windows Secure Storage behavior must be validated against the supported Windows environment when runtime implementation begins. No external configuration is executed during this phase.
