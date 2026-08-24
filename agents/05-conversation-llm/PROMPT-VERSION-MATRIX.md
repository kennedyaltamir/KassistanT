# IA-05 — Prompt Version Matrix

Status: **PARTIAL / CROSS_AGENT**.

## Logical V1 contract

| Item | V1 classification | Evidence / rationale |
|---|---|---|
| Prompt identity | REQUIRED | A reproducible execution needs stable identity |
| Version | REQUIRED | Immutable version reference is needed for audit |
| Source | REQUIRED | Provenance of system/template configuration |
| Variables | REQUIRED | Inputs must be typed/provenanced before construction |
| System prompt | REQUIRED logically | Part of execution configuration |
| Tool definitions | OPTIONAL for first non-tool slice; REQUIRED when tools enabled | Must correspond to approved tool contract/version |
| Context inputs | REQUIRED | Prompt must reference authoritative context sources |
| Result schema reference | REQUIRED for structured output | Validation must be reproducible |
| Context provenance | REQUIRED | Prevent hidden/unaudited context injection |
| Reproducibility | REQUIRED | Same configuration references should reconstruct execution setup |
| Audit reference | REQUIRED logically | AIExecution must point to prompt identity/version |

## Closure boundary

The minimum logical contract can be documented inside IA-05. A shared persistence representation or executable contract that other agents consume is `CROSS_AGENT` and requires integration approval.

## Proposed rule — PROPOSAL, not DECISION

Prompt artifacts should be immutable/versioned references rather than hidden strings assembled from renderer state. The execution record should reference prompt identity/version and relevant context provenance.

No wording, template identifier, version number or storage field is approved by this document.
