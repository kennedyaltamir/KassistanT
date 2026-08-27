# CROSS_AGENT_REQUESTS — IA-08

Cross-agent requests describe a missing external capability. They do not approve a contract, adapter, protocol, IPC channel, DTO or implementation. `REQUESTED`/`PENDING` remains non-authoritative until the owning authority records formal approval.

## CAR-01 — Product/Order renderer capability
Status: REQUESTED / PENDING

- reason: UI cannot treat local fixtures as persisted Product/Order records.
- required_capability: authoritative list/create/update Product and list/create/detail/confirm Order operations.
- minimum_expected_boundary: a renderer-consumable boundary formally approved and supplied by the owning integration authority; IA-08 does not define IPC, DTO, endpoint or error protocol.
- affected_screen: Dashboard, Products, Orders, Confirmation.
- why renderer-only implementation is insufficient: persistence and ConfirmOrder are outside renderer authority and canonical totals/lifecycle belong to Domain/Core.

## CAR-02 — Conversation transport capability
Status: REQUESTED / PENDING

- reason: message delivery requires authoritative transport.
- required_capability: availability plus send operation returning authoritative success/error.
- minimum_expected_boundary: a boundary formally approved by the owning transport authority over the future IPC/WSS/WhatsApp path; IA-08 does not define the protocol.
- affected_screen: Conversations.
- why renderer-only implementation is insufficient: local append would falsely imply `MESSAGE_SENT` without transport confirmation.

## CAR-03 — Diagnostics capability
Status: REQUESTED / PARTIAL

- reason: renderer can observe only renderer-local execution.
- required_capability: authoritative status for IPC, persistence, transport and auth.
- minimum_expected_boundary: read-only boundary formally approved by the owning integration authority, with explicit status semantics.
- affected_screen: Settings/Diagnostics and Dashboard.
- why renderer-only implementation is insufficient: UNKNOWN must not be upgraded to HEALTHY by inference.

Until these capabilities are formally supplied, UI continues independently with `PROVISIONAL_DATA`, `UNAVAILABLE`, `NOT_CONNECTED` or `UNKNOWN` as applicable.