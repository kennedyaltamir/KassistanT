# Current Definition of Done — Auditor 2

## Authority basis

This is an audit determination, not a new product decision. It is derived from the approved baseline, merged governance records, current main evidence, and explicit project boundaries. Where the baseline is broad or ambiguous, the requirement is marked UNKNOWN rather than invented.

## C1 — MVP completion

A C1 requirement must be demonstrably part of the approved initial commercial desktop MVP and must have executable evidence in main. The minimum verified path is:

1. Windows desktop application starts through the intended Electron shell.
2. Canonical local persistence exists for the business entities required by the MVP path; M5.1 foundation alone is insufficient.
3. Core domain can validate and execute the minimum approved sales flow; LLM remains non-authoritative.
4. Order lifecycle required by the current MVP is executable; the approved `DRAFT -> CONFIRMED` slice is the first currently explicit milestone.
5. Required inbound/event intake and durable effects exist where the MVP flow depends on them.
6. Device authentication exists for the production transport path required by the MVP, subject to the still-open cryptographic contract details.
7. Gateway/WSS transport needed by the MVP WhatsApp path is executable.
8. WhatsApp integration required by the baseline MVP has a real adapter/path, subject to external approvals/configuration being treated separately.
9. Conversation/LLM runtime exists sufficiently to interpret customer messages and route validated actions to Core.
10. Desktop UI is functionally connected to real Core outputs/boundaries rather than presentation-only fixtures.
11. The primary MVP path has integration/acceptance evidence, not only isolated unit tests.
12. Required CI/merge gates are satisfied on the actual implementation heads before the final release merge.

## C2 — Production readiness

Examples that are serious production requirements but are not automatically C1 unless the approved release scope explicitly requires them:

- full recovery/restore verification;
- extensive observability/runtime telemetry;
- production-grade packaging/signing/update chain;
- complete E2E and acceptance suite across all operational surfaces;
- security hardening beyond the minimum C1 security path;
- operational runbooks, rollback validation, and release rehearsal.

## C3 / Deferred / Not required for current DoD

Future SaaS/multi-tenant work, ERP/industrial stock/accounting scope, and other baseline `Future` items are outside C1 unless separately promoted by an approved decision.

## Important separation

`PROJECT_COMPLETION != PRODUCTION_READINESS`.

C2 does not block C1 unless the approved scope or an explicit release requirement makes the item necessary for the current DoD.

## Current assessment

The DoD itself is sufficiently grounded at the high level above, but several detailed acceptance criteria are UNKNOWN and must be clarified before final completion can honestly be claimed.
