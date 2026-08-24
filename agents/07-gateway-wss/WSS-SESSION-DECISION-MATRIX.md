# IA-07 — WSS Session Decision Matrix

Status: AUDIT / NO NEW GLOBAL DECISIONS
Date: 2026-08-24

| Decision ID | Question | Current Evidence | Owner Agent | Local Decision | Cross Agent | Global Decision | External Dependency | Blocking Level | Proposed Resolution | Required Approval |
|---|---|---|---|---|---|---|---|---|---|---|
| WSS-SESSION-001 | Who owns device identity? | IA-06 owns enrollment, identity and Ed25519 key lifecycle. | IA-06 | None | Yes | No | Windows Secure Storage | HIGH | Consume `device_id`/authenticated result; never recreate cryptographic authority. | Integration authority if contract changes |
| WSS-SESSION-002 | Who authenticates the device? | Gateway challenge → Desktop signs nonce + session context → Gateway verifies; AUTH outcomes belong to device-auth boundary. | IA-06 | None | Yes | No | Device-auth runtime | HIGH | IA-06 supplies authentication boundary; IA-07 only hosts/consumes transport boundary. | Global if semantics change |
| WSS-SESSION-003 | What is session identity? | Contract states that authenticated device produces a session identity, but exact fields/lifecycle are not fully specified. | IA-06 | None | Yes | No | Device-auth runtime | BLOCKED | IA-06 must define executable session identity contract before IA-07 session manager. | IA-06 + integration authority |
| WSS-SESSION-004 | Who owns WSS connection? | IA-07 owns generic Gateway/WSS transport. | IA-07 | Connection mechanics belong to IA-07 after authentication boundary is established. | Yes | No | Gateway hosting | MEDIUM | Keep WSS socket lifecycle in IA-07; do not duplicate auth. | None unless contract changes |
| WSS-SESSION-005 | Who owns durable inbound persistence? | IA-03 owns InboundInbox and ACK durability. | IA-03 | None | Yes | No | SQLite/runtime persistence | HIGH | IA-07 calls the IA-03 boundary; never implement Inbox persistence locally. | IA-03 + integration authority |
| WSS-SESSION-006 | When is ACK legal? | Only after durable Inbox persistence; ACK != business completion. | IA-03 | None | Yes | No | Persistence runtime | HIGH | Formalize an executable IA-03 intake/ack interface before WSS runtime. | IA-03 |
| WSS-SESSION-007 | Who owns replay/resume? | IA-03 owns replay/recovery infrastructure; WSS protocol defines resume/replay conceptually but retention details remain partial. | IA-03 | None | Yes | No | Persistence/retention | HIGH | IA-03 defines durable replay source; IA-07 transports RESUME/RESUME_OK. | IA-03 + global contract authority if semantics change |
| WSS-SESSION-008 | Who reacts to revocation? | IA-06 owns revocation; contract specifies DEVICE_REVOKED and session termination. | IA-06 authority / IA-07 transport reaction | IA-07 may terminate transport only from an authenticated revocation signal. | Yes | No | Device-auth runtime | HIGH | Define exact signal/interface from IA-06 to IA-07. | IA-06 + integration authority |
| WSS-SESSION-009 | Who owns sequence persistence? | Sequence is monotonic per `(store_id, device_id)`; persistence/replay details are incomplete. | IA-03 for durable state; IA-07 for transport handling | None | Yes | No | Persistence | HIGH | Approve executable sequence storage/ownership before transport implementation. | IA-03 + global contract authority |
| WSS-SESSION-010 | How should reconnect authenticate? | Reconnect exists conceptually; exact reauthentication/session reuse semantics are not fully defined. | IA-06 | None | Yes | No | Device-auth runtime | HIGH | IA-06 must define whether reconnect creates a new authenticated session or resumes one. | IA-06 + integration authority |
| WSS-SESSION-011 | How should unknown envelope fields behave? | Contract lists fields but does not define strict/lenient unknown-field policy. | Global contract | None | Yes | Yes | None | MEDIUM | Explicitly define policy before treating validator as strict schema enforcement. | Global contract authority |
| WSS-SESSION-012 | What are timestamp/identifier validation rules? | Existing contract only establishes field presence/types, not canonical lexical formats. | Global contract | None | Yes | Yes | None | MEDIUM | Define exact lexical formats in protected contract. | Global contract authority |
| WSS-SESSION-013 | What is backpressure threshold semantics? | States NORMAL, PRESSURED, CRITICAL, BLOCKED exist; numeric thresholds are missing. | IA-03 / IA-07 boundary | None | Yes | Yes | Runtime capacity | HIGH | Define transport/infrastructure split and numeric policy before runtime backpressure. | IA-03 + global contract authority |
| WSS-SESSION-014 | What is DomainOutbox relationship to Gateway? | `CONTRACT-001` remains ambiguous. | IA-03 / global | None | Yes | Yes | None | CRITICAL | Resolve ownership/scope before runtime paths depend on DomainOutbox. | Global integration authority |
| WSS-SESSION-015 | Can IA-07 implement a connection lifecycle abstraction now? | Authentication/session identity, durable ACK and replay boundaries are not executable. | IA-07 | No | Yes | No | IA-03/IA-06 runtime | BLOCKED | Wait for IA-06 session interface and IA-03 durable intake/replay interfaces. | IA-06 + IA-03 |

## Interpretation

No new global architectural decision was created by this matrix. It records boundaries and unresolved questions only.

The key separation is:

`IA-06 establishes trustworthy device/session identity` → `IA-07 transports an authenticated session` → `IA-03 owns durable event intake/ACK/replay` → `Core performs business processing`.

This matrix must not be treated as approval for implementation beyond currently established contracts.
