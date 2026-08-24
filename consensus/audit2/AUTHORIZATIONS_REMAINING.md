# Authorizations Remaining — Auditor 2

| ID | Authorization | Prerequisites | Current state | Blocking |
|---|---|---|---|---|
| AUTH-01 | Authorize C1 schema migration | authoritative schema + tests + migration plan | NOT_AUTHORIZED | C1 schema |
| AUTH-02 | Authorize IA-02 runtime slice | decisions materialized + cross-audit pass | PENDING | C1 domain |
| AUTH-03 | Authorize IA-05 runtime | DR-001 closed + scope defined | PENDING | IA05 |
| AUTH-04 | Authorize IA-06 verifier | DR-02A.1..4 materialized + cross-audit | NOT_GRANTED | C1 auth |
| AUTH-05 | Authorize full IA-06 runtime | required auth/replay/session decisions | NOT_GRANTED | C1 transport |
| AUTH-06 | Authorize WSS/Gateway runtime | IA03/IA06 artifacts verified | PENDING | C1 transport |
| AUTH-07 | Authorize functional desktop integration | stable real application contracts | PENDING | C1 UI |
| AUTH-08 | Final merge/release authorization | all applicable verification/CI/security gates | NOT_GRANTED | final C1/C2 |
