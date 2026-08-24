# IA-07 — WSS Session Decision Matrix

Status: AUDIT / NO NEW GLOBAL DECISIONS
Date: 2026-08-24

| Decision ID | Question | Current Evidence | Owner Agent | Local Decision | Cross Agent | Global Decision | External Dependency | Blocking Level | Proposed Resolution | Required Approval |
|---|---|---|---|---|---|---|---|---|---|---|
| WSS-SESSION-001 | Who owns device identity? | IA-06 owns enrollment, identity and Ed25519 key lifecycle. | IA-06 | None | Yes | No | Windows Secure Storage | HIGH | Consume `device_id`/authenticated result; never recreate cryptographic authority. | Integration authority if contract changes |
| WSS-SESSION-002 | Who authenticates the device? | Gateway challenge → Desktop signs nonce + session context → Gateway verifies; AUTH outcomes belong to device-auth boundary. | IA-06 | None | Yes | No | Device-auth runtime | HIGH | IA-06 supplies authentication boundary; IA-07 only hosts/consumes transport boundary. | Global if semantics change |
| WSS-SESSION-003 | What is session identity? | Contract states that authenticated device produces a session identity, but exact fields/lifecycle are not fully specified. | IA-06 | None | Yes | No | Device-auth runtime | CRITICAL | IA-06 must define the minimum executable authenticated-session interface before IA-07 session lifecycle. | IA-06 + integration authority |
| WSS-SESSION-004 | Who owns WSS connection? | IA-07 owns generic Gateway/WSS transport. | IA-07 | Connection mechanics belong to IA-07 after authentication boundary is established. | Yes | No | Gateway hosting | MEDIUM | Keep WSS socket lifecycle in IA-07; do not duplicate auth. | None unless contract changes |
| WSS-SESSION-005 | Who owns durable inbound persistence? | IA-03 owns InboundInbox and ACK durability. | IA-03 | None | Yes | No | SQLite/runtime persistence | CRITICAL | IA-07 consumes the IA-03 durable intake interface; never implement Inbox persistence locally. | IA-03 + integration authority |
| WSS-SESSION-006 | When is ACK legal? | Only after durable Inbox persistence; ACK != business completion. | IA-03 | None | Yes | No | Persistence runtime | CRITICAL | Formalize an executable IA-03 intake/ACK interface before WSS receive path. | IA-03 |
| WSS-SESSION-007 | Who owns replay/resume? | IA-03 owns replay/recovery infrastructure; WSS protocol defines resume/replay conceptually but retention details remain partial. | IA-03 | None | Yes | No | Persistence/retention | HIGH | IA-03 defines durable replay source; IA-07 transports recovery messages. | IA-03 + global contract authority if semantics change |
| WSS-SESSION-008 | Who reacts to revocation? | IA-06 owns revocation; contract specifies DEVICE_REVOKED and session termination. | IA-06 authority / IA-07 transport reaction | IA-07 may terminate transport only from an authenticated revocation signal. | Yes | No | Device-auth runtime | HIGH | Define exact signal/interface from IA-06 to IA-07. | IA-06 + integration authority |
| WSS-SESSION-009 | Who owns sequence persistence? | Sequence is monotonic per `(store_id, device_id)`; persistence/replay details are incomplete. | IA-03 for durable state; IA-07 for transport handling | None | Yes | No | Persistence | HIGH | Approve executable sequence storage/ownership before replay-dependent transport implementation. | IA-03 + global contract authority |
| WSS-SESSION-010 | How should reconnect authenticate? | Reconnect exists conceptually; exact reauthentication/session reuse semantics are not fully defined. | IA-06 | None | Yes | No | Device-auth runtime | CRITICAL | IA-06 must define whether reconnect creates a new authenticated session or resumes an existing valid session. | IA-06 + integration authority |
| WSS-SESSION-011 | What are the minimum IA-06 fields consumed by IA-07? | Only `device_id` and authentication outcome are directly evidenced; session fields are incomplete. | IA-06 | None | Yes | No | Device-auth runtime | CRITICAL | Use `WSS-IA06-CONTRACT.md` as the acceptance gate; no invented fields. | IA-06 + integration authority |
| WSS-SESSION-012 | What is the minimum IA-03 intake result consumed by IA-07? | Persistence-before-ACK is explicit; runtime result shape is not. | IA-03 | None | Yes | No | Event infrastructure runtime | CRITICAL | Use `WSS-IA03-CONTRACT.md` and require persisted/duplicate/failure semantics before implementation. | IA-03 + integration authority |
| WSS-SESSION-013 | What is V1 recovery scope? | WSS defines replay/resume/resync concepts but detailed retention/state-sync semantics are partial. | IA-03 + global | None | Yes | Yes | Persistence/capacity | HIGH | Select one recovery boundary explicitly; defer unsupported recovery mechanics rather than infer them. | Global integration authority if contract scope changes |
| WSS-SESSION-014 | What are backpressure minimum semantics? | States NORMAL/PRESSURED/CRITICAL/BLOCKED exist; numeric thresholds are missing. | IA-03 / IA-07 boundary | None | Yes | Yes | Runtime capacity | HIGH | Define minimum behavioral semantics without inventing numeric thresholds. | IA-03 + integration authority |
| WSS-SESSION-015 | What is DomainOutbox relationship to Gateway? | `CONTRACT-001` remains ambiguous. | IA-03 / global | None | Yes | Yes | None | CRITICAL | Do not make WSS lifecycle depend on DomainOutbox until ownership/scope is resolved. | Global integration authority |
| WSS-SESSION-016 | Can IA-07 implement connection lifecycle now? | IA-06 authenticated-session interface and IA-03 durable-intake/ACK/replay interfaces are not executable. | IA-07 | No | Yes | No | IA-03/IA-06 runtime | CRITICAL | Keep `WSS_RUNTIME_READINESS = BLOCKED` until gate criteria are met. | IA-06 + IA-03 |

## Interpretation

No new global architectural decision was created by this matrix. It records boundaries, gates and unresolved questions only.

The minimum ownership split is:

`IA-06 establishes trustworthy device/session identity` → `IA-07 transports an authenticated session` → `IA-03 owns durable event intake/ACK/replay` → `Core performs business processing`.

The objective V1 gate is not to require every future WSS capability. Only the interfaces necessary for the selected connection-lifecycle slice must be closed; unsupported recovery or backpressure behavior may remain explicitly deferred.
