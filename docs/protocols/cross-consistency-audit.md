# Documentation Cross-Consistency Audit

**Status:** CURRENT audit snapshot

See the contract registry for the normative gap list. This file intentionally records the status of cross-contract checks rather than asserting runtime completeness.

- HTTP route ↔ OpenAPI: PASS for all 10 baseline-defined routes.
- HTTP errors ↔ backend errors: PARTIAL; status/error mapping is incomplete.
- Domain events ↔ EventBus: PARTIAL; EventBus runtime is not implemented.
- Domain events ↔ WSS: PARTIAL; exact event/message mapping is incomplete.
- InboundInbox ↔ ACK: PASS; ACK follows durable local Inbox commit.
- DomainOutbox ↔ external effects: AMBIGUOUS; CONTRACT-001.
- JobQueue ↔ asynchronous operations: PASS/PARTIAL.
- Provider contracts ↔ adapters: PARTIAL.
- Device Auth ↔ enrollment: PASS/PARTIAL.
- Authorization ↔ endpoint access: MISSING/PARTIAL.
- Idempotency consistency: PARTIAL.
- Audit requirements: PARTIAL.

Known contradictions: CONTRACT-001, CONTRACT-002, GOV-001. No unilateral resolution is made.
