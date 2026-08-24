# False Global Blockers — Auditor 2

| Item | Why it looks blocking | Why it is not globally blocking | Actual class |
|---|---|---|---|
| Shared Test Harness not registering every new TS test | Official suite incomplete | Independent analysis/implementation can proceed with direct evidence; affected merges may be blocked | TRANSVERSAL / LOCAL MERGE GATE |
| CONTRACT-001 | Global contract open | Only slices encoding DomainOutbox semantics are blocked | CONDITIONAL |
| CONTRACT-002 | Global contract open | Only slices depending on contested order.status_changed semantics are blocked | CONDITIONAL |
| GOV-001 | Documentation authority conflict | Does not block isolated work unless normative promotion depends on it | CONDITIONAL GOVERNANCE |
| IA-06 DR-02A.1..4 | Blocks verifier | Does not block IA-01 schema analysis, IA-08 presentation-only work, or unrelated C1 analysis | LOCAL C1 BLOCKER |
| IA-08 test runner gap | Test exists but unregistered | Does not invalidate implementation itself; affects verification/merge of the affected test | LOCAL VERIFICATION GATE |
| C2 packaging/signing | Needed for production release | Not automatically required for current MVP completion | C2 |
| Backup/restore | Important operational control | Can be C2 unless DoD explicitly requires it | C2/CONDITIONAL |
