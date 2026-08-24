# IA-06 Changelog

## 2026-08-24 — Final DR-02 Refinement

### Added / refined

- Split DR-02 into `DR-02A — Cryptographic Verification Contract` and `DR-02B — Operational Replay Protocol`.
- Added explicit `CRYPTO_MINIMUM_APPROVAL`, `REPLAY_REMAINS_OPEN` and `NON_APPROVED_RUNTIME_SEMANTICS` sections to the approval surface.
- Clarified that the `Signature Verification Boundary` requires only the minimum DR-02A scope.
- Clarified that replay runtime remains independently blocked/open after any DR-02A approval.
- Separated cryptographic context binding from challenge persistence, freshness windows, expiration and replay storage.
- Updated crypto/security, decision, memory, progress and handoff records to preserve the stratified model.

### Constraints preserved

- No production code implemented.
- No shared contracts modified.
- No Gateway/WSS implementation modified.
- No Secure Storage technology selected.
- No TTL, freshness window, replay-store design, HTTP mapping or authorization rule invented.
- `CONTRACT-001`, `CONTRACT-002` and `GOV-001` remain unresolved.

### Current conclusion

IA-06 is **READY FOR HUMAN PROJECT DECISION REVIEW / IMPLEMENTATION FROZEN**. The proposed first slice is the pure `Signature Verification Boundary`, pending explicit approval of DR-02A. DR-02B remains open and is not implied by DR-02A approval.
