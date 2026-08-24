# IA-06 — Global Decisions Required

This is a decision-request register, not an approval record.

| ID | Decision required | Why normative | Approver scope | Status |
|---|---|---|---|---|
| DR-01 | Enrollment HTTP schemas/status/authz/idempotency | External contract | Project authority + IA-07/IA-01 inputs | OPEN |
| DR-02 | Challenge/signature wire semantics and replay | Security protocol | Project authority + IA-07 | OPEN |
| DR-03 | Session identity/lifecycle | Security/transport behavior | Project authority + IA-07 | OPEN |
| DR-04 | Authorization matrix | Security boundary | Project authority | OPEN |
| DR-05 | Rate-limit policy | Externally observable policy | Project authority + IA-07 | OPEN |
| DR-06 | Endpoint idempotency semantics | Externally observable replay behavior | Project authority + IA-03/IA-07 | OPEN |
| DR-07 | Key rotation lifecycle | Security/key lifecycle | Project authority + IA-01/IA-07 | OPEN |
| DR-08 | Error taxonomy and HTTP mapping | Public API contract | Project authority + IA-07 | OPEN |

## Already-defined facts

Ed25519 challenge-response, public/private key separation, Windows Secure Storage boundary, Provisioning Service authority, `REVOKED`, `DEVICE_REVOKED`, and session termination after revocation are not decision requests; they are already documented normative inputs.

## Out of scope for local resolution

`CONTRACT-001`, `CONTRACT-002` and `GOV-001` remain global issues and are not closed by IA-06.
