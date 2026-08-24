# IA-07 — Changelog

## 2026-08-24

- Initialized IA-07 Gateway + WSS operational specification.
- Audited current Gateway skeleton in `main`.
- Recorded ownership boundaries, dependencies, known ambiguities, risks, current progress and handoff requirements.
- No product implementation started.
- Completed HTTP API contract-to-runtime audit for GW-001 through GW-010.
- Completed WSS contract-to-runtime audit including envelope, ACK, handshake, sequence, replay/resume/resync, heartbeat, backpressure, revocation and error gaps.
- Added pure WSS v1 envelope validation in `gateway/src/wss-envelope.mjs`.
- Added deterministic WSS envelope tests in `gateway/test/wss-envelope.test.mjs`.
- Preserved existing `/health` and `/ready` implementation and tests.
