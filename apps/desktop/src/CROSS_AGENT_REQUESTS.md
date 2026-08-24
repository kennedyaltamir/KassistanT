# CROSS_AGENT_REQUESTS — IA-08

## CAR-01 — Approved Product/Order renderer adapter
Status: UNAVAILABLE

- reason: UI cannot treat local fixtures as persisted Product/Order records.
- required_capability: authoritative list/create/update Product and list/create/detail/confirm Order operations.
- minimum_expected_boundary: approved renderer-facing adapter supplied by the owning integration authority; no new IPC, DTO, endpoint or error protocol invented here.
- affected_screen: Dashboard, Products, Orders, Confirmation.
- why renderer-only implementation is insufficient: persistence and ConfirmOrder are outside renderer authority and canonical totals/lifecycle belong to Domain/Core.

## CAR-02 — Conversation transport adapter
Status: UNAVAILABLE

- reason: message delivery requires authoritative transport.
- required_capability: availability plus send operation returning authoritative success/error.
- minimum_expected_boundary: sanctioned adapter over the future IPC/WSS/WhatsApp boundary; IA-08 does not define the protocol.
- affected_screen: Conversations.
- why renderer-only implementation is insufficient: local append would falsely imply `MESSAGE_SENT` without transport confirmation.

## CAR-03 — Diagnostics integration
Status: PARTIAL

- reason: renderer can observe only renderer-local execution.
- required_capability: authoritative status for IPC, persistence, transport and auth.
- minimum_expected_boundary: read-only approved diagnostics adapter, with explicit status semantics.
- affected_screen: Settings/Diagnostics and Dashboard.
- why renderer-only implementation is insufficient: UNKNOWN must not be upgraded to HEALTHY by inference.

Until these boundaries exist, UI continues independently with `PROVISIONAL_DATA`, `UNAVAILABLE`, `NOT_CONNECTED` or `UNKNOWN` as applicable.
