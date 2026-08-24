# IA-06 Implementation Gates

Status: STRATIFIED CONTRACT REVIEW; implementation remains frozen.

## Gate 0 — Repository / territory

- Branch is `Agent06-device-authentication`.
- Only `agents/06-device-auth/**` may change in this phase.
- No product runtime changes are permitted.

Status: READY.

## Gate 1 — Device identity semantics

Logical device identity, Store binding and public-key association must be sufficiently defined for the target slice.

Physical schema/migrations remain IA-01 responsibility.

Status: PARTIAL.

## Gate 2 — Cryptographic primitive

Ed25519 as the verification primitive and public/private trust boundary are already normative.

Status: READY.

## Gate 3 — Minimum cryptographic wire contract

For the Signature Verification Boundary only, approve:

- signed bytes;
- public-key representation;
- signature representation;
- challenge/context binding;
- deterministic valid/invalid verifier result;
- minimum freshness/replay requirement relevant to the signed input.

This gate does not require session TTL, authorization, rate limits, endpoint idempotency or rotation closure.

Status: BLOCKED pending minimum DR-02 subset.

## Gate 4 — Replay security

Full challenge lifecycle, reuse rejection and operational replay handling.

Status: BLOCKED / DR-02.

## Gate 5 — Session security

Session identity, expiration/renewal, reconnect/resume, reauthentication and revocation invalidation.

Status: BLOCKED / DR-03.

## Gate 6 — Authorization

Endpoint/action/resource/condition matrix and failure semantics.

Status: BLOCKED / DR-04.

## Gate 7 — Rate limiting

Applicable operations and approved numeric policy.

Status: BLOCKED / DR-05.

## Gate 8 — Endpoint idempotency

Operation-specific key/scope, duplicate/conflict behavior, persistence and retention/replay semantics.

Status: BLOCKED / DR-06.

## Gate 9 — Rotation

Old/new key lifecycle, overlap, rollback, revocation ordering and session continuity.

Status: BLOCKED / DR-07.

## Gate 10 — Error model

Device-auth error identifiers, retryability, client-visible semantics and HTTP mapping.

Status: BLOCKED / DR-08.

## Gate 11 — Secure Storage

Logical boundary is defined. Concrete Windows mechanism and supported-runtime validation are separate external/implementation gates.

Status: PARTIAL / EXTERNAL.

## Gate 12 — Auditability

Minimum security-event audit contract must be explicit for:

- enrollment attempt/result;
- authentication success/failure;
- replay rejection;
- authorization denial;
- rate-limit decision;
- revocation;
- rotation;
- session termination.

Private keys, pairing codes and secret material must not be logged.

IA-03 owns durable audit/event infrastructure.

Status: PARTIAL / CROSS_AGENT.

## Gate 13 — Gateway/WSS boundary

Device-auth payload/session behavior and the ownership interface with IA-07 must be stable before transport integration.

Status: PARTIAL / CROSS_AGENT.

## Gate 14 — First slice authorization

The Signature Verification Boundary may be authorized independently once Gate 2 and the minimum Gate 3 subset are approved and the operator explicitly authorizes implementation.

Status: BLOCKED pending approval.

## Gate 15 — Full runtime authorization

Full production implementation requires the applicable gates above to be closed, cross-agent dependencies stable, deterministic tests available and explicit project authorization.

Status: BLOCKED.

## Global non-gates

`CONTRACT-001`, `CONTRACT-002` and `GOV-001` remain outside IA-06 authority. They block only implementation paths that would encode assumptions about those contracts.
