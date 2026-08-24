# CROSS_AGENT_REQUESTS — IA-08

## CAR-01: Approved product/order persistence adapter
**Status:** UNAVAILABLE

The renderer currently uses presentation-only fixtures and session state. A real adapter requires the persistence/contract authority owned by MVP-SLICE-002. Minimum need: an approved renderer-facing adapter boundary for listing/creating products and orders and confirming an order. No IPC channel, DTO, schema, or error protocol was invented by IA-08.

## CAR-02: Conversation transport
**Status:** UNAVAILABLE

Real message sending requires an approved transport boundary (and, where applicable, IPC/WSS/auth). Minimum need: a sanctioned renderer adapter exposing availability plus a send operation with authoritative success/error results. Until that exists, Send remains disabled and explicitly UNAVAILABLE.

## CAR-03: Diagnostics integration
**Status:** PARTIAL

Only renderer-local state is HEALTHY. IPC, persistence and transport are shown as NOT_CONNECTED/UNAVAILABLE rather than fabricated health.
