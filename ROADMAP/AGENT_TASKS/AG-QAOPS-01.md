# AG-QAOPS-01 — Implementation Task Packet v1.1

**Agent:** `AG-QAOPS-01`
**Territory:** QA, Security, DevOps & Release
**Implementation state:** AUTHORIZED for P0-004; P0-005 is verification-only.

## Baseline requirement

- Baseline ref: `MVP2`.
- Before any file change, record `BASELINE_SHA_AT_START`, task branch and task ID.
- `main` is reference-only unless explicitly authorized.
- If `GOVERNANCE/IMPLEMENTATION_BASELINE.md` or the authoritative task packet is unavailable on `MVP2`, report `BASELINE_MISMATCH` and stop.
- Do not silently rebase, merge or switch refs when `MVP2` advances.

## Mission

Turn the canonical quality policy into executable gates and produce reproducible evidence without becoming the release approver.

## P0-004 — Quality Gate Automation Baseline

**Allowed paths**
- dedicated QA/release scripts and tests
- QA/release documentation
- `.github/**` only where explicitly permitted by the Permission Matrix and task scope

**Dependencies**
- `GOVERNANCE/QUALITY_GATES.md`
- `GOVERNANCE/IMPLEMENTATION_BASELINE.md`
- Permission Matrix
- current repository CI structure

**Acceptance**
- lint/typecheck/unit/integration/build/security stages are executable or explicitly recorded as missing
- evidence maps to exact commit SHA
- `READY_FOR_REVIEW` requires evidence package
- no gate weakening
- `APPROVED` and `RELEASED` remain human-only
- exceptions require explicit documentation and review

**Required tests**
- gate dry-run
- failure injection for at least one required stage
- commit/evidence correlation
- regression against silent gate weakening

## P0-005 — Cross-Territory WSS Verification

**Depends on:** P0-001 reaching the required implementation/test gate.

**Scope:** test/evidence only for:
`WhatsApp → Gateway → Inbox/Outbox → WSS → Desktop → ACK`

**Required cases**
- happy path
- authentication failure
- malformed envelope
- duplicate delivery
- reconnect/resume
- missing ACK
- sequence violation
- persistence failure
- Gateway/WSS restart

**Evidence**
- reproducible report
- logs/traces/correlation IDs
- exact SHAs
- limitations
- quality-gate verdict

## Additional release-discipline rule

Do not approve the product, merge code, or release code as part of QAOPS work unless a human approval is explicitly recorded.

## Handoff

Provide findings back to owning agents and human administrators. Preserve blockers instead of converting them into approval.
