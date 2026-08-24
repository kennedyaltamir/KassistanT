# IA-06 — Device Authentication Approval Request

Status: READY FOR HUMAN PROJECT AUTHORITY REVIEW / NO IMPLEMENTATION.

## Purpose

Provide a single approval surface for the remaining Device Authentication contract decisions, while keeping cryptographic verification, replay runtime, session, authorization, rate-limit, idempotency, rotation and external-storage concerns independently gated.

## Decision requests

| ID | Decision | Blocks | Scope |
|---|---|---|---|
| DR-01 | Enrollment HTTP contract | Enrollment runtime | HTTP request/response/status/authz/idempotency |
| DR-02 | Challenge/signature contract | Signature verification and challenge runtime | Stratified cryptographic minimum vs operational replay runtime |
| DR-03 | Session lifecycle | Session runtime | Session identity/expiry/renewal/reauth/resume |
| DR-04 | Authorization | Authorization runtime | Actor/action/resource/condition matrix |
| DR-05 | Rate limiting | Rate-limit runtime | Applicable operations and concrete policy |
| DR-06 | Endpoint idempotency | Enrollment/revoke/rotate runtime | Key/scope/duplicate/replay/retention |
| DR-07 | Rotation lifecycle | Rotation runtime | Old/new key lifecycle/overlap/rollback/session continuity |
| DR-08 | Error taxonomy | Public device-auth error mapping | Canonical identifiers/retryability/HTTP mapping |

## Stratified approval rule

Approval of one layer does not implicitly approve another layer.

- Approval of Ed25519 as the primitive does not approve wire representation.
- Approval of the cryptographic verification contract does not approve replay runtime lifecycle.
- Approval of challenge signing does not approve session TTL.
- Approval of authentication does not approve authorization.
- Approval of revocation does not approve rotation.
- Approval of the logical Secure Storage boundary does not select a Windows technology.
- Approval of audit requirements does not authorize logging secrets.

## DR-02 Approval Scope

DR-02 is divided into two independent closure scopes:

- **DR-02A — Cryptographic Verification Contract**
- **DR-02B — Operational Replay / Challenge Runtime**

Approval of DR-02A alone must never be interpreted as approval of DR-02B.

### CRYPTOGRAPHIC_CONTEXT_BINDING_BOUNDARY

Context binding belongs to the cryptographic verification contract only to the extent required to prevent a valid signature over one authenticated context from being accepted as valid in an incompatible context.

For DR-02A, the **logical context** is the set of protocol elements that the signature authenticates. Only elements explicitly approved as part of that context may contribute to the bytes presented to the verifier.

Candidate context elements for review are:

- device identity;
- protocol/domain separation;
- authentication purpose or operation identifier;
- challenge identity;
- protocol version, if the approved contract requires it.

These are **analysis candidates, not decisions**. An element becomes part of the signed context only when the project authority explicitly approves it for DR-02A.

The final context boundary must satisfy two properties:

1. The signer and verifier can derive the same logical context deterministically.
2. The approved context is reflected deterministically in the bytes verified by the Ed25519 primitive.

This boundary answers only **what is cryptographically authenticated**. It does not decide whether a challenge is fresh, unique, expired, reusable, persisted or rejected after prior use.

### CRYPTO_MINIMUM_APPROVAL

The authority is being asked to approve only the contract needed for the pure `Signature Verification Boundary`:

1. Ed25519 verification primitive.
2. Logical signed-context concept.
3. Explicit set of approved context elements.
4. Approved rule for deriving the signed bytes from that context.
5. Public-key representation.
6. Signature representation.
7. Deterministic verifier result semantics (`valid` / `invalid`).

This approval is intentionally limited to the cryptographic verification boundary. It must not introduce or imply a numeric freshness window, challenge persistence model, expiration policy, replay store, HTTP behavior or session lifecycle.

### REPLAY_REMAINS_OPEN

Operational replay/challenge runtime remains **OPEN** after DR-02A approval. It still requires separate closure for:

- challenge uniqueness;
- challenge freshness policy;
- challenge lifecycle/storage;
- reuse rejection;
- expiration;
- replay detection;
- replay error semantics;
- persistence and recovery behavior.

These items are not approved by the cryptographic context-binding boundary and are not required by the pure verifier unless a future implementation boundary establishes a concrete dependency.

### NON_APPROVED_RUNTIME_SEMANTICS

The following are explicitly **not** approved by DR-02A:

- challenge TTL or numeric freshness window;
- challenge storage/recovery;
- replay database/state;
- replay lockout or rate limiting;
- HTTP status/error mapping;
- session creation, TTL, renewal or reauthentication;
- authorization policy;
- enrollment lifecycle;
- key rotation lifecycle;
- Secure Storage technology selection.

## Minimum DR-02 closure for first slice

The `Signature Verification Boundary` requires only the `CRYPTO_MINIMUM_APPROVAL` scope above.

It does not require enrollment HTTP semantics, session TTL, authorization policy, rate limits, endpoint idempotency, key rotation or replay persistence.

## Evidence / authority rule

This document records decision requests only. It does not create project decisions. Unresolved items remain OPEN until approved by the project authority.

## Approval outcomes expected

For each DR, the authority should return one of:

- APPROVED
- APPROVED_WITH_CONSTRAINTS
- REJECTED
- NEEDS_EVIDENCE
- DEFERRED

For DR-02 specifically, an approval must state whether it applies to:

- `CRYPTO_MINIMUM_ONLY`; or
- `CRYPTO_MINIMUM + REPLAY_RUNTIME`.

For the current review, IA-06 requests only `CRYPTO_MINIMUM_ONLY`.

Silence must not be interpreted as approval of replay runtime.

## Security evidence minimum

No decision may require storing or logging private key material. Audit evidence must identify actor/device/result/time/correlation as contractually appropriate without exposing secrets.
